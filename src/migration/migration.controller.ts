import {
  Controller,
  Get,
  Post,
  HttpStatus,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { MigrationService } from './migration.service';
import {
  MigrationResponseDto,
  MigrationStatusResponseDto,
} from './dto/migration-stats.dto';

@ApiTags('Migration')
@Controller('migration')
export class MigrationController {
  constructor(private readonly migrationService: MigrationService) {}

  @Post('trigger')
  @ApiOperation({
    summary: 'Trigger manual migration',
    description: 'Manually trigger a migration from MongoDB to PostgreSQL',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Migration completed successfully',
    type: MigrationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Migration already running',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Migration failed',
  })
  async triggerMigration(): Promise<MigrationResponseDto> {
    try {
      const stats = await this.migrationService.triggerManualMigration();

      return {
        success: true,
        data: stats,
        message: 'Migration completed successfully',
      };
    } catch (error: any) {
      if (error.message === 'Migration is already running') {
        throw new BadRequestException({
          success: false,
          error: error.message,
        });
      } else {
        console.error('Migration error:', error);
        throw new InternalServerErrorException({
          success: false,
          error: 'Migration failed',
        });
      }
    }
  }

  @Get('status')
  @ApiOperation({
    summary: 'Get migration scheduler status',
    description: 'Get the current status of the migration scheduler',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Migration status retrieved successfully',
    type: MigrationStatusResponseDto,
  })
  async getMigrationStatus(): Promise<MigrationStatusResponseDto> {
    try {
      const status = this.migrationService.getStatus();

      return {
        success: true,
        data: status,
        message: 'Migration status retrieved successfully',
      };
    } catch (error) {
      console.error('Error getting migration status:', error);
      throw new InternalServerErrorException({
        success: false,
        error: 'Failed to get migration status',
      });
    }
  }
}