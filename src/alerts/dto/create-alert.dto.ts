import { ApiProperty } from "@nestjs/swagger"
import { IsString, MaxLength, MinLength, IsNumber, IsOptional, IsIn, IsInt, Min } from "class-validator";

export class CreateAlertDto {
    
    @ApiProperty({
        description: 'MAC address of the ESP32/sensor device',
        maxLength: 50,
        example: '24:6F:28:AE:52:7C',
    })
    @IsString()
    @MaxLength(50)
    stationId!: string;
    
    @ApiProperty({
        description: 'UUID of the parameter this warning will be watching',
        maxLength: 36,
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    @IsString()
    @MaxLength(36)
    parameterId!: string;

    @ApiProperty({
        description: 'What is this alert for?',
        minLength: 1,
        maxLength: 150,
        example: 'Warning of incoming rain',
    })
    @IsString()
    @MinLength(1)
    @MaxLength(150)
    description!: string;

    @ApiProperty({
        description: 'Threshold value for the alert',
        example: 10.5,
    })
    @IsNumber()
    threshold!: number;

    @ApiProperty({
        description: 'Level of the alert',
        example: 'warning',
        default: 'warning',
        enum: ['warning', 'critical'],
        required: false,
    })
    @IsOptional()
    @IsString()
    @IsIn(['warning', 'critical'])
    level?: string = 'warning';

    @ApiProperty({
        description: 'Condition to trigger the alert',
        example: 'GREATER_THAN',
        default: 'GREATER_THAN',
        enum: ['GREATER_THAN', 'LESS_THAN', 'IN_BETWEEN'],
        required: false,
    })
    @IsOptional()
    @IsString()
    @IsIn(['GREATER_THAN', 'LESS_THAN', 'IN_BETWEEN'])
    condition?: string = 'GREATER_THAN';

    @ApiProperty({
        description: 'Duration in minutes the condition must be sustained to trigger the alert',
        example: 5,
        required: false,
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    durationMinutes?: number;
}
