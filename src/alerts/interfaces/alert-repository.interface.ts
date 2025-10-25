import type { RegisteredAlerts } from '@prisma/client';
import { CreateAlertDto } from '../dto/create-alert.dto';

export const ALERT_REPOSITORY_TOKEN = 'IAlertRepository';

export interface AlertFilters {
    level?: string;
    search?: string;
    is_active?: boolean;
    page: number;
    limit: number;
}

export interface AlertListResult {
    alerts: RegisteredAlerts[];
    total: number;
}

export interface IAlertRepository {
    findAll(filters: AlertFilters): Promise<AlertListResult>;
    findById(id: string): Promise<RegisteredAlerts | null>;
    findByMacAddress(filters: AlertFilters, macAddress: string): Promise<AlertListResult>;
    create(data: CreateAlertDto): Promise<RegisteredAlerts>;
    update(id: string): Promise<RegisteredAlerts>;
    delete(id: string): Promise<void>;
    exists(id: string): Promise<boolean>;
}