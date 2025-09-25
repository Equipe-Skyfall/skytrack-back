import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'isValidLeituraStructure', async: false })
export class IsValidLeituraStructureConstraint implements ValidatorConstraintInterface {
  validate(leitura: any): boolean {
    if (!leitura || typeof leitura !== 'object') {
      return false;
    }

    // Check that all values in leitura are calibration objects with offset/factor
    for (const [key, value] of Object.entries(leitura)) {
      if (!value || typeof value !== 'object') {
        return false;
      }

      // Each calibration object should have offset and factor
      const calibration = value as any;
      if (typeof calibration.offset !== 'number' || typeof calibration.factor !== 'number') {
        return false;
      }
    }

    return true;
  }

  defaultMessage(): string {
    return 'leitura must be an object mapping sensor reading keys to calibration data (e.g., { "temperatura": { "offset": 0, "factor": 1 } })';
  }
}

export function IsValidLeituraStructure(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidLeituraStructureConstraint,
    });
  };
}