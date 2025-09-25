import { PrismaClient } from '@prisma/client';
import { MongoDataService, MongoSensorData } from './mongoDataService';
import { parse } from 'mathjs';

export interface MigrationConfig {
  batchSize: number;
  syncName: string; 
}

export interface MigrationStats {
  totalProcessed: number;
  successfulMigrations: number;
  failedMigrations: number;
  stationsMatched: number;
  stationsNotFound: number;
  lastSyncTimestamp: number;
  startTime: Date;
  endTime?: Date;
  duration?: number;
}

export class MigrationService {
  private prisma: PrismaClient;
  private mongoService: MongoDataService;
  private config: MigrationConfig;

  constructor(
    prisma: PrismaClient,
    mongoService?: MongoDataService,
    config?: Partial<MigrationConfig>
  ) {
    this.prisma = prisma;
    this.mongoService = mongoService || new MongoDataService();
    this.config = {
      batchSize: parseInt(process.env.MIGRATION_BATCH_SIZE || '100'),
      syncName: process.env.MIGRATION_SYNC_NAME || 'main_sync',
      ...config
    };
  }

  async migrate(): Promise<MigrationStats> {
    const stats: MigrationStats = {
      totalProcessed: 0,
      successfulMigrations: 0,
      failedMigrations: 0,
      stationsMatched: 0,
      stationsNotFound: 0,
      lastSyncTimestamp: 0,
      startTime: new Date(),
    };

    try {
      console.log('Starting simplified MongoDB to PostgreSQL migration...');

      // Conecta no MongoDB
      await this.mongoService.connect();

      // pega a timestamp do ultimo migration from database
      const lastSyncTimestamp = await this.getLastSyncTimestamp();
      console.log(`Last sync was at: ${new Date(lastSyncTimestamp * 1000).toISOString()}`);

      // pega apenas os novos dados A PARTIR DA ULTIMA SINCRONIZAÇÃO
      const newData = await this.mongoService.fetchDataSinceTimestamp(lastSyncTimestamp);
      stats.totalProcessed = newData.length;

      if (newData.length === 0) {
        console.log('No new data to migrate');
        return this.finalizeMigration(stats);
      }

      // pega o mac address para mapear nas estações corretas
      const stationMappings = await this.getStationMacAddressMappings();
      console.log(`Found ${stationMappings.size} stations with MAC addresses`);

      // Processa os dados em lotes
      await this.processBatches(newData, stationMappings, stats);

      // atualiza o timestamp da ultima sync
      if (newData.length > 0) {
        const latestTimestamp = Math.max(...newData.map(d => d.unixtime));
        await this.updateLastSyncTimestamp(latestTimestamp);
        stats.lastSyncTimestamp = latestTimestamp;
      }

      return this.finalizeMigration(stats);
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    } finally {
      await this.mongoService.disconnect();
    }
  }

  private async getLastSyncTimestamp(): Promise<number> {
    const migrationState = await this.prisma.migrationState.findUnique({
      where: { name: this.config.syncName },
    });

    if (!migrationState) {
      // se for a primeira vez ele pega todos dos dados
      console.log('First migration run - starting from timestamp 0 (all data)');
      return 0;
    }

    return migrationState.lastSyncTimestamp;
  }

  private async updateLastSyncTimestamp(timestamp: number): Promise<void> {
    await this.prisma.migrationState.upsert({
      where: { name: this.config.syncName },
      create: {
        name: this.config.syncName,
        lastSyncTimestamp: timestamp,
        totalMigrated: 0,
      },
      update: {
        lastSyncTimestamp: timestamp,
        lastRunAt: new Date(),
      },
    });
  }

  private async getStationMacAddressMappings(): Promise<Map<string, string>> {
    const stations = await this.prisma.meteorologicalStation.findMany({
      select: { id: true, macAddress: true },
      where: { macAddress: { not: null } },
    });

    const mappings = new Map<string, string>();
    stations.forEach(station => {
      if (station.macAddress) {
        mappings.set(station.macAddress, station.id);
      }
    });

    return mappings;
  }

  private async processBatches(
    data: MongoSensorData[],
    stationMappings: Map<string, string>,
    stats: MigrationStats
  ): Promise<void> {
    // Process in batches
    for (let i = 0; i < data.length; i += this.config.batchSize) {
      const batch = data.slice(i, i + this.config.batchSize);
      console.log(`Processing batch ${Math.floor(i / this.config.batchSize) + 1}/${Math.ceil(data.length / this.config.batchSize)}`);

      await this.processBatch(batch, stationMappings, stats);
    }
  }

  private async processBatch(
    batch: MongoSensorData[],
    stationMappings: Map<string, string>,
    stats: MigrationStats
  ): Promise<void> {
    const sensorReadingsData = [];

    for (const mongoRecord of batch) {
      try {
        const stationId = stationMappings.get(mongoRecord.uuid);

        if (!stationId) {
          console.warn(`No station found for MAC address: ${mongoRecord.uuid}`);
          stats.stationsNotFound++;
          continue;
        }

        stats.stationsMatched++;
        const parameters = await this.getParametersByStationId(stationId);
        console.log(`Parameters for station ${stationId}:`, parameters);
        const mongoReadings = this.extractSensorData(mongoRecord); // guarda os dados dos sensores no padrao JSONB
        console.log(`Raw sensor data for ${mongoRecord.uuid}:`, mongoReadings);

        let parameterValues: Record<string, number> = {};
        let calibratedReadings: Record<string, number> = {};

        if (parameters && parameters.length > 0) {
          const result = this.processParameterValues(parameters, mongoReadings);
          parameterValues = result.parameterValues;
          calibratedReadings = result.calibratedReadings;
          console.log(`Processed parameter values:`, parameterValues);
          console.log(`Calibrated sensor readings:`, calibratedReadings);
        } else {
          console.log(`No parameters found for station ${stationId}`);
        }

        // transforma os dados do mongodb em dados compativeis com o postgres
        const sensorReading = {
          stationId,
          timestamp: new Date(mongoRecord.unixtime * 1000),
          mongoId: mongoRecord._id,
          valor: {
            ...mongoReadings,     // raw sensor data
            ...calibratedReadings, // calibrated sensor readings
            ...parameterValues    // processed parameter values
          },
          macEstacao: mongoRecord.uuid,
          uuidEstacao: stationId,
        };

        sensorReadingsData.push({
          sensorReading,
          parameterIds: parameters?.map(p => p.id) || []
        });
      } catch (error) {
        console.error(`Error processing record ${mongoRecord._id}:`, error);
        stats.failedMigrations++;
      }
    }

    // Insere as novas leituras
    if (sensorReadingsData.length > 0) {
      try {
        // First, create all sensor readings
        const createdReadings = [];
        for (const data of sensorReadingsData) {
          const createdReading = await this.prisma.sensorReading.create({
            data: data.sensorReading,
          });
          createdReadings.push({
            reading: createdReading,
            parameterIds: data.parameterIds
          });
        }

        // Then, create parameter relationships
        for (const { reading, parameterIds } of createdReadings) {
          if (parameterIds.length > 0) {
            const relationshipData = parameterIds.map(parameterId => ({
              sensorReadingId: reading.id,
              parameterId: parameterId
            }));

            await this.prisma.sensorReadingParameter.createMany({
              data: relationshipData,
            });
          }
        }

        stats.successfulMigrations += sensorReadingsData.length;
        console.log(`Successfully inserted ${sensorReadingsData.length} sensor readings with parameter relationships`);
      } catch (error) {
        console.error('Error inserting sensor readings:', error);
        stats.failedMigrations += sensorReadingsData.length;
      }
    }
  }

  private async getParametersByStationId(stationId: string): Promise<any[]> {
    return this.prisma.parameter.findMany({
            where: { stationId: stationId },
            include: {
                tipoParametro: true
            },
        });
  }

  private processParameterValues(parameters: any[], readings: any): {
    parameterValues: Record<string, number>;
    calibratedReadings: Record<string, number>;
  } {
    const parameterValues: Record<string, number> = {};
    const calibratedReadings: Record<string, number> = {};
      for (const param of parameters) {
        const tipoParametro = param.tipoParametro;
        console.log(`Processing parameter: ${tipoParametro.nome}`);

        const calibration = tipoParametro.leitura as Record<
          string,
          { offset?: number; factor?: number }
        >;
        console.log(`Calibration data:`, calibration);

        const calibKeys = Object.keys(calibration || {});
        const matchedEntries: { readingKey: string; calibKey: string }[] = [];

        for (const key of calibKeys) {
          const readingKey = Object.keys(readings).find(
            rk => rk.toLowerCase() === key.toLowerCase()
          );
          if (readingKey) {
            matchedEntries.push({ readingKey, calibKey: key });
            console.log(`Matched calibration key "${key}" with reading key "${readingKey}"`);
          }
        }

        if (matchedEntries.length === 0) {
          console.log(`No matching readings found for parameter ${tipoParametro.nome}`);
          continue;
        }

        const { readingKey: mainReadingKey, calibKey: mainCalibKey } = matchedEntries[0]!;
        const rawValue = readings[mainReadingKey];
        const calib = calibration[mainCalibKey];
        const calibratedValue = calib
          ? (rawValue + (calib.offset || 0)) * (calib.factor || 1)
          : rawValue;

        let finalValue = calibratedValue;

        // Store calibrated values for all matched entries (for non-polynomial case)
        for (const { readingKey, calibKey } of matchedEntries) {
          const value = readings[readingKey];
          const c = calibration[calibKey];
          calibratedReadings[readingKey] = c
            ? (value + (c.offset || 0)) * (c.factor || 1)
            : value;
        }

        // apply polynomial if exists
        if (tipoParametro.polinomio && tipoParametro.coeficiente?.length) {
          const vars: Record<string, number> = {};

          // map coefficients (a0, a1, ...)
          tipoParametro.coeficiente.forEach((c: number, i: number) => {
            vars[`a${i}`] = c;
          });

          for (const { readingKey, calibKey } of matchedEntries) {
            const value = readings[readingKey];
            const c = calibration[calibKey];
            const calibratedValue = c
              ? (value + (c.offset || 0)) * (c.factor || 1)
              : value;
            vars[calibKey] = calibratedValue;

            // Store calibrated sensor values
            calibratedReadings[readingKey] = calibratedValue;
          }

          try {
            finalValue = parse(tipoParametro.polinomio).evaluate(vars);
          } catch (err) {
            console.warn(
              `Failed to evaluate polynomial for parameter ${tipoParametro.nome}, falling back to calibrated value.`,
              err
            );
          }
        }

        parameterValues[tipoParametro.nome] = finalValue;
      }
    return { parameterValues, calibratedReadings };
  }

  private extractSensorData(mongoRecord: MongoSensorData): any {
    // Extrai os dados dos sensores
    const sensorData: any = {};

    for (const [key, value] of Object.entries(mongoRecord)) {
      // Skip core fields
      if (!['_id', 'uuid', 'unixtime'].includes(key)) {
        sensorData[key] = value;
      }
    }

    return sensorData;
  }

  private finalizeMigration(stats: MigrationStats): MigrationStats {
    stats.endTime = new Date();
    stats.duration = stats.endTime.getTime() - stats.startTime.getTime();

    console.log('\n=== MIGRATION COMPLETED ===');
    console.log(`Total processed: ${stats.totalProcessed}`);
    console.log(`Successful migrations: ${stats.successfulMigrations}`);
    console.log(`Failed migrations: ${stats.failedMigrations}`);
    console.log(`Stations matched: ${stats.stationsMatched}`);
    console.log(`Stations not found: ${stats.stationsNotFound}`);
    console.log(`Duration: ${stats.duration}ms`);
    console.log(`Last sync timestamp: ${stats.lastSyncTimestamp}`);
    console.log('=== END MIGRATION ===\n');

    return stats;
  }

  // Utility methods
  async resetSyncState(): Promise<void> {
    await this.prisma.migrationState.deleteMany({
      where: { name: this.config.syncName },
    });
    console.log(`Reset sync state for: ${this.config.syncName}`);
  }

  async getSyncStatus(): Promise<{
    name: string;
    lastSyncTimestamp: number;
    lastSyncDate: string;
    totalMigrated: number;
    lastRunAt: string;
  } | null> {
    const migrationState = await this.prisma.migrationState.findUnique({
      where: { name: this.config.syncName },
    });

    if (!migrationState) {
      return null;
    }

    return {
      name: migrationState.name,
      lastSyncTimestamp: migrationState.lastSyncTimestamp,
      lastSyncDate: new Date(migrationState.lastSyncTimestamp * 1000).toISOString(),
      totalMigrated: migrationState.totalMigrated,
      lastRunAt: migrationState.lastRunAt.toISOString(),
    };
  }
}