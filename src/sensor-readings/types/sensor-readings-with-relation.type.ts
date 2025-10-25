import { Prisma } from "@prisma/client";

export type SensorReadingWithRelations = Prisma.SensorReadingGetPayload<{
  include: {
    parameters: {
      include: {
        parameter: {
          include: {
            tipoParametro: true
          }
        }
      }
    },
    alerts: true
  }
}>;