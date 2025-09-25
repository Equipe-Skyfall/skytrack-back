import { registerDecorator, ValidationOptions } from 'class-validator';
import { IsValidPolynomialConstraint } from '../validators/polynomial.validator';

export function IsValidPolynomial(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidPolynomial',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsValidPolynomialConstraint,
    });
  };
}
