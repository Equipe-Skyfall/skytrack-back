import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { StationsService } from './stations.service';
import { CreateStationDto, StationStatus } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';
import { StationDto } from './dto/station.dto';
import { StationsListDto } from './dto/stations-list.dto';

@ApiTags('Stations')
@Controller('stations')
export class StationsController {
  constructor(private readonly stationsService: StationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all stations' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
    example: 10,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: StationStatus,
    description: 'Filter by status',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of stations',
    type: StationsListDto,
  })
  async getAllStations(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: StationStatus,
  ): Promise<StationsListDto> {
    return this.stationsService.getAllStations(
      Number(page),
      Number(limit),
      status,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get station by ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Station ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Station details',
    type: StationDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Station not found',
  })
  async getStationById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StationDto> {
    return this.stationsService.getStationById(id);
  }

  @Get('mac/:macAddress')
  @ApiOperation({ summary: 'Get station by MAC address' })
  @ApiParam({
    name: 'macAddress',
    type: 'string',
    description: 'Station MAC address',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Station details',
    type: StationDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Station not found',
  })
  async getStationByMacAddress(
    @Param('macAddress') macAddress: string,
  ): Promise<StationDto> {
    return this.stationsService.getStationByMacAddress(macAddress);
  }

  @Post()
  @ApiOperation({ summary: 'Create new station' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Station created successfully',
    type: StationDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
  })
  async createStation(@Body() createStationDto: CreateStationDto): Promise<StationDto> {
    return this.stationsService.createStation(createStationDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update station' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Station ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Station updated successfully',
    type: StationDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Station not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
  })
  async updateStation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStationDto: UpdateStationDto,
  ): Promise<StationDto> {
    // Add the station ID to the DTO for validation context
    (updateStationDto as any).id = id;
    return this.stationsService.updateStation(id, updateStationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete station' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Station ID',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Station deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Station not found',
  })
  async deleteStation(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.stationsService.deleteStation(id);
  }
}