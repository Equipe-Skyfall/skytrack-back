import { ApiProperty } from '@nestjs/swagger';
import { StationDto } from './station.dto';

class PaginationDto {
  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Items per page',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of items',
    example: 25,
  })
  total: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 3,
  })
  totalPages: number;
}

export class StationsListDto {
  @ApiProperty({
    description: 'List of stations',
    type: [StationDto],
  })
  data: StationDto[];

  @ApiProperty({
    description: 'Pagination information',
    type: PaginationDto,
  })
  pagination: PaginationDto;
}