import logger from '../config/logger.js';

export default (err, req, res, next) => {
  // Log error
  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`, {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // Hide stack trace in production
  const isProduction = process.env.NODE_ENV === 'production';
  const response = {
    success: false,
    status: statusCode,
    message: message
  };
  
  if (!isProduction) {
    response.stack = err.stack;
    if (err.code) response.code = err.code;
  }
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    response.message = 'Validation Error';
    response.errors = err.errors;
  }
  
  if (err.code === '23505') { // PostgreSQL unique violation
    response.message = 'Duplicate entry';
    response.field = err.message.match(/key \(([^)]+)\)/)?.[1];
  }
  
  res.status(statusCode).json(response);
};