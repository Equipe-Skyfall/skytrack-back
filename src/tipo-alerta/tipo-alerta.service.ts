import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { TipoAlerta } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTipoAlertaDto } from './dto/create-tipo-alerta.dto';
import { UpdateTipoAlertaDto } from './dto/update-tipo-alerta.dto';
import { TipoAlertaDto } from './dto/tipo-alerta.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class TipoAlertaService {
    constructor(private readonly prisma: PrismaService) {}

    async getAllTipoAlertas(): Promise<TipoAlertaDto[]> {
        const tipoAlertas = await this.prisma.tipoAlerta.findMany({
            orderBy: { tipo: 'asc' }
        });
        return tipoAlertas.map(this.mapToTipoAlertaDto);
    }

    async getTipoAlertaById(id: string): Promise<TipoAlertaDto> {
        const tipoAlerta = await this.prisma.tipoAlerta.findUnique({
            where: { id }
        });

        if (!tipoAlerta) {
            throw new NotFoundException(`TipoAlerta with ID ${id} not found`);
        }

        return this.mapToTipoAlertaDto(tipoAlerta);
    }

    async createTipoAlerta(createTipoAlertaDto: CreateTipoAlertaDto): Promise<TipoAlertaDto> {
        try {
            const tipoAlerta = await this.prisma.tipoAlerta.create({
                data: {
                    ...createTipoAlertaDto,
                    limite: new Decimal(createTipoAlertaDto.limite)
                }
            });
            return this.mapToTipoAlertaDto(tipoAlerta);
        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
                throw new BadRequestException(`TipoAlerta with tipo '${createTipoAlertaDto.tipo}' already exists`);
            }
            throw error;
        }
    }

    async updateTipoAlerta(id: string, updateTipoAlertaDto: UpdateTipoAlertaDto): Promise<TipoAlertaDto> {
        const exists = await this.prisma.tipoAlerta.findUnique({
            where: { id }
        });

        if (!exists) {
            throw new NotFoundException(`TipoAlerta with ID ${id} not found`);
        }

        try {
            const updateData: Record<string, unknown> = { ...updateTipoAlertaDto };
            if (updateTipoAlertaDto.limite !== undefined) {
                updateData.limite = new Decimal(updateTipoAlertaDto.limite);
            }

            const tipoAlerta = await this.prisma.tipoAlerta.update({
                where: { id },
                data: updateData
            });
            return this.mapToTipoAlertaDto(tipoAlerta);
        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
                throw new BadRequestException(`TipoAlerta with tipo '${updateTipoAlertaDto.tipo}' already exists`);
            }
            throw error;
        }
    }

    async deleteTipoAlerta(id: string): Promise<void> {
        const exists = await this.prisma.tipoAlerta.findUnique({
            where: { id }
        });

        if (!exists) {
            throw new NotFoundException(`TipoAlerta with ID ${id} not found`);
        }

        await this.prisma.tipoAlerta.delete({
            where: { id }
        });
    }

    private mapToTipoAlertaDto(tipoAlerta: TipoAlerta): TipoAlertaDto {
        return {
            id: tipoAlerta.id,
            tipo: tipoAlerta.tipo,
            publica: tipoAlerta.publica,
            condicao: tipoAlerta.condicao,
            valor: tipoAlerta.valor,
            criadoEm: tipoAlerta.criadoEm,
            limite: typeof tipoAlerta.limite === 'object' && tipoAlerta.limite instanceof Decimal
                ? tipoAlerta.limite.toNumber()
                : Number(tipoAlerta.limite),
            nivel: tipoAlerta.nivel,
            duracaoMin: tipoAlerta.duracaoMin || undefined
        };
    }
}