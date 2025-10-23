import { Module } from "@nestjs/common";
import { SensorReadingsController } from "./sensor-readings.controller";
import { SensorReadingsService } from "./sensor-readings.service";
import { SensorReadingsRepository } from "./repositories/sensor-readings.repository";
import { SENSOR_READINGS_REPOSITORY_TOKEN } from "./interfaces/sensor-readings-repository.interface";

@Module({
    controllers: [SensorReadingsController],
    providers: [
        SensorReadingsService,
        {
            provide: SENSOR_READINGS_REPOSITORY_TOKEN,
            useClass: SensorReadingsRepository,
        },
    ]
})
export class SensorReadingsModule {}