import { SensorReadingWithRelations } from "../types/sensor-readings-with-relation.type";

export const SENSOR_READINGS_REPOSITORY_TOKEN = 'ISensorReadingsRepository';

export interface ReadingsFilters {
    page: number;
    limit: number;
    dateRange?: [Date, Date];
    date?: Date;
    stationId?: string;
}

export interface SensorReadingsListResult {
    readings: SensorReadingWithRelations[];
    total: number;
}

export interface ISensorReadingsRepository {
    findAll(filters: ReadingsFilters): Promise<SensorReadingsListResult>;
    findById(id: string): Promise<SensorReadingWithRelations | null>;
    exists(id: string): Promise<boolean>;
}