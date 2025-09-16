import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from '../../src/health/health.controller';
import { HealthService } from '../../src/health/health.service';

describe('HealthController', () => {
  let controller: HealthController;
  let service: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [HealthService],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    service = module.get<HealthService>(HealthService);
  });

  describe('getHealth', () => {
    it('should return health status', () => {
      const result = controller.getHealth();

      expect(result).toEqual(
        expect.objectContaining({
          status: 'OK',
          timestamp: expect.any(String),
          uptime: expect.any(Number),
          version: '1.0.0',
        })
      );
    });

    it('should return valid ISO timestamp', () => {
      const result = controller.getHealth();
      const timestamp = result.timestamp;

      expect(() => new Date(timestamp)).not.toThrow();
      expect(new Date(timestamp).toISOString()).toBe(timestamp);
    });

    it('should call health service', () => {
      const serviceSpy = jest.spyOn(service, 'getHealth');
      controller.getHealth();

      expect(serviceSpy).toHaveBeenCalled();
    });
  });
});