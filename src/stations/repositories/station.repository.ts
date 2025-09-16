import { Injectable } from '@nestjs/common';
import type { MeteorologicalStation } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  IStationRepository,
  StationFilters,
  StationListResult
} from '../interfaces/station-repository.interface';
import { CreateStationDto, StationStatus } from '../dto/create-station.dto';
import { UpdateStationDto } from '../dto/update-station.dto';

@Injectable()
export class StationRepository implements IStationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: StationFilters): Promise<StationListResult> {
    const { page, limit, status } = filters;
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const [stations, total] = await Promise.all([
      this.prisma.meteorologicalStation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.meteorologicalStation.count({ where }),
    ]);

    return { stations, total };
  }

  async findById(id: string): Promise<MeteorologicalStation | null> {
    return this.prisma.meteorologicalStation.findUnique({
      where: { id },
    });
  }

  async findByMacAddress(macAddress: string): Promise<MeteorologicalStation | null> {
    return this.prisma.meteorologicalStation.findUnique({
      where: { macAddress },
    });
  }

  async create(data: CreateStationDto): Promise<MeteorologicalStation> {
    return this.prisma.meteorologicalStation.create({
      data: {
        ...data,
        status: data.status || StationStatus.ACTIVE,
      },
    });
  }

  async update(id: string, data: UpdateStationDto): Promise<MeteorologicalStation> {
    return this.prisma.meteorologicalStation.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.meteorologicalStation.delete({
      where: { id },
    });
  }

  async exists(id: string): Promise<boolean> {
    const station = await this.prisma.meteorologicalStation.findUnique({
      where: { id },
      select: { id: true },
    });
    return station !== null;
  }
}