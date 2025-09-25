import { Module } from '@nestjs/common';
import { TipoParametroController } from './tipo-parametro.controller';
import { TipoParametroService } from './tipo-parametro.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TipoParametroController],
  providers: [TipoParametroService],
  exports: [TipoParametroService],
})
export class TipoParametroModule {}