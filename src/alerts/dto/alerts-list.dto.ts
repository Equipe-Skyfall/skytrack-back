import { ApiProperty } from '@nestjs/swagger';
import { RegisteredAlertDto } from './alert.dto';

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

export class RegisteredAlertsListDto {
  @ApiProperty({
    description: 'List of registered alerts',
    type: [RegisteredAlertDto],
  })
  data: RegisteredAlertDto[];

  @ApiProperty({
    description: 'Pagination information',
    type: PaginationDto,
  })
  pagination: PaginationDto;
}