import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TipoAlerta } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';
import { TipoAlertaService } from './tipo-alerta.service';
import { CreateTipoAlertaDto } from './dto/create-tipo-alerta.dto';
import { UpdateTipoAlertaDto } from './dto/update-tipo-alerta.dto';

describe('TipoAlertaService', () => {
  let service: TipoAlertaService;
  let prisma: any;

  const mockTipoAlerta: TipoAlerta = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    tipo: 'TEMPERATURE_HIGH',
    publica: true,
    condicao: 'GREATER_THAN',
    criadoEm: new Date('2024-01-01T00:00:00.000Z'),
    limite: new Decimal(35.0),
    nivel: 'warning',
    duracaoMin: 5
  };

  const mockCreateDto: CreateTipoAlertaDto = {
    tipo: 'HUMIDITY_LOW',
    publica: false,
    condicao: 'LESS_THAN',
    limite: 20.0,
    nivel: 'critical',
    duracaoMin: 10
  };

  const mockUpdateDto: UpdateTipoAlertaDto = {
    tipo: 'UPDATED_ALERT',
    nivel: 'warning'
  };

  beforeEach(async () => {
    const mockPrisma = {
      tipoAlerta: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      }
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TipoAlertaService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<TipoAlertaService>(TipoAlertaService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllTipoAlertas', () => {
    it('should return all tipo alertas ordered by tipo', async () => {
      const mockTipoAlertas = [mockTipoAlerta];
      prisma.tipoAlerta.findMany.mockResolvedValue(mockTipoAlertas);

      const result = await service.getAllTipoAlertas();

      expect(result).toEqual([{
        id: mockTipoAlerta.id,
        tipo: mockTipoAlerta.tipo,
        publica: mockTipoAlerta.publica,
        condicao: mockTipoAlerta.condicao,
        criadoEm: mockTipoAlerta.criadoEm,
        limite: (mockTipoAlerta.limite as Decimal).toNumber(),
        nivel: mockTipoAlerta.nivel,
        duracaoMin: mockTipoAlerta.duracaoMin
      }]);
      expect(prisma.tipoAlerta.findMany).toHaveBeenCalledWith({
        orderBy: { tipo: 'asc' }
      });
    });

    it('should return empty array when no tipo alertas exist', async () => {
      prisma.tipoAlerta.findMany.mockResolvedValue([]);

      const result = await service.getAllTipoAlertas();

      expect(result).toEqual([]);
    });
  });

  describe('getTipoAlertaById', () => {
    it('should return tipo alerta when found', async () => {
      prisma.tipoAlerta.findUnique.mockResolvedValue(mockTipoAlerta);

      const result = await service.getTipoAlertaById(mockTipoAlerta.id);

      expect(result).toEqual({
        id: mockTipoAlerta.id,
        tipo: mockTipoAlerta.tipo,
        publica: mockTipoAlerta.publica,
        condicao: mockTipoAlerta.condicao,
        criadoEm: mockTipoAlerta.criadoEm,
        limite: (mockTipoAlerta.limite as Decimal).toNumber(),
        nivel: mockTipoAlerta.nivel,
        duracaoMin: mockTipoAlerta.duracaoMin
      });
      expect(prisma.tipoAlerta.findUnique).toHaveBeenCalledWith({
        where: { id: mockTipoAlerta.id }
      });
    });

    it('should throw NotFoundException when tipo alerta not found', async () => {
      prisma.tipoAlerta.findUnique.mockResolvedValue(null);

      await expect(service.getTipoAlertaById('non-existent-id'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('createTipoAlerta', () => {
    it('should create and return new tipo alerta', async () => {
      const createdTipoAlerta = {
        ...mockTipoAlerta,
        ...mockCreateDto,
        id: '550e8400-e29b-41d4-a716-446655440001',
        criadoEm: new Date(),
        limite: new Decimal(mockCreateDto.limite) // Ensure limite is converted to Decimal for Prisma response
      };
      prisma.tipoAlerta.create.mockResolvedValue(createdTipoAlerta);

      const result = await service.createTipoAlerta(mockCreateDto);

      expect(result).toEqual({
        id: createdTipoAlerta.id,
        tipo: createdTipoAlerta.tipo,
        publica: createdTipoAlerta.publica,
        condicao: createdTipoAlerta.condicao,
        criadoEm: createdTipoAlerta.criadoEm,
        limite: typeof createdTipoAlerta.limite === 'number' ? createdTipoAlerta.limite : (createdTipoAlerta.limite as Decimal).toNumber(),
        nivel: createdTipoAlerta.nivel,
        duracaoMin: createdTipoAlerta.duracaoMin
      });
      expect(prisma.tipoAlerta.create).toHaveBeenCalledWith({
        data: {
          ...mockCreateDto,
          limite: new Decimal(mockCreateDto.limite)
        }
      });
    });

    it('should throw BadRequestException when tipo already exists', async () => {
      const duplicateError = { code: 'P2002' };
      prisma.tipoAlerta.create.mockRejectedValue(duplicateError);

      await expect(service.createTipoAlerta(mockCreateDto))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('updateTipoAlerta', () => {
    it('should update and return tipo alerta when it exists', async () => {
      const updatedTipoAlerta = { ...mockTipoAlerta, ...mockUpdateDto };
      prisma.tipoAlerta.findUnique.mockResolvedValue(mockTipoAlerta);
      prisma.tipoAlerta.update.mockResolvedValue(updatedTipoAlerta);

      const result = await service.updateTipoAlerta(mockTipoAlerta.id, mockUpdateDto);

      expect(result).toEqual({
        id: updatedTipoAlerta.id,
        tipo: updatedTipoAlerta.tipo,
        publica: updatedTipoAlerta.publica,
        condicao: updatedTipoAlerta.condicao,
        criadoEm: updatedTipoAlerta.criadoEm,
        limite: (updatedTipoAlerta.limite as Decimal).toNumber(),
        nivel: updatedTipoAlerta.nivel,
        duracaoMin: updatedTipoAlerta.duracaoMin
      });
    });

    it('should throw NotFoundException when tipo alerta does not exist', async () => {
      prisma.tipoAlerta.findUnique.mockResolvedValue(null);

      await expect(service.updateTipoAlerta('non-existent-id', mockUpdateDto))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when tipo already exists', async () => {
      prisma.tipoAlerta.findUnique.mockResolvedValue(mockTipoAlerta);
      const duplicateError = { code: 'P2002' };
      prisma.tipoAlerta.update.mockRejectedValue(duplicateError);

      await expect(service.updateTipoAlerta(mockTipoAlerta.id, { tipo: 'existing-tipo' }))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteTipoAlerta', () => {
    it('should delete tipo alerta when it exists', async () => {
      prisma.tipoAlerta.findUnique.mockResolvedValue(mockTipoAlerta);
      prisma.tipoAlerta.delete.mockResolvedValue(mockTipoAlerta);

      await service.deleteTipoAlerta(mockTipoAlerta.id);

      expect(prisma.tipoAlerta.delete).toHaveBeenCalledWith({
        where: { id: mockTipoAlerta.id }
      });
    });

    it('should throw NotFoundException when tipo alerta does not exist', async () => {
      prisma.tipoAlerta.findUnique.mockResolvedValue(null);

      await expect(service.deleteTipoAlerta('non-existent-id'))
        .rejects.toThrow(NotFoundException);
    });
  });
});