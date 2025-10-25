import { ApiProperty } from "@nestjs/swagger";

export class RegisteredAlertDto {
  @ApiProperty({
    description: 'UUID of the registered alert',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'Name given based on alert-type',
    example: 'Alerta de Chuva',
  })
  alert_name!: string;

  @ApiProperty({
    description: 'Alert date/timestamp',
    example: '2025-09-20T12:34:56.789Z',
  })
  data!: Date;

  @ApiProperty({
    description: 'MAC address of the station this alert belongs to',
    example: '24:6F:28:AE:52:7C',
  })
  stationId!: string;

  @ApiProperty({
    description: 'UUID of the parameter this alert is linked to',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  parameterId!: string;

  @ApiProperty({
    description: 'UUID of the alert type (TipoAlerta)',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  tipoAlertaId!: string;

  @ApiProperty({
    description: 'Optional UUID of the sensor reading that triggered this alert',
    example: '550e8400-e29b-41d4-a716-446655440003',
    required: false,
  })
  medidasId?: string;

  @ApiProperty({
    description: 'Date of creation',
    example: '2025-09-20T12:34:56.789Z',
  })
  createdAt!: Date;
}
