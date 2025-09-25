import { ApiProperty } from '@nestjs/swagger';
import { StationDto } from './station.dto';
import { PaginationDto } from '../../shared/classes/pagination.dto';

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