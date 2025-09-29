import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class ReadingCalibrationDto {
  @ApiProperty({
    description: 'Offset applied to the raw sensor value',
    example: -2,
    required: false,
  })
  @IsNumber()
  offset?: number;

  @ApiProperty({
    description: 'Multiplicative factor applied to the raw sensor value',
    example: 1.1,
    required: false,
  })
  @IsNumber()
  factor?: number;
}