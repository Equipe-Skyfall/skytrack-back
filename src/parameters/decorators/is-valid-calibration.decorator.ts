import { registerDecorator, ValidationOptions } from "class-validator";
import { IsValidCalibrationConstraint } from "../validators/calibration.validator";

export function IsValidCalibration(validationOptions?: ValidationOptions) {
    return function (target: any, propertyName: string) {
        registerDecorator({
            name: 'isValidCalibration',
            target: target.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: IsValidCalibrationConstraint,
        })
    }
}