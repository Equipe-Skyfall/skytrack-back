// import { Request, Response, NextFunction } from 'express';
// import { body, validationResult } from 'express-validator';

// export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({
//       success: false,
//       message: 'Validation failed',
//       errors: errors.array()
//     });
//   }
//   next();
// };

// export const loginValidation = [
//   body('email')
//     .isEmail()
//     .normalizeEmail()
//     .withMessage('Please provide a valid email'),
//   body('password')
//     .isLength({ min: 6 })
//     .withMessage('Password must be at least 6 characters long'),
//   validateRequest
// ];

// export const createUserValidation = [
//   body('email')
//     .isEmail()
//     .normalizeEmail()
//     .withMessage('Please provide a valid email'),
//   body('username')
//     .isLength({ min: 3, max: 30 })
//     .isAlphanumeric()
//     .withMessage('Username must be 3-30 characters and contain only letters and numbers'),
//   body('password')
//     .isLength({ min: 6 })
//     .withMessage('Password must be at least 6 characters long'),
//   body('role')
//     .optional()
//     .isIn(['ADMIN', 'USER'])
//     .withMessage('Role must be either ADMIN or USER'),
//   validateRequest
// ];

// export const updateUserValidation = [
//   body('email')
//     .optional()
//     .isEmail()
//     .normalizeEmail()
//     .withMessage('Please provide a valid email'),
//   body('username')
//     .optional()
//     .isLength({ min: 3, max: 30 })
//     .isAlphanumeric()
//     .withMessage('Username must be 3-30 characters and contain only letters and numbers'),
//   body('password')
//     .optional()
//     .isLength({ min: 6 })
//     .withMessage('Password must be at least 6 characters long'),
//   body('role')
//     .optional()
//     .isIn(['ADMIN', 'USER'])
//     .withMessage('Role must be either ADMIN or USER'),
//   validateRequest
// ];