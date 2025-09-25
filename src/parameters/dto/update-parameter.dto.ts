import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsUUID } from "class-validator";

export class UpdateParameterDto {
  @ApiProperty({
    description: 'Optional TipoAlerta ID to link this parameter to',
    example: '550e8400-e29b-41d4-a716-446655440002',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  tipoAlertaId?: string;
}
