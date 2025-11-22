import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { MigrationService, MigrationConfig } from './migrationService';
import { MongoDataService, MongoSensorData } from './mongoDataService';

describe('MigrationService', () => {
  let service: MigrationService;
  let prisma: any;
  let mongoService: jest.Mocked<MongoDataService>;

  const mockConfig: MigrationConfig = {
    batchSize: 2,
    syncName: 'test_sync'
  };

  const mockStation: any = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Test Station',
    macAddress: '24:6F:28:AE:52:7C',
    latitude: -23.5505,
    longitude: -46.6333,
    description: 'Test station',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
    address: 'Test Address'
  };

  // Primary "good" mock parameter (matches Prisma schema)
  const mockParameter: any = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    stationId: mockStation.id,
    tipoParametroId: '550e8400-e29b-41d4-a716-446655440002',

    // Prisma fields that must exist (even if null)
    tipoAlertaId: null,
    tipoAlerta: null,

    tipoParametro: {
      id: '550e8400-e29b-41d4-a716-446655440002',
      jsonId: 'temperature_sensor',
      nome: 'temperature',
      metrica: '°C',
      leitura: { temperatura: { offset: 0, factor: 1.0 } },
      polinomio: 'a0 + a1*temperatura',
      coeficiente: [1.0, 0.95]
    },

    // relation arrays must exist
    alerts: [],
    readings: []
  };

  const mockMongoData: MongoSensorData = {
    _id: '507f1f77bcf86cd799439011',
    uuid: '24:6F:28:AE:52:7C',
    unixtime: 1640995200, // 2022-01-01 00:00:00
    temperatura: 25.5,
    umidade: 60.0
  };

  const mockMigrationState = {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'test_sync',
    lastSyncTimestamp: 1640995000,
    totalMigrated: 0,
    lastRunAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(async () => {
    const mockPrisma = {
      migrationState: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
        deleteMany: jest.fn(),
      },
      meteorologicalStation: {
        findMany: jest.fn(),
      },
      parameter: {
        findMany: jest.fn(),
      },
      tipoAlerta: {
        findUnique: jest.fn()
      },
      sensorReading: {
        create: jest.fn(),
        createMany: jest.fn(),
      },
      sensorReadingParameter: {
        createMany: jest.fn(),
      },
    };

    const mockMongoService = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      fetchDataSinceTimestamp: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PrismaClient,
          useValue: mockPrisma,
        },
        {
          provide: MongoDataService,
          useValue: mockMongoService,
        },
      ],
    }).compile();

    prisma = module.get(PrismaClient);
    mongoService = module.get(MongoDataService);
    service = new MigrationService(prisma, mongoService, mockConfig);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('migrate', () => {
    it('should complete migration successfully with no new data', async () => {
      // Setup
      prisma.migrationState.findUnique.mockResolvedValue(mockMigrationState);
      mongoService.connect.mockResolvedValue();
      mongoService.fetchDataSinceTimestamp.mockResolvedValue([]);
      mongoService.disconnect.mockResolvedValue();

      // Execute
      const result = await service.migrate();

      // Assert
      expect(result).toEqual({
        totalProcessed: 0,
        successfulMigrations: 0,
        failedMigrations: 0,
        stationsMatched: 0,
        stationsNotFound: 0,
        lastSyncTimestamp: 0,
        startTime: expect.any(Date),
        endTime: expect.any(Date),
        duration: expect.any(Number)
      });
      expect(mongoService.connect).toHaveBeenCalled();
      expect(mongoService.disconnect).toHaveBeenCalled();
    });

    it('should handle invalid polynomial gracefully', async () => {
      // Setup mock parameter with user's exact problematic configuration
      const invalidPolynomialParameter = {
        id: '550e8400-e29b-41d4-a716-446655440010',
        stationId: mockStation.id,
        tipoParametroId: '550e8400-e29b-41d4-a716-446655440011',

        tipoAlertaId: null,
        tipoAlerta: null,

        tipoParametro: {
          id: '550e8400-e29b-41d4-a716-446655440011',
          jsonId: 'temperature_sensor',
          nome: 'temperatura',
          metrica: '°C',
          leitura: {
            temperatura: { offset: 0, factor: 1.0 },
            umidade: { offset: 0, factor: 1.0 }
          },
          polinomio: 'a0 + a1*temperatura+umidade', // malformed for provided coefficients
          coeficiente: [1.0, 0.95]
        },

        alerts: [],
        readings: []
      };

      // Setup
      prisma.migrationState.findUnique.mockResolvedValue(mockMigrationState);
      mongoService.connect.mockResolvedValue();
      mongoService.fetchDataSinceTimestamp.mockResolvedValue([mockMongoData]);
      mongoService.disconnect.mockResolvedValue();

      // Mock station mapping
      prisma.meteorologicalStation.findMany.mockResolvedValue([mockStation]);

      // Mock invalid polynomial parameter
      prisma.parameter.findMany.mockResolvedValue([invalidPolynomialParameter]);

      // Mock sensor reading creation
      prisma.sensorReading.create.mockResolvedValue({
        id: '550e8400-e29b-41d4-a716-446655440004',
        stationId: mockStation.id,
        timestamp: new Date(mockMongoData.unixtime * 1000),
        mongoId: mockMongoData._id,
        valor: expect.any(Object),
        macEstacao: mockMongoData.uuid,
        uuidEstacao: mockStation.id,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      prisma.sensorReadingParameter.createMany.mockResolvedValue({ count: 1 });
      prisma.migrationState.upsert.mockResolvedValue(mockMigrationState);

      const result = await service.migrate();

      expect(result.successfulMigrations).toBe(1);
    });

    it('should migrate data successfully with multi-sensor parameter', async () => {
      // Setup mock parameter with multi-sensor configuration
      const multiSensorParameter = {
        id: '550e8400-e29b-41d4-a716-446655440020',
        stationId: mockStation.id,
        tipoParametroId: '550e8400-e29b-41d4-a716-446655440021',

        tipoAlertaId: null,
        tipoAlerta: null,

        tipoParametro: {
          id: '550e8400-e29b-41d4-a716-446655440021',
          jsonId: 'multi_sensor',
          nome: 'temperatura',
          metrica: '°C',
          leitura: {
            temperatura: { offset: 0, factor: 1.0 },
            umidade: { offset: 0, factor: 1.0 }
          },
          polinomio: 'a0 + a1*temperatura + a2*umidade',
          coeficiente: [1.0, 0.95, 1.0]
        },

        alerts: [],
        readings: []
      };

      // Setup
      prisma.migrationState.findUnique.mockResolvedValue(mockMigrationState);
      mongoService.connect.mockResolvedValue();
      mongoService.fetchDataSinceTimestamp.mockResolvedValue([mockMongoData]);
      mongoService.disconnect.mockResolvedValue();

      // Mock station mapping
      prisma.meteorologicalStation.findMany.mockResolvedValue([mockStation]);

      // Mock multi-sensor parameter
      prisma.parameter.findMany.mockResolvedValue([multiSensorParameter]);

      // Mock sensor reading creation - should have both raw and processed values
      const mockCreatedReading = {
        id: '550e8400-e29b-41d4-a716-446655440004',
        stationId: mockStation.id,
        timestamp: new Date(mockMongoData.unixtime * 1000),
        mongoId: mockMongoData._id,
        valor: {
          umidade: 60.0,
          temperatura: expect.any(Number)
        },
        macEstacao: mockMongoData.uuid,
        uuidEstacao: mockStation.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      prisma.sensorReading.create.mockResolvedValue(mockCreatedReading);
      prisma.sensorReadingParameter.createMany.mockResolvedValue({ count: 1 });
      prisma.migrationState.upsert.mockResolvedValue(mockMigrationState);

      const result = await service.migrate();

      expect(result.successfulMigrations).toBe(1);
      expect(result.stationsMatched).toBe(1);
      expect(result.stationsNotFound).toBe(0);
      expect(prisma.sensorReading.create).toHaveBeenCalledWith({
        data: {
          stationId: mockStation.id,
          timestamp: new Date(mockMongoData.unixtime * 1000),
          mongoId: mockMongoData._id,
          valor: {
            umidade: 60.0,
            temperatura: expect.any(Number)
          },
          macEstacao: mockMongoData.uuid,
          uuidEstacao: mockStation.id,
        }
      });
    });

    it('should migrate data successfully', async () => {
      // Setup
      prisma.migrationState.findUnique.mockResolvedValue(mockMigrationState);
      mongoService.connect.mockResolvedValue();
      mongoService.fetchDataSinceTimestamp.mockResolvedValue([mockMongoData]);
      mongoService.disconnect.mockResolvedValue();

      // Mock station mapping
      prisma.meteorologicalStation.findMany.mockResolvedValue([mockStation]);

      // Mock parameters
      prisma.parameter.findMany.mockResolvedValue([mockParameter]);

      // Mock sensor reading creation
      const mockCreatedReading = {
        id: '550e8400-e29b-41d4-a716-446655440004',
        stationId: mockStation.id,
        timestamp: new Date(mockMongoData.unixtime * 1000),
        mongoId: mockMongoData._id,
        valor: { temperature: expect.any(Number) },
        macEstacao: mockMongoData.uuid,
        uuidEstacao: mockStation.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      prisma.sensorReading.create.mockResolvedValue(mockCreatedReading);
      prisma.sensorReadingParameter.createMany.mockResolvedValue({ count: 1 });
      prisma.migrationState.upsert.mockResolvedValue(mockMigrationState);

      // Execute
      const result = await service.migrate();

      // Assert
      expect(result.totalProcessed).toBe(1);
      expect(result.successfulMigrations).toBe(1);
      expect(result.failedMigrations).toBe(0);
      expect(result.stationsMatched).toBe(1);
      expect(result.stationsNotFound).toBe(0);
      expect(prisma.sensorReading.create).toHaveBeenCalledWith({
        data: {
          stationId: mockStation.id,
          timestamp: new Date(mockMongoData.unixtime * 1000),
          mongoId: mockMongoData._id,
          valor: {
            temperatura: 25.5,
            umidade: 60.0,
            temperature: expect.any(Number)
          },
          macEstacao: mockMongoData.uuid,
          uuidEstacao: mockStation.id,
        }
      });
      expect(prisma.sensorReadingParameter.createMany).toHaveBeenCalledWith({
        data: [{
          sensorReadingId: mockCreatedReading.id,
          parameterId: mockParameter.id
        }]
      });
    });

    it('should handle station not found', async () => {
      // Setup
      prisma.migrationState.findUnique.mockResolvedValue(mockMigrationState);
      mongoService.connect.mockResolvedValue();
      mongoService.fetchDataSinceTimestamp.mockResolvedValue([mockMongoData]);
      mongoService.disconnect.mockResolvedValue();

      // Mock empty station mapping (station not found)
      prisma.meteorologicalStation.findMany.mockResolvedValue([]);

      // Execute
      const result = await service.migrate();

      // Assert
      expect(result.stationsNotFound).toBe(1);
      expect(result.stationsMatched).toBe(0);
      expect(result.successfulMigrations).toBe(0);
    });

    it('should handle sensor reading creation error', async () => {
      // Setup
      prisma.migrationState.findUnique.mockResolvedValue(mockMigrationState);
      mongoService.connect.mockResolvedValue();
      mongoService.fetchDataSinceTimestamp.mockResolvedValue([mockMongoData]);
      mongoService.disconnect.mockResolvedValue();

      // Mock station mapping
      prisma.meteorologicalStation.findMany.mockResolvedValue([mockStation]);

      // Mock parameters
      prisma.parameter.findMany.mockResolvedValue([mockParameter]);

      // Mock sensor reading creation error
      prisma.sensorReading.create.mockRejectedValue(new Error('Database error'));

      // Execute
      const result = await service.migrate();

      // Assert
      expect(result.failedMigrations).toBe(1);
      expect(result.successfulMigrations).toBe(0);
    });

    it('should handle first migration run', async () => {
      // Setup - no existing migration state
      prisma.migrationState.findUnique.mockResolvedValue(null);
      mongoService.connect.mockResolvedValue();
      mongoService.fetchDataSinceTimestamp.mockResolvedValue([]);
      mongoService.disconnect.mockResolvedValue();

      // Execute
      await service.migrate();

      // Assert
      expect(mongoService.fetchDataSinceTimestamp).toHaveBeenCalledWith(0);
    });
  });

  describe('getStationMacAddressMappings', () => {
    it('should return correct station mappings', async () => {
      prisma.meteorologicalStation.findMany.mockResolvedValue([mockStation]);

      const mappings = await service['getStationMacAddressMappings']();

      expect(mappings.get(mockStation.macAddress!)).toBe(mockStation.id);
      expect(mappings.size).toBe(1);
    });

    it('should handle stations without MAC addresses', async () => {
      const stationWithoutMAC = { ...mockStation, macAddress: null };
      prisma.meteorologicalStation.findMany.mockResolvedValue([stationWithoutMAC]);

      const mappings = await service['getStationMacAddressMappings']();

      expect(mappings.size).toBe(0);
    });
  });

  describe('getParametersByStationId', () => {
    it('should return parameters for given station ID', async () => {
      prisma.parameter.findMany.mockResolvedValue([mockParameter]);

      const parameters = await service['getParametersByStationId'](mockStation.id);

      expect(parameters).toEqual([mockParameter]);
      expect(prisma.parameter.findMany).toHaveBeenCalledWith({
        where: { stationId: mockStation.id },
        include: {
          tipoParametro: true,
          tipoAlerta: true
        }
      });
    });
  });

  describe('processParameterValues', () => {
    it('should process parameter values with calibration', () => {
      const readings = { temperatura: 25.0, umidade: 60.0 };

      const result = service['processParameterValues']([mockParameter], readings);

      expect(result).toHaveProperty('parameterValues');
      expect(result).toHaveProperty('calibratedReadings');
      expect(result.parameterValues).toHaveProperty('temperature');
      expect(typeof result.parameterValues.temperature).toBe('number');
    });

    it('should handle parameters with polynomial evaluation', () => {
      const paramWithPolynomial = {
        ...mockParameter,
        tipoParametro: {
          ...mockParameter.tipoParametro,
          polinomio: 'a0 + a1*temperatura',
          coeficiente: [1.0, 0.95]
        }
      };
      const readings = { temperatura: 25.0 };

      const result = service['processParameterValues']([paramWithPolynomial], readings);

      expect(result.parameterValues).toHaveProperty('temperature');
    });

    it('should handle missing calibration data', () => {
      const paramWithoutCalibration = {
        ...mockParameter,
        tipoParametro: {
          ...mockParameter.tipoParametro,
          leitura: {}
        }
      };
      const readings = { temperatura: 25.0 };

      const result = service['processParameterValues']([paramWithoutCalibration], readings);

      expect(Object.keys(result.parameterValues)).toHaveLength(0);
      expect(Object.keys(result.calibratedReadings)).toHaveLength(0);
    });
  });

  describe('extractSensorData', () => {
    it('should extract sensor data excluding core fields', () => {
      const result = service['extractSensorData'](mockMongoData);

      expect(result).toEqual({
        temperatura: 25.5,
        umidade: 60.0
      });
      expect(result).not.toHaveProperty('_id');
      expect(result).not.toHaveProperty('uuid');
      expect(result).not.toHaveProperty('unixtime');
    });
  });

  describe('resetSyncState', () => {
    it('should delete migration state', async () => {
      prisma.migrationState.deleteMany.mockResolvedValue({ count: 1 });

      await service.resetSyncState();

      expect(prisma.migrationState.deleteMany).toHaveBeenCalledWith({
        where: { name: mockConfig.syncName }
      });
    });
  });

  describe('getSyncStatus', () => {
    it('should return sync status when state exists', async () => {
      prisma.migrationState.findUnique.mockResolvedValue(mockMigrationState);

      const result = await service.getSyncStatus();

      expect(result).toEqual({
        name: mockMigrationState.name,
        lastSyncTimestamp: mockMigrationState.lastSyncTimestamp,
        lastSyncDate: new Date(mockMigrationState.lastSyncTimestamp * 1000).toISOString(),
        totalMigrated: mockMigrationState.totalMigrated,
        lastRunAt: mockMigrationState.lastRunAt.toISOString()
      });
    });

    it('should return null when no state exists', async () => {
      prisma.migrationState.findUnique.mockResolvedValue(null);

      const result = await service.getSyncStatus();

      expect(result).toBeNull();
    });
  });
});
