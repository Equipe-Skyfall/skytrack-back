import { Module } from "@nestjs/common";
import { AlertsControllers } from "./alert.controller";
import { AlertsService } from "./alert.service";
import { AlertRepository } from "./repositories/alert.repository";
import { StationRepository } from "../stations/repositories/station.repository";

@Module({
    controllers: [AlertsControllers],
    providers: [
        AlertsService,
        AlertRepository,

        StationRepository,
    ]
})
export class AlertsModule {}