/*
  Warnings:

  - You are about to drop the `meteorological_readings` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `parameters` to the `sensor_readings` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."meteorological_readings" DROP CONSTRAINT "meteorological_readings_station_id_fkey";

-- AlterTable
ALTER TABLE "public"."sensor_readings" ADD COLUMN     "parameters" JSONB NOT NULL;

-- DropTable
DROP TABLE "public"."meteorological_readings";

-- CreateTable
CREATE TABLE "public"."parameter" (
    "id" TEXT NOT NULL,
    "station_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "calibration" JSONB NOT NULL,
    "polynomial" TEXT,
    "coefficients" DOUBLE PRECISION[],

    CONSTRAINT "parameter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."registered_alerts" (
    "id" TEXT NOT NULL,
    "station_id" TEXT NOT NULL,
    "parameter_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "threshold" DECIMAL(65,30) NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'warning',
    "condition" TEXT NOT NULL DEFAULT 'GREATER_THAN',
    "durationMinutes" INTEGER,

    CONSTRAINT "registered_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "parameter_station_id_idx" ON "public"."parameter"("station_id");

-- CreateIndex
CREATE INDEX "parameter_name_idx" ON "public"."parameter"("name");

-- CreateIndex
CREATE UNIQUE INDEX "parameter_station_id_name_key" ON "public"."parameter"("station_id", "name");

-- CreateIndex
CREATE INDEX "registered_alerts_station_id_idx" ON "public"."registered_alerts"("station_id");

-- CreateIndex
CREATE INDEX "registered_alerts_parameter_id_idx" ON "public"."registered_alerts"("parameter_id");

-- CreateIndex
CREATE UNIQUE INDEX "registered_alerts_station_id_parameter_id_level_key" ON "public"."registered_alerts"("station_id", "parameter_id", "level");

-- AddForeignKey
ALTER TABLE "public"."parameter" ADD CONSTRAINT "parameter_station_id_fkey" FOREIGN KEY ("station_id") REFERENCES "public"."meteorological_stations"("mac_address") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."registered_alerts" ADD CONSTRAINT "registered_alerts_station_id_fkey" FOREIGN KEY ("station_id") REFERENCES "public"."meteorological_stations"("mac_address") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."registered_alerts" ADD CONSTRAINT "registered_alerts_parameter_id_fkey" FOREIGN KEY ("parameter_id") REFERENCES "public"."parameter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
