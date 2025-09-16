import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import type { MeteorologicalStation } from '@prisma/client';
import { CreateStationDto, StationStatus } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';
import { StationDto } from './dto/station.dto';
import { StationsListDto } from './dto/stations-list.dto';
import { IStationRepository, STATION_REPOSITORY_TOKEN } from './interfaces/station-repository.interface';

@Injectable()
export class StationsService {
  constructor(
    @Inject(STATION_REPOSITORY_TOKEN)
    private readonly stationRepository: IStationRepository
  ) {}

  async getAllStations(
    page: number,
    limit: number,
    status?: StationStatus,
  ): Promise<StationsListDto> {
    const result = await this.stationRepository.findAll({ page, limit, status });
    const totalPages = Math.ceil(result.total / limit);

    return {
      data: result.stations.map(this.mapToStationDto),
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages,
      },
    };
  }

  async getStationById(id: string): Promise<StationDto> {
    const station = await this.stationRepository.findById(id);

    if (!station) {
      throw new NotFoundException(`Station with ID ${id} not found`);
    }

    return this.mapToStationDto(station);
  }

  async getStationByMacAddress(macAddress: string): Promise<StationDto> {
    const station = await this.stationRepository.findByMacAddress(macAddress);

    if (!station) {
      throw new NotFoundException(
        `Station with MAC address ${macAddress} not found`,
      );
    }

    return this.mapToStationDto(station);
  }

  async createStation(createStationDto: CreateStationDto): Promise<StationDto> {
    const station = await this.stationRepository.create(createStationDto);
    return this.mapToStationDto(station);
  }

  async updateStation(
    id: string,
    updateStationDto: UpdateStationDto,
  ): Promise<StationDto> {
    // Check if station exists
    const exists = await this.stationRepository.exists(id);
    if (!exists) {
      throw new NotFoundException(`Station with ID ${id} not found`);
    }

    const station = await this.stationRepository.update(id, updateStationDto);
    return this.mapToStationDto(station);
  }

  async deleteStation(id: string): Promise<void> {
    // Check if station exists
    const exists = await this.stationRepository.exists(id);
    if (!exists) {
      throw new NotFoundException(`Station with ID ${id} not found`);
    }

    await this.stationRepository.delete(id);
  }

  private mapToStationDto(station: MeteorologicalStation): StationDto {
    return {
      id: station.id,
      name: station.name,
      macAddress: station.macAddress,
      latitude: Number(station.latitude),
      longitude: Number(station.longitude),
      address: station.address,
      description: station.description,
      status: station.status as StationStatus,
      createdAt: station.createdAt,
      updatedAt: station.updatedAt,
    };
  }
}