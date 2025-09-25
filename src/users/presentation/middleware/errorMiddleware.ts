// import { Request, Response, NextFunction } from 'express';
// import { AppError } from '../../application/errors/AppError';

// export const errorHandler = (
//   error: Error,
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   console.error('Error caught by error handler:', error);

//   let statusCode = 500;
//   let message = 'Internal Server Error';

//   if (error instanceof AppError) {
//     statusCode = error.statusCode;
//     message = error.message;
//   }

//   // Prisma errors
//   if (error.name === 'PrismaClientKnownRequestError') {
//     statusCode = 400;
//     message = 'Database operation failed';
//   }

//   // Validation errors
//   if (error.name === 'ValidationError') {
//     statusCode = 400;
//     message = error.message;
//   }

//   // JWT errors
//   if (error.name === 'JsonWebTokenError') {
//     statusCode = 401;
//     message = 'Invalid token';
//   }

//   if (error.name === 'TokenExpiredError') {
//     statusCode = 401;
//     message = 'Token expired';
//   }

//   // Log error for debugging (in production, use proper logging service)
//   if (process.env.NODE_ENV === 'development') {
//     console.error('Error details:', error);
//   }

//   // Don't send error details in production
//   if (process.env.NODE_ENV === 'production' && statusCode === 500) {
//     message = 'Something went wrong';
//   }

//   res.status(statusCode).json({
//     success: false,
//     message,
//     ...(process.env.NODE_ENV === 'development' && { 
//       stack: error.stack,
//       error: error.name 
//     })
//   });
// };

// export const notFoundHandler = (req: Request, res: Response) => {
//   res.status(404).json({
//     success: false,
//     message: `Route ${req.originalUrl} not found`
//   });
// };