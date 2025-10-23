import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { StationsModule } from './stations/stations.module';
import { MigrationModule } from './migration/migration.module';
import { AppController } from './app.controller';
import { AlertsModule } from './alerts/alerts.module';
import { ParameterModule } from './parameters/parameter.module';
import { TipoParametroModule } from './tipo-parametro/tipo-parametro.module';
import { TipoAlertaModule } from './tipo-alerta/tipo-alerta.module';
import { AuthModule } from './auth/auth.module';
import { SensorReadingsModule } from './sensor-readings/sensor-readings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `.env.${process.env.NODE_ENV || 'development'}`,
        '.env.local',
        '.env',
      ],
    }),
    AuthModule,
    PrismaModule,
    HealthModule,
    StationsModule,
    MigrationModule,
    AlertsModule,
    ParameterModule,
    TipoParametroModule,
    TipoAlertaModule,
    SensorReadingsModule
  ],
  controllers: [AppController],
})
export class AppModule {}