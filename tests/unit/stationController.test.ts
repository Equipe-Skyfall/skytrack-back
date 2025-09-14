import { Request, Response } from 'express';
import { StationController } from '../../src/controllers/stationController';
import { IStationService } from '../../src/services/stationService';
import { StationStatus, IStation, ICreateStationDTO, IUpdateStationDTO } from '../../src/types/station';
import { ApiResponse } from '../../src/types';

// Mock station data
const mockStation: IStation = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Test Station',
  latitude: -23.5505,
  longitude: -46.6333,
  description: 'Test station description',
  status: StationStatus.ACTIVE,
  createdAt: new Date('2023-12-01T10:30:00.000Z'),
  updatedAt: new Date('2023-12-01T10:30:00.000Z'),
};

const mockCreateStationDTO: ICreateStationDTO = {
  name: 'New Station',
  latitude: -22.5505,
  longitude: -45.6333,
  description: 'New station description',
  status: StationStatus.ACTIVE,
};

const mockUpdateStationDTO: IUpdateStationDTO = {
  name: 'Updated Station',
  description: 'Updated description',
};

describe('Station Controller', () => {
  let stationController: StationController;
  let mockStationService: jest.Mocked<IStationService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockStationService = {
      getAllStations: jest.fn(),
      getStationById: jest.fn(),
      createStation: jest.fn(),
      updateStation: jest.fn(),
      deleteStation: jest.fn(),
    };

    stationController = new StationController(mockStationService);

    mockRequest = {
      params: {},
      query: {},
      body: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('getAllStations', () => {
    it('should return all stations with 200 status code', async () => {
      const mockServiceResponse: ApiResponse<{
        stations: IStation[];
        total: number;
        page?: number;
        limit?: number;
      }> = {
        success: true,
        data: {
          stations: [mockStation],
          total: 1,
        },
        message: 'Retrieved 1 stations',
      };

      mockStationService.getAllStations.mockResolvedValue(mockServiceResponse);

      await stationController.getAllStations(mockRequest as Request, mockResponse as Response);

      expect(mockStationService.getAllStations).toHaveBeenCalledWith({});
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockServiceResponse);
    });

    it('should handle query parameters correctly', async () => {
      mockRequest.query = {
        name: 'test',
        status: 'ACTIVE',
        limit: '10',
        offset: '0',
      };

      const mockServiceResponse: ApiResponse<{
        stations: IStation[];
        total: number;
        page?: number;
        limit?: number;
      }> = {
        success: true,
        data: {
          stations: [],
          total: 0,
        },
        message: 'Retrieved 0 stations',
      };

      mockStationService.getAllStations.mockResolvedValue(mockServiceResponse);

      await stationController.getAllStations(mockRequest as Request, mockResponse as Response);

      expect(mockStationService.getAllStations).toHaveBeenCalledWith({
        name: 'test',
        status: StationStatus.ACTIVE,
        limit: 10,
        offset: 0,
      });
    });

    it('should return 400 on service error', async () => {
      const mockServiceResponse: ApiResponse<{
        stations: IStation[];
        total: number;
        page?: number;
        limit?: number;
      }> = {
        success: false,
        error: 'Invalid parameters',
      };

      mockStationService.getAllStations.mockResolvedValue(mockServiceResponse);

      await stationController.getAllStations(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(mockServiceResponse);
    });

    it('should return 500 on unexpected error', async () => {
      mockStationService.getAllStations.mockRejectedValue(new Error('Database error'));

      await stationController.getAllStations(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error',
      });
    });
  });

  describe('getStationById', () => {
    beforeEach(() => {
      mockRequest.params = { id: '123e4567-e89b-12d3-a456-426614174000' };
    });

    it('should return station with 200 status code', async () => {
      const mockServiceResponse: ApiResponse<IStation> = {
        success: true,
        data: mockStation,
        message: 'Station retrieved successfully',
      };

      mockStationService.getStationById.mockResolvedValue(mockServiceResponse);

      await stationController.getStationById(mockRequest as Request, mockResponse as Response);

      expect(mockStationService.getStationById).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockServiceResponse);
    });

    it('should return 404 when station not found', async () => {
      const mockServiceResponse: ApiResponse<IStation> = {
        success: false,
        error: 'Station with ID 123e4567-e89b-12d3-a456-426614174000 not found',
      };

      mockStationService.getStationById.mockResolvedValue(mockServiceResponse);

      await stationController.getStationById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(mockServiceResponse);
    });

    it('should return 400 for invalid ID format', async () => {
      const mockServiceResponse: ApiResponse<IStation> = {
        success: false,
        error: 'Invalid station ID format',
      };

      mockStationService.getStationById.mockResolvedValue(mockServiceResponse);

      await stationController.getStationById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(mockServiceResponse);
    });
  });

  describe('createStation', () => {
    beforeEach(() => {
      mockRequest.body = mockCreateStationDTO;
    });

    it('should create station with 201 status code', async () => {
      const mockServiceResponse: ApiResponse<IStation> = {
        success: true,
        data: { ...mockStation, ...mockCreateStationDTO },
        message: 'Station created successfully',
      };

      mockStationService.createStation.mockResolvedValue(mockServiceResponse);

      await stationController.createStation(mockRequest as Request, mockResponse as Response);

      expect(mockStationService.createStation).toHaveBeenCalledWith(mockCreateStationDTO);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockServiceResponse);
    });

    it('should return 400 on validation error', async () => {
      const mockServiceResponse: ApiResponse<IStation> = {
        success: false,
        error: 'Validation failed: Name is required',
      };

      mockStationService.createStation.mockResolvedValue(mockServiceResponse);

      await stationController.createStation(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(mockServiceResponse);
    });

    it('should return 400 on duplicate name', async () => {
      const mockServiceResponse: ApiResponse<IStation> = {
        success: false,
        error: "Station with name 'New Station' already exists",
      };

      mockStationService.createStation.mockResolvedValue(mockServiceResponse);

      await stationController.createStation(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(mockServiceResponse);
    });
  });

  describe('updateStation', () => {
    beforeEach(() => {
      mockRequest.params = { id: '123e4567-e89b-12d3-a456-426614174000' };
      mockRequest.body = mockUpdateStationDTO;
    });

    it('should update station with 200 status code', async () => {
      const updatedStation = { ...mockStation, ...mockUpdateStationDTO };
      const mockServiceResponse: ApiResponse<IStation> = {
        success: true,
        data: updatedStation,
        message: 'Station updated successfully',
      };

      mockStationService.updateStation.mockResolvedValue(mockServiceResponse);

      await stationController.updateStation(mockRequest as Request, mockResponse as Response);

      expect(mockStationService.updateStation).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
        mockUpdateStationDTO
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockServiceResponse);
    });

    it('should return 404 when station not found', async () => {
      const mockServiceResponse: ApiResponse<IStation> = {
        success: false,
        error: 'Station with ID 123e4567-e89b-12d3-a456-426614174000 not found',
      };

      mockStationService.updateStation.mockResolvedValue(mockServiceResponse);

      await stationController.updateStation(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(mockServiceResponse);
    });

    it('should return 400 on validation error', async () => {
      const mockServiceResponse: ApiResponse<IStation> = {
        success: false,
        error: 'Validation failed: Name must be between 1 and 100 characters',
      };

      mockStationService.updateStation.mockResolvedValue(mockServiceResponse);

      await stationController.updateStation(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(mockServiceResponse);
    });
  });

  describe('deleteStation', () => {
    beforeEach(() => {
      mockRequest.params = { id: '123e4567-e89b-12d3-a456-426614174000' };
    });

    it('should delete station with 200 status code', async () => {
      const mockServiceResponse: ApiResponse<null> = {
        success: true,
        data: null,
        message: 'Station deleted successfully',
      };

      mockStationService.deleteStation.mockResolvedValue(mockServiceResponse);

      await stationController.deleteStation(mockRequest as Request, mockResponse as Response);

      expect(mockStationService.deleteStation).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockServiceResponse);
    });

    it('should return 404 when station not found', async () => {
      const mockServiceResponse: ApiResponse<null> = {
        success: false,
        error: 'Station with ID 123e4567-e89b-12d3-a456-426614174000 not found',
      };

      mockStationService.deleteStation.mockResolvedValue(mockServiceResponse);

      await stationController.deleteStation(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(mockServiceResponse);
    });

    it('should return 400 for invalid ID format', async () => {
      const mockServiceResponse: ApiResponse<null> = {
        success: false,
        error: 'Invalid station ID format',
      };

      mockStationService.deleteStation.mockResolvedValue(mockServiceResponse);

      await stationController.deleteStation(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(mockServiceResponse);
    });
  });
});