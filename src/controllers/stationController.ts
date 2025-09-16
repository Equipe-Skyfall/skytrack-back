import { Request, Response } from 'express';
import { IStationService } from '../services/stationService';
import { ICreateStationDTO, IUpdateStationDTO, IStationQueryParams, StationStatus } from '../types/station';

// Controller interface following Single Responsibility Principle
export interface IStationController {
  getAllStations(req: Request, res: Response): Promise<void>;
  getStationById(req: Request, res: Response): Promise<void>;
  getStationByMacAddress?(req: Request, res: Response): Promise<void>;
  createStation(req: Request, res: Response): Promise<void>;
  updateStation(req: Request, res: Response): Promise<void>;
  deleteStation(req: Request, res: Response): Promise<void>;
}

// Station Controller implementation following Dependency Injection
export class StationController implements IStationController {
  constructor(private stationService: IStationService) {}

  /**
   * @swagger
   * /stations:
   *   get:
   *     summary: Get all meteorological stations
   *     description: Retrieve a list of meteorological stations with optional filtering and pagination
   *     tags: [Stations]
   *     parameters:
   *       - in: query
   *         name: name
   *         schema:
   *           type: string
   *         description: Filter by station name (case-insensitive partial match)
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [ACTIVE, INACTIVE]
   *         description: Filter by station status
   *       - in: query
   *         name: minLatitude
   *         schema:
   *           type: number
   *           minimum: -90
   *           maximum: 90
   *         description: Minimum latitude for filtering
   *       - in: query
   *         name: maxLatitude
   *         schema:
   *           type: number
   *           minimum: -90
   *           maximum: 90
   *         description: Maximum latitude for filtering
   *       - in: query
   *         name: minLongitude
   *         schema:
   *           type: number
   *           minimum: -180
   *           maximum: 180
   *         description: Minimum longitude for filtering
   *       - in: query
   *         name: maxLongitude
   *         schema:
   *           type: number
   *           minimum: -180
   *           maximum: 180
   *         description: Maximum longitude for filtering
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *         description: Number of stations to return (max 100)
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integer
   *           minimum: 0
   *         description: Number of stations to skip for pagination
   *     responses:
   *       200:
   *         description: List of meteorological stations
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
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiError'
   */
  async getAllStations(req: Request, res: Response): Promise<void> {
    try {
      const queryParams: IStationQueryParams = this.extractQueryParams(req);
      const result = await this.stationService.getAllStations(queryParams);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  /**
   * @swagger
   * /stations/{id}:
   *   get:
   *     summary: Get a meteorological station by ID
   *     description: Retrieve a specific meteorological station by its UUID
   *     tags: [Stations]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Station UUID
   *     responses:
   *       200:
   *         description: Station found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/StationResponse'
   *       404:
   *         description: Station not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiError'
   *       400:
   *         description: Invalid ID format
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiError'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiError'
   */
  async getStationById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Station ID is required',
        });
        return;
      }

      const result = await this.stationService.getStationById(id);

      if (result.success) {
        res.status(200).json(result);
      } else {
        const statusCode = result.error?.includes('not found') ? 404 : 400;
        res.status(statusCode).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  /**
   * @swagger
   * /stations/mac/{macAddress}:
   *   get:
   *     summary: Get a meteorological station by MAC address
   *     description: Retrieve a specific meteorological station by its MAC address
   *     tags: [Stations]
   *     parameters:
   *       - in: path
   *         name: macAddress
   *         required: true
   *         schema:
   *           type: string
   *         description: Station MAC address or UUID
   *     responses:
   *       200:
   *         description: Station found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/StationResponse'
   *       404:
   *         description: Station not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiError'
   *       400:
   *         description: Invalid MAC address format
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiError'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiError'
   */
  async getStationByMacAddress(req: Request, res: Response): Promise<void> {
    try {
      const { macAddress } = req.params;

      if (!macAddress) {
        res.status(400).json({
          success: false,
          error: 'MAC address is required',
        });
        return;
      }

      if (!this.stationService.getStationByMacAddress) {
        res.status(501).json({
          success: false,
          error: 'MAC address lookup not implemented',
        });
        return;
      }

      const result = await this.stationService.getStationByMacAddress(macAddress);

      if (result.success) {
        res.status(200).json(result);
      } else {
        const statusCode = result.error?.includes('not found') ? 404 : 400;
        res.status(statusCode).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  /**
   * @swagger
   * /stations:
   *   post:
   *     summary: Create a new meteorological station
   *     description: Create a new meteorological station with the provided data
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
   *               $ref: '#/components/schemas/StationResponse'
   *       400:
   *         description: Validation error or duplicate name
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiError'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiError'
   */
  async createStation(req: Request, res: Response): Promise<void> {
    try {
      const stationData: ICreateStationDTO = req.body;
      const result = await this.stationService.createStation(stationData);

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  /**
   * @swagger
   * /stations/{id}:
   *   put:
   *     summary: Update a meteorological station
   *     description: Update an existing meteorological station with the provided data
   *     tags: [Stations]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Station UUID
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
   *               $ref: '#/components/schemas/StationResponse'
   *       400:
   *         description: Validation error or duplicate name
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
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiError'
   */
  async updateStation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Station ID is required',
        });
        return;
      }

      const stationData: IUpdateStationDTO = req.body;
      const result = await this.stationService.updateStation(id, stationData);

      if (result.success) {
        res.status(200).json(result);
      } else {
        const statusCode = result.error?.includes('not found') ? 404 : 400;
        res.status(statusCode).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  /**
   * @swagger
   * /stations/{id}:
   *   delete:
   *     summary: Delete a meteorological station
   *     description: Delete an existing meteorological station by its UUID
   *     tags: [Stations]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Station UUID
   *     responses:
   *       200:
   *         description: Station deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiSuccessResponse'
   *       404:
   *         description: Station not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiError'
   *       400:
   *         description: Invalid ID format
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiError'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiError'
   */
  async deleteStation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Station ID is required',
        });
        return;
      }

      const result = await this.stationService.deleteStation(id);

      if (result.success) {
        res.status(200).json(result);
      } else {
        const statusCode = result.error?.includes('not found') ? 404 : 400;
        res.status(statusCode).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  private extractQueryParams(req: Request): IStationQueryParams {
    const queryParams: IStationQueryParams = {};

    if (req.query.name) {
      queryParams.name = String(req.query.name);
    }

    if (req.query.status && Object.values(StationStatus).includes(req.query.status as StationStatus)) {
      queryParams.status = req.query.status as StationStatus;
    }

    if (req.query.minLatitude) {
      const minLat = parseFloat(String(req.query.minLatitude));
      if (!isNaN(minLat)) queryParams.minLatitude = minLat;
    }

    if (req.query.maxLatitude) {
      const maxLat = parseFloat(String(req.query.maxLatitude));
      if (!isNaN(maxLat)) queryParams.maxLatitude = maxLat;
    }

    if (req.query.minLongitude) {
      const minLng = parseFloat(String(req.query.minLongitude));
      if (!isNaN(minLng)) queryParams.minLongitude = minLng;
    }

    if (req.query.maxLongitude) {
      const maxLng = parseFloat(String(req.query.maxLongitude));
      if (!isNaN(maxLng)) queryParams.maxLongitude = maxLng;
    }

    if (req.query.limit) {
      const limit = parseInt(String(req.query.limit));
      if (!isNaN(limit) && limit > 0) queryParams.limit = Math.min(limit, 100);
    }

    if (req.query.offset) {
      const offset = parseInt(String(req.query.offset));
      if (!isNaN(offset) && offset >= 0) queryParams.offset = offset;
    }

    return queryParams;
  }
}

