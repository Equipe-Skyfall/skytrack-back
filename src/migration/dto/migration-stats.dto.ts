import { ApiProperty } from '@nestjs/swagger';

export class MigrationStatsDto {
  @ApiProperty({
    description: 'Total documents processed from MongoDB',
    example: 150,
  })
  totalProcessed: number;

  @ApiProperty({
    description: 'Successfully migrated sensor readings',
    example: 145,
  })
  successfulMigrations: number;

  @ApiProperty({
    description: 'Failed migration attempts',
    example: 5,
  })
  failedMigrations: number;

  @ApiProperty({
    description: 'Readings matched to existing stations',
    example: 140,
  })
  stationsMatched: number;

  @ApiProperty({
    description: 'Readings without matching stations',
    example: 10,
  })
  stationsNotFound: number;

  @ApiProperty({
    description: 'Unix timestamp of last synchronized data',
    example: 1640995200,
  })
  lastSyncTimestamp: number;

  @ApiProperty({
    description: 'Migration start time',
    format: 'date-time',
  })
  startTime: string;

  @ApiProperty({
    description: 'Migration end time',
    format: 'date-time',
  })
  endTime: string;

  @ApiProperty({
    description: 'Migration duration in milliseconds',
    example: 5432,
  })
  duration: number;
}

export class MigrationResponseDto {
  @ApiProperty({
    description: 'Operation success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Migration statistics',
    type: MigrationStatsDto,
  })
  data: MigrationStatsDto;

  @ApiProperty({
    description: 'Response message',
    example: 'Migration completed successfully',
  })
  message: string;
}

export class MigrationStatusDto {
  @ApiProperty({
    description: 'Whether migration scheduler is enabled',
    example: true,
  })
  enabled: boolean;

  @ApiProperty({
    description: 'Whether a migration is currently running',
    example: false,
  })
  running: boolean;

  @ApiProperty({
    description: 'Migration interval in minutes',
    example: 15,
  })
  intervalMinutes: number;

  @ApiProperty({
    description: 'Next scheduled execution time',
    example: 'scheduled',
  })
  nextExecution?: string;
}

export class MigrationStatusResponseDto {
  @ApiProperty({
    description: 'Operation success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Migration status information',
    type: MigrationStatusDto,
  })
  data: MigrationStatusDto;

  @ApiProperty({
    description: 'Response message',
    example: 'Migration status retrieved successfully',
  })
  message: string;
}