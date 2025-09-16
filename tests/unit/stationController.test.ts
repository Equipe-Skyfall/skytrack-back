import { Test, TestingModule } from '@nestjs/testing';
import { StationsController } from '../../src/stations/stations.controller';
import { StationsService } from '../../src/stations/stations.service';
import { CreateStationDto, StationStatus } from '../../src/stations/dto/create-station.dto';
import { UpdateStationDto } from '../../src/stations/dto/update-station.dto';
import { StationDto } from '../../src/stations/dto/station.dto';
import { StationsListDto } from '../../src/stations/dto/stations-list.dto';
import { STATION_REPOSITORY_TOKEN } from '../../src/stations/interfaces/station-repository.interface';
import { NotFoundException, BadRequestException } from '@nestjs/common';

const mockStation: StationDto = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Test Station',
  latitude: -23.5505,
  longitude: -46.6333,
  address: 'Rua das Flores, 123 - São Paulo, SP',
  description: 'Test station description',
  status: StationStatus.ACTIVE,
  macAddress: '00:11:22:33:44:55',
  createdAt: new Date('2023-12-01T10:30:00.000Z'),
  updatedAt: new Date('2023-12-01T10:30:00.000Z'),
};

const mockCreateStationDto: CreateStationDto = {
  name: 'New Station',
  latitude: -22.5505,
  longitude: -45.6333,
  description: 'New station description',
  status: StationStatus.ACTIVE,
  macAddress: '00:11:22:33:44:66',
};

const mockUpdateStationDto: UpdateStationDto = {
  name: 'Updated Station',
  description: 'Updated description',
};

describe('StationsController', () => {
  let controller: StationsController;
  let service: StationsService;

  beforeEach(async () => {
    const mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByMacAddress: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StationsController],
      providers: [
        StationsService,
        {
          provide: STATION_REPOSITORY_TOKEN,
          useValue: mockRepository,
        },
      ],
    }).compile();

    controller = module.get<StationsController>(StationsController);
    service = module.get<StationsService>(StationsService);
  });

  describe('getAllStations', () => {
    it('should return all stations', async () => {
      const mockResult: StationsListDto = {
        data: [mockStation],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      jest.spyOn(service, 'getAllStations').mockResolvedValue(mockResult);

      const result = await controller.getAllStations(1, 10);

      expect(service.getAllStations).toHaveBeenCalledWith(1, 10, undefined);
      expect(result).toEqual(mockResult);
    });

    it('should handle query parameters correctly', async () => {
      const mockResult: StationsListDto = {
        data: [],
        pagination: {
          page: 1,
          limit: 5,
          total: 0,
          totalPages: 0,
        },
      };

      jest.spyOn(service, 'getAllStations').mockResolvedValue(mockResult);

      await controller.getAllStations(1, 5, StationStatus.ACTIVE);

      expect(service.getAllStations).toHaveBeenCalledWith(1, 5, StationStatus.ACTIVE);
    });
  });

  describe('getStationById', () => {
    it('should return station by ID', async () => {
      jest.spyOn(service, 'getStationById').mockResolvedValue(mockStation);

      const result = await controller.getStationById('123e4567-e89b-12d3-a456-426614174000');

      expect(service.getStationById).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
      expect(result).toEqual(mockStation);
    });

    it('should throw NotFoundException when station not found', async () => {
      jest.spyOn(service, 'getStationById').mockRejectedValue(new NotFoundException('Station not found'));

      await expect(
        controller.getStationById('123e4567-e89b-12d3-a456-426614174000')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStationByMacAddress', () => {
    it('should return station by MAC address', async () => {
      jest.spyOn(service, 'getStationByMacAddress').mockResolvedValue(mockStation);

      const result = await controller.getStationByMacAddress('00:11:22:33:44:55');

      expect(service.getStationByMacAddress).toHaveBeenCalledWith('00:11:22:33:44:55');
      expect(result).toEqual(mockStation);
    });

    it('should throw NotFoundException when station not found', async () => {
      jest.spyOn(service, 'getStationByMacAddress').mockRejectedValue(new NotFoundException('Station not found'));

      await expect(
        controller.getStationByMacAddress('00:11:22:33:44:55')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createStation', () => {
    it('should create a new station', async () => {
      const newStation = { ...mockStation, ...mockCreateStationDto };
      jest.spyOn(service, 'createStation').mockResolvedValue(newStation);

      const result = await controller.createStation(mockCreateStationDto);

      expect(service.createStation).toHaveBeenCalledWith(mockCreateStationDto);
      expect(result).toEqual(newStation);
    });

    it('should throw BadRequestException on validation error', async () => {
      jest.spyOn(service, 'createStation').mockRejectedValue(new BadRequestException('Validation failed'));

      await expect(
        controller.createStation(mockCreateStationDto)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateStation', () => {
    it('should update a station', async () => {
      const updatedStation = { ...mockStation, ...mockUpdateStationDto };
      jest.spyOn(service, 'updateStation').mockResolvedValue(updatedStation);

      const result = await controller.updateStation(
        '123e4567-e89b-12d3-a456-426614174000',
        mockUpdateStationDto
      );

      expect(service.updateStation).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
        mockUpdateStationDto
      );
      expect(result).toEqual(updatedStation);
    });

    it('should throw NotFoundException when station not found', async () => {
      jest.spyOn(service, 'updateStation').mockRejectedValue(new NotFoundException('Station not found'));

      await expect(
        controller.updateStation('123e4567-e89b-12d3-a456-426614174000', mockUpdateStationDto)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteStation', () => {
    it('should delete a station', async () => {
      jest.spyOn(service, 'deleteStation').mockResolvedValue(undefined);

      await controller.deleteStation('123e4567-e89b-12d3-a456-426614174000');

      expect(service.deleteStation).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should throw NotFoundException when station not found', async () => {
      jest.spyOn(service, 'deleteStation').mockRejectedValue(new NotFoundException('Station not found'));

      await expect(
        controller.deleteStation('123e4567-e89b-12d3-a456-426614174000')
      ).rejects.toThrow(NotFoundException);
    });
  });
});