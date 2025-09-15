import { Router } from 'express';
import { IStationController } from '../controllers/stationController';
import { validateCreateStation, validateUpdateStation } from '../middleware/stationValidation';

/**
 * @swagger
 * tags:
 *   name: Stations
 *   description: Meteorological stations management endpoints
 */

const createStationRoutes = (stationController: IStationController): Router => {
  const router = Router();

  /**
   * @swagger
   * /stations:
   *   get:
   *     summary: Get all stations
   *     tags: [Stations]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Items per page
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [ACTIVE, INACTIVE]
   *         description: Filter by status
   *     responses:
   *       200:
   *         description: List of stations
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/StationsListResponse'
   *       400:
   *         description: Bad request
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiError'
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiError'
   */
  router.get('/stations', (req, res) => stationController.getAllStations(req, res));

  /**
   * @swagger
   * /stations/{id}:
   *   get:
   *     summary: Get station by ID
   *     tags: [Stations]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Station ID
   *     responses:
   *       200:
   *         description: Station details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Station'
   *       404:
   *         description: Station not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiError'
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiError'
   */
  router.get('/stations/:id', (req, res) => stationController.getStationById(req, res));

  /**
   * @swagger
   * /stations:
   *   post:
   *     summary: Create new station
   *     tags: [Stations]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateStationRequest'
   *     responses:
   *       201:
   *         description: Station created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Station'
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiError'
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiError'
   */
  router.post('/stations', validateCreateStation, (req, res) => stationController.createStation(req, res));

  /**
   * @swagger
   * /stations/{id}:
   *   put:
   *     summary: Update station
   *     tags: [Stations]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Station ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateStationRequest'
   *     responses:
   *       200:
   *         description: Station updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Station'
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiError'
   *       404:
   *         description: Station not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiError'
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiError'
   */
  router.put('/stations/:id', validateUpdateStation, (req, res) => stationController.updateStation(req, res));

  /**
   * @swagger
   * /stations/{id}:
   *   delete:
   *     summary: Delete station
   *     tags: [Stations]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Station ID
   *     responses:
   *       204:
   *         description: Station deleted successfully
   *       404:
   *         description: Station not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiError'
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiError'
   */
  router.delete('/stations/:id', (req, res) => stationController.deleteStation(req, res));

  return router;
};

export default createStationRoutes;