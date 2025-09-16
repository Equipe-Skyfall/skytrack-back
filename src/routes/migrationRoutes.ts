import { Router, Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma';
import { MigrationScheduler } from '../services/migration/migrationScheduler';

/**
 * @swagger
 * tags:
 *   name: Migration
 *   description: MongoDB to PostgreSQL migration endpoints
 */

export const createMigrationRoutes = (prisma: PrismaClient): Router => {
  const router = Router();
  const migrationScheduler = new MigrationScheduler(prisma);

  /**
   * @swagger
   * /migration/trigger:
   *   post:
   *     summary: Trigger manual migration
   *     tags: [Migration]
   *     description: Manually trigger a migration from MongoDB to PostgreSQL
   *     responses:
   *       200:
   *         description: Migration completed successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/MigrationStats'
   *                 message:
   *                   type: string
   *                   example: 'Migration completed successfully'
   *       400:
   *         description: Migration already running
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 error:
   *                   type: string
   *                   example: 'Migration is already running'
   *       500:
   *         description: Migration failed
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 error:
   *                   type: string
   *                   example: 'Migration failed'
   */
  router.post('/trigger', async (req: Request, res: Response) => {
    try {
      const stats = await migrationScheduler.triggerManualMigration();

      res.json({
        success: true,
        data: stats,
        message: 'Migration completed successfully'
      });
    } catch (error: any) {
      if (error.message === 'Migration is already running') {
        res.status(400).json({
          success: false,
          error: error.message
        });
      } else {
        console.error('Migration error:', error);
        res.status(500).json({
          success: false,
          error: 'Migration failed'
        });
      }
    }
  });

  /**
   * @swagger
   * /migration/status:
   *   get:
   *     summary: Get migration scheduler status
   *     tags: [Migration]
   *     description: Get the current status of the migration scheduler
   *     responses:
   *       200:
   *         description: Migration status retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     enabled:
   *                       type: boolean
   *                       description: Whether migration scheduler is enabled
   *                       example: true
   *                     running:
   *                       type: boolean
   *                       description: Whether a migration is currently running
   *                       example: false
   *                     intervalMinutes:
   *                       type: number
   *                       description: Migration interval in minutes
   *                       example: 1
   *                     nextExecution:
   *                       type: string
   *                       description: Next scheduled execution time
   *                       example: 'scheduled'
   *                 message:
   *                   type: string
   *                   example: 'Migration status retrieved successfully'
   */
  router.get('/status', async (req: Request, res: Response) => {
    try {
      const status = migrationScheduler.getStatus();

      res.json({
        success: true,
        data: status,
        message: 'Migration status retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting migration status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get migration status'
      });
    }
  });

  return router;
};