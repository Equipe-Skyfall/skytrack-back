import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TipoParametro } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TipoParametroService } from './tipo-parametro.service';
import { CreateTipoParametroDto } from './dto/create-tipo-parametro.dto';
import { UpdateTipoParametroDto } from './dto/update-tipo-parametro.dto';

describe('TipoParametroService', () => {
  let service: TipoParametroService;
  let prisma: any;

  const mockTipoParametro: TipoParametro = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    jsonId: 'temperature_sensor',
    nome: 'Temperature',
    metrica: '°C',
    polinomio: 'a0 + a1*temperatura',
    coeficiente: [1.0, 0.95],
    leitura: { temperatura: { offset: 0, factor: 1.0 } }
  };

  const mockCreateDto: CreateTipoParametroDto = {
    jsonId: 'humidity_sensor',
    nome: 'Humidity',
    metrica: '%',
    polinomio: 'a0 + a1*umidade',
    coeficiente: [0.0, 1.1],
    leitura: { umidade: { offset: -2, factor: 1.05 } }
  };

  const mockUpdateDto: UpdateTipoParametroDto = {
    nome: 'Updated Temperature',
    metrica: '°F'
  };

  beforeEach(async () => {
    const mockPrisma = {
      tipoParametro: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      }
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TipoParametroService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<TipoParametroService>(TipoParametroService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllTipoParametros', () => {
    it('should return all tipo parametros ordered by name', async () => {
      const mockTipoParametros = [mockTipoParametro];
      prisma.tipoParametro.findMany.mockResolvedValue(mockTipoParametros);

      const result = await service.getAllTipoParametros();

      expect(result).toEqual([{
        id: mockTipoParametro.id,
        jsonId: mockTipoParametro.jsonId,
        nome: mockTipoParametro.nome,
        metrica: mockTipoParametro.metrica,
        polinomio: mockTipoParametro.polinomio,
        coeficiente: mockTipoParametro.coeficiente,
        leitura: mockTipoParametro.leitura
      }]);
      expect(prisma.tipoParametro.findMany).toHaveBeenCalledWith({
        orderBy: { nome: 'asc' }
      });
    });

    it('should return empty array when no tipo parametros exist', async () => {
      prisma.tipoParametro.findMany.mockResolvedValue([]);

      const result = await service.getAllTipoParametros();

      expect(result).toEqual([]);
    });
  });

  describe('getTipoParametroById', () => {
    it('should return tipo parametro when found', async () => {
      prisma.tipoParametro.findUnique.mockResolvedValue(mockTipoParametro);

      const result = await service.getTipoParametroById(mockTipoParametro.id);

      expect(result).toEqual({
        id: mockTipoParametro.id,
        jsonId: mockTipoParametro.jsonId,
        nome: mockTipoParametro.nome,
        metrica: mockTipoParametro.metrica,
        polinomio: mockTipoParametro.polinomio,
        coeficiente: mockTipoParametro.coeficiente,
        leitura: mockTipoParametro.leitura
      });
      expect(prisma.tipoParametro.findUnique).toHaveBeenCalledWith({
        where: { id: mockTipoParametro.id }
      });
    });

    it('should throw NotFoundException when tipo parametro not found', async () => {
      prisma.tipoParametro.findUnique.mockResolvedValue(null);

      await expect(service.getTipoParametroById('non-existent-id'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('createTipoParametro', () => {
    it('should create and return new tipo parametro', async () => {
      const createdTipoParametro = { ...mockTipoParametro, ...mockCreateDto };
      prisma.tipoParametro.create.mockResolvedValue(createdTipoParametro);

      const result = await service.createTipoParametro(mockCreateDto);

      expect(result).toEqual({
        id: createdTipoParametro.id,
        jsonId: createdTipoParametro.jsonId,
        nome: createdTipoParametro.nome,
        metrica: createdTipoParametro.metrica,
        polinomio: createdTipoParametro.polinomio,
        coeficiente: createdTipoParametro.coeficiente,
        leitura: createdTipoParametro.leitura
      });
      expect(prisma.tipoParametro.create).toHaveBeenCalledWith({
        data: mockCreateDto
      });
    });

    it('should throw BadRequestException when jsonId already exists', async () => {
      const duplicateError = { code: 'P2002' };
      prisma.tipoParametro.create.mockRejectedValue(duplicateError);

      await expect(service.createTipoParametro(mockCreateDto))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('updateTipoParametro', () => {
    it('should update and return tipo parametro when it exists', async () => {
      const updatedTipoParametro = { ...mockTipoParametro, ...mockUpdateDto };
      prisma.tipoParametro.findUnique.mockResolvedValue(mockTipoParametro);
      prisma.tipoParametro.update.mockResolvedValue(updatedTipoParametro);

      const result = await service.updateTipoParametro(mockTipoParametro.id, mockUpdateDto);

      expect(result).toEqual({
        id: updatedTipoParametro.id,
        jsonId: updatedTipoParametro.jsonId,
        nome: updatedTipoParametro.nome,
        metrica: updatedTipoParametro.metrica,
        polinomio: updatedTipoParametro.polinomio,
        coeficiente: updatedTipoParametro.coeficiente,
        leitura: updatedTipoParametro.leitura
      });
    });

    it('should throw NotFoundException when tipo parametro does not exist', async () => {
      prisma.tipoParametro.findUnique.mockResolvedValue(null);

      await expect(service.updateTipoParametro('non-existent-id', mockUpdateDto))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when jsonId already exists', async () => {
      prisma.tipoParametro.findUnique.mockResolvedValue(mockTipoParametro);
      const duplicateError = { code: 'P2002' };
      prisma.tipoParametro.update.mockRejectedValue(duplicateError);

      await expect(service.updateTipoParametro(mockTipoParametro.id, { jsonId: 'existing-json-id' }))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteTipoParametro', () => {
    it('should delete tipo parametro when it exists', async () => {
      prisma.tipoParametro.findUnique.mockResolvedValue(mockTipoParametro);
      prisma.tipoParametro.delete.mockResolvedValue(mockTipoParametro);

      await service.deleteTipoParametro(mockTipoParametro.id);

      expect(prisma.tipoParametro.delete).toHaveBeenCalledWith({
        where: { id: mockTipoParametro.id }
      });
    });

    it('should throw NotFoundException when tipo parametro does not exist', async () => {
      prisma.tipoParametro.findUnique.mockResolvedValue(null);

      await expect(service.deleteTipoParametro('non-existent-id'))
        .rejects.toThrow(NotFoundException);
    });
  });
});