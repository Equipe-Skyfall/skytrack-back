import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, MinLength, MaxLength, Min, Max } from 'class-validator';
import { IsUniqueMacAddress } from '../validators/unique-mac-address.validator';

export enum StationStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export class CreateStationDto {
  @ApiProperty({
    description: 'Station name',
    minLength: 1,
    maxLength: 100,
    example: 'Station Alpha',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    description: 'MAC address of the ESP32/sensor device',
    maxLength: 50,
    example: '24:6F:28:AE:52:7C',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @IsUniqueMacAddress()
  macAddress?: string;

  @ApiProperty({
    description: 'Station latitude',
    minimum: -90,
    maximum: 90,
    example: -23.5505,
  })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @ApiProperty({
    description: 'Station longitude',
    minimum: -180,
    maximum: 180,
    example: -46.6333,
  })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;

  @ApiProperty({
    description: 'Station address',
    maxLength: 255,
    required: false,
    example: 'Rua das Flores, 123 - São Paulo, SP',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @ApiProperty({
    description: 'Station description',
    maxLength: 500,
    required: false,
    example: 'Weather station located in downtown area',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Station status',
    enum: StationStatus,
    default: StationStatus.ACTIVE,
    required: false,
  })
  @IsOptional()
  @IsEnum(StationStatus)
  status?: StationStatus;
}