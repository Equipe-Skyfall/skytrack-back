import { BadRequestException, ConflictException, Inject, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { IParameterRepository, PARAMETER_REPOSITORY_TOKEN } from "./interfaces/parameter-repository.interface";
import { ParametersListDto } from "./dto/parameters-list.dto";
import { Parameter, Prisma } from "@prisma/client";
import { ParameterDto } from "./dto/parameter.dto";
import { IStationRepository, STATION_REPOSITORY_TOKEN } from "../stations/interfaces/station-repository.interface";
import { CreateParameterDto } from "./dto/create-parameter.dto";
import { UpdateParameterDto } from "./dto/update-parameter.dto";

@Injectable()
export class ParametersService {
    constructor(
        @Inject(PARAMETER_REPOSITORY_TOKEN)
        private readonly parameterRepository: IParameterRepository,

        @Inject(STATION_REPOSITORY_TOKEN)
        private readonly stationRepository: IStationRepository,
    ) {}

    async getAllParameters(
        page: number,
        limit: number,
        name?: string,
    ): Promise<ParametersListDto> {
        const result = await this.parameterRepository.findAll({page, limit, name});
        const totalPages = Math.ceil(result.total/limit);

        return {
            data: result.parameters.map(this.mapToParameterDto),
            pagination: {
                page,
                limit,
                total: result.total,
                totalPages,
            }
        }
    }

    async getParameterById(id: string): Promise<ParameterDto> {
        const parameter = await this.parameterRepository.findById(id);

        if (!parameter) {
            throw new NotFoundException(`Parameter with ID ${id} not found`);
        }

        return this.mapToParameterDto(parameter);
    }

    async getParametersByStationId(
        page: number,
        limit: number,
        stationId: string,
        name?: string,
    ): Promise<ParametersListDto> {
        const stationExists = await this.stationRepository.exists(stationId)
        if (!stationExists) {
            throw new NotFoundException(`Station with ID ${stationId} not found`);
        }

        const result = await this.parameterRepository.findByStationId({page, limit, name}, stationId)
        const totalPages = Math.ceil(result.total/limit);

        return {
            data: result.parameters.map(this.mapToParameterDto),
            pagination: {
                page,
                limit,
                total: result.total,
                totalPages,
            }
        }
    }

    async getParametersByMacAddress(
        page: number,
        limit: number,
        macAddress: string,
        name?: string,
    ): Promise<ParametersListDto> {
        const validMAC = await this.stationRepository.existsByMAC(macAddress)
        if (!validMAC) {
            throw new NotFoundException(`Station with MAC ${macAddress} not found`);
        }

        const result = await this.parameterRepository.findByMacAddress({page, limit, name}, macAddress)
        const totalPages = Math.ceil(result.total/limit);

        return {
            data: result.parameters.map(this.mapToParameterDto),
            pagination: {
                page,
                limit,
                total: result.total,
                totalPages,
            }
        }
    }

    async createParameter(createParameterDto: CreateParameterDto): Promise<ParameterDto> {
        const stationId = createParameterDto.stationId;
        const stationExists = await this.stationRepository.exists(stationId)
        if (!stationExists) {
            throw new NotFoundException(`Station with ID ${stationId} not found`);
        }

        // Check if TipoParametro exists
        const tipoParametroExists = await this.parameterRepository.tipoParametroExists(createParameterDto.tipoParametroId);
        if (!tipoParametroExists) {
            throw new NotFoundException(`TipoParametro with ID ${createParameterDto.tipoParametroId} not found`);
        }

        // Check if tipoAlertaId exists (if provided)
        if (createParameterDto.tipoAlertaId) {
            const tipoAlertaExists = await this.parameterRepository.tipoAlertaExists(createParameterDto.tipoAlertaId);
            if (!tipoAlertaExists) {
                throw new NotFoundException(`TipoAlerta with ID ${createParameterDto.tipoAlertaId} not found`);
            }
        }

        try {
            const parameter = await this.parameterRepository.create(createParameterDto);
            return this.mapToParameterDto(parameter);
        } catch (error: any) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                switch (error.code) {
                    case 'P2003':
                        throw new NotFoundException(
                            `Station with MAC ${createParameterDto.stationId} not found`,
                        );

                    case 'P2002':
                        throw new ConflictException(
                            `Parameter relationship already exists for station ${createParameterDto.stationId} and parameter type ${createParameterDto.tipoParametroId}`,
                        );

                    default:
                        throw new BadRequestException(`Failed to create parameter: ${error.message}`);
                }
            }
            throw new InternalServerErrorException('Unexpected error creating parameter');
        }
    }

    async updateParameter(
        id: string,
        updateParameterDto: UpdateParameterDto,
    ): Promise<ParameterDto> {
        // Check if tipoAlertaId exists (if provided)
        if (updateParameterDto.tipoAlertaId) {
            const tipoAlertaExists = await this.parameterRepository.tipoAlertaExists(updateParameterDto.tipoAlertaId);
            if (!tipoAlertaExists) {
                throw new NotFoundException(`TipoAlerta with ID ${updateParameterDto.tipoAlertaId} not found`);
            }
        }

        try {
            const parameter = await this.parameterRepository.update(id, updateParameterDto);
            return this.mapToParameterDto(parameter);
        } catch (error: any) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                switch (error.code) {
                    case 'P2002':
                        throw new ConflictException(
                            `Parameter relationship constraint violation during update`,
                        );

                    default:
                        throw new BadRequestException(`Failed to update parameter: ${error.message}`);
                }
            }
            throw new InternalServerErrorException('Unexpected error updating parameter');
        }
    }

    async deleteParameter(id: string): Promise<void> {
        const exists = await this.parameterRepository.exists(id);
        if (!exists) {
            throw new NotFoundException(`Parameter with ID ${id} not found`);
        }

        await this.parameterRepository.delete(id);
    }

    private mapToParameterDto(parameter: Parameter): ParameterDto {
        return {
            id: parameter.id,
            stationId: parameter.stationId,
            tipoParametroId: parameter.tipoParametroId,
            tipoAlertaId: parameter.tipoAlertaId ?? undefined,
        }
    }
}