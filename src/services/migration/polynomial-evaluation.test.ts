import { MigrationService } from './migrationService';
import { PrismaClient } from '@prisma/client';
import { MongoDataService } from './mongoDataService';

describe('MigrationService - Polynomial Evaluation', () => {
  let migrationService: MigrationService;
  let mockPrisma: any;
  let mockMongoService: any;

  beforeEach(() => {
    mockPrisma = {
      parameter: {
        findMany: jest.fn()
      }
    };

    mockMongoService = {};

    migrationService = new MigrationService(
      mockPrisma as PrismaClient,
      mockMongoService as MongoDataService
    );
  });

  describe('processParameterValues', () => {
    it('should correctly process single sensor parameter with polynomial', () => {
      const parameters = [{
        id: 'param1',
        tipoParametro: {
          nome: 'Temperature',
          leitura: { temperatura: { offset: 0, factor: 1.0 } },
          polinomio: 'a0 + a1*temperatura',
          coeficiente: [1, 0.95]
        }
      }];

      const readings = { temperatura: 22.3 };

      const result = (migrationService as any).processParameterValues(parameters, readings);

      // Expected: (22.3 + 0) * 1.0 = 22.3, then 1 + 0.95*22.3 = 22.185
      expect(result).toEqual({
        parameterValues: {
          'Temperature': 22.185
        },
        calibratedReadings: {
          'temperatura': 22.3  // Same as raw since offset=0, factor=1.0
        }
      });
    });

    it('should correctly process multi-sensor parameter with polynomial', () => {
      const parameters = [{
        id: 'param1',
        tipoParametro: {
          nome: 'Multi Sensor',
          leitura: {
            temperatura: { offset: 0, factor: 1.0 },
            umidade: { offset: -2, factor: 1.05 }
          },
          polinomio: 'a0 + a1*temperatura + a2*umidade',
          coeficiente: [1, 0.95, 0.8]
        }
      }];

      const readings = { temperatura: 22.3, umidade: 72 };

      const result = (migrationService as any).processParameterValues(parameters, readings);

      // Expected calibrated values:
      // temperatura: (22.3 + 0) * 1.0 = 22.3
      // umidade: (72 + (-2)) * 1.05 = 70 * 1.05 = 73.5
      // Polynomial: 1 + 0.95*22.3 + 0.8*73.5 = 1 + 21.185 + 58.8 = 80.985
      expect(result).toEqual({
        parameterValues: {
          'Multi Sensor': 80.985
        },
        calibratedReadings: {
          'temperatura': 22.3,
          'umidade': 73.5
        }
      });
    });

    it('should handle parameter without polynomial (calibration only)', () => {
      const parameters = [{
        id: 'param1',
        tipoParametro: {
          nome: 'Simple Temperature',
          leitura: { temperatura: { offset: -2, factor: 1.1 } },
          polinomio: null,
          coeficiente: []
        }
      }];

      const readings = { temperatura: 20 };

      const result = (migrationService as any).processParameterValues(parameters, readings);

      // Expected: (20 + (-2)) * 1.1 = 18 * 1.1 = 19.8
      expect(result).toEqual({
        parameterValues: {
          'Simple Temperature': 19.8
        },
        calibratedReadings: {
          'temperatura': 19.8
        }
      });
    });

    it('should handle missing sensor readings gracefully', () => {
      const parameters = [{
        id: 'param1',
        tipoParametro: {
          nome: 'Missing Sensor',
          leitura: {
            temperatura: { offset: 0, factor: 1.0 },
            pressure: { offset: 0, factor: 1.0 }
          },
          polinomio: 'a0 + a1*temperatura',
          coeficiente: [1, 0.95]
        }
      }];

      const readings = { temperatura: 25 }; // missing pressure

      const result = (migrationService as any).processParameterValues(parameters, readings);

      // Should still process temperatura even though pressure is missing
      expect(result).toEqual({
        parameterValues: {
          'Missing Sensor': 24.75 // 1 + 0.95*25
        },
        calibratedReadings: {
          'temperatura': 25
        }
      });
    });

    it('should handle case-insensitive sensor key matching', () => {
      const parameters = [{
        id: 'param1',
        tipoParametro: {
          nome: 'Case Test',
          leitura: { temperatura: { offset: 0, factor: 1.0 } },
          polinomio: 'a0 + a1*temperatura',
          coeficiente: [0, 1]
        }
      }];

      const readings = { TEMPERATURA: 30 }; // uppercase

      const result = (migrationService as any).processParameterValues(parameters, readings);

      // Should match temperatura with TEMPERATURA through case-insensitive comparison
      expect(result).toEqual({
        parameterValues: {
          'Case Test': 30
        },
        calibratedReadings: {
          'TEMPERATURA': 30
        }
      });
    });

    it('should handle polynomial evaluation errors gracefully', () => {
      const parameters = [{
        id: 'param1',
        tipoParametro: {
          nome: 'Bad Polynomial',
          leitura: { temperatura: { offset: 0, factor: 1.0 } },
          polinomio: 'invalid_math_expression',
          coeficiente: [1, 0.5]
        }
      }];

      const readings = { temperatura: 25 };

      const result = (migrationService as any).processParameterValues(parameters, readings);

      // Should fall back to calibrated value when polynomial fails
      expect(result).toEqual({
        parameterValues: {
          'Bad Polynomial': 25 // Just the calibrated value
        },
        calibratedReadings: {
          'temperatura': 25
        }
      });
    });

    it('should process multiple parameters for the same station', () => {
      const parameters = [
        {
          id: 'temp_param',
          tipoParametro: {
            nome: 'Temperature',
            leitura: { temperatura: { offset: 0, factor: 1.0 } },
            polinomio: 'a0 + a1*temperatura',
            coeficiente: [0, 1]
          }
        },
        {
          id: 'humid_param',
          tipoParametro: {
            nome: 'Humidity',
            leitura: { umidade: { offset: -5, factor: 1.1 } },
            polinomio: 'a0 + a1*umidade',
            coeficiente: [10, 0.8]
          }
        }
      ];

      const readings = { temperatura: 25, umidade: 60 };

      const result = (migrationService as any).processParameterValues(parameters, readings);

      expect(result).toEqual({
        parameterValues: {
          'Temperature': 25, // 0 + 1*25
          'Humidity': expect.closeTo(58.4, 5)  // 10 + 0.8*((60-5)*1.1) = 10 + 0.8*60.5 = 10 + 48.4
        },
        calibratedReadings: {
          'temperatura': 25,
          'umidade': expect.closeTo(60.5, 5)  // (60-5)*1.1
        }
      });
    });

    it('should handle complex polynomial with multiple variables', () => {
      const parameters = [{
        id: 'complex_param',
        tipoParametro: {
          nome: 'Heat Index',
          leitura: {
            temperatura: { offset: 0, factor: 1.0 },
            umidade: { offset: 0, factor: 1.0 },
            pressure: { offset: 0, factor: 0.01 }
          },
          polinomio: 'a0 + a1*temperatura + a2*umidade + a3*pressure + a4*temperatura*umidade',
          coeficiente: [5, 1.2, 0.8, 0.1, 0.05]
        }
      }];

      const readings = { temperatura: 30, umidade: 70, pressure: 1013 };

      const result = (migrationService as any).processParameterValues(parameters, readings);

      // Complex calculation:
      // calibrated pressure: 1013 * 0.01 = 10.13
      // polynomial: 5 + 1.2*30 + 0.8*70 + 0.1*10.13 + 0.05*30*70
      // = 5 + 36 + 56 + 1.013 + 105 = 203.013
      expect(result).toEqual({
        parameterValues: {
          'Heat Index': 203.013
        },
        calibratedReadings: {
          'temperatura': 30,
          'umidade': 70,
          'pressure': 10.13
        }
      });
    });

    it('should handle empty parameters array', () => {
      const parameters: any[] = [];
      const readings = { temperatura: 25, umidade: 60 };

      const result = (migrationService as any).processParameterValues(parameters, readings);

      expect(result).toEqual({
        parameterValues: {},
        calibratedReadings: {}
      });
    });

    it('should handle empty readings object', () => {
      const parameters = [{
        id: 'param1',
        tipoParametro: {
          nome: 'Temperature',
          leitura: { temperatura: { offset: 0, factor: 1.0 } },
          polinomio: 'a0 + a1*temperatura',
          coeficiente: [1, 0.95]
        }
      }];

      const readings = {};

      const result = (migrationService as any).processParameterValues(parameters, readings);

      expect(result).toEqual({
        parameterValues: {},
        calibratedReadings: {}
      });
    });
  });
});