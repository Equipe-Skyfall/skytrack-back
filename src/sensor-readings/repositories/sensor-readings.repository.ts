import { PrismaService } from "../../prisma/prisma.service";
import { ISensorReadingsRepository, ReadingsFilters, SensorReadingsListResult } from "../interfaces/sensor-readings-repository.interface";
import { Injectable } from "@nestjs/common";
import { SensorReadingWithRelations } from "../types/sensor-readings-with-relation.type";

@Injectable()
export class SensorReadingsRepository implements ISensorReadingsRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(filters: ReadingsFilters): Promise<SensorReadingsListResult> {
        const {page, limit, dateRange, date, stationId} = filters;
        const skip = (page-1)*limit;

        const where: any = {};

        if (stationId) {
            where.stationId = stationId;
        }

        if (dateRange && dateRange.length === 2) {
            const [startDate, endDate] = dateRange;

            const startOfRange = new Date(startDate);
            startOfRange.setUTCHours(0, 0, 0, 0);

            const endOfRange = new Date(endDate);
            endOfRange.setUTCHours(23, 59, 59, 999);

            where.timestamp = {
                gte: startOfRange,
                lte: endOfRange,
            };
        } else if (date) {
            const startOfDay = new Date(date);
            startOfDay.setUTCHours(0, 0, 0, 0);

            const endOfDay = new Date(date);
            endOfDay.setUTCHours(23, 59, 59, 999);

            where.timestamp = {
                gte: startOfDay,
                lte: endOfDay,
            };
        }

        const [readings, total] = await Promise.all([
            this.prisma.sensorReading.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    timestamp: 'desc',
                },
                include: {
                    parameters: {
                        include: {
                            parameter: {
                                include: {
                                    tipoParametro: true,
                                }
                            },
                        },
                    },
                    alerts: {
                        include: {
                            tipoAlerta: {
                                select: { tipo: true },
                            },
                        },
                    },
                },
            }),
            this.prisma.sensorReading.count({ where }),
        ]);

        return {readings, total};
    }

    async findById(id: string): Promise<SensorReadingWithRelations | null> {
        return this.prisma.sensorReading.findUnique({
            where: { id },
            include: {
                parameters: {
                    include: {
                        parameter: {
                            include: {
                                tipoParametro: true,
                            },
                        },
                    },
                },
                alerts: {
                        include: {
                            tipoAlerta: {
                                select: { tipo: true },
                            },
                        },
                },
            },
        });
    }

    async exists(id: string): Promise<boolean> {
        const reading = await this.prisma.sensorReading.findUnique({
            where: {id},
            select: {id: true},
        });
        return reading !== null;
    }
}