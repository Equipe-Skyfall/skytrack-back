import { registerDecorator, ValidationOptions } from "class-validator";
import { IsValidCalibrationConstraint } from "../validators/calibration.validator";

export function IsValidCalibration(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isValidCalibration',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: IsValidCalibrationConstraint,
        })
    }
}