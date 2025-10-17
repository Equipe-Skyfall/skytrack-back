import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TipoAlertaService } from './tipo-alerta.service';
import { CreateTipoAlertaDto } from './dto/create-tipo-alerta.dto';
import { UpdateTipoAlertaDto } from './dto/update-tipo-alerta.dto';
import { TipoAlertaDto } from './dto/tipo-alerta.dto';

@ApiTags('Tipo Alerta')
@ApiBearerAuth('JWT-auth')
@Controller('tipo-alerta')
export class TipoAlertaController {
  constructor(private readonly tipoAlertaService: TipoAlertaService) {}

  @Get()
  @ApiOperation({ summary: 'Get all alert types (templates)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of alert types',
    type: [TipoAlertaDto],
  })
  async getAllTipoAlertas(): Promise<TipoAlertaDto[]> {
    return this.tipoAlertaService.getAllTipoAlertas();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get alert type by ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Alert type ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Alert type details',
    type: TipoAlertaDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Alert type not found',
  })
  async getTipoAlertaById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TipoAlertaDto> {
    return this.tipoAlertaService.getTipoAlertaById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new alert type (template)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Alert type created successfully',
    type: TipoAlertaDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
  })
  async createTipoAlerta(
    @Body() createTipoAlertaDto: CreateTipoAlertaDto,
  ): Promise<TipoAlertaDto> {
    return this.tipoAlertaService.createTipoAlerta(createTipoAlertaDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update alert type' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Alert type ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Alert type updated successfully',
    type: TipoAlertaDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Alert type not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
  })
  async updateTipoAlerta(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTipoAlertaDto: UpdateTipoAlertaDto,
  ): Promise<TipoAlertaDto> {
    return this.tipoAlertaService.updateTipoAlerta(id, updateTipoAlertaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete alert type' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Alert type ID',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Alert type deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Alert type not found',
  })
  async deleteTipoAlerta(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.tipoAlertaService.deleteTipoAlerta(id);
  }
}