import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsUUID, IsDateString } from "class-validator";

export class UpdateAlertDto {
    @ApiPropertyOptional({
        description: 'Alert date/timestamp',
        example: '2025-09-20T12:34:56.789Z',
    })
    @IsOptional()
    @IsDateString()
    data?: Date;

    @ApiPropertyOptional({
        description: 'MAC address of the ESP32/sensor device',
        example: '24:6F:28:AE:52:7C',
    })
    @IsOptional()
    @IsString()
    stationId?: string;

    @ApiPropertyOptional({
        description: 'UUID of the parameter this alert is linked to',
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    @IsOptional()
    @IsUUID()
    parameterId?: string;

    @ApiPropertyOptional({
        description: 'UUID of the TipoAlerta (alert type)',
        example: '550e8400-e29b-41d4-a716-446655440001'
    })
    @IsOptional()
    @IsUUID()
    tipoAlertaId?: string;

    @ApiPropertyOptional({
        description: 'Optional UUID of the sensor reading (medidas)',
        example: '550e8400-e29b-41d4-a716-446655440002',
    })
    @IsOptional()
    @IsUUID()
    medidasId?: string;
}