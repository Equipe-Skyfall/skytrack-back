import { ApiProperty } from '@nestjs/swagger';

export class TipoAlertaDto {
    @ApiProperty({
        description: 'Alert type ID',
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    id: string;

    @ApiProperty({
        description: 'Alert type name/identifier',
        example: 'TEMPERATURE_HIGH'
    })
    tipo: string;

    @ApiProperty({
        description: 'Whether this alert type is public',
        example: true
    })
    publica: boolean;

    @ApiProperty({
        description: 'Alert condition',
        example: 'GREATER_THAN'
    })
    condicao: string;

    @ApiProperty({
        description: 'Creation date',
        example: '2024-01-01T00:00:00.000Z'
    })
    criadoEm: Date;

    @ApiProperty({
        description: 'Alert threshold limit',
        example: 35.0
    })
    limite: number;

    @ApiProperty({
        description: 'Alert level',
        example: 'warning'
    })
    nivel: string;

    @ApiProperty({
        description: 'Minimum duration in minutes',
        example: 5,
        required: false
    })
    duracaoMin?: number;
}