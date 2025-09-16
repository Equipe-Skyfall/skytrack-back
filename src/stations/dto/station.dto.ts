import { ApiProperty } from '@nestjs/swagger';
import { StationStatus } from './create-station.dto';

export class StationDto {
  @ApiProperty({
    description: 'Unique identifier for the station',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Station name',
    example: 'Station Alpha',
  })
  name: string;

  @ApiProperty({
    description: 'MAC address of the ESP32/sensor device',
    example: '24:6F:28:AE:52:7C',
    nullable: true,
  })
  macAddress: string | null;

  @ApiProperty({
    description: 'Station latitude',
    example: -23.5505,
  })
  latitude: number;

  @ApiProperty({
    description: 'Station longitude',
    example: -46.6333,
  })
  longitude: number;

  @ApiProperty({
    description: 'Station address',
    example: 'Rua das Flores, 123 - São Paulo, SP',
    nullable: true,
  })
  address: string | null;

  @ApiProperty({
    description: 'Station description',
    example: 'Weather station located in downtown area',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Station status',
    enum: StationStatus,
    example: StationStatus.ACTIVE,
  })
  status: StationStatus;

  @ApiProperty({
    description: 'Creation timestamp',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    format: 'date-time',
  })
  updatedAt: Date;
}