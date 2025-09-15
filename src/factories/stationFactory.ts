import { randomUUID } from 'crypto';
import { IStation, ICreateStationDTO, IUpdateStationDTO, StationStatus } from '../types/station';

// Station Factory following Factory Pattern for creating Station entities
export interface IStationFactory {
  createStation(data: ICreateStationDTO): IStation;
  createStationFromData(data: any): IStation;
  updateStation(existingStation: IStation, updateData: IUpdateStationDTO): IStation;
  createFromExternalAPI(apiData: any): IStation;
}

export class StationFactory implements IStationFactory {
  /**
   * Create a new Station entity from DTO data with validation
   */
  createStation(data: ICreateStationDTO): IStation {
    const now = new Date();

    return {
      id: randomUUID(),
      name: this.sanitizeName(data.name),
      latitude: this.validateLatitude(data.latitude),
      longitude: this.validateLongitude(data.longitude),
      description: this.sanitizeDescription(data.description),
      status: data.status || StationStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Create Station entity from raw database data
   */
  createStationFromData(data: any): IStation {
    return {
      id: data.id,
      name: data.name,
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
      description: data.description,
      status: data.status as StationStatus,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  /**
   * Update existing station with new data
   */
  updateStation(existingStation: IStation, updateData: IUpdateStationDTO): IStation {
    return {
      ...existingStation,
      name: updateData.name !== undefined ? this.sanitizeName(updateData.name) : existingStation.name,
      latitude: updateData.latitude !== undefined ? this.validateLatitude(updateData.latitude) : existingStation.latitude,
      longitude: updateData.longitude !== undefined ? this.validateLongitude(updateData.longitude) : existingStation.longitude,
      description: updateData.description !== undefined ? this.sanitizeDescription(updateData.description) : existingStation.description,
      status: updateData.status !== undefined ? updateData.status : existingStation.status,
      updatedAt: new Date(),
    };
  }

  /**
   * Create station from external API data
   */
  createFromExternalAPI(apiData: any): IStation {
    return this.createStation({
      name: apiData.stationName || apiData.name,
      latitude: parseFloat(apiData.lat || apiData.latitude),
      longitude: parseFloat(apiData.lng || apiData.longitude),
      description: apiData.description || apiData.desc,
      status: this.mapExternalStatus(apiData.status),
    });
  }

  // Validation and sanitization helpers
  private sanitizeName(name: string): string {
    if (!name || name.trim().length === 0) {
      throw new Error('Station name is required');
    }

    const sanitized = name.trim();
    if (sanitized.length > 100) {
      throw new Error('Station name must be 100 characters or less');
    }

    return sanitized;
  }

  private validateLatitude(latitude: number): number {
    if (latitude < -90 || latitude > 90) {
      throw new Error('Latitude must be between -90 and 90');
    }
    return latitude;
  }

  private validateLongitude(longitude: number): number {
    if (longitude < -180 || longitude > 180) {
      throw new Error('Longitude must be between -180 and 180');
    }
    return longitude;
  }

  private sanitizeDescription(description?: string): string | undefined {
    if (!description) return undefined;

    const sanitized = description.trim();
    if (sanitized.length === 0) return undefined;

    if (sanitized.length > 500) {
      throw new Error('Description must be 500 characters or less');
    }

    return sanitized;
  }

  private mapExternalStatus(status?: string): StationStatus {
    if (!status) return StationStatus.ACTIVE;

    const upperStatus = status.toUpperCase();
    return upperStatus === 'INACTIVE' ? StationStatus.INACTIVE : StationStatus.ACTIVE;
  }
}

// Export factory instance
export const stationFactory = new StationFactory();