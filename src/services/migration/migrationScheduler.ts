import * as cron from 'node-cron';
import { PrismaClient } from '../../generated/prisma';
import { MigrationService } from './migrationService';

export interface SchedulerConfig {
  enabled: boolean;
  intervalMinutes: number;
}

export class MigrationScheduler {
  private prisma: PrismaClient;
  private migrationService: MigrationService;
  private config: SchedulerConfig;
  private scheduledTask: cron.ScheduledTask | null = null; // null = null por causa do typescript
  private isRunning = false;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.migrationService = new MigrationService(prisma);
    this.config = {
      enabled: process.env.MIGRATION_ENABLED === 'true',
      intervalMinutes: parseInt(process.env.MIGRATION_INTERVAL_MINUTES || '15'),
    };
  }

  start(): void {
    if (!this.config.enabled) {
      console.log('Migration scheduler is disabled');
      return;
    }

    if (this.scheduledTask) {
      console.log('Migration scheduler is already running');
      return;
    }

    // intervalo de tempo que a migração vai ser feita
    const cronExpression = `*/${this.config.intervalMinutes} * * * *`;

    this.scheduledTask = cron.schedule(cronExpression, async () => {
      await this.executeMigration();
    }, {
      timezone: 'America/Sao_Paulo'
    });

    console.log(`Migration scheduler started - running every ${this.config.intervalMinutes} minutes`);
  }

  stop(): void {
    if (this.scheduledTask) {
      this.scheduledTask.destroy();
      this.scheduledTask = null;
      console.log('Migration scheduler stopped');
    }
  }

  async executeMigration(): Promise<void> {
    if (this.isRunning) {
      console.log('Migration is already running, skipping this execution');
      return;
    }

    try {
      this.isRunning = true;
      console.log('Starting scheduled migration...');

      const stats = await this.migrationService.migrate();

      console.log('Scheduled migration completed:', {
        totalProcessed: stats.totalProcessed,
        successful: stats.successfulMigrations,
        failed: stats.failedMigrations,
        duration: stats.duration
      });
    } catch (error) {
      console.error('Scheduled migration failed:', error);
    } finally {
      this.isRunning = false;
    }
  }

  async triggerManualMigration(): Promise<any> {
    if (this.isRunning) {
      throw new Error('Migration is already running');
    }

    try {
      this.isRunning = true;
      console.log('Starting manual migration...');

      const stats = await this.migrationService.migrate();

      console.log('Manual migration completed');
      return stats;
    } catch (error) {
      console.error('Manual migration failed:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  getStatus(): {
    enabled: boolean;
    running: boolean;
    intervalMinutes: number;
    nextExecution?: string;
  } {
    return {
      enabled: this.config.enabled,
      running: this.isRunning,
      intervalMinutes: this.config.intervalMinutes,
      nextExecution: this.scheduledTask ? 'scheduled' : undefined,
    };
  }

  updateConfig(newConfig: Partial<SchedulerConfig>): void {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...newConfig };

    // Restart scheduler if interval changed
    if (oldConfig.intervalMinutes !== this.config.intervalMinutes) {
      this.stop();
      this.start();
    }

    console.log('Migration scheduler config updated:', this.config);
  }
}