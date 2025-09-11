import { Router } from 'express';
import { getHealth } from '../controllers/healthController';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: Health check endpoints
 */
router.get('/health', getHealth);

export default router;