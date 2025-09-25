import { ApiProperty } from "@nestjs/swagger";
import { ParameterDto } from "./parameter.dto";
import { PaginationDto } from "../../shared/classes/pagination.dto";

export class ParametersListDto {
    @ApiProperty({
        description: 'List of registered parameters',
        type: [ParameterDto],
    })
    data: ParameterDto[];

    @ApiProperty({
        description: 'Pagination information',
        type: PaginationDto,
    })
    pagination: PaginationDto;
}