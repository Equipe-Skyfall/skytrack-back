import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, IsNotEmpty } from 'class-validator';
import { IsValidLeituraStructure } from '../validators/leitura.validator';
import { IsValidPolynomial } from '../validators/polynomial.validator';

export class CreateTipoParametroDto {
    @ApiProperty({
        description: 'JSON identifier for the parameter type',
        example: 'temperature_sensor'
    })
    @IsString()
    @IsNotEmpty()
    jsonId: string;

    @ApiProperty({
        description: 'Parameter type name',
        example: 'Temperature'
    })
    @IsString()
    @IsNotEmpty()
    nome: string;

    @ApiProperty({
        description: 'Parameter metric/unit',
        example: '°C'
    })
    @IsString()
    @IsNotEmpty()
    metrica: string;

    @ApiProperty({
        description: 'Polynomial formula',
        example: 'a0 + a1*temperatura',
        required: false
    })
    @IsString()
    @IsOptional()
    @IsValidPolynomial()
    polinomio?: string;

    @ApiProperty({
        description: 'Array of polynomial coefficients',
        example: [1.0, 0.95],
        type: [Number]
    })
    @IsArray()
    @IsOptional()
    coeficiente: number[];

    @ApiProperty({
        description: 'Reading configuration mapping sensor keys to calibration data',
        example: { temperatura: { offset: 0, factor: 1.0 } }
    })
    @IsOptional()
    @IsValidLeituraStructure()
    leitura: any; // JSON field mapping sensor reading keys to calibration (offset/factor)
}