import { ApiProperty } from '@nestjs/swagger';
import { RegisteredAlertDto } from './alert.dto';
import { PaginationDto } from '../../shared/classes/pagination.dto';

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