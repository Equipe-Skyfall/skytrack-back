import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { Injectable } from "@nestjs/common";
import { parse } from "mathjs";

@ValidatorConstraint({ name: 'isValidPolynomial', async: false })
@Injectable()
export class IsValidPolynomialConstraint implements ValidatorConstraintInterface {
    validate(polynomial: string, args: ValidationArguments): boolean {
        if (!polynomial) {
            return true;
        }

        const dto: any = args.object;
        const coefficients: number[] = dto.coefficients || [];
        const calibration: Record<string, any> = dto.calibration || {};
        const calibrationKeys = Object.keys(calibration);

        try {
            validatePolynomial(polynomial, coefficients, calibrationKeys);
            return true;
        } catch (err) {
            // You can attach the message to args constraints
            return false;
        }
    }

    defaultMessage(args: ValidationArguments) {
        const dto: any = args.object;
        const polynomial = args.value as string;
        const coefficients: number[] = dto.coefficients || [];
        const calibration: Record<string, any> = dto.calibration || {};
        const calibrationKeys = Object.keys(calibration);

        try {
            validatePolynomial(polynomial, coefficients, calibrationKeys);
            return '';
        } catch (err: any) {
            return err.message;
        }
    }
}

function validatePolynomial(
  polynomial: string,
  coefficients: number[],
  calibrationKeys: string[],
) {
  if (!polynomial) return;

  try {
    parse(polynomial);
  } catch (err: any) {
    throw new Error(`Polynomial is not mathematically valid: ${err.message}`);
  }

  // Extract aN identifiers
  const aMatches = polynomial.match(/a\d+/g) || [];
  const uniqueACoeffs = Array.from(new Set(aMatches));

  // Check sequential aN starting from a0
  for (let i = 0; i < uniqueACoeffs.length; i++) {
    if (`a${i}` !== uniqueACoeffs[i]) {
      throw new Error(
        `Polynomial coefficients must be named sequentially as a0, a1, a2..., found ${uniqueACoeffs.join(
          ', ',
        )}`,
      );
    }
  }

  // Check number of coefficients matches
  if (coefficients.length !== uniqueACoeffs.length) {
    throw new Error(
      `Number of coefficients (${coefficients.length}) does not match the number of aN terms in the polynomial (${uniqueACoeffs.length})`,
    );
  }

  // Extract variable names from polynomial (anything not aN, numbers, operators, parentheses)
  const varMatches = polynomial.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g) || [];
  const variables = varMatches.filter((v) => !/^a\d+$/.test(v));

  // Ensure all variables exist in calibration
  const missingKeys = variables.filter((v) => !calibrationKeys.includes(v));
  if (missingKeys.length > 0) {
    throw new Error(
      `Polynomial contains variables not present in calibration: ${missingKeys.join(', ')}`,
    );
  }
}