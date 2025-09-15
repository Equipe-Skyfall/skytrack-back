# MongoDB to PostgreSQL Migration System with MAC Address Integration

## 📋 Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Database Schema Changes](#database-schema-changes)
- [Core Components](#core-components)
- [API Endpoints](#api-endpoints)
- [Migration Flow](#migration-flow)
- [Duplicate Handling](#duplicate-handling)
- [Configuration](#configuration)
- [Usage Examples](#usage-examples)
- [Testing](#testing)

## 🎯 Overview

This system provides automated migration of sensor data from MongoDB to PostgreSQL, with comprehensive MAC address integration across all station components and sophisticated duplicate handling mechanisms.

### Key Features
- ✅ Automated scheduled migrations with cron jobs
- ✅ MAC address integration across all CRUD operations
- ✅ Advanced duplicate handling (skip, update, error modes)
- ✅ Real-time monitoring and statistics
- ✅ RESTful API for manual control
- ✅ Comprehensive error handling and logging

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     MongoDB     │    │  Migration      │    │   PostgreSQL    │
│                 │────│   System        │────│                 │
│ Sensor Data     │    │                 │    │ Relational Data │
│ {uuid, temp...} │    │ - Scheduler     │    │ Stations +      │
└─────────────────┘    │ - Transform     │    │ SensorReadings  │
                       │ - Validation    │    └─────────────────┘
                       └─────────────────┘
                              │
                       ┌─────────────────┐
                       │   REST API      │
                       │ /migration/*    │
                       │ /stations/*     │
                       └─────────────────┘
```

## 🗄️ Database Schema Changes

### 1. Updated MeteorologicalStation Model

```prisma
// prisma/schema.prisma
model MeteorologicalStation {
  id          String                     @id @default(uuid())
  name        String                     @unique @db.VarChar(100)
  macAddress  String?                    @unique @db.VarChar(50) @map("mac_address") // NEW
  latitude    Decimal                    @db.Decimal(10, 8)
  longitude   Decimal                    @db.Decimal(11, 8)
  address     String?                    @db.VarChar(255)
  description String?                    @db.Text
  status      MeteorologicalStationStatus @default(ACTIVE)
  createdAt   DateTime                   @default(now()) @map("created_at")
  updatedAt   DateTime                   @updatedAt @map("updated_at")

  // Relations
  sensorReadings SensorReading[]          // NEW

  @@index([status])
  @@index([latitude, longitude])
  @@index([name])
  @@index([macAddress])                   // NEW
  @@map("meteorological_stations")
}
```

### 2. New SensorReading Model

```prisma
// Sensor Reading model - stores migrated data from MongoDB
model SensorReading {
  id             String                 @id @default(uuid())
  stationId      String                 @map("station_id")
  timestamp      DateTime               // Converted from MongoDB unixtime
  mongoId        String                 @unique @map("mongo_id") // Original MongoDB _id for tracking
  temperature    Decimal?               @db.Decimal(5, 2)
  humidity       Decimal?               @db.Decimal(5, 2)
  pressure       Decimal?               @db.Decimal(8, 2)
  rainfall       Decimal?               @db.Decimal(6, 2)
  createdAt      DateTime               @default(now()) @map("created_at")
  updatedAt      DateTime               @updatedAt @map("updated_at")

  // Relations
  station MeteorologicalStation @relation(fields: [stationId], references: [id], onDelete: Cascade)

  @@index([stationId])
  @@index([timestamp])
  @@index([stationId, timestamp])
  @@map("sensor_readings")
}
```

## 🧩 Core Components

### 1. MongoDB Data Service

```typescript
// src/services/mongoDataService.ts
export interface MongoSensorData {
  _id: string;
  uuid: string;           // MAC address identifier
  unixtime: number;       // Timestamp
  temperatura?: number;   // Temperature
  umidade?: number;       // Humidity
  chuva?: number;         // Rainfall
  pressao?: number;       // Pressure
  [key: string]: any;
}

export class MongoDataService {
  async fetchRecentData(limitCount: number = 10): Promise<MongoSensorData[]> {
    const data = await this.collection
      .find({})
      .sort({ unixtime: -1 })
      .limit(limitCount)
      .toArray();
    return data;
  }

  async fetchDataByStation(uuid: string): Promise<MongoSensorData[]> {
    const data = await this.collection.find({ uuid }).toArray();
    return data;
  }
}
```

### 2. Migration Service with Duplicate Handling

```typescript
// src/services/mongoToPostgresMigrationService.ts
export interface MigrationConfig {
  batchSize: number;
  maxRetries: number;
  retryDelayMs: number;
  duplicateHandling: 'skip' | 'update' | 'error';  // NEW
  syncMode: 'incremental' | 'full';                // NEW
}

export interface MigrationStats {
  totalProcessed: number;
  successfulMigrations: number;
  failedMigrations: number;
  skippedDuplicates: number;
  updatedDuplicates: number;    // NEW
  stationsMatched: number;
  stationsNotFound: number;
  startTime: Date;
  endTime?: Date;
  duration?: number;
}

export class MongoToPostgresMigrationService {
  private async handleDuplicate(
    mongoRecord: MongoSensorData,
    existingReading: any,
    stationId: string,
    stats: MigrationStats
  ): Promise<void> {
    switch (this.config.duplicateHandling) {
      case 'skip':
        console.log(`Record ${mongoRecord._id} already exists, skipping`);
        stats.skippedDuplicates++;
        break;

      case 'update':
        try {
          const updatedReading = {
            stationId,
            timestamp: new Date(mongoRecord.unixtime * 1000),
            temperature: this.convertToDecimal(mongoRecord.temperatura),
            humidity: this.convertToDecimal(mongoRecord.umidade),
            pressure: this.convertToDecimal(mongoRecord.pressao),
            rainfall: this.convertToDecimal(mongoRecord.chuva),
          };

          await this.prisma.sensorReading.update({
            where: { mongoId: mongoRecord._id },
            data: updatedReading,
          });

          stats.updatedDuplicates++;
        } catch (error) {
          stats.failedMigrations++;
        }
        break;

      case 'error':
        throw new Error(`Duplicate record found: ${mongoRecord._id}`);
    }
  }

  private async processBatch(
    batch: MongoSensorData[],
    stationMappings: Map<string, string>,
    stats: MigrationStats
  ): Promise<void> {
    for (const mongoRecord of batch) {
      // Match MongoDB UUID with station MAC address
      const stationId = stationMappings.get(mongoRecord.uuid);

      if (!stationId) {
        console.warn(`No station found for MAC address: ${mongoRecord.uuid}`);
        stats.stationsNotFound++;
        continue;
      }

      // Check for existing record
      const existingReading = await this.prisma.sensorReading.findUnique({
        where: { mongoId: mongoRecord._id },
      });

      if (existingReading) {
        await this.handleDuplicate(mongoRecord, existingReading, stationId, stats);
        continue;
      }

      // Transform and create new record
      const sensorReading = {
        stationId,
        timestamp: new Date(mongoRecord.unixtime * 1000),
        mongoId: mongoRecord._id,
        temperature: this.convertToDecimal(mongoRecord.temperatura),
        humidity: this.convertToDecimal(mongoRecord.umidade),
        pressure: this.convertToDecimal(mongoRecord.pressao),
        rainfall: this.convertToDecimal(mongoRecord.chuva),
      };

      // Add to batch for bulk insert
      sensorReadings.push(sensorReading);
    }

    // Bulk insert new records
    if (sensorReadings.length > 0) {
      await this.prisma.sensorReading.createMany({
        data: sensorReadings,
        skipDuplicates: true,
      });
      stats.successfulMigrations += sensorReadings.length;
    }
  }
}
```

### 3. Scheduler Service

```typescript
// src/services/migrationSchedulerService.ts
export class MigrationSchedulerService {
  private scheduledTask: cron.ScheduledTask | null = null;

  constructor(
    prisma: PrismaClient,
    mongoConnectionString?: string,
    config: SchedulerConfig = {
      cronExpression: '*/15 * * * *', // Every 15 minutes
      enabled: true,
      timezone: 'America/Sao_Paulo',
    }
  ) {
    this.config = config;
    const mongoService = new MongoDataService(mongoConnectionString);
    this.migrationService = new MongoToPostgresMigrationService(prisma, mongoService);
  }

  start(): void {
    this.scheduledTask = cron.schedule(
      this.config.cronExpression,
      this.executeMigration.bind(this),
      { timezone: this.config.timezone }
    );
    console.log(`Migration scheduler started with expression: ${this.config.cronExpression}`);
  }

  async executeMigration(): Promise<void> {
    const migrationStats = await this.migrationService.migrate();
    console.log('Migration completed:', migrationStats);
  }
}
```

### 4. Enhanced Station Service with MAC Address Support

```typescript
// src/services/stationService.ts
export class StationService implements IStationService {
  async createStation(stationData: ICreateStationDTO): Promise<ApiResponse<IStation>> {
    // Validate input data
    const validationResult = this.validator.validateCreate(stationData);
    if (!validationResult.isValid) {
      return { success: false, error: validationResult.errors.join(', ') };
    }

    // Check for duplicate name
    const nameExists = await this.stationRepository.existsByName(stationData.name);
    if (nameExists) {
      return { success: false, error: `Station with name '${stationData.name}' already exists` };
    }

    // Check for duplicate MAC address if provided
    if (stationData.macAddress && this.stationRepository.existsByMacAddress) {
      const macExists = await this.stationRepository.existsByMacAddress(stationData.macAddress);
      if (macExists) {
        return {
          success: false,
          error: `Station with MAC address '${stationData.macAddress}' already exists`
        };
      }
    }

    const station = await this.stationRepository.create(stationData);
    return { success: true, data: station, message: 'Station created successfully' };
  }

  async getStationByMacAddress(macAddress: string): Promise<ApiResponse<IStation>> {
    if (!this.stationRepository.findByMacAddress) {
      return { success: false, error: 'MAC address lookup not supported' };
    }

    const station = await this.stationRepository.findByMacAddress(macAddress.trim());
    if (!station) {
      return { success: false, error: `Station with MAC address '${macAddress}' not found` };
    }

    return { success: true, data: station, message: 'Station retrieved successfully' };
  }
}
```

### 5. Enhanced Repository with MAC Address Operations

```typescript
// src/repositories/prismaStationRepository.ts
export class StationRepository implements IStationRepository {
  async create(stationData: ICreateStationDTO): Promise<IStation> {
    const station = await this.prisma.meteorologicalStation.create({
      data: {
        name: stationData.name.trim(),
        macAddress: stationData.macAddress?.trim() || null,  // NEW
        latitude: stationData.latitude,
        longitude: stationData.longitude,
        address: stationData.address?.trim() || null,
        description: stationData.description?.trim() || null,
        status: stationData.status ? this.mapToMeteorologicalStationStatus(stationData.status)
                                   : MeteorologicalStationStatus.ACTIVE,
      },
    });
    return this.mapToIStation(station);
  }

  async existsByMacAddress(macAddress: string, excludeId?: string): Promise<boolean> {
    const where: Prisma.MeteorologicalStationWhereInput = {
      macAddress: macAddress.trim(),
    };

    if (excludeId) {
      where.NOT = { id: excludeId };
    }

    const count = await this.prisma.meteorologicalStation.count({ where });
    return count > 0;
  }

  async findByMacAddress(macAddress: string): Promise<IStation | null> {
    const station = await this.prisma.meteorologicalStation.findUnique({
      where: { macAddress: macAddress.trim() },
    });
    return station ? this.mapToIStation(station) : null;
  }

  private mapToIStation(station: MeteorologicalStation): IStation {
    return {
      id: station.id,
      name: station.name,
      macAddress: station.macAddress || undefined,  // NEW
      latitude: station.latitude.toNumber(),
      longitude: station.longitude.toNumber(),
      address: station.address || undefined,
      description: station.description || undefined,
      status: this.mapToStationStatus(station.status),
      createdAt: station.createdAt,
      updatedAt: station.updatedAt,
    };
  }
}
```

### 6. Enhanced Validation with MAC Address Support

```typescript
// src/middleware/stationValidation.ts
export const STATION_VALIDATION_RULES = {
  MAC_ADDRESS: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 50,
    PATTERN: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$|^[0-9A-Fa-f-]+$/, // MAC or UUID format
  },
  // ... other rules
} as const;

abstract class BaseValidationMiddleware {
  protected isValidMacAddress(value: any): boolean {
    if (typeof value !== 'string') return false;
    const trimmed = value.trim();

    if (trimmed.length === 0 || trimmed.length > STATION_VALIDATION_RULES.MAC_ADDRESS.MAX_LENGTH) {
      return false;
    }

    return STATION_VALIDATION_RULES.MAC_ADDRESS.PATTERN.test(trimmed);
  }
}

class CreateStationValidation extends BaseValidationMiddleware {
  validate = (req: Request, res: Response, next: NextFunction): void => {
    const { name, macAddress, latitude, longitude, address, description, status } = req.body;
    const errors: ValidationError[] = [];

    // Validate MAC address if provided
    if (macAddress !== undefined && macAddress !== null) {
      if (!this.isValidMacAddress(macAddress)) {
        errors.push({ field: 'macAddress', message: 'Invalid MAC address format' });
      }
    }

    // ... other validations

    if (errors.length > 0) {
      this.sendValidationError(res, errors);
      return;
    }
    next();
  };
}
```

## 🛠️ API Endpoints

### Migration Control Endpoints

```typescript
// src/routes/migrationRoutes.ts

// Get migration status
GET /api/migration/status
Response: {
  "success": true,
  "data": {
    "isRunning": false,
    "isScheduled": true,
    "nextExecution": "2024-01-15T10:30:00.000Z",
    "lastExecution": "2024-01-15T10:15:00.000Z",
    "totalExecutions": 25,
    "lastMigrationStats": {
      "totalProcessed": 150,
      "successfulMigrations": 145,
      "skippedDuplicates": 5,
      "updatedDuplicates": 0
    }
  }
}

// Trigger manual migration
POST /api/migration/trigger
Response: {
  "success": true,
  "data": {
    "totalProcessed": 50,
    "successfulMigrations": 45,
    "skippedDuplicates": 3,
    "updatedDuplicates": 2,
    "duration": 2500
  }
}

// Update migration configuration
PUT /api/migration/config
Body: {
  "duplicateHandling": "update",
  "syncMode": "incremental",
  "cronExpression": "0 */6 * * *"
}

// Start/Stop scheduler
POST /api/migration/start
POST /api/migration/stop
```

### Enhanced Station Endpoints

```typescript
// src/routes/stationRoutes.ts

// Find station by MAC address
GET /api/stations/mac/{macAddress}
Example: GET /api/stations/mac/ESP32001
Response: {
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "Weather Station Alpha",
    "macAddress": "ESP32001",
    "latitude": -23.5505,
    "longitude": -46.6333
  }
}

// Create station with MAC address
POST /api/stations
Body: {
  "name": "Weather Station Beta",
  "macAddress": "ESP32002",
  "latitude": -23.5515,
  "longitude": -46.6343,
  "description": "Rooftop weather station"
}
```

## 🔄 Migration Flow

### Complete Migration Process

```typescript
// Migration Flow Diagram
┌─────────────────────────────────────────────────────────────────┐
│                    MIGRATION PROCESS FLOW                      │
└─────────────────────────────────────────────────────────────────┘

1. SCHEDULER TRIGGER (Every 15 minutes)
   │
   ├─ Check if migration is already running
   │
   └─ Execute Migration
      │
      ├─ 2. CONNECT TO DATABASES
      │  ├─ MongoDB Connection
      │  └─ PostgreSQL Connection (Prisma)
      │
      ├─ 3. FETCH DATA
      │  ├─ Get new sensor data from MongoDB
      │  └─ Build station MAC address mappings
      │
      ├─ 4. PROCESS IN BATCHES (100 records per batch)
      │  │
      │  └─ For each MongoDB record:
      │     ├─ Match UUID with station MAC address
      │     │
      │     ├─ Check if record exists (by mongoId)
      │     │
      │     ├─ Handle Duplicates:
      │     │  ├─ SKIP: Ignore existing records
      │     │  ├─ UPDATE: Update existing records
      │     │  └─ ERROR: Throw exception on duplicates
      │     │
      │     └─ Transform & Insert New Records:
      │        ├─ Convert unixtime to DateTime
      │        ├─ Map sensor fields (temperatura → temperature)
      │        ├─ Convert to Decimal types
      │        └─ Bulk insert to PostgreSQL
      │
      ├─ 5. FINALIZE
      │  ├─ Update migration statistics
      │  ├─ Update last sync timestamp
      │  └─ Log results
      │
      └─ 6. DISCONNECT & CLEANUP
```

### Data Transformation Example

```typescript
// MongoDB Document
{
  "_id": "60f8d1234567890abcdef123",
  "uuid": "ESP32001",                    // MAC Address
  "unixtime": 1672531200,               // Unix timestamp
  "temperatura": 23.5,                  // Temperature in Celsius
  "umidade": 65.2,                      // Humidity percentage
  "chuva": 0.0,                        // Rainfall in mm
  "pressao": 1013.25                   // Pressure in hPa
}

// Transformed PostgreSQL Record
{
  "id": "generated-uuid",
  "stationId": "station-uuid-from-mac-mapping",
  "mongoId": "60f8d1234567890abcdef123",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "temperature": 23.50,
  "humidity": 65.20,
  "rainfall": 0.00,
  "pressure": 1013.25,
  "createdAt": "2023-01-01T00:00:01.000Z",
  "updatedAt": "2023-01-01T00:00:01.000Z"
}
```

## 🔄 Duplicate Handling

### Three Handling Modes

```typescript
enum DuplicateHandling {
  SKIP = 'skip',      // Default: Skip existing records
  UPDATE = 'update',  // Update existing records with new data
  ERROR = 'error'     // Throw error on duplicates (strict mode)
}
```

### Implementation Details

```typescript
private async handleDuplicate(
  mongoRecord: MongoSensorData,
  existingReading: any,
  stationId: string,
  stats: MigrationStats
): Promise<void> {
  switch (this.config.duplicateHandling) {
    case 'skip':
      console.log(`Record ${mongoRecord._id} already exists, skipping`);
      stats.skippedDuplicates++;
      break;

    case 'update':
      try {
        const updatedReading = {
          stationId,
          timestamp: new Date(mongoRecord.unixtime * 1000),
          temperature: this.convertToDecimal(mongoRecord.temperatura),
          humidity: this.convertToDecimal(mongoRecord.umidade),
          pressure: this.convertToDecimal(mongoRecord.pressao),
          rainfall: this.convertToDecimal(mongoRecord.chuva),
        };

        await this.prisma.sensorReading.update({
          where: { mongoId: mongoRecord._id },
          data: updatedReading,
        });

        console.log(`Record ${mongoRecord._id} updated`);
        stats.updatedDuplicates++;
      } catch (error) {
        console.error(`Error updating duplicate record ${mongoRecord._id}:`, error);
        stats.failedMigrations++;
      }
      break;

    case 'error':
      throw new Error(`Duplicate record found: ${mongoRecord._id}. Migration stopped.`);

    default:
      console.log(`Record ${mongoRecord._id} already exists, skipping (default behavior)`);
      stats.skippedDuplicates++;
  }
}
```

## ⚙️ Configuration

### Environment Variables

```bash
# .env file
DATABASE_URL="postgresql://user:password@localhost:5432/skytrack"
MONGODB_CONNECTION_STRING="mongodb+srv://user:pass@cluster.mongodb.net/dadosClima"

# Migration Settings
MIGRATION_CRON_EXPRESSION="*/15 * * * *"  # Every 15 minutes
MIGRATION_ENABLED="true"
MIGRATION_TIMEZONE="America/Sao_Paulo"
MIGRATION_DUPLICATE_HANDLING="skip"       # skip | update | error
MIGRATION_SYNC_MODE="incremental"         # incremental | full
MIGRATION_BATCH_SIZE="100"
```

### Server Integration

```typescript
// src/server.ts
import { PrismaClient } from './generated/prisma';
import { initializeMigrationRoutes } from './routes/migrationRoutes';
import { MigrationManager } from './services/migrationManager';

const prisma = new PrismaClient();
const app = express();

// Initialize migration system
const migrationManager = MigrationManager.getInstance(prisma);
migrationManager.initialize({
  cronExpression: process.env.MIGRATION_CRON_EXPRESSION || '*/15 * * * *',
  enabled: process.env.MIGRATION_ENABLED === 'true',
  timezone: process.env.MIGRATION_TIMEZONE || 'America/Sao_Paulo',
});

// Start automatic migrations
migrationManager.start();

// Register API routes
app.use('/api/migration', initializeMigrationRoutes(prisma));

// Graceful shutdown
process.on('SIGTERM', () => {
  migrationManager.stop();
  prisma.$disconnect();
});
```

## 💻 Usage Examples

### 1. Creating Stations with MAC Addresses

```bash
# Create multiple stations that match your MongoDB UUIDs
curl -X POST http://localhost:3000/api/stations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ESP32 Weather Station 001",
    "macAddress": "ESP32001",
    "latitude": -23.5505,
    "longitude": -46.6333,
    "description": "Primary weather station"
  }'

curl -X POST http://localhost:3000/api/stations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Arduino Weather Station",
    "macAddress": "WEATHER01",
    "latitude": -23.5515,
    "longitude": -46.6343,
    "description": "Secondary weather station"
  }'
```

### 2. Configuring Migration for Different Scenarios

```bash
# For first-time setup (skip duplicates)
curl -X PUT http://localhost:3000/api/migration/config \
  -H "Content-Type: application/json" \
  -d '{
    "duplicateHandling": "skip",
    "syncMode": "full",
    "cronExpression": "*/15 * * * *"
  }'

# For data synchronization (update duplicates)
curl -X PUT http://localhost:3000/api/migration/config \
  -H "Content-Type: application/json" \
  -d '{
    "duplicateHandling": "update",
    "syncMode": "incremental",
    "cronExpression": "*/5 * * * *"
  }'

# For strict data integrity (error on duplicates)
curl -X PUT http://localhost:3000/api/migration/config \
  -H "Content-Type: application/json" \
  -d '{
    "duplicateHandling": "error",
    "syncMode": "incremental"
  }'
```

### 3. Manual Migration Control

```bash
# Check migration status
curl http://localhost:3000/api/migration/status

# Trigger manual migration
curl -X POST http://localhost:3000/api/migration/trigger

# Start/stop scheduler
curl -X POST http://localhost:3000/api/migration/start
curl -X POST http://localhost:3000/api/migration/stop

# View migration statistics
curl http://localhost:3000/api/migration/stats
```

### 4. Station Management by MAC Address

```bash
# Find station by MAC address
curl http://localhost:3000/api/stations/mac/ESP32001

# Update station MAC address
curl -X PUT http://localhost:3000/api/stations/{station-id} \
  -H "Content-Type: application/json" \
  -d '{
    "macAddress": "ESP32001-UPDATED"
  }'

# List all stations with sensor readings
curl http://localhost:3000/api/migration/readings/recent?limit=50
```

## 🧪 Testing

### Automated Test Suite

```typescript
// Run comprehensive migration tests
npx ts-node src/scripts/testMigrationWithDuplicateHandling.ts

// Test basic system functionality
npx ts-node src/scripts/testMigrationSystem.ts

// Explore MongoDB data structure
npx ts-node src/scripts/exploreMongoData.ts
```

### Manual Testing Steps

```bash
# 1. Setup test data
npm run db:reset
npm run db:migrate

# 2. Create test stations
curl -X POST http://localhost:3000/api/stations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Station 1",
    "macAddress": "ESP32001",
    "latitude": -23.5505,
    "longitude": -46.6333
  }'

# 3. Run first migration (should create new records)
curl -X POST http://localhost:3000/api/migration/trigger

# 4. Run second migration with skip mode (should skip duplicates)
curl -X PUT http://localhost:3000/api/migration/config \
  -d '{"duplicateHandling": "skip"}'
curl -X POST http://localhost:3000/api/migration/trigger

# 5. Run third migration with update mode (should update existing)
curl -X PUT http://localhost:3000/api/migration/config \
  -d '{"duplicateHandling": "update"}'
curl -X POST http://localhost:3000/api/migration/trigger

# 6. Check results
curl http://localhost:3000/api/migration/stats
```

### Expected Test Results

```json
{
  "migration1": {
    "totalProcessed": 100,
    "successfulMigrations": 100,
    "skippedDuplicates": 0,
    "updatedDuplicates": 0
  },
  "migration2_skip": {
    "totalProcessed": 100,
    "successfulMigrations": 0,
    "skippedDuplicates": 100,
    "updatedDuplicates": 0
  },
  "migration3_update": {
    "totalProcessed": 100,
    "successfulMigrations": 0,
    "skippedDuplicates": 0,
    "updatedDuplicates": 100
  }
}
```

## 📊 Monitoring & Troubleshooting

### Migration Status Monitoring

```typescript
// Check system health
GET /api/migration/validate
{
  "mongoConnection": true,
  "postgresConnection": true,
  "stationMappings": {
    "totalStations": 5,
    "stationsWithMac": 3,
    "stationsWithoutMac": 2,
    "macAddresses": ["ESP32001", "ESP32002", "WEATHER01"]
  },
  "cronExpression": true
}

// View recent migrations
GET /api/migration/status
{
  "isRunning": false,
  "totalExecutions": 150,
  "totalSuccessfulExecutions": 148,
  "totalFailedExecutions": 2,
  "lastMigrationStats": { /* detailed stats */ }
}
```

### Common Issues & Solutions

#### Issue 1: No stations found for MAC addresses
```bash
# Check what MAC addresses exist in MongoDB
npx ts-node src/scripts/exploreMongoData.ts

# Create stations with matching MAC addresses
curl -X POST /api/stations -d '{
  "name": "Station for ESP32001",
  "macAddress": "ESP32001",
  "latitude": -23.5505,
  "longitude": -46.6333
}'
```

#### Issue 2: Duplicate handling errors
```javascript
// Check current duplicate handling mode
curl /api/migration/config

// Change to more permissive mode
curl -X PUT /api/migration/config -d '{
  "duplicateHandling": "skip"
}'
```

#### Issue 3: Migration performance issues
```javascript
// Reduce batch size for slower systems
curl -X PUT /api/migration/config -d '{
  "batchSize": 50,
  "duplicateHandling": "skip"
}'
```

## 🚀 Deployment Checklist

### Pre-deployment Setup
- [ ] MongoDB connection string configured
- [ ] PostgreSQL database migrated
- [ ] Environment variables set
- [ ] Stations created with MAC addresses matching MongoDB UUIDs
- [ ] Migration configuration tested

### Post-deployment Verification
- [ ] Migration scheduler starts automatically
- [ ] API endpoints respond correctly
- [ ] First migration completes successfully
- [ ] Duplicate handling works as expected
- [ ] Logs show successful station matching

### Production Configuration
```bash
# Production environment variables
MIGRATION_CRON_EXPRESSION="*/15 * * * *"  # Every 15 minutes
MIGRATION_DUPLICATE_HANDLING="skip"       # Conservative approach
MIGRATION_BATCH_SIZE="100"                # Balanced performance
MIGRATION_SYNC_MODE="incremental"         # Efficient syncing
```

## 📝 Summary

This migration system provides:

✅ **Complete automation** - Runs every 15 minutes without intervention
✅ **MAC address integration** - Full CRUD support across all components
✅ **Flexible duplicate handling** - Skip, update, or error on existing data
✅ **Comprehensive monitoring** - Detailed statistics and status reporting
✅ **RESTful API control** - Manual override and configuration capabilities
✅ **Production-ready** - Error handling, logging, and graceful shutdown
✅ **Scalable architecture** - Batch processing and configurable performance

The system handles the complete flow from MongoDB sensor data to PostgreSQL relational storage, with sophisticated duplicate handling and comprehensive station management capabilities.