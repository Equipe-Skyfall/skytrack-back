import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MigrationScheduler } from '../services/migration/migrationScheduler';
import { MigrationStatsDto, MigrationStatusDto } from './dto/migration-stats.dto';

@Injectable()
export class MigrationService {
  private migrationScheduler: MigrationScheduler;

  constructor(private readonly prisma: PrismaService) {
    this.migrationScheduler = new MigrationScheduler(this.prisma as any);

    // Only start scheduler in non-serverless environments
    if (process.env.IS_SERVERLESS !== 'true') {
      this.migrationScheduler.start();
      console.log('🔄 Migration scheduler started');
    } else {
      console.log('⚡ Running in serverless mode - migration scheduler disabled');
    }
  }

  async triggerManualMigration(): Promise<MigrationStatsDto> {
    const stats = await this.migrationScheduler.triggerManualMigration();

    return {
      totalProcessed: stats.totalProcessed,
      successfulMigrations: stats.successfulMigrations,
      failedMigrations: stats.failedMigrations,
      stationsMatched: stats.stationsMatched,
      stationsNotFound: stats.stationsNotFound,
      lastSyncTimestamp: stats.lastSyncTimestamp,
      startTime: stats.startTime,
      endTime: stats.endTime,
      duration: stats.duration,
    };
  }

  getStatus(): MigrationStatusDto {
    const status = this.migrationScheduler.getStatus();

    return {
      enabled: status.enabled,
      running: status.running,
      intervalMinutes: status.intervalMinutes,
      nextExecution: status.nextExecution,
    };
  }
}