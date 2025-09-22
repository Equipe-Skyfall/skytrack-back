import { RegisteredAlerts } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { AlertFilters, AlertListResult, IAlertRepository } from "../interfaces/alert-repository.interface";
import { CreateAlertDto } from "../dto/create-alert.dto";
import { UpdateAlertDto } from "../dto/update-alert.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AlertRepository implements IAlertRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(filters: AlertFilters): Promise<AlertListResult> {
        const { level, page, limit } = filters;
        const skip = (page - 1) * limit;

        const where = level ? { level } : {};

        const [alerts, total] = await Promise.all([
            this.prisma.registeredAlerts.findMany({
                where,
                skip,
                take: limit,
                orderBy: { description: 'asc' },
                include: { parameter: { select: { id: true, name: true } } },
            }),
            this.prisma.registeredAlerts.count({ where }),
        ]);

        return { alerts, total };
    }

    async findById(id: string): Promise<RegisteredAlerts | null> {
        return this.prisma.registeredAlerts.findUnique({
            where: { id },
            include: { parameter: { select: { id: true, name: true } } },
        });
    }

    async findByMacAddress(filters: AlertFilters, macAddress: string): Promise<AlertListResult> {
        const { level, page, limit } = filters;
        const skip = (page - 1) * limit;

        const where = {
            stationId: macAddress,
            ...(level ? { level } : {}),
        };

        const [alerts, total] = await Promise.all([
            this.prisma.registeredAlerts.findMany({
                where,
                skip,
                take: limit,
                orderBy: { description: 'asc' },
                include: { parameter: { select: { id: true, name: true } } },
            }),
            this.prisma.registeredAlerts.count({ where }),
        ]);

        return { alerts, total };
    }

    async create(data: CreateAlertDto): Promise<RegisteredAlerts> {
        return this.prisma.registeredAlerts.create({
            data: {
                ...data,
                createdAt: new Date(),
            },
            include: {
                parameter: { select: { id: true, name: true } },
            },
        });
    }

    async update(id: string, data: UpdateAlertDto): Promise<RegisteredAlerts> {
        return this.prisma.registeredAlerts.update({
            where: { id },
            data,
            include: {
                parameter: { select: { id: true, name: true } },
            },
        });
    }

    async delete(id: string): Promise<void> {
        await this.prisma.registeredAlerts.delete({
            where: { id },
        });
    }

    async exists(id: string): Promise<boolean> {
        const alert = await this.prisma.registeredAlerts.findUnique({
            where: { id },
            select: { id: true },
        });
        return alert !== null;
    }
}
