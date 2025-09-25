import { Module } from "@nestjs/common";
import { AlertsControllers } from "./alert.controller";
import { AlertsService } from "./alert.service";
import { AlertRepository } from "./repositories/alert.repository";
import { StationRepository } from "../stations/repositories/station.repository";
import { ALERT_REPOSITORY_TOKEN } from "./interfaces/alert-repository.interface";
import { STATION_REPOSITORY_TOKEN } from "../stations/interfaces/station-repository.interface";

@Module({
    controllers: [AlertsControllers],
    providers: [
        AlertsService,
        
    {
        provide: ALERT_REPOSITORY_TOKEN,
        useClass: AlertRepository,
    },
    {
        provide: STATION_REPOSITORY_TOKEN,
        useClass: StationRepository,
    },
    ]
})
export class AlertsModule {}