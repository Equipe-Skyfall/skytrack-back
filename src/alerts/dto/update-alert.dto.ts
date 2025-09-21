import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, MaxLength, MinLength, IsNumber, IsOptional, IsIn, IsInt, Min } from "class-validator";

export class UpdateAlertDto {
    @ApiPropertyOptional({
        description: 'UUID of the parameter this warning will be watching',
        maxLength: 36,
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    @IsOptional()
    @IsString()
    @MaxLength(36)
    parameterId?: string;

    @ApiPropertyOptional({
        description: 'What is this alert for?',
        minLength: 1,
        maxLength: 150,
        example: 'Warning of incoming rain',
    })
    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(150)
    description?: string;

    @ApiPropertyOptional({
        description: 'Threshold value for the alert',
        example: 10.5,
    })
    @IsOptional()
    @IsNumber()
    threshold?: number;

    @ApiPropertyOptional({
        description: 'Level of the alert',
        example: 'warning',
        enum: ['warning', 'critical'],
    })
    @IsOptional()
    @IsString()
    @IsIn(['warning', 'critical'])
    level?: string;

    @ApiPropertyOptional({
        description: 'Condition to trigger the alert',
        example: 'GREATER_THAN',
        enum: ['GREATER_THAN', 'LESS_THAN', 'IN_BETWEEN'],
    })
    @IsOptional()
    @IsString()
    @IsIn(['GREATER_THAN', 'LESS_THAN', 'IN_BETWEEN'])
    condition?: string;

    @ApiPropertyOptional({
        description: 'Duration in minutes the condition must be sustained to trigger the alert',
        example: 5,
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    durationMinutes?: number;
}