import { validate } from 'class-validator';
import { CreateTipoParametroDto } from '../dto/create-tipo-parametro.dto';

describe('Polynomial Validator', () => {
  it('should pass validation when polynomial variables match leitura keys', async () => {
    const dto = new CreateTipoParametroDto();
    dto.jsonId = 'test_sensor';
    dto.nome = 'Test';
    dto.metrica = '°C';
    dto.polinomio = 'a0 + a1*temperatura';
    dto.coeficiente = [1, 0.95];
    dto.leitura = {
      temperatura: { offset: 0, factor: 1 }
    };

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail validation when polynomial references missing calibration key', async () => {
    const dto = new CreateTipoParametroDto();
    dto.jsonId = 'test_sensor';
    dto.nome = 'Test';
    dto.metrica = '°C';
    dto.polinomio = 'a0 + a1*temperatura + umidade';  // References umidade but no calibration for it
    dto.coeficiente = [1, 0.95];
    dto.leitura = {
      temperatura: { offset: 0, factor: 1 }
      // Missing umidade calibration
    };

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0]?.property).toBe('polinomio');
    expect(errors[0]?.constraints?.isValidPolynomial).toContain('Polynomial contains variables not present in calibration: umidade');
  });

  it('should fail validation when coefficient count mismatch', async () => {
    const dto = new CreateTipoParametroDto();
    dto.jsonId = 'test_sensor';
    dto.nome = 'Test';
    dto.metrica = '°C';
    dto.polinomio = 'a0 + a1*temperatura + a2*umidade';  // 3 coefficients needed
    dto.coeficiente = [1, 0.95];  // Only 2 coefficients provided
    dto.leitura = {
      temperatura: { offset: 0, factor: 1 },
      umidade: { offset: 0, factor: 1 }
    };

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0]?.property).toBe('polinomio');
    expect(errors[0]?.constraints?.isValidPolynomial).toContain('Number of coefficients (2) does not match the number of aN terms in the polynomial (3)');
  });

  it('should pass validation when polynomial and calibration are consistent', async () => {
    const dto = new CreateTipoParametroDto();
    dto.jsonId = 'test_sensor';
    dto.nome = 'Test';
    dto.metrica = '°C';
    dto.polinomio = 'a0 + a1*temperatura + a2*umidade';
    dto.coeficiente = [1, 0.95, 0.5];
    dto.leitura = {
      temperatura: { offset: 0, factor: 1 },
      umidade: { offset: 0, factor: 1 }
    };

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});