import { Body, Controller, Delete, Get, HttpStatus, Param, ParseUUIDPipe, Post, Put, Query } from "@nestjs/common";
import { AlertsService } from "./alert.service";
import { RegisteredAlertsListDto } from "./dto/alerts-list.dto";
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { RegisteredAlertDto } from "./dto/alert.dto";
import { CreateAlertDto } from "./dto/create-alert.dto";
import { UpdateAlertDto } from "./dto/update-alert.dto";

@ApiTags('RegisteredAlerts')
@ApiBearerAuth('JWT-auth')
@Controller('alerts')
export class AlertsControllers {
    constructor(private readonly alertsService: AlertsService) {}

    @Get()
    @ApiOperation({summary: 'Get all alerts'})
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
        name: 'level',
        required: false,
        type: String,
        description: 'Filter by alert level',
        example: 'warning',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of alerts',
        type: RegisteredAlertsListDto,
    })
    async getAllAlerts(
        @Query('page') page = 1,
        @Query('limit') limit = 10,
        @Query('level') level?: string,
    ): Promise<RegisteredAlertsListDto> {
        return this.alertsService.getAllAlerts(
            Number(page),
            Number(limit),
            level,
        )
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get alert by ID' })
    @ApiParam({
        name: 'id',
        type: 'string',
        format: 'uuid',
        description: 'Alert ID',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Alert details',
        type: RegisteredAlertDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Alert not found',
    })
    async getAlertById(
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<RegisteredAlertDto> {
        return this.alertsService.getAlertById(id);
    }

    @Get('mac/:macAddress')
    @ApiOperation({summary: 'Get all alerts from MAC address'})
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
    @ApiParam({
        name: 'macAddress',
        type: 'string',
        description: `Station's MAC address`,
    })
    @ApiQuery({
        name: 'level',
        required: false,
        type: String,
        description: 'Filter by alert level',
        example: 'warning',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of alerts from MAC address',
        type: RegisteredAlertsListDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'MAC address invalid or non-existent',
    })
    async getAlertsByMacAddress(
        @Param('macAddress') macAddress: string,
        @Query('page') page = 1,
        @Query('limit') limit = 10,
        @Query('level') level?: string,
    ): Promise<RegisteredAlertsListDto> {
        return this.alertsService.getAlertsByMacAddress(page, limit, macAddress, level);
    }

    @Post()
    @ApiOperation({ summary: 'Create new alert' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Alert created successfully',
        type: RegisteredAlertDto,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation error',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'MAC address invalid or non-existent',
    })
    async createAlert(@Body() createAlertDto: CreateAlertDto): Promise<RegisteredAlertDto> {
        return this.alertsService.createAlert(createAlertDto)
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update alert' })
    @ApiParam({
        name: 'id',
        type: 'string',
        format: 'uuid',
        description: 'Alert ID',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Alert updated successfully',
        type: RegisteredAlertDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Alert not found',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation error',
    })
    async updateAlert(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateAlertDto: UpdateAlertDto,
    ): Promise<RegisteredAlertDto> {
        (updateAlertDto as any).id = id;
        return this.alertsService.updateAlert(id, updateAlertDto)
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete alert' })
    @ApiParam({
        name: 'id',
        type: 'string',
        format: 'uuid',
        description: 'Alert ID',
    })
    @ApiResponse({
        status: HttpStatus.NO_CONTENT,
        description: 'Alert deleted successfully',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Alert not found',
    })
    async deleteAlert(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
        return this.alertsService.deleteAlert(id);
    }
}