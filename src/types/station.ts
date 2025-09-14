// Station Status Enum
export enum StationStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

// Re-export Prisma generated types for advanced use cases
export type {
  MeteorologicalStation as PrismaStation,
  MeteorologicalStationStatus as PrismaStationStatus,
  Prisma,
} from '../generated/prisma';

// Base Station interface following Single Responsibility Principle
export interface IStation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  description?: string;
  status: StationStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Station creation DTO (Data Transfer Object)
export interface ICreateStationDTO {
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  description?: string;
  status?: StationStatus;
}

// Station update DTO
export interface IUpdateStationDTO {
  name?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  description?: string;
  status?: StationStatus;
}

// Station query parameters for filtering
export interface IStationQueryParams {
  name?: string;
  status?: StationStatus;
  minLatitude?: number;
  maxLatitude?: number;
  minLongitude?: number;
  maxLongitude?: number;
  limit?: number;
  offset?: number;
}

// Validation interfaces following Interface Segregation Principle
export interface IStationValidator {
  validateCreate(data: ICreateStationDTO): IValidationResult;
  validateUpdate(data: IUpdateStationDTO): IValidationResult;
  validateCoordinates(latitude: number, longitude: number): IValidationResult;
}

export interface IValidationResult {
  isValid: boolean;
  errors: string[];
}

// Station validation rules
export const STATION_VALIDATION_RULES = {
  NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
  },
  ADDRESS: {
    MAX_LENGTH: 255,
  },
  DESCRIPTION: {
    MAX_LENGTH: 500,
  },
  LATITUDE: {
    MIN: -90,
    MAX: 90,
  },
  LONGITUDE: {
    MIN: -180,
    MAX: 180,
  },
} as const;

// Station validation implementation
export class StationValidator implements IStationValidator {
  validateCreate(data: ICreateStationDTO): IValidationResult {
    const errors: string[] = [];

    // Validate required fields
    if (!data.name || data.name.trim().length === 0) {
      errors.push('Name is required');
    }

    if (data.latitude === undefined || data.latitude === null) {
      errors.push('Latitude is required');
    }

    if (data.longitude === undefined || data.longitude === null) {
      errors.push('Longitude is required');
    }

    // Validate name length
    if (data.name && (data.name.trim().length < STATION_VALIDATION_RULES.NAME.MIN_LENGTH ||
        data.name.trim().length > STATION_VALIDATION_RULES.NAME.MAX_LENGTH)) {
      errors.push(`Name must be between ${STATION_VALIDATION_RULES.NAME.MIN_LENGTH} and ${STATION_VALIDATION_RULES.NAME.MAX_LENGTH} characters`);
    }

    // Validate address length
    if (data.address && data.address.length > STATION_VALIDATION_RULES.ADDRESS.MAX_LENGTH) {
      errors.push(`Address must not exceed ${STATION_VALIDATION_RULES.ADDRESS.MAX_LENGTH} characters`);
    }

    // Validate description length
    if (data.description && data.description.length > STATION_VALIDATION_RULES.DESCRIPTION.MAX_LENGTH) {
      errors.push(`Description must not exceed ${STATION_VALIDATION_RULES.DESCRIPTION.MAX_LENGTH} characters`);
    }

    // Validate coordinates
    const coordinateValidation = this.validateCoordinates(data.latitude, data.longitude);
    errors.push(...coordinateValidation.errors);

    // Validate status if provided
    if (data.status && !Object.values(StationStatus).includes(data.status)) {
      errors.push('Invalid status value');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validateUpdate(data: IUpdateStationDTO): IValidationResult {
    const errors: string[] = [];

    // Validate name if provided
    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        errors.push('Name cannot be empty');
      } else if (data.name.trim().length < STATION_VALIDATION_RULES.NAME.MIN_LENGTH ||
                 data.name.trim().length > STATION_VALIDATION_RULES.NAME.MAX_LENGTH) {
        errors.push(`Name must be between ${STATION_VALIDATION_RULES.NAME.MIN_LENGTH} and ${STATION_VALIDATION_RULES.NAME.MAX_LENGTH} characters`);
      }
    }

    // Validate address if provided
    if (data.address !== undefined && data.address.length > STATION_VALIDATION_RULES.ADDRESS.MAX_LENGTH) {
      errors.push(`Address must not exceed ${STATION_VALIDATION_RULES.ADDRESS.MAX_LENGTH} characters`);
    }

    // Validate description if provided
    if (data.description !== undefined && data.description.length > STATION_VALIDATION_RULES.DESCRIPTION.MAX_LENGTH) {
      errors.push(`Description must not exceed ${STATION_VALIDATION_RULES.DESCRIPTION.MAX_LENGTH} characters`);
    }

    // Validate coordinates if provided
    if (data.latitude !== undefined && (data.latitude < STATION_VALIDATION_RULES.LATITUDE.MIN || data.latitude > STATION_VALIDATION_RULES.LATITUDE.MAX)) {
      errors.push(`Latitude must be between ${STATION_VALIDATION_RULES.LATITUDE.MIN} and ${STATION_VALIDATION_RULES.LATITUDE.MAX}`);
    }

    if (data.longitude !== undefined && (data.longitude < STATION_VALIDATION_RULES.LONGITUDE.MIN || data.longitude > STATION_VALIDATION_RULES.LONGITUDE.MAX)) {
      errors.push(`Longitude must be between ${STATION_VALIDATION_RULES.LONGITUDE.MIN} and ${STATION_VALIDATION_RULES.LONGITUDE.MAX}`);
    }

    // Validate status if provided
    if (data.status !== undefined && !Object.values(StationStatus).includes(data.status)) {
      errors.push('Invalid status value');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validateCoordinates(latitude: number, longitude: number): IValidationResult {
    const errors: string[] = [];

    if (latitude < STATION_VALIDATION_RULES.LATITUDE.MIN || latitude > STATION_VALIDATION_RULES.LATITUDE.MAX) {
      errors.push(`Latitude must be between ${STATION_VALIDATION_RULES.LATITUDE.MIN} and ${STATION_VALIDATION_RULES.LATITUDE.MAX}`);
    }

    if (longitude < STATION_VALIDATION_RULES.LONGITUDE.MIN || longitude > STATION_VALIDATION_RULES.LONGITUDE.MAX) {
      errors.push(`Longitude must be between ${STATION_VALIDATION_RULES.LONGITUDE.MIN} and ${STATION_VALIDATION_RULES.LONGITUDE.MAX}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Factory for creating validator instances
export class StationValidatorFactory {
  static create(): IStationValidator {
    return new StationValidator();
  }
}