import { ENV } from '../config/env.js';

export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || (err.status ? parseInt(err.status, 10) : 500);
  const message = err.message || 'Internal server error occurred';

  if (ENV.NODE_ENV === 'development') {
    console.error(`[ERROR ${statusCode}]:`, err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(ENV.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
