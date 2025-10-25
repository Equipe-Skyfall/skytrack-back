import { RegisteredAlerts } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { AlertFilters, AlertListResult, IAlertRepository } from "../interfaces/alert-repository.interface";
import { CreateAlertDto } from "../dto/create-alert.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AlertRepository implements IAlertRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(filters: AlertFilters): Promise<AlertListResult> {
        const { level, search, is_active, page, limit } = filters;
        const skip = (page - 1) * limit;

        const tipoAlertaFilter: any = {};

        if (level) tipoAlertaFilter.nivel = level;
        if (search) tipoAlertaFilter.tipo = { contains: search, mode: 'insensitive' };

        const where: any = {
            ...(Object.keys(tipoAlertaFilter).length && { tipoAlerta: tipoAlertaFilter }),
            ...(typeof is_active === 'boolean' && { active: is_active }),
        };

        const [alerts, total] = await Promise.all([
            this.prisma.registeredAlerts.findMany({
                where,
                skip,
                take: limit,
                orderBy: { data: 'desc' },
                include: {
                    parameter: { select: { id: true } },
                    tipoAlerta: { select: { id: true, tipo: true, nivel: true } }
                },
            }),
            this.prisma.registeredAlerts.count({ where }),
        ]);

        return { alerts, total };
    }

    async findById(id: string): Promise<RegisteredAlerts | null> {
        return this.prisma.registeredAlerts.findUnique({
            where: { id },
            include: {
                parameter: { select: { id: true } },
                tipoAlerta: { select: { id: true, tipo: true, nivel: true } }
            },
        });
    }

    async findByMacAddress(filters: AlertFilters, macAddress: string): Promise<AlertListResult> {
        const { level, search, is_active, page, limit } = filters;
        const skip = (page - 1) * limit;

        const tipoAlertaFilter: any = {};

        if (level) tipoAlertaFilter.nivel = level;
        if (search) tipoAlertaFilter.tipo = { contains: search, mode: 'insensitive' };

        const where: any = {
            stationId: macAddress,
            ...(Object.keys(tipoAlertaFilter).length && { tipoAlerta: tipoAlertaFilter }),
            ...(typeof is_active === 'boolean' && { active: is_active }),
        };

        const [alerts, total] = await Promise.all([
            this.prisma.registeredAlerts.findMany({
                where,
                skip,
                take: limit,
                orderBy: { data: 'desc' },
                include: {
                    parameter: { select: { id: true } },
                    tipoAlerta: { select: { id: true, tipo: true, nivel: true } }
                },
            }),
            this.prisma.registeredAlerts.count({ where }),
        ]);

        return { alerts, total };
    }

    async create(data: CreateAlertDto): Promise<RegisteredAlerts> {
        return this.prisma.registeredAlerts.create({
            data: {
                ...data,
            },
            include: {
                parameter: { select: { id: true } },
                tipoAlerta: { select: { id: true, tipo: true, nivel: true } }
            },
        });
    }

    async update(id: string): Promise<RegisteredAlerts> {
        const current = await this.prisma.registeredAlerts.findUnique({
            where: { id },
            select: { active: true },
        });

        if (!current) {
            throw new Error(`Registered alert with ID ${id} not found.`);
        }

        const updated = await this.prisma.registeredAlerts.update({
            where: { id },
            data: { active: !current.active },
            include: {
                parameter: { select: { id: true } },
                tipoAlerta: { select: { id: true, tipo: true, nivel: true } },
            },
        });

        return updated;
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
