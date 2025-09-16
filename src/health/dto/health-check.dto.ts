import { ApiProperty } from '@nestjs/swagger';

export class HealthCheckDto {
  @ApiProperty({
    description: 'Health status',
    example: 'OK',
  })
  status!: string;

  @ApiProperty({
    description: 'Timestamp of the health check',
    format: 'date-time',
  })
  timestamp!: string;

  @ApiProperty({
    description: 'Process uptime in seconds',
    example: 123.456,
  })
  uptime!: number;

  @ApiProperty({
    description: 'API version',
    example: '1.0.0',
  })
  version!: string;
}