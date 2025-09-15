import {
  IStation,
  ICreateStationDTO,
  IUpdateStationDTO,
  IStationQueryParams,
  IStationValidator,
  StationValidatorFactory,
} from '../types/station';
import { IStationRepository } from '../repositories/stationRepository';
import { ApiResponse } from '../types';
import { stationFactory } from '../factories/stationFactory';

// Custom error classes for better error handling
export class StationNotFoundError extends Error {
  constructor(id: string) {
    super(`Station with ID ${id} not found`);
    this.name = 'StationNotFoundError';
  }
}

export class StationValidationError extends Error {
  constructor(public errors: string[]) {
    super(`Validation failed: ${errors.join(', ')}`);
    this.name = 'StationValidationError';
  }
}

export class DuplicateStationNameError extends Error {
  constructor(name: string) {
    super(`Station with name '${name}' already exists`);
    this.name = 'DuplicateStationNameError';
  }
}

export class DuplicateMacAddressError extends Error {
  constructor(macAddress: string) {
    super(`Station with MAC address '${macAddress}' already exists`);
    this.name = 'DuplicateMacAddressError';
  }
}

// Service interface following Dependency Inversion Principle
export interface IStationService {
  getAllStations(queryParams?: IStationQueryParams): Promise<ApiResponse<{
    stations: IStation[];
    total: number;
    page?: number;
    limit?: number;
  }>>;
  getStationById(id: string): Promise<ApiResponse<IStation>>;
  getStationByMacAddress?(macAddress: string): Promise<ApiResponse<IStation>>;
  createStation(stationData: ICreateStationDTO): Promise<ApiResponse<IStation>>;
  updateStation(id: string, stationData: IUpdateStationDTO): Promise<ApiResponse<IStation>>;
  deleteStation(id: string): Promise<ApiResponse<null>>;
}

// Station Service implementation following Single Responsibility Principle
export class StationService implements IStationService {
  private validator: IStationValidator;

  constructor(private stationRepository: IStationRepository) {
    this.validator = StationValidatorFactory.create();
  }

  async getAllStations(queryParams?: IStationQueryParams): Promise<ApiResponse<{
    stations: IStation[];
    total: number;
    page?: number;
    limit?: number;
  }>> {
    try {
      // Validate query parameters
      const validatedParams = this.validateQueryParams(queryParams);

      // Get stations and total count
      const [stations, total] = await Promise.all([
        this.stationRepository.findAll(validatedParams),
        this.stationRepository.count(validatedParams),
      ]);

      const response = {
        stations,
        total,
        ...(validatedParams.limit && { limit: validatedParams.limit }),
        ...(validatedParams.offset && validatedParams.limit && {
          page: Math.floor(validatedParams.offset / validatedParams.limit) + 1,
        }),
      };

      return {
        success: true,
        data: response,
        message: `Retrieved ${stations.length} stations`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async getStationById(id: string): Promise<ApiResponse<IStation>> {
    try {
      if (!this.isValidUUID(id)) {
        return {
          success: false,
          error: 'Invalid station ID format',
        };
      }

      const station = await this.stationRepository.findById(id);

      if (!station) {
        return {
          success: false,
          error: `Station with ID ${id} not found`,
        };
      }

      return {
        success: true,
        data: station,
        message: 'Station retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async createStation(stationData: ICreateStationDTO): Promise<ApiResponse<IStation>> {
    try {
      // Validate input data
      const validationResult = this.validator.validateCreate(stationData);
      if (!validationResult.isValid) {
        return {
          success: false,
          error: `Validation failed: ${validationResult.errors.join(', ')}`,
        };
      }

      // Check for duplicate name
      const nameExists = await this.stationRepository.existsByName(stationData.name);
      if (nameExists) {
        return {
          success: false,
          error: `Station with name '${stationData.name}' already exists`,
        };
      }

      // Check for duplicate MAC address if provided
      if (stationData.macAddress && this.stationRepository.existsByMacAddress) {
        const macExists = await this.stationRepository.existsByMacAddress(stationData.macAddress);
        if (macExists) {
          return {
            success: false,
            error: `Station with MAC address '${stationData.macAddress}' already exists`,
          };
        }
      }

      // Create the station entity using factory (with validation)
      const stationEntity = stationFactory.createStation(stationData);

      // Save to repository
      const station = await this.stationRepository.create(stationEntity);

      return {
        success: true,
        data: station,
        message: 'Station created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async getStationByMacAddress(macAddress: string): Promise<ApiResponse<IStation>> {
    try {
      if (!macAddress || !macAddress.trim()) {
        return {
          success: false,
          error: 'MAC address is required',
        };
      }

      if (!this.stationRepository.findByMacAddress) {
        return {
          success: false,
          error: 'MAC address lookup not supported by this repository',
        };
      }

      const station = await this.stationRepository.findByMacAddress(macAddress.trim());

      if (!station) {
        return {
          success: false,
          error: `Station with MAC address '${macAddress}' not found`,
        };
      }

      return {
        success: true,
        data: station,
        message: 'Station retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async updateStation(id: string, stationData: IUpdateStationDTO): Promise<ApiResponse<IStation>> {
    try {
      // Validate ID format
      if (!this.isValidUUID(id)) {
        return {
          success: false,
          error: 'Invalid station ID format',
        };
      }

      // Validate input data
      const validationResult = this.validator.validateUpdate(stationData);
      if (!validationResult.isValid) {
        return {
          success: false,
          error: `Validation failed: ${validationResult.errors.join(', ')}`,
        };
      }

      // Check for duplicate name (if name is being updated)
      if (stationData.name) {
        const nameExists = await this.stationRepository.existsByName(stationData.name, id);
        if (nameExists) {
          return {
            success: false,
            error: `Station with name '${stationData.name}' already exists`,
          };
        }
      }

      // Check for duplicate MAC address (if MAC address is being updated)
      if (stationData.macAddress && this.stationRepository.existsByMacAddress) {
        const macExists = await this.stationRepository.existsByMacAddress(stationData.macAddress, id);
        if (macExists) {
          return {
            success: false,
            error: `Station with MAC address '${stationData.macAddress}' already exists`,
          };
        }
      }

      // Update the station in repository (validation already done above)
      const updatedStation = await this.stationRepository.update(id, stationData);

      if (!updatedStation) {
        return {
          success: false,
          error: `Station with ID ${id} not found`,
        };
      }

      return {
        success: true,
        data: updatedStation,
        message: 'Station updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async deleteStation(id: string): Promise<ApiResponse<null>> {
    try {
      // Validate ID format
      if (!this.isValidUUID(id)) {
        return {
          success: false,
          error: 'Invalid station ID format',
        };
      }

      // Check if station exists
      const station = await this.stationRepository.findById(id);
      if (!station) {
        return {
          success: false,
          error: `Station with ID ${id} not found`,
        };
      }

      // Delete the station
      const deleted = await this.stationRepository.delete(id);

      if (!deleted) {
        return {
          success: false,
          error: 'Failed to delete station',
        };
      }

      return {
        success: true,
        data: null,
        message: 'Station deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }


  private validateQueryParams(params?: IStationQueryParams): IStationQueryParams {
    if (!params) return {};

    const validatedParams: IStationQueryParams = {};

    // Validate and set limit
    if (params.limit !== undefined) {
      const limit = Number(params.limit);
      if (!isNaN(limit) && limit > 0 && limit <= 100) {
        validatedParams.limit = limit;
      }
    }

    // Validate and set offset
    if (params.offset !== undefined) {
      const offset = Number(params.offset);
      if (!isNaN(offset) && offset >= 0) {
        validatedParams.offset = offset;
      }
    }

    // Copy other valid parameters
    if (params.name) validatedParams.name = params.name;
    if (params.status) validatedParams.status = params.status;
    if (params.minLatitude !== undefined) validatedParams.minLatitude = params.minLatitude;
    if (params.maxLatitude !== undefined) validatedParams.maxLatitude = params.maxLatitude;
    if (params.minLongitude !== undefined) validatedParams.minLongitude = params.minLongitude;
    if (params.maxLongitude !== undefined) validatedParams.maxLongitude = params.maxLongitude;

    return validatedParams;
  }

  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}

