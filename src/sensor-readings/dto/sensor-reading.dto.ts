import { ApiProperty } from '@nestjs/swagger';
import { RegisteredAlertDto } from '../../alerts/dto/alert.dto';
import { TipoParametroDto } from '../../tipo-parametro/dto/tipo-parametro.dto';

export class SensorReadingDto {
  @ApiProperty({
    description: 'Unique identifier for the sensor reading',
    format: 'uuid',
    example: 'a2d6a1b3-3f8e-4b8c-9b17-7b5b6c8e4b13',
  })
  id: string;

  @ApiProperty({
    description: 'Foreign key referencing the station this reading belongs to',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  stationId: string;

  @ApiProperty({
    description: 'Timestamp when the reading was taken',
    format: 'date-time',
    example: '2025-10-19T14:30:00Z',
  })
  timestamp: Date;

  @ApiProperty({
    description: 'Unique MongoDB identifier for this reading',
    example: '6713c68a2b33b8947c19aa31',
  })
  mongoId: string;

  @ApiProperty({
    description: 'Creation timestamp of the reading record',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp of the reading record',
    format: 'date-time',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'MAC address of the associated station, if available',
    example: '24:6F:28:AE:52:7C',
    nullable: true,
  })
  macEstacao: string | null;

  @ApiProperty({
    description: 'UUID of the associated station, if available',
    example: '550e8400-e29b-41d4-a716-446655440000',
    nullable: true,
  })
  uuidEstacao: string | null;

  @ApiProperty({
    description: 'Sensor measurement values (JSON object with dynamic structure)',
    example: {
      temperature: 26.4,
      humidity: 58.7,
      pressure: 1012.3,
    },
  })
  valor: Record<string, any>;

  @ApiProperty({
    description: 'Alerts associated with this reading',
    type: () => [RegisteredAlertDto],
    nullable: true,
  })
  alerts?: RegisteredAlertDto[];

  @ApiProperty({
    description: 'Parameters associated with this sensor reading',
    type: () => [TipoParametroDto],
    nullable: true,
  })
  parameters?: TipoParametroDto[];
}
