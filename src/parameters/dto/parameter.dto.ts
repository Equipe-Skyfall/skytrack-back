import { ApiProperty } from "@nestjs/swagger";
import { ReadingCalibrationDto } from "./reading-calibration.dto";

export class ParameterDto {
  @ApiProperty({
    description: 'UUID of the parameter',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'MAC address of the station this parameter belongs to',
    example: '24:6F:28:AE:52:7C',
  })
  stationId!: string;

  @ApiProperty({
    description: 'Name of the parameter',
    example: 'Temperature',
  })
  name!: string;

  @ApiProperty({
    description: 'Unit or metric associated with this parameter',
    example: '°C',
  })
  metric!: string;

  @ApiProperty({
    description:
      'Calibration values (offset and factor) applied per reading. Each key corresponds to the sensor reading name (e.g., temperatura, humidade).',
    example: {
      humidade: { offset: -2, factor: 1.1 },
      temperatura: { offset: -1, factor: 1.2 },
    },
    type: 'object',
    additionalProperties: {
      type: 'object',
      properties: {
        offset: { type: 'number', example: -2 },
        factor: { type: 'number', example: 1.1 },
      },
    },
  })
  calibration!: Record<string, ReadingCalibrationDto>;

  @ApiProperty({
    description: 'Polynomial formula applied to readings',
    example: 'a0 + a1*temperature + a2*humidity^2',
    required: false,
  })
  polynomial?: string;

  @ApiProperty({
    description: 'Array of coefficients corresponding to the polynomial',
    example: [1.2, 0.95, -0.002],
    type: [Number],
    required: false,
  })
  coefficients?: number[];
}