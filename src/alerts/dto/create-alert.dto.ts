import { ApiProperty } from "@nestjs/swagger"
import { IsString, MaxLength, IsOptional, IsUUID, IsDateString } from "class-validator";

export class CreateAlertDto {

    @ApiProperty({
        description: 'Alert date/timestamp',
        example: '2025-09-20T12:34:56.789Z',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    data?: Date;

    @ApiProperty({
        description: 'MAC address of the ESP32/sensor device',
        maxLength: 50,
        example: '24:6F:28:AE:52:7C',
    })
    @IsString()
    @MaxLength(50)
    stationId!: string;

    @ApiProperty({
        description: 'UUID of the parameter this alert is linked to',
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    @IsUUID()
    parameterId!: string;

    @ApiProperty({
        description: 'UUID of the TipoAlerta (alert type)',
        example: '550e8400-e29b-41d4-a716-446655440001'
    })
    @IsUUID()
    tipoAlertaId!: string;

    @ApiProperty({
        description: 'Optional UUID of the sensor reading (medidas)',
        example: '550e8400-e29b-41d4-a716-446655440002',
        required: false,
    })
    @IsOptional()
    @IsUUID()
    medidasId?: string;
}
