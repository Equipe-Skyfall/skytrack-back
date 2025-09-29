import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateParameterDto } from '../dto/create-parameter.dto';
import { UpdateParameterDto } from '../dto/update-parameter.dto';
import { ParameterFilters, ParameterListResult, IParameterRepository } from '../interfaces/parameter-repository.interface';
import { Parameter, Prisma } from '@prisma/client';

@Injectable()
export class ParameterRepository implements IParameterRepository {
  constructor(private readonly prisma: PrismaService) {}

    async findAll(filters: ParameterFilters): Promise<ParameterListResult> {
        const { page, limit, name } = filters;
        const skip = (page - 1) * limit;

        const where = name ? { tipoParametro: { nome: { contains: name, mode: Prisma.QueryMode.insensitive } } } : {};

        const [parameters, total] = await Promise.all([
                this.prisma.parameter.findMany({
                where,
                skip,
                take: limit,
                orderBy: { tipoParametro: { nome: 'asc' } },
                include: {
                    alerts: true,
                    station: true,
                    tipoParametro: true,
                    tipoAlerta: true
                },
            }),
            this.prisma.parameter.count({ where }),
        ]);

        return { parameters, total };
    }

    async findById(id: string): Promise<Parameter | null> {
        return this.prisma.parameter.findUnique({
            where: { id },
            include: {
                alerts: true,
                station: true,
                tipoParametro: true,
                tipoAlerta: true
            },
        });
    }

    async findByMacAddress(
        filters: ParameterFilters,
        macAddress: string,
    ): Promise<ParameterListResult> {
        const { page, limit, name } = filters;
        const skip = (page - 1) * limit;

        const where = {
            stationId: macAddress,
            ...(name ? { tipoParametro: { nome: { contains: name, mode: Prisma.QueryMode.insensitive } } } : {}),
        }

        const [parameters, total] = await Promise.all([
            this.prisma.parameter.findMany({
                where,
                skip,
                take: limit,
                orderBy: { tipoParametro: { nome: 'asc' } },
                include: {
                    alerts: true,
                    station: true,
                    tipoParametro: true,
                    tipoAlerta: true
                },
            }),
            this.prisma.parameter.count({ where: { stationId: macAddress } }),
        ]);

        return { parameters, total };
    }

    async findByStationId(
        filters: ParameterFilters,
        stationId: string,
    ): Promise<ParameterListResult> {
        const { page, limit, name } = filters;
        const skip = (page - 1) * limit;

        const where = {
            stationId: stationId,
            ...(name ? { tipoParametro: { nome: { contains: name, mode: Prisma.QueryMode.insensitive } } } : {}),
        }

        const [parameters, total] = await Promise.all([
            this.prisma.parameter.findMany({
                where,
                skip,
                take: limit,
                orderBy: { tipoParametro: { nome: 'asc' } },
                include: {
                    alerts: true,
                    station: true,
                    tipoParametro: true,
                    tipoAlerta: true
                },
            }),
            this.prisma.parameter.count({ where: { stationId: stationId } }),
        ]);

        return { parameters, total };
    }

    async create(data: CreateParameterDto): Promise<Parameter> {
        return this.prisma.parameter.create({
            data: {
                ...data,
            },
            include: {
                alerts: true,
                station: true,
                tipoParametro: true,
                tipoAlerta: true
            },
        });
    }

    async update(id: string, data: UpdateParameterDto): Promise<Parameter> {
        return this.prisma.parameter.update({
                where: { id },
                data: {
                ...data,
            },
            include: {
                alerts: true,
                station: true,
                tipoParametro: true,
                tipoAlerta: true
            },
        });
    }

    async delete(id: string): Promise<void> {
        await this.prisma.parameter.delete({
            where: { id },
        });
    }

    async exists(id: string): Promise<boolean> {
        const parameter = await this.prisma.parameter.findUnique({
            where: { id },
            select: { id: true },
        });
        return parameter !== null;
    }

    async tipoParametroExists(id: string): Promise<boolean> {
        const tipoParametro = await this.prisma.tipoParametro.findUnique({
            where: { id },
            select: { id: true },
        });
        return tipoParametro !== null;
    }

    async tipoAlertaExists(id: string): Promise<boolean> {
        const tipoAlerta = await this.prisma.tipoAlerta.findUnique({
            where: { id },
            select: { id: true },
        });
        return tipoAlerta !== null;
    }
}