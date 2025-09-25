/*
  Warnings:

  - You are about to drop the column `alerta_id` on the `parameter` table. All the data in the column will be lost.
  - You are about to drop the column `calibration` on the `parameter` table. All the data in the column will be lost.
  - You are about to drop the column `coefficients` on the `parameter` table. All the data in the column will be lost.
  - You are about to drop the column `metric` on the `parameter` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `parameter` table. All the data in the column will be lost.
  - You are about to drop the column `polynomial` on the `parameter` table. All the data in the column will be lost.
  - You are about to drop the column `condition` on the `registered_alerts` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `registered_alerts` table. All the data in the column will be lost.
  - You are about to drop the column `durationMinutes` on the `registered_alerts` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `registered_alerts` table. All the data in the column will be lost.
  - You are about to drop the column `threshold` on the `registered_alerts` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[station_id,tipo_parametro_id]` on the table `parameter` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[station_id,parameter_id,tipo_alerta_id]` on the table `registered_alerts` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."parameter" DROP CONSTRAINT "parameter_alerta_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."parameter" DROP CONSTRAINT "parameter_station_id_fkey";

-- DropIndex
DROP INDEX "public"."parameter_name_idx";

-- DropIndex
DROP INDEX "public"."parameter_station_id_name_key";

-- DropIndex
DROP INDEX "public"."registered_alerts_station_id_parameter_id_level_key";

-- AlterTable
ALTER TABLE "public"."parameter" DROP COLUMN "alerta_id",
DROP COLUMN "calibration",
DROP COLUMN "coefficients",
DROP COLUMN "metric",
DROP COLUMN "name",
DROP COLUMN "polynomial",
ADD COLUMN     "tipo_alerta_id" TEXT;

-- AlterTable
ALTER TABLE "public"."registered_alerts" DROP COLUMN "condition",
DROP COLUMN "description",
DROP COLUMN "durationMinutes",
DROP COLUMN "level",
DROP COLUMN "threshold";

-- CreateIndex
CREATE INDEX "parameter_tipo_alerta_id_idx" ON "public"."parameter"("tipo_alerta_id");

-- CreateIndex
CREATE UNIQUE INDEX "parameter_station_id_tipo_parametro_id_key" ON "public"."parameter"("station_id", "tipo_parametro_id");

-- CreateIndex
CREATE UNIQUE INDEX "registered_alerts_station_id_parameter_id_tipo_alerta_id_key" ON "public"."registered_alerts"("station_id", "parameter_id", "tipo_alerta_id");

-- AddForeignKey
ALTER TABLE "public"."parameter" ADD CONSTRAINT "parameter_station_id_fkey" FOREIGN KEY ("station_id") REFERENCES "public"."meteorological_stations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."parameter" ADD CONSTRAINT "parameter_tipo_alerta_id_fkey" FOREIGN KEY ("tipo_alerta_id") REFERENCES "public"."tipo_alerta"("id") ON DELETE SET NULL ON UPDATE CASCADE;
