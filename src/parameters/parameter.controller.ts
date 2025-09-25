import { 
  Body, Controller, Delete, Get, HttpStatus, Param, ParseUUIDPipe, Post, Put, Query 
} from "@nestjs/common";
import { ParametersListDto } from "./dto/parameters-list.dto";
import { ParameterDto } from "./dto/parameter.dto";
import { CreateParameterDto } from "./dto/create-parameter.dto";
import { UpdateParameterDto } from "./dto/update-parameter.dto";
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ParametersService } from "./parameter.service";

@ApiTags('Parameters')
@Controller('parameters')
export class ParametersController {
    constructor(private readonly parametersService: ParametersService) {}

    @Get()
    @ApiOperation({ summary: 'Get all parameters' })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    @ApiQuery({ name: 'name', required: false, type: String, example: "Chuva" })
    @ApiResponse({ status: HttpStatus.OK, description: 'List of parameters', type: ParametersListDto })
    async getAllParameters(
        @Query('page') page = 1,
        @Query('limit') limit = 10,
        @Query('name') name?: string
    ): Promise<ParametersListDto> {
        return this.parametersService.getAllParameters(Number(page), Number(limit), name);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get parameter by ID' })
    @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Parameter ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Parameter details', type: ParameterDto })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Parameter not found' })
    async getParameterById(
        @Param('id', ParseUUIDPipe) id: string
    ): Promise<ParameterDto> {
        return this.parametersService.getParameterById(id);
    }

    @Get('mac/:macAddress')
    @ApiOperation({ summary: 'Get all parameters for a station MAC address' })
    @ApiParam({ name: 'macAddress', type: 'string', description: `Station's MAC address` })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    @ApiQuery({ name: 'name', required: false, type: String, example: "Chuva" })
    @ApiResponse({ status: HttpStatus.OK, description: 'List of parameters', type: ParametersListDto })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Station not found' })
    async getParametersByMacAddress(
        @Param('macAddress') macAddress: string,
        @Query('page') page = 1,
        @Query('limit') limit = 10,
        @Query('name') name?: string
    ): Promise<ParametersListDto> {
        return this.parametersService.getParametersByMacAddress(Number(page), Number(limit), macAddress, name);
    }

    @Get('station/:stationId')
    @ApiOperation({ summary: 'Get all parameters for a station UUID' })
    @ApiParam({ name: 'stationId', type: 'string', description: `Station's UUID` })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    @ApiQuery({ name: 'name', required: false, type: String, example: "Chuva" })
    @ApiResponse({ status: HttpStatus.OK, description: 'List of parameters', type: ParametersListDto })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Station not found' })
    async getParametersByStationId(
        @Param('stationId', ParseUUIDPipe) stationId: string,
        @Query('page') page = 1,
        @Query('limit') limit = 10,
        @Query('name') name?: string
    ): Promise<ParametersListDto> {
        return this.parametersService.getParametersByStationId(Number(page), Number(limit), stationId, name);
    }

    @Post()
    @ApiOperation({ summary: 'Create a new parameter' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Parameter created', type: ParameterDto })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Validation error' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Station MAC not found' })
    async createParameter(@Body() createParameterDto: CreateParameterDto): Promise<ParameterDto> {
        return this.parametersService.createParameter(createParameterDto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a parameter' })
    @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Parameter ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Parameter updated', type: ParameterDto })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Parameter not found' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Validation error' })
    async updateParameter(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateParameterDto: UpdateParameterDto
    ): Promise<ParameterDto> {
        return this.parametersService.updateParameter(id, updateParameterDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a parameter' })
    @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Parameter ID' })
    @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Parameter deleted successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Parameter not found' })
    async deleteParameter(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
        return this.parametersService.deleteParameter(id);
    }
}