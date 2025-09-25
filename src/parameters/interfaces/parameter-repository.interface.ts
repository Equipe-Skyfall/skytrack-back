import { CreateParameterDto } from '../dto/create-parameter.dto';
import { UpdateParameterDto } from '../dto/update-parameter.dto';
import { Parameter } from '@prisma/client';

export const PARAMETER_REPOSITORY_TOKEN = 'IParameterRepository';

export interface ParameterFilters {
  page: number;
  limit: number;
  name?: string;
}

export interface ParameterListResult {
  parameters: Parameter[];
  total: number;
}

export interface IParameterRepository {
  findAll(filters: ParameterFilters): Promise<ParameterListResult>;
  findById(id: string): Promise<Parameter | null>;
  findByMacAddress(filters: ParameterFilters, macAddress: string): Promise<ParameterListResult>;
  create(data: CreateParameterDto): Promise<Parameter>;
  update(id: string, data: UpdateParameterDto): Promise<Parameter>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}
