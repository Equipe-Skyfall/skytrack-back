import { Parameter, PrismaClient } from '@prisma/client';
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
    const sensorReadings = [];

    for (const mongoRecord of batch) {
      try {
        const stationId = stationMappings.get(mongoRecord.uuid);

        if (!stationId) {
          console.warn(`No station found for MAC address: ${mongoRecord.uuid}`);
          stats.stationsNotFound++;
          continue;
        }

        stats.stationsMatched++;
        const parameters = await this.getParametersByMAC(mongoRecord.uuid);
        console.log(`Parameters for station ${stationId}:`, parameters);
        const mongoReadings = this.extractSensorData(mongoRecord); // guarda os dados dos sensores no padrao JSONB
        let parameterValues: Record<string, number> = {};

        if (parameters && parameters.length > 0) {
          parameterValues = this.processParameterValues(parameters, mongoReadings);
        }

        // transforma os dados do mongodb em dados compativeis com o postgres
        const sensorReading = {
          stationId,
          timestamp: new Date(mongoRecord.unixtime * 1000),
          mongoId: mongoRecord._id,
          readings: parameterValues,
          parameters: parameters?.map(p => p.id) || [],
        };

        sensorReadings.push(sensorReading);
      } catch (error) {
        console.error(`Error processing record ${mongoRecord._id}:`, error);
        stats.failedMigrations++;
      }
    }

    // Insere as novas leituras
    if (sensorReadings.length > 0) {
      try {
        await this.prisma.sensorReading.createMany({
          data: sensorReadings,
        });

        stats.successfulMigrations += sensorReadings.length;
        console.log(`Successfully inserted ${sensorReadings.length} sensor readings`);
      } catch (error) {
        console.error('Error inserting sensor readings:', error);
        stats.failedMigrations += sensorReadings.length;
      }
    }
  }

  private async getParametersByMAC(stationId: string): Promise<Parameter[]> {
    return this.prisma.parameter.findMany({
            where: { stationId: stationId },
            orderBy: { name: 'asc' },
        });
  }

  private processParameterValues(parameters: Parameter[], readings: any): Record<string, number> {
    const parameterValues: Record<string, number> = {};
      for (const param of parameters) {
        const calibration = param.calibration as Record<
          string,
          { offset?: number; factor?: number }
        >;

        const calibKeys = Object.keys(calibration || {});
        const matchedEntries: { readingKey: string; calibKey: string }[] = [];

        for (const key of calibKeys) {
          const readingKey = Object.keys(readings).find(
            rk => rk.toLowerCase() === key.toLowerCase()
          );
          if (readingKey) {
            matchedEntries.push({ readingKey, calibKey: key });
          }
        }

        if (matchedEntries.length === 0) {
          continue;
        }

        const { readingKey: mainReadingKey, calibKey: mainCalibKey } = matchedEntries[0]!;
        const rawValue = readings[mainReadingKey];
        const calib = calibration[mainCalibKey];
        const calibratedValue = calib
          ? (rawValue + (calib.offset || 0)) * (calib.factor || 1)
          : rawValue;

        let finalValue = calibratedValue;

        // apply polynomial if exists
        if (param.polynomial && param.coefficients?.length) {
          const vars: Record<string, number> = {};

          // map coefficients (a0, a1, ...)
          param.coefficients.forEach((c, i) => {
            vars[`a${i}`] = c;
          });

          for (const { readingKey, calibKey } of matchedEntries) {
            const value = readings[readingKey];
            const c = calibration[calibKey];
            vars[calibKey] = c
              ? (value + (c.offset || 0)) * (c.factor || 1)
              : value;
          }

          try {
            finalValue = parse(param.polynomial).evaluate(vars);
          } catch (err) {
            console.warn(
              `Failed to evaluate polynomial for parameter ${param.name}, falling back to calibrated value.`,
              err
            );
          }
        }

        parameterValues[param.name] = finalValue;
      }
    return parameterValues;
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