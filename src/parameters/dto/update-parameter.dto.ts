import { 
  ApiProperty 
} from "@nestjs/swagger";
import { 
  IsString, MaxLength, MinLength, IsOptional, 
  IsArray, IsNumber, IsObject 
} from "class-validator";
import { ReadingCalibrationDto } from "./reading-calibration.dto";
import { IsValidPolynomial } from "../decorators/is-valid-polynomial.decorator";

export class UpdateParameterDto {
  @ApiProperty({
    description: 'Name of the parameter',
    minLength: 1,
    maxLength: 100,
    example: 'Temperature',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    description: 'Unit or metric associated with this parameter',
    minLength: 1,
    maxLength: 20,
    example: '°C',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  metric?: string;

  @ApiProperty({
    description: 'Per-reading calibration values. Each key corresponds to the sensor reading name (e.g., temperatura, humidade).',
    example: {
      humidade: { offset: -2, factor: 1.1 },
      temperatura: { offset: -1, factor: 1.2 },
    },
    type: 'object',
    additionalProperties: { type: 'object', properties: { offset: { type: 'number' }, factor: { type: 'number' } } },
  })
  @IsOptional()
  @IsObject()
  calibration?: Record<string, ReadingCalibrationDto>;

  @ApiProperty({
    description: 'Polynomial formula applied to readings',
    example: 'a0 + a1*temperature + a2*humidity^2',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsValidPolynomial({ message: 'Invalid polynomial: check coefficients and calibration keys' })
  polynomial?: string;

  @ApiProperty({
    description: 'Array of coefficients corresponding to the polynomial. Empty if no polynomial is defined.',
    example: [1.2, 0.95, -0.002],
    type: [Number],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  coefficients?: number[];
}
