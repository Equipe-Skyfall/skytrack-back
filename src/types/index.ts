export interface HealthCheckResponse {
  status: 'OK';
  timestamp: string;
  uptime: number;
  version: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}