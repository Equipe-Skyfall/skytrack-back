import { Request, Response, NextFunction } from 'express';
import { StationStatus, STATION_VALIDATION_RULES } from '../types/station';

// Validation error response interface
interface ValidationError {
  field: string;
  message: string;
}

// Base validation middleware class following Single Responsibility Principle
abstract class BaseValidationMiddleware {
  protected sendValidationError(res: Response, errors: ValidationError[]): void {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors,
    });
  }

  protected isValidCoordinate(value: any, type: 'latitude' | 'longitude'): boolean {
    if (typeof value !== 'number' || isNaN(value)) return false;

    if (type === 'latitude') {
      return value >= STATION_VALIDATION_RULES.LATITUDE.MIN &&
             value <= STATION_VALIDATION_RULES.LATITUDE.MAX;
    } else {
      return value >= STATION_VALIDATION_RULES.LONGITUDE.MIN &&
             value <= STATION_VALIDATION_RULES.LONGITUDE.MAX;
    }
  }

  protected isValidStatus(status: any): boolean {
    return Object.values(StationStatus).includes(status);
  }

  protected isValidString(value: any, minLength?: number, maxLength?: number): boolean {
    if (typeof value !== 'string') return false;
    const trimmed = value.trim();

    if (minLength && trimmed.length < minLength) return false;
    if (maxLength && trimmed.length > maxLength) return false;

    return true;
  }

  protected isValidMacAddress(value: any): boolean {
    if (typeof value !== 'string') return false;
    const trimmed = value.trim();

    // Check length
    if (trimmed.length === 0 || trimmed.length > STATION_VALIDATION_RULES.MAC_ADDRESS.MAX_LENGTH) {
      return false;
    }

    // Check pattern (MAC address or UUID format)
    return STATION_VALIDATION_RULES.MAC_ADDRESS.PATTERN.test(trimmed);
  }
}

// Create Station validation middleware
class CreateStationValidation extends BaseValidationMiddleware {
  validate = (req: Request, res: Response, next: NextFunction): void => {
    const errors: ValidationError[] = [];
    const { name, macAddress, latitude, longitude, address, description, status } = req.body;

    // Validate required name field
    if (!name) {
      errors.push({ field: 'name', message: 'Name is required' });
    } else if (!this.isValidString(name, STATION_VALIDATION_RULES.NAME.MIN_LENGTH, STATION_VALIDATION_RULES.NAME.MAX_LENGTH)) {
      errors.push({
        field: 'name',
        message: `Name must be between ${STATION_VALIDATION_RULES.NAME.MIN_LENGTH} and ${STATION_VALIDATION_RULES.NAME.MAX_LENGTH} characters`
      });
    }

    // Validate required latitude field
    if (latitude === undefined || latitude === null) {
      errors.push({ field: 'latitude', message: 'Latitude is required' });
    } else if (!this.isValidCoordinate(latitude, 'latitude')) {
      errors.push({
        field: 'latitude',
        message: `Latitude must be a number between ${STATION_VALIDATION_RULES.LATITUDE.MIN} and ${STATION_VALIDATION_RULES.LATITUDE.MAX}`
      });
    }

    // Validate required longitude field
    if (longitude === undefined || longitude === null) {
      errors.push({ field: 'longitude', message: 'Longitude is required' });
    } else if (!this.isValidCoordinate(longitude, 'longitude')) {
      errors.push({
        field: 'longitude',
        message: `Longitude must be a number between ${STATION_VALIDATION_RULES.LONGITUDE.MIN} and ${STATION_VALIDATION_RULES.LONGITUDE.MAX}`
      });
    }

    // Validate optional MAC address field
    if (macAddress !== undefined && macAddress !== null) {
      if (!this.isValidMacAddress(macAddress)) {
        errors.push({
          field: 'macAddress',
          message: 'Invalid MAC address format'
        });
      }
    }

    // Validate optional address field
    if (address !== undefined && address !== null) {
      if (!this.isValidString(address, 0, STATION_VALIDATION_RULES.ADDRESS.MAX_LENGTH)) {
        errors.push({
          field: 'address',
          message: `Address must not exceed ${STATION_VALIDATION_RULES.ADDRESS.MAX_LENGTH} characters`
        });
      }
    }

    // Validate optional description field
    if (description !== undefined && description !== null) {
      if (!this.isValidString(description, 0, STATION_VALIDATION_RULES.DESCRIPTION.MAX_LENGTH)) {
        errors.push({
          field: 'description',
          message: `Description must not exceed ${STATION_VALIDATION_RULES.DESCRIPTION.MAX_LENGTH} characters`
        });
      }
    }

    // Validate optional status field
    if (status !== undefined && status !== null && !this.isValidStatus(status)) {
      errors.push({
        field: 'status',
        message: `Status must be one of: ${Object.values(StationStatus).join(', ')}`
      });
    }

    if (errors.length > 0) {
      this.sendValidationError(res, errors);
      return;
    }

    next();
  };
}

// Update Station validation middleware
class UpdateStationValidation extends BaseValidationMiddleware {
  validate = (req: Request, res: Response, next: NextFunction): void => {
    const errors: ValidationError[] = [];
    const { name, macAddress, latitude, longitude, address, description, status } = req.body;

    // Check if at least one field is provided for update
    if (name === undefined && macAddress === undefined && latitude === undefined && longitude === undefined &&
        address === undefined && description === undefined && status === undefined) {
      errors.push({ field: 'body', message: 'At least one field must be provided for update' });
    }

    // Validate name field if provided
    if (name !== undefined && name !== null) {
      if (!this.isValidString(name, STATION_VALIDATION_RULES.NAME.MIN_LENGTH, STATION_VALIDATION_RULES.NAME.MAX_LENGTH)) {
        errors.push({
          field: 'name',
          message: `Name must be between ${STATION_VALIDATION_RULES.NAME.MIN_LENGTH} and ${STATION_VALIDATION_RULES.NAME.MAX_LENGTH} characters`
        });
      }
    }

    // Validate latitude field if provided
    if (latitude !== undefined && latitude !== null && !this.isValidCoordinate(latitude, 'latitude')) {
      errors.push({
        field: 'latitude',
        message: `Latitude must be a number between ${STATION_VALIDATION_RULES.LATITUDE.MIN} and ${STATION_VALIDATION_RULES.LATITUDE.MAX}`
      });
    }

    // Validate longitude field if provided
    if (longitude !== undefined && longitude !== null && !this.isValidCoordinate(longitude, 'longitude')) {
      errors.push({
        field: 'longitude',
        message: `Longitude must be a number between ${STATION_VALIDATION_RULES.LONGITUDE.MIN} and ${STATION_VALIDATION_RULES.LONGITUDE.MAX}`
      });
    }

    // Validate MAC address field if provided
    if (macAddress !== undefined && macAddress !== null) {
      if (!this.isValidMacAddress(macAddress)) {
        errors.push({
          field: 'macAddress',
          message: 'Invalid MAC address format'
        });
      }
    }

    // Validate address field if provided
    if (address !== undefined && address !== null) {
      if (!this.isValidString(address, 0, STATION_VALIDATION_RULES.ADDRESS.MAX_LENGTH)) {
        errors.push({
          field: 'address',
          message: `Address must not exceed ${STATION_VALIDATION_RULES.ADDRESS.MAX_LENGTH} characters`
        });
      }
    }

    // Validate description field if provided
    if (description !== undefined && description !== null) {
      if (!this.isValidString(description, 0, STATION_VALIDATION_RULES.DESCRIPTION.MAX_LENGTH)) {
        errors.push({
          field: 'description',
          message: `Description must not exceed ${STATION_VALIDATION_RULES.DESCRIPTION.MAX_LENGTH} characters`
        });
      }
    }

    // Validate status field if provided
    if (status !== undefined && status !== null && !this.isValidStatus(status)) {
      errors.push({
        field: 'status',
        message: `Status must be one of: ${Object.values(StationStatus).join(', ')}`
      });
    }

    if (errors.length > 0) {
      this.sendValidationError(res, errors);
      return;
    }

    next();
  };
}

// Export middleware instances using Factory Pattern
export const validateCreateStation = new CreateStationValidation().validate;
export const validateUpdateStation = new UpdateStationValidation().validate;

// Factory for creating validation middleware instances
export class StationValidationFactory {
  static createValidator(): {
    validateCreate: (req: Request, res: Response, next: NextFunction) => void;
    validateUpdate: (req: Request, res: Response, next: NextFunction) => void;
  } {
    const createValidator = new CreateStationValidation();
    const updateValidator = new UpdateStationValidation();

    return {
      validateCreate: createValidator.validate,
      validateUpdate: updateValidator.validate,
    };
  }
}