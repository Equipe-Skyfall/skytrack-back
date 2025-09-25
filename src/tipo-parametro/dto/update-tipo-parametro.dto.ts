import { PartialType } from '@nestjs/swagger';
import { CreateTipoParametroDto } from './create-tipo-parametro.dto';

export class UpdateTipoParametroDto extends PartialType(CreateTipoParametroDto) {}