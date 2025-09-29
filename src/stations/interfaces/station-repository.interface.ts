import { StationStatus } from '../dto/create-station.dto';
import { CreateStationDto } from '../dto/create-station.dto';
import { UpdateStationDto } from '../dto/update-station.dto';
import type { MeteorologicalStation } from '@prisma/client';

export const STATION_REPOSITORY_TOKEN = 'IStationRepository';

export interface StationFilters {
  status?: StationStatus;
  page: number;
  limit: number;
}

export interface StationListResult {
  stations: MeteorologicalStation[];
  total: number;
}

export interface IStationRepository {
  findAll(filters: StationFilters): Promise<StationListResult>;
  findById(id: string): Promise<MeteorologicalStation | null>;
  findByMacAddress(macAddress: string): Promise<MeteorologicalStation | null>;
  create(data: CreateStationDto): Promise<MeteorologicalStation>;
  update(id: string, data: UpdateStationDto): Promise<MeteorologicalStation>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
  existsByMAC(macAddress: string): Promise<boolean>;
}