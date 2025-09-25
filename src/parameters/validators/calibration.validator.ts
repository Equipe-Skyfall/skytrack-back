import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { ReadingCalibrationDto } from '../dto/reading-calibration.dto';

@ValidatorConstraint({ name: 'isValidCalibration', async: false })
@Injectable()
export class IsValidCalibrationConstraint implements ValidatorConstraintInterface {
  validate(calibration: Record<string, ReadingCalibrationDto>, args: ValidationArguments): boolean {
    if (!calibration || typeof calibration !== 'object') return false;

    const dto: any = args.object;
    const polynomial: string | undefined = dto.polynomial;
    const keys = Object.keys(calibration);

    // If no polynomial, there can only be one key
    if (!polynomial && keys.length !== 1) return false;

    // No keys should be named like aN
    const forbiddenKeys = keys.filter(key => /^a\d+$/.test(key));
    if (forbiddenKeys.length > 0) return false;

    return true;
  }

  defaultMessage(args: ValidationArguments): string {
    const dto: any = args.object;
    const polynomial: string | undefined = dto.polynomial;
    const calibration: Record<string, ReadingCalibrationDto> = dto.calibration || {};
    const keys = Object.keys(calibration);

    if (!polynomial && keys.length !== 1) {
      return `Calibration must contain exactly one key when polynomial is not present, found ${keys.length}`;
    }

    const forbiddenKeys = keys.filter(key => /^a\d+$/.test(key));
    if (forbiddenKeys.length > 0) {
      return `Calibration keys cannot be named like polynomial coefficients (a0, a1, ...). Invalid keys: ${forbiddenKeys.join(', ')}`;
    }

    return 'Calibration is invalid';
  }
}
