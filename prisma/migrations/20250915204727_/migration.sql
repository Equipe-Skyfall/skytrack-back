-- CreateEnum
CREATE TYPE "public"."MeteorologicalStationStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "public"."meteorological_stations" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "description" TEXT,
    "status" "public"."MeteorologicalStationStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "address" VARCHAR(255),
    "mac_address" VARCHAR(50),

    CONSTRAINT "meteorological_stations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sensor_readings" (
    "id" TEXT NOT NULL,
    "station_id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "mongo_id" TEXT NOT NULL,
    "readings" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sensor_readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."meteorological_readings" (
    "id" TEXT NOT NULL,
    "station_id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "mongo_id" TEXT NOT NULL,
    "temperatura" DECIMAL(5,2),
    "umidade" DECIMAL(5,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meteorological_readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."migration_states" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "last_sync_timestamp" INTEGER NOT NULL,
    "total_migrated" INTEGER NOT NULL DEFAULT 0,
    "last_run_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "migration_states_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "meteorological_stations_name_key" ON "public"."meteorological_stations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "meteorological_stations_mac_address_key" ON "public"."meteorological_stations"("mac_address");

-- CreateIndex
CREATE INDEX "meteorological_stations_status_idx" ON "public"."meteorological_stations"("status");

-- CreateIndex
CREATE INDEX "meteorological_stations_latitude_longitude_idx" ON "public"."meteorological_stations"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "meteorological_stations_name_idx" ON "public"."meteorological_stations"("name");

-- CreateIndex
CREATE INDEX "meteorological_stations_mac_address_idx" ON "public"."meteorological_stations"("mac_address");

-- CreateIndex
CREATE UNIQUE INDEX "sensor_readings_mongo_id_key" ON "public"."sensor_readings"("mongo_id");

-- CreateIndex
CREATE INDEX "sensor_readings_station_id_idx" ON "public"."sensor_readings"("station_id");

-- CreateIndex
CREATE INDEX "sensor_readings_timestamp_idx" ON "public"."sensor_readings"("timestamp");

-- CreateIndex
CREATE INDEX "sensor_readings_station_id_timestamp_idx" ON "public"."sensor_readings"("station_id", "timestamp");

-- CreateIndex
CREATE INDEX "sensor_readings_mongo_id_idx" ON "public"."sensor_readings"("mongo_id");

-- CreateIndex
CREATE UNIQUE INDEX "meteorological_readings_mongo_id_key" ON "public"."meteorological_readings"("mongo_id");

-- CreateIndex
CREATE INDEX "meteorological_readings_station_id_idx" ON "public"."meteorological_readings"("station_id");

-- CreateIndex
CREATE INDEX "meteorological_readings_timestamp_idx" ON "public"."meteorological_readings"("timestamp");

-- CreateIndex
CREATE INDEX "meteorological_readings_station_id_timestamp_idx" ON "public"."meteorological_readings"("station_id", "timestamp");

-- CreateIndex
CREATE INDEX "meteorological_readings_temperatura_idx" ON "public"."meteorological_readings"("temperatura");

-- CreateIndex
CREATE INDEX "meteorological_readings_umidade_idx" ON "public"."meteorological_readings"("umidade");

-- CreateIndex
CREATE UNIQUE INDEX "migration_states_name_key" ON "public"."migration_states"("name");

-- AddForeignKey
ALTER TABLE "public"."sensor_readings" ADD CONSTRAINT "sensor_readings_station_id_fkey" FOREIGN KEY ("station_id") REFERENCES "public"."meteorological_stations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."meteorological_readings" ADD CONSTRAINT "meteorological_readings_station_id_fkey" FOREIGN KEY ("station_id") REFERENCES "public"."meteorological_stations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
