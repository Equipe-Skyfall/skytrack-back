import { PartialType } from '@nestjs/swagger';
import { CreateTipoAlertaDto } from './create-tipo-alerta.dto';

export class UpdateTipoAlertaDto extends PartialType(CreateTipoAlertaDto) {}