import { ApiProperty } from "@nestjs/swagger";

export class RegisteredAlertDto {
  @ApiProperty({
    description: 'UUID of the registered alert',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'MAC address of the station this alert belongs to',
    example: '24:6F:28:AE:52:7C',
  })
  stationId!: string;

  @ApiProperty({
    description: 'The parameter this alert watches',
    example: 'Humidity',
  })
  parameter!: string;

  @ApiProperty({
    description: 'Description of what this alert is for',
    example: 'Warning of incoming rain',
  })
  description!: string;

  @ApiProperty({
    description: 'Threshold value for triggering the alert',
    example: 10.5,
  })
  threshold!: number;

  @ApiProperty({
    description: 'Level of the alert',
    example: 'warning',
    enum: ['warning', 'critical'],
  })
  level!: string;

  @ApiProperty({
    description: 'Condition to trigger the alert',
    example: 'GREATER_THAN',
    enum: ['GREATER_THAN', 'LESS_THAN', 'IN_BETWEEN'],
  })
  condition!: string;

  @ApiProperty({
    description: 'Duration in minutes the condition must be sustained to trigger the alert',
    example: 5,
    required: false,
  })
  durationMinutes?: number;

  @ApiProperty({
    description: 'Date of creation',
    example: '2025-09-20T12:34:56.789Z',
  })
  createdAt!: Date;
}
