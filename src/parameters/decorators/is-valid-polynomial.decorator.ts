import { registerDecorator, ValidationOptions } from 'class-validator';
import { IsValidPolynomialConstraint } from '../validators/polynomial.validator';

export function IsValidPolynomial(validationOptions?: ValidationOptions) {
  return function (target: any, propertyName: string) {
    registerDecorator({
      name: 'isValidPolynomial',
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsValidPolynomialConstraint,
    });
  };
}
