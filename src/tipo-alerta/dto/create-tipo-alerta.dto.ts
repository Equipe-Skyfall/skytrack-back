import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsNumber, IsInt, IsOptional, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTipoAlertaDto {
    @ApiProperty({
        description: 'Alert type name/identifier',
        example: 'TEMPERATURE_HIGH'
    })
    @IsString()
    @IsNotEmpty()
    tipo: string;

    @ApiProperty({
        description: 'Whether this alert type is public',
        example: true
    })
    @IsBoolean()
    publica: boolean;

    @ApiProperty({
        description: 'Alert condition',
        example: 'GREATER_THAN'
    })
    @IsString()
    @IsNotEmpty()
    condicao: string;

    @ApiProperty({
        description: 'Alert threshold limit',
        example: 35.0
    })
    @IsNumber()
    @Transform(({ value }: { value: any }) => parseFloat(value))
    limite: number;

    @ApiProperty({
        description: 'Alert level',
        example: 'warning',
        default: 'warning',
        required: false
    })
    @IsString()
    @IsOptional()
    nivel: string = 'warning';

    @ApiProperty({
        description: 'Minimum duration in minutes',
        example: 5,
        required: false
    })
    @IsInt()
    @IsOptional()
    duracaoMin?: number;
}