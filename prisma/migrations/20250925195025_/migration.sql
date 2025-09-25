/*
  Warnings:

  - You are about to drop the column `createdAt` on the `registered_alerts` table. All the data in the column will be lost.
  - You are about to drop the column `parameters` on the `sensor_readings` table. All the data in the column will be lost.
  - You are about to drop the column `readings` on the `sensor_readings` table. All the data in the column will be lost.
  - Added the required column `tipo_parametro_id` to the `parameter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipo_alerta_id` to the `registered_alerts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valor` to the `sensor_readings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."parameter" ADD COLUMN     "alerta_id" TEXT,
ADD COLUMN     "tipo_parametro_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."registered_alerts" DROP COLUMN "createdAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "medidas_id" TEXT,
ADD COLUMN     "tipo_alerta_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."sensor_readings" DROP COLUMN "parameters",
DROP COLUMN "readings",
ADD COLUMN     "mac_estacao" TEXT,
ADD COLUMN     "uuid_estacao" TEXT,
ADD COLUMN     "valor" JSONB NOT NULL;

-- CreateTable
CREATE TABLE "public"."tipo_parametro" (
    "id" TEXT NOT NULL,
    "json_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "metrica" TEXT NOT NULL,
    "polinomio" TEXT,
    "coeficiente" DOUBLE PRECISION[],
    "leitura" JSONB NOT NULL,

    CONSTRAINT "tipo_parametro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tipo_alerta" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "publica" BOOLEAN NOT NULL,
    "condicao" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "limite" DECIMAL(65,30) NOT NULL,
    "nivel" TEXT NOT NULL DEFAULT 'warning',
    "duracao_min" INTEGER,

    CONSTRAINT "tipo_alerta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sensor_reading_parameters" (
    "sensorReadingId" TEXT NOT NULL,
    "parameterId" TEXT NOT NULL,

    CONSTRAINT "sensor_reading_parameters_pkey" PRIMARY KEY ("sensorReadingId","parameterId")
);

-- CreateIndex
CREATE INDEX "parameter_tipo_parametro_id_idx" ON "public"."parameter"("tipo_parametro_id");

-- CreateIndex
CREATE INDEX "registered_alerts_tipo_alerta_id_idx" ON "public"."registered_alerts"("tipo_alerta_id");

-- CreateIndex
CREATE INDEX "registered_alerts_medidas_id_idx" ON "public"."registered_alerts"("medidas_id");

-- AddForeignKey
ALTER TABLE "public"."parameter" ADD CONSTRAINT "parameter_tipo_parametro_id_fkey" FOREIGN KEY ("tipo_parametro_id") REFERENCES "public"."tipo_parametro"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."parameter" ADD CONSTRAINT "parameter_alerta_id_fkey" FOREIGN KEY ("alerta_id") REFERENCES "public"."registered_alerts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."registered_alerts" ADD CONSTRAINT "registered_alerts_tipo_alerta_id_fkey" FOREIGN KEY ("tipo_alerta_id") REFERENCES "public"."tipo_alerta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."registered_alerts" ADD CONSTRAINT "registered_alerts_medidas_id_fkey" FOREIGN KEY ("medidas_id") REFERENCES "public"."sensor_readings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sensor_reading_parameters" ADD CONSTRAINT "sensor_reading_parameters_sensorReadingId_fkey" FOREIGN KEY ("sensorReadingId") REFERENCES "public"."sensor_readings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sensor_reading_parameters" ADD CONSTRAINT "sensor_reading_parameters_parameterId_fkey" FOREIGN KEY ("parameterId") REFERENCES "public"."parameter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
