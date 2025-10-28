import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ISensorReadingsRepository, SENSOR_READINGS_REPOSITORY_TOKEN } from "./interfaces/sensor-readings-repository.interface";
import { SensorReadingsListDto } from "./dto/sensor-readings-list.dto";
import { TipoParametro } from "@prisma/client";
import { SensorReadingDto } from "./dto/sensor-reading.dto";
import { TipoParametroDto } from "../tipo-parametro/dto/tipo-parametro.dto";
import { RegisteredAlertDto } from "../alerts/dto/alert.dto";
import { SensorReadingWithRelations } from "./types/sensor-readings-with-relation.type";

@Injectable()
export class SensorReadingsService {
    constructor(
        @Inject(SENSOR_READINGS_REPOSITORY_TOKEN)
        private readonly readingsRepository: ISensorReadingsRepository
    ) {}

    async getAllReadings(
        page: number,
        limit: number,
        dateRange?: [Date, Date],
        date?: Date,
        stationId?: string,
    ): Promise<SensorReadingsListDto> {
        const result = await this.readingsRepository.findAll({page, limit, dateRange, date, stationId});
        const totalPages = Math.ceil(result.total / limit);

        return {
            data: result.readings.map(reading => this.mapToSensorReadingDto(reading)),
            pagination: {
                page,
                limit,
                total: result.total,
                totalPages,
            }
        }
    }

    async getReadingById(id: string): Promise<SensorReadingDto> {
        const reading = await this.readingsRepository.findById(id);

        if (!reading) {
            throw new NotFoundException(`Sensor reading with ID ${id} not found`);
        }

        return this.mapToSensorReadingDto(reading);
    }

    private mapToSensorReadingDto(reading: SensorReadingWithRelations): SensorReadingDto {
        return {
            id: reading.id,
            stationId: reading.stationId,
            timestamp: reading.timestamp,
            mongoId: reading.mongoId,
            createdAt: reading.createdAt,
            updatedAt: reading.updatedAt,
            macEstacao: reading.macEstacao,
            uuidEstacao: reading.uuidEstacao,
            valor: reading.valor as Record<string, any>,
            alerts: reading.alerts.map(alert => this.mapToAlertDto(alert)),
            parameters: reading.parameters.map(paramRel =>
                this.mapToTipoParametroDto(paramRel.parameter.tipoParametro)
            ),
        };
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

    private mapToAlertDto(alert: any): RegisteredAlertDto {
        return {
            id: alert.id,
            alert_name: alert.tipoAlerta.tipo,
            data: alert.data,
            stationId: alert.stationId,
            parameterId: alert.parameterId,
            tipoAlertaId: alert.tipoAlertaId,
            medidasId: alert.medidasId ?? undefined,
            createdAt: alert.createdAt,
            active: alert.active,
        }
    }
}