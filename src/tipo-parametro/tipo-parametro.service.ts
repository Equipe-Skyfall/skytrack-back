import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { TipoParametro } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTipoParametroDto } from './dto/create-tipo-parametro.dto';
import { UpdateTipoParametroDto } from './dto/update-tipo-parametro.dto';
import { TipoParametroDto } from './dto/tipo-parametro.dto';

@Injectable()
export class TipoParametroService {
    constructor(private readonly prisma: PrismaService) {}

    async getAllTipoParametros(): Promise<TipoParametroDto[]> {
        const tipoParametros = await this.prisma.tipoParametro.findMany({
            orderBy: { nome: 'asc' }
        });
        return tipoParametros.map(this.mapToTipoParametroDto);
    }

    async getTipoParametroById(id: string): Promise<TipoParametroDto> {
        const tipoParametro = await this.prisma.tipoParametro.findUnique({
            where: { id }
        });

        if (!tipoParametro) {
            throw new NotFoundException(`TipoParametro with ID ${id} not found`);
        }

        return this.mapToTipoParametroDto(tipoParametro);
    }

    async createTipoParametro(createTipoParametroDto: CreateTipoParametroDto): Promise<TipoParametroDto> {
        try {
            const tipoParametro = await this.prisma.tipoParametro.create({
                data: createTipoParametroDto
            });
            return this.mapToTipoParametroDto(tipoParametro);
        } catch (error: any) {
            if (error.code === 'P2002') {
                throw new BadRequestException(`TipoParametro with jsonId '${createTipoParametroDto.jsonId}' already exists`);
            }
            throw error;
        }
    }

    async updateTipoParametro(id: string, updateTipoParametroDto: UpdateTipoParametroDto): Promise<TipoParametroDto> {
        const exists = await this.prisma.tipoParametro.findUnique({
            where: { id }
        });

        if (!exists) {
            throw new NotFoundException(`TipoParametro with ID ${id} not found`);
        }

        try {
            const tipoParametro = await this.prisma.tipoParametro.update({
                where: { id },
                data: updateTipoParametroDto
            });
            return this.mapToTipoParametroDto(tipoParametro);
        } catch (error: any) {
            if (error.code === 'P2002') {
                throw new BadRequestException(`TipoParametro with jsonId '${updateTipoParametroDto.jsonId}' already exists`);
            }
            throw error;
        }
    }

    async deleteTipoParametro(id: string): Promise<void> {
        const exists = await this.prisma.tipoParametro.findUnique({
            where: { id }
        });

        if (!exists) {
            throw new NotFoundException(`TipoParametro with ID ${id} not found`);
        }

        await this.prisma.tipoParametro.delete({
            where: { id }
        });
    }

    private mapToTipoParametroDto(tipoParametro: TipoParametro): TipoParametroDto {
        return {
            id: tipoParametro.id,
            jsonId: tipoParametro.jsonId,
            nome: tipoParametro.nome,
            metrica: tipoParametro.metrica,
            polinomio: tipoParametro.polinomio || undefined,
            coeficiente: tipoParametro.coeficiente,
            leitura: tipoParametro.leitura
        };
    }
}