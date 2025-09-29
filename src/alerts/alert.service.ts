import { BadRequestException, ConflictException, Inject, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { ALERT_REPOSITORY_TOKEN, IAlertRepository } from "./interfaces/alert-repository.interface";
import { RegisteredAlertsListDto } from "./dto/alerts-list.dto";
import { Prisma } from "@prisma/client";
import { RegisteredAlertDto } from "./dto/alert.dto";
import { CreateAlertDto } from "./dto/create-alert.dto";
import { UpdateAlertDto } from "./dto/update-alert.dto";
import { IStationRepository, STATION_REPOSITORY_TOKEN } from "../stations/interfaces/station-repository.interface";

@Injectable()
export class AlertsService {
    constructor(
        @Inject(ALERT_REPOSITORY_TOKEN)
        private readonly alertRepository: IAlertRepository,

        @Inject(STATION_REPOSITORY_TOKEN)
        private readonly stationRepository: IStationRepository
    ) {}

    async getAllAlerts(
        page: number,
        limit: number,
        level?: string,
    ): Promise<RegisteredAlertsListDto> {
        const result = await this.alertRepository.findAll({page, limit, level});
        const totalPages = Math.ceil(result.total/limit);

        return {
            data: result.alerts.map(this.mapToAlertDto),
            pagination: {
                page,
                limit,
                total: result.total,
                totalPages,
            }
        };
    }

    async getAlertById(id: string): Promise<RegisteredAlertDto> {
        const alert = await this.alertRepository.findById(id);

        if (!alert) {
            throw new NotFoundException(`Alert with ID ${id} not found`);
        }

        return this.mapToAlertDto(alert);
    }

    async getAlertsByMacAddress(
        page: number,
        limit: number,
        macAddress: string,
        level?: string,
    ): Promise<RegisteredAlertsListDto> {
        const validMAC = await this.stationRepository.existsByMAC(macAddress)
        if (!validMAC) {
            throw new NotFoundException(`Station with MAC ${macAddress} not found`);
        }

        const result = await this.alertRepository.findByMacAddress({page, limit, level}, macAddress)
        const totalPages = Math.ceil(result.total/limit);

        return {
            data: result.alerts.map(this.mapToAlertDto),
            pagination: {
                page,
                limit,
                total: result.total,
                totalPages,
            }
        };
    }

    async createAlert(createAlertDto: CreateAlertDto): Promise<RegisteredAlertDto> {
        const validMAC = await this.stationRepository.existsByMAC(createAlertDto.stationId)
        if (!validMAC) {
            throw new NotFoundException(`Station with MAC ${createAlertDto.stationId} not found`);
        }

        try {
            const alert = await this.alertRepository.create(createAlertDto);
            return this.mapToAlertDto(alert);
        } catch (error: any) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                switch (error.code) {
                    case 'P2003':
                        throw new NotFoundException(
                            `Parameter with ID ${createAlertDto.parameterId} not found`,
                        );

                    case 'P2002':
                        throw new ConflictException(
                            `An alert for this station, parameter, and alert type already exists`,
                        );

                    default:
                        throw new BadRequestException(`Failed to create alert: ${error.message}`);
                }
            }
            throw new InternalServerErrorException('Unexpected error creating alert');
        }
    }

    async updateAlert(id: string, updateAlertDto: UpdateAlertDto): Promise<RegisteredAlertDto> {
        const exists = await this.alertRepository.exists(id);
        if (!exists) {
            throw new NotFoundException(`Alert with ID ${id} not found`);
        }

        try {
            const alert = await this.alertRepository.update(id, updateAlertDto);
            return this.mapToAlertDto(alert);
        } catch (error: any) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                const field = error.meta?.field_name as string | undefined;

                switch (error.code) {
                    case 'P2003':
                        if (field?.includes('parameterId')) {
                            throw new NotFoundException(
                                `Parameter with ID ${updateAlertDto.parameterId} not found`,
                            );
                        }
                        break;

                    case 'P2002':
                        throw new ConflictException(
                            `An alert for this station, parameter, and alert type already exists`,
                        );

                    default:
                        throw new BadRequestException(
                            `Failed to update alert: ${error.message}`,
                        );
                }
            }
            throw new InternalServerErrorException('Unexpected error updating alert');
        }
    }

    async deleteAlert(id: string): Promise<void> {
        const exists = await this.alertRepository.exists(id);
        if (!exists) {
            throw new NotFoundException(`Alert with ID ${id} not found`);
        }

        await this.alertRepository.delete(id);
    }

    private mapToAlertDto(alert: any): RegisteredAlertDto {
        return {
            id: alert.id,
            data: alert.data,
            stationId: alert.stationId,
            parameterId: alert.parameterId,
            tipoAlertaId: alert.tipoAlertaId,
            medidasId: alert.medidasId ?? undefined,
            createdAt: alert.createdAt,
        }
    }
}
