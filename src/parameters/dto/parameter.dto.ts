import { ApiProperty } from "@nestjs/swagger";

export class ParameterDto {
  @ApiProperty({
    description: 'UUID of the parameter',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'UUID of the station this parameter belongs to',
    example: '356565b5-bc12-4873-acc8-145472c5fa79',
  })
  stationId!: string;

  @ApiProperty({
    description: 'UUID of the TipoParametro (parameter type)',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  tipoParametroId!: string;

  @ApiProperty({
    description: 'Optional TipoAlerta ID linked to this parameter',
    example: '550e8400-e29b-41d4-a716-446655440002',
    required: false,
  })
  tipoAlertaId?: string;
}