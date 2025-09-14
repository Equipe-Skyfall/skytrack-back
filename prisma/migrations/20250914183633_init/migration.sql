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

    CONSTRAINT "meteorological_stations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "meteorological_stations_name_key" ON "public"."meteorological_stations"("name");

-- CreateIndex
CREATE INDEX "meteorological_stations_status_idx" ON "public"."meteorological_stations"("status");

-- CreateIndex
CREATE INDEX "meteorological_stations_latitude_longitude_idx" ON "public"."meteorological_stations"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "meteorological_stations_name_idx" ON "public"."meteorological_stations"("name");
