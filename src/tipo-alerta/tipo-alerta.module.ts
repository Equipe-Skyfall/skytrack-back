import { Module } from '@nestjs/common';
import { TipoAlertaController } from './tipo-alerta.controller';
import { TipoAlertaService } from './tipo-alerta.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TipoAlertaController],
  providers: [TipoAlertaService],
  exports: [TipoAlertaService],
})
export class TipoAlertaModule {}