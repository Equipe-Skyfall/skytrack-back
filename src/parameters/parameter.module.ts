import { Module } from "@nestjs/common";
import { ParametersController } from "./parameter.controller";
import { ParametersService } from "./parameter.service";
import { ParameterRepository } from "./repositories/parameter.repository";
import { StationRepository } from "../stations/repositories/station.repository";
import { PARAMETER_REPOSITORY_TOKEN } from "./interfaces/parameter-repository.interface";
import { STATION_REPOSITORY_TOKEN } from "../stations/interfaces/station-repository.interface";

@Module({
    controllers: [ParametersController],
    providers: [
        ParametersService,

        {
            provide: PARAMETER_REPOSITORY_TOKEN,
            useClass: ParameterRepository,
        },
        {
            provide: STATION_REPOSITORY_TOKEN,
            useClass: StationRepository,
        },
    ]
})
export class ParameterModule {}