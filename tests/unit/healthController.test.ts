import { Request, Response } from 'express';
import { getHealth } from '../../src/controllers/healthController';

describe('Health Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('getHealth', () => {
    it('should return health status with 200 status code', () => {
      getHealth(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'OK',
          timestamp: expect.any(String),
          uptime: expect.any(Number),
          version: '1.0.0',
        })
      );
    });

    it('should return valid ISO timestamp', () => {
      getHealth(mockRequest as Request, mockResponse as Response);

      const callArgs = (mockResponse.json as jest.Mock).mock.calls[0][0];
      const timestamp = callArgs.timestamp;
      
      expect(() => new Date(timestamp)).not.toThrow();
      expect(new Date(timestamp).toISOString()).toBe(timestamp);
    });
  });
});