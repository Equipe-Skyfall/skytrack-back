import { Module } from '@nestjs/common';
import { StationsController } from './stations.controller';
import { StationsService } from './stations.service';
import { StationRepository } from './repositories/station.repository';
import { STATION_REPOSITORY_TOKEN } from './interfaces/station-repository.interface';

@Module({
  controllers: [StationsController],
  providers: [
    StationsService,
    {
      provide: STATION_REPOSITORY_TOKEN,
      useClass: StationRepository,
    },
  ],
})
export class StationsModule {}