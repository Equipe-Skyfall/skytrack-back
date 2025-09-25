import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { Parameter, Prisma } from '@prisma/client';
import { ParametersService } from './parameter.service';
import { IParameterRepository, PARAMETER_REPOSITORY_TOKEN } from './interfaces/parameter-repository.interface';
import { IStationRepository, STATION_REPOSITORY_TOKEN } from '../stations/interfaces/station-repository.interface';
import { CreateParameterDto } from './dto/create-parameter.dto';
import { UpdateParameterDto } from './dto/update-parameter.dto';

describe('ParametersService', () => {
  let service: ParametersService;
  let parameterRepository: jest.Mocked<IParameterRepository>;
  let stationRepository: jest.Mocked<IStationRepository>;

  const mockParameter: Parameter = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    stationId: '24:6F:28:AE:52:7C',
    tipoParametroId: '550e8400-e29b-41d4-a716-446655440001',
    tipoAlertaId: '550e8400-e29b-41d4-a716-446655440002'
  };

  const mockCreateDto: CreateParameterDto = {
    stationId: '24:6F:28:AE:52:7C',
    tipoParametroId: '550e8400-e29b-41d4-a716-446655440001',
    tipoAlertaId: '550e8400-e29b-41d4-a716-446655440002'
  };

  const mockUpdateDto: UpdateParameterDto = {
    tipoAlertaId: '550e8400-e29b-41d4-a716-446655440003'
  };

  beforeEach(async () => {
    const mockParameterRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByMacAddress: jest.fn(),
      findByStationId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      tipoParametroExists: jest.fn(),
      tipoAlertaExists: jest.fn(),
    };

    const mockStationRepository = {
      existsByMAC: jest.fn(),
      exists: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParametersService,
        {
          provide: PARAMETER_REPOSITORY_TOKEN,
          useValue: mockParameterRepository,
        },
        {
          provide: STATION_REPOSITORY_TOKEN,
          useValue: mockStationRepository,
        },
      ],
    }).compile();

    service = module.get<ParametersService>(ParametersService);
    parameterRepository = module.get(PARAMETER_REPOSITORY_TOKEN);
    stationRepository = module.get(STATION_REPOSITORY_TOKEN);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllParameters', () => {
    it('should return paginated parameters list', async () => {
      const mockResult = {
        parameters: [mockParameter],
        total: 1
      };
      parameterRepository.findAll.mockResolvedValue(mockResult);

      const result = await service.getAllParameters(1, 10, 'Temperature');

      expect(result).toEqual({
        data: [{
          id: mockParameter.id,
          stationId: mockParameter.stationId,
          tipoParametroId: mockParameter.tipoParametroId,
          tipoAlertaId: mockParameter.tipoAlertaId
        }],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1
        }
      });
    });

    it('should calculate total pages correctly', async () => {
      const mockResult = {
        parameters: Array(25).fill(mockParameter),
        total: 25
      };
      parameterRepository.findAll.mockResolvedValue(mockResult);

      const result = await service.getAllParameters(1, 10);

      expect(result.pagination.totalPages).toBe(3);
    });
  });

  describe('getParameterById', () => {
    it('should return parameter when found', async () => {
      parameterRepository.findById.mockResolvedValue(mockParameter);

      const result = await service.getParameterById(mockParameter.id);

      expect(result).toEqual({
        id: mockParameter.id,
        stationId: mockParameter.stationId,
        tipoParametroId: mockParameter.tipoParametroId,
        tipoAlertaId: mockParameter.tipoAlertaId
      });
    });

    it('should throw NotFoundException when parameter not found', async () => {
      parameterRepository.findById.mockResolvedValue(null);

      await expect(service.getParameterById('non-existent-id'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('getParametersByStationId', () => {
    it('should return parameters for valid station ID', async () => {
      stationRepository.exists.mockResolvedValue(true);
      const mockResult = {
        parameters: [mockParameter],
        total: 1
      };
      parameterRepository.findByStationId.mockResolvedValue(mockResult);

      const result = await service.getParametersByStationId(1, 10, '356565b5-bc12-4873-acc8-145472c5fa79');

      expect(result).toEqual({
        data: [{
          id: mockParameter.id,
          stationId: mockParameter.stationId,
          tipoParametroId: mockParameter.tipoParametroId,
          tipoAlertaId: mockParameter.tipoAlertaId
        }],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1
        }
      });
    });

    it('should throw NotFoundException for invalid station ID', async () => {
      stationRepository.exists.mockResolvedValue(false);

      await expect(service.getParametersByStationId(1, 10, 'invalid-station-id'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('createParameter', () => {
    it('should create parameter with valid data', async () => {
      stationRepository.exists.mockResolvedValue(true);
      parameterRepository.tipoParametroExists.mockResolvedValue(true);
      parameterRepository.tipoAlertaExists.mockResolvedValue(true);
      parameterRepository.create.mockResolvedValue(mockParameter);

      const result = await service.createParameter(mockCreateDto);

      expect(result).toEqual({
        id: mockParameter.id,
        stationId: mockParameter.stationId,
        tipoParametroId: mockParameter.tipoParametroId,
        tipoAlertaId: mockParameter.tipoAlertaId
      });
      expect(parameterRepository.create).toHaveBeenCalledWith(mockCreateDto);
    });

    it('should throw NotFoundException for invalid station MAC', async () => {
      stationRepository.exists.mockResolvedValue(false);

      await expect(service.createParameter(mockCreateDto))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for invalid TipoParametro ID', async () => {
      stationRepository.exists.mockResolvedValue(true);
      parameterRepository.tipoParametroExists.mockResolvedValue(false);

      await expect(service.createParameter(mockCreateDto))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for invalid Alert ID', async () => {
      stationRepository.exists.mockResolvedValue(true);
      parameterRepository.tipoParametroExists.mockResolvedValue(true);
      parameterRepository.tipoAlertaExists.mockResolvedValue(false);

      await expect(service.createParameter(mockCreateDto))
        .rejects.toThrow(NotFoundException);
    });

    it('should work without tipoAlertaId when not provided', async () => {
      const dtoWithoutAlert = { ...mockCreateDto };
      delete dtoWithoutAlert.tipoAlertaId;

      stationRepository.exists.mockResolvedValue(true);
      parameterRepository.tipoParametroExists.mockResolvedValue(true);
      parameterRepository.create.mockResolvedValue({ ...mockParameter, tipoAlertaId: null });

      const result = await service.createParameter(dtoWithoutAlert);

      expect(result).toBeDefined();
      expect(parameterRepository.tipoAlertaExists).not.toHaveBeenCalled();
    });

    it('should throw ConflictException for duplicate parameter name', async () => {
      stationRepository.exists.mockResolvedValue(true);
      parameterRepository.tipoParametroExists.mockResolvedValue(true);
      parameterRepository.tipoAlertaExists.mockResolvedValue(true);
      const duplicateError = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '6.16.1'
      });
      parameterRepository.create.mockRejectedValue(duplicateError);

      await expect(service.createParameter(mockCreateDto))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('updateParameter', () => {
    it('should update parameter successfully', async () => {
      const updatedParameter = { ...mockParameter, ...mockUpdateDto } as Parameter;
      parameterRepository.tipoAlertaExists.mockResolvedValue(true);
      parameterRepository.update.mockResolvedValue(updatedParameter);

      const result = await service.updateParameter(mockParameter.id, mockUpdateDto);

      expect(result).toEqual({
        id: updatedParameter.id,
        stationId: updatedParameter.stationId,
        tipoParametroId: updatedParameter.tipoParametroId,
        tipoAlertaId: updatedParameter.tipoAlertaId
      });
    });

    it('should throw ConflictException for duplicate parameter name', async () => {
      const duplicateError = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '6.16.1'
      });
      parameterRepository.tipoAlertaExists.mockResolvedValue(true);
      parameterRepository.update.mockRejectedValue(duplicateError);

      await expect(service.updateParameter(mockParameter.id, mockUpdateDto))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('deleteParameter', () => {
    it('should delete parameter when it exists', async () => {
      parameterRepository.exists.mockResolvedValue(true);
      parameterRepository.delete.mockResolvedValue();

      await service.deleteParameter(mockParameter.id);

      expect(parameterRepository.delete).toHaveBeenCalledWith(mockParameter.id);
    });

    it('should throw NotFoundException when parameter does not exist', async () => {
      parameterRepository.exists.mockResolvedValue(false);

      await expect(service.deleteParameter('non-existent-id'))
        .rejects.toThrow(NotFoundException);
    });
  });
});