import { ApiProperty } from "@nestjs/swagger";
import { PaginationDto } from "../../shared/classes/pagination.dto";
import { SensorReadingDto } from "./sensor-reading.dto";

export class SensorReadingsListDto {
    @ApiProperty({
        description: 'List of readings',
        type: [SensorReadingDto],
    })
    data: SensorReadingDto[];

    @ApiProperty({
        description: 'Pagination information',
        type: PaginationDto,
    })
    pagination: PaginationDto;
}