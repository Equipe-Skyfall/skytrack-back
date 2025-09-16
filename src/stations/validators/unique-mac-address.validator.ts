import { Injectable, Inject } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';
import { IStationRepository, STATION_REPOSITORY_TOKEN } from '../interfaces/station-repository.interface';

@ValidatorConstraint({ name: 'isUniqueMacAddress', async: true })
@Injectable()
export class IsUniqueMacAddressConstraint implements ValidatorConstraintInterface {
  constructor(
    @Inject(STATION_REPOSITORY_TOKEN)
    private readonly stationRepository: IStationRepository
  ) {}

  async validate(macAddress: string, args: ValidationArguments): Promise<boolean> {
    if (!macAddress) {
      return true; // Allow empty/null values (handled by @IsOptional)
    }

    const existingStation = await this.stationRepository.findByMacAddress(macAddress);

    // For updates, we need to exclude the current station being updated
    const currentStationId = (args.object as any).id;
    if (existingStation && currentStationId && existingStation.id === currentStationId) {
      return true; // Same station, allowed
    }

    return !existingStation; // Valid if no existing station found
  }

  defaultMessage(args: ValidationArguments): string {
    return `MAC address '${args.value}' is already in use by another station`;
  }
}

export function IsUniqueMacAddress(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUniqueMacAddressConstraint,
    });
  };
}