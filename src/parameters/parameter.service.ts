import { BadRequestException, ConflictException, Inject, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { IParameterRepository, PARAMETER_REPOSITORY_TOKEN } from "./interfaces/parameter-repository.interface";
import { ParametersListDto } from "./dto/parameters-list.dto";
import { Parameter, Prisma } from "@prisma/client";
import { ParameterDto } from "./dto/parameter.dto";
import { ReadingCalibrationDto } from "./dto/reading-calibration.dto";
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
        const macAddress = createParameterDto.stationId;
        const validMAC = await this.stationRepository.existsByMAC(macAddress)
        if (!validMAC) {
            throw new NotFoundException(`Station with MAC ${macAddress} not found`);
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
                            `Parameter with name "${createParameterDto.name}" already exists for station ${createParameterDto.stationId}`,
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
        try {
            const parameter = await this.parameterRepository.update(id, updateParameterDto);
            return this.mapToParameterDto(parameter);
        } catch (error: any) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                switch (error.code) {
                    case 'P2002':
                        throw new ConflictException(
                            `Parameter with name "${updateParameterDto.name}" already exists for this station`,
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
            name: parameter.name,
            metric: parameter.metric,
            calibration: (parameter.calibration ?? {}) as unknown as Record<string, ReadingCalibrationDto>,
            polynomial: parameter.polynomial ?? undefined,
            coefficients: parameter.coefficients ?? undefined,
        }
    }
}