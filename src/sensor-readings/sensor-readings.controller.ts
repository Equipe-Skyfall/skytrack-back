import {
  Controller,
  Get,
  Param,
  Query,
  ParseUUIDPipe,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Public } from '../auth/public.decorator';
import { SensorReadingsService } from './sensor-readings.service';
import { SensorReadingsListDto } from './dto/sensor-readings-list.dto';
import { SensorReadingDto } from './dto/sensor-reading.dto';

@ApiTags('Sensor Readings')
@ApiBearerAuth('JWT-auth')
@Controller('sensor-readings')
export class SensorReadingsController {
  constructor(private readonly sensorReadingsService: SensorReadingsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all sensor readings' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'date',
    required: false,
    type: String,
    description: 'Filter by single date (ISO string)',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date for date range filter (ISO string)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date for date range filter (ISO string)',
  })
  @ApiQuery({
    name: 'stationId',
    required: false,
    type: String,
    description: 'Filter by station ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of sensor readings',
    type: SensorReadingsListDto,
  })
  async getAllReadings(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('date') date?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('stationId') stationId?: string,
  ): Promise<SensorReadingsListDto> {
    const parsedDate = date ? new Date(date) : undefined;
    const dateRange =
      startDate && endDate ? [new Date(startDate), new Date(endDate)] as [Date, Date] : undefined;

    return this.sensorReadingsService.getAllReadings(
      Number(page),
      Number(limit),
      dateRange,
      parsedDate,
      stationId,
    );
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a sensor reading by ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Sensor reading ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sensor reading details',
    type: SensorReadingDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Sensor reading not found',
  })
  async getReadingById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SensorReadingDto> {
    return this.sensorReadingsService.getReadingById(id);
  }
}