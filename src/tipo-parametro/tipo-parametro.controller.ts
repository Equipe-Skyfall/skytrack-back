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
} from '@nestjs/swagger';
import { TipoParametroService } from './tipo-parametro.service';
import { CreateTipoParametroDto } from './dto/create-tipo-parametro.dto';
import { UpdateTipoParametroDto } from './dto/update-tipo-parametro.dto';
import { TipoParametroDto } from './dto/tipo-parametro.dto';

@ApiTags('Tipo Parametro')
@Controller('tipo-parametro')
export class TipoParametroController {
  constructor(private readonly tipoParametroService: TipoParametroService) {}

  @Get()
  @ApiOperation({ summary: 'Get all parameter types' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of parameter types',
    type: [TipoParametroDto],
  })
  async getAllTipoParametros(): Promise<TipoParametroDto[]> {
    return this.tipoParametroService.getAllTipoParametros();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get parameter type by ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Parameter type ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Parameter type details',
    type: TipoParametroDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Parameter type not found',
  })
  async getTipoParametroById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TipoParametroDto> {
    return this.tipoParametroService.getTipoParametroById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new parameter type' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Parameter type created successfully',
    type: TipoParametroDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
  })
  async createTipoParametro(
    @Body() createTipoParametroDto: CreateTipoParametroDto,
  ): Promise<TipoParametroDto> {
    return this.tipoParametroService.createTipoParametro(createTipoParametroDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update parameter type' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Parameter type ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Parameter type updated successfully',
    type: TipoParametroDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Parameter type not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
  })
  async updateTipoParametro(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTipoParametroDto: UpdateTipoParametroDto,
  ): Promise<TipoParametroDto> {
    return this.tipoParametroService.updateTipoParametro(id, updateTipoParametroDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete parameter type' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Parameter type ID',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Parameter type deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Parameter type not found',
  })
  async deleteTipoParametro(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.tipoParametroService.deleteTipoParametro(id);
  }
}