import { PartialType, ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';
import { CreateStationDto } from './create-station.dto';
import { IsUniqueMacAddress } from '../validators/unique-mac-address.validator';

export class UpdateStationDto extends PartialType(CreateStationDto) {
  // Override macAddress field to include the uniqueness validator for updates
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
  override macAddress?: string;
}