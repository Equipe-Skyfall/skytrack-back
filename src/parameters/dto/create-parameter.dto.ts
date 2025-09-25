import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength, IsOptional, IsUUID } from "class-validator";

export class CreateParameterDto {
  @ApiProperty({
    description: 'UUID of the meteorological station',
    example: '356565b5-bc12-4873-acc8-145472c5fa79',
  })
  @IsUUID()
  stationId!: string;

  @ApiProperty({
    description: 'ID of the TipoParametro (parameter type)',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  tipoParametroId!: string;

  @ApiProperty({
    description: 'Optional TipoAlerta ID to link this parameter to',
    example: '550e8400-e29b-41d4-a716-446655440002',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  tipoAlertaId?: string;
}
