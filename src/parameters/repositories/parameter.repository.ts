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

        const where = name ? { name } : {};

        const [parameters, total] = await Promise.all([
                this.prisma.parameter.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: 'asc' },
                include: { alerts: true, station: true },
            }),
            this.prisma.parameter.count(),
        ]);

        return { parameters, total };
    }

    async findById(id: string): Promise<Parameter | null> {
        return this.prisma.parameter.findUnique({
            where: { id },
            include: { alerts: true, station: true },
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
            ...(name ? { name } : {}),
        }

        const [parameters, total] = await Promise.all([
            this.prisma.parameter.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: 'asc' },
                include: { alerts: true, station: true },
            }),
            this.prisma.parameter.count({ where: { stationId: macAddress } }),
        ]);

        return { parameters, total };
    }

    async create(data: CreateParameterDto): Promise<Parameter> {
        return this.prisma.parameter.create({
            data: {
                ...data,
                calibration: data.calibration as unknown as Prisma.InputJsonValue,
            },
            include: { alerts: true, station: true },
        });
    }

    async update(id: string, data: UpdateParameterDto): Promise<Parameter> {
        return this.prisma.parameter.update({
                where: { id },
                data: {
                ...data,
                calibration: data.calibration as unknown as Prisma.InputJsonValue,
            },
            include: { alerts: true, station: true },
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
}