import { ApiProperty } from '@nestjs/swagger';

export class TipoParametroDto {
    @ApiProperty({
        description: 'Parameter type ID',
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    id: string;

    @ApiProperty({
        description: 'JSON identifier for the parameter type',
        example: 'temperature_sensor'
    })
    jsonId: string;

    @ApiProperty({
        description: 'Parameter type name',
        example: 'Temperature'
    })
    nome: string;

    @ApiProperty({
        description: 'Parameter metric/unit',
        example: '°C'
    })
    metrica: string;

    @ApiProperty({
        description: 'Polynomial formula',
        example: 'a0 + a1*temperatura',
        required: false
    })
    polinomio?: string;

    @ApiProperty({
        description: 'Array of polynomial coefficients',
        example: [1.0, 0.95],
        type: [Number]
    })
    coeficiente: number[];

    @ApiProperty({
        description: 'Reading configuration mapping sensor keys to calibration data',
        example: { temperatura: { offset: 0, factor: 1.0 } }
    })
    leitura: any;
}