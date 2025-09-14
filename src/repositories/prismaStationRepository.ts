import { PrismaClient, MeteorologicalStation, MeteorologicalStationStatus, Prisma } from '../generated/prisma';
import {
  IStation,
  ICreateStationDTO,
  IUpdateStationDTO,
  IStationQueryParams,
  StationStatus,
} from '../types/station';
import { IStationRepository } from './stationRepository';

// Prisma Station Repository implementation following Repository Pattern
export class PrismaStationRepository implements IStationRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(queryParams?: IStationQueryParams): Promise<IStation[]> {
    const where: Prisma.MeteorologicalStationWhereInput = {};

    // Build where conditions based on query parameters
    if (queryParams?.name) {
      where.name = {
        contains: queryParams.name,
        mode: 'insensitive',
      };
    }

    if (queryParams?.status) {
      where.status = this.mapToMeteorologicalStationStatus(queryParams.status);
    }

    // Build latitude filter
    const latitudeFilter: any = {};
    if (queryParams?.minLatitude !== undefined) {
      latitudeFilter.gte = queryParams.minLatitude;
    }
    if (queryParams?.maxLatitude !== undefined) {
      latitudeFilter.lte = queryParams.maxLatitude;
    }
    if (Object.keys(latitudeFilter).length > 0) {
      where.latitude = latitudeFilter;
    }

    // Build longitude filter
    const longitudeFilter: any = {};
    if (queryParams?.minLongitude !== undefined) {
      longitudeFilter.gte = queryParams.minLongitude;
    }
    if (queryParams?.maxLongitude !== undefined) {
      longitudeFilter.lte = queryParams.maxLongitude;
    }
    if (Object.keys(longitudeFilter).length > 0) {
      where.longitude = longitudeFilter;
    }

    const stations = await this.prisma.meteorologicalStation.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: queryParams?.limit || undefined,
      skip: queryParams?.offset || undefined,
    });

    return stations.map((station) => this.mapToIStation(station));
  }

  async findById(id: string): Promise<IStation | null> {
    const station = await this.prisma.meteorologicalStation.findUnique({
      where: { id },
    });

    return station ? this.mapToIStation(station) : null;
  }

  async create(stationData: ICreateStationDTO): Promise<IStation> {
    const station = await this.prisma.meteorologicalStation.create({
      data: {
        name: stationData.name.trim(),
        latitude: stationData.latitude,
        longitude: stationData.longitude,
        address: stationData.address?.trim() || null,
        description: stationData.description?.trim() || null,
        status: stationData.status
          ? this.mapToMeteorologicalStationStatus(stationData.status)
          : MeteorologicalStationStatus.ACTIVE,
      },
    });

    return this.mapToIStation(station);
  }

  async update(id: string, stationData: IUpdateStationDTO): Promise<IStation | null> {
    try {
      const data: Prisma.MeteorologicalStationUpdateInput = {};

      if (stationData.name !== undefined) {
        data.name = stationData.name.trim();
      }

      if (stationData.latitude !== undefined) {
        data.latitude = stationData.latitude;
      }

      if (stationData.longitude !== undefined) {
        data.longitude = stationData.longitude;
      }

      if (stationData.address !== undefined) {
        data.address = stationData.address?.trim() || null;
      }

      if (stationData.description !== undefined) {
        data.description = stationData.description?.trim() || null;
      }

      if (stationData.status !== undefined) {
        data.status = this.mapToMeteorologicalStationStatus(stationData.status);
      }

      const station = await this.prisma.meteorologicalStation.update({
        where: { id },
        data,
      });

      return this.mapToIStation(station);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          // Record not found
          return null;
        }
      }
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.meteorologicalStation.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          // Record not found
          return false;
        }
      }
      throw error;
    }
  }

  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    const where: Prisma.MeteorologicalStationWhereInput = {
      name: name.trim(),
    };

    if (excludeId) {
      where.NOT = {
        id: excludeId,
      };
    }

    const count = await this.prisma.meteorologicalStation.count({
      where,
    });

    return count > 0;
  }

  async count(queryParams?: IStationQueryParams): Promise<number> {
    const where: Prisma.MeteorologicalStationWhereInput = {};

    // Apply same filters as findAll
    if (queryParams?.name) {
      where.name = {
        contains: queryParams.name,
        mode: 'insensitive',
      };
    }

    if (queryParams?.status) {
      where.status = this.mapToMeteorologicalStationStatus(queryParams.status);
    }

    // Build latitude filter
    const latitudeFilter: any = {};
    if (queryParams?.minLatitude !== undefined) {
      latitudeFilter.gte = queryParams.minLatitude;
    }
    if (queryParams?.maxLatitude !== undefined) {
      latitudeFilter.lte = queryParams.maxLatitude;
    }
    if (Object.keys(latitudeFilter).length > 0) {
      where.latitude = latitudeFilter;
    }

    // Build longitude filter
    const longitudeFilter: any = {};
    if (queryParams?.minLongitude !== undefined) {
      longitudeFilter.gte = queryParams.minLongitude;
    }
    if (queryParams?.maxLongitude !== undefined) {
      longitudeFilter.lte = queryParams.maxLongitude;
    }
    if (Object.keys(longitudeFilter).length > 0) {
      where.longitude = longitudeFilter;
    }

    return await this.prisma.meteorologicalStation.count({
      where,
    });
  }

  // Helper method to map Prisma model to IStation interface
  private mapToIStation(station: MeteorologicalStation): IStation {
    return {
      id: station.id,
      name: station.name,
      latitude: station.latitude.toNumber(),
      longitude: station.longitude.toNumber(),
      address: station.address || undefined,
      description: station.description || undefined,
      status: this.mapToStationStatus(station.status),
      createdAt: station.createdAt,
      updatedAt: station.updatedAt,
    };
  }

  // Helper method to map from StationStatus to MeteorologicalStationStatus
  private mapToMeteorologicalStationStatus(status: StationStatus): MeteorologicalStationStatus {
    switch (status) {
      case StationStatus.ACTIVE:
        return MeteorologicalStationStatus.ACTIVE;
      case StationStatus.INACTIVE:
        return MeteorologicalStationStatus.INACTIVE;
      default:
        return MeteorologicalStationStatus.ACTIVE;
    }
  }

  // Helper method to map from MeteorologicalStationStatus to StationStatus
  private mapToStationStatus(status: MeteorologicalStationStatus): StationStatus {
    switch (status) {
      case MeteorologicalStationStatus.ACTIVE:
        return StationStatus.ACTIVE;
      case MeteorologicalStationStatus.INACTIVE:
        return StationStatus.INACTIVE;
      default:
        return StationStatus.ACTIVE;
    }
  }
}

