const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || error.status || 500;
    const message = error.message || 'Internal server error';
    error = new ApiError(statusCode, message, false, err.stack);
  }

  const response = {
    status: error.status,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  };

  if (process.env.NODE_ENV === 'development') {
    console.error('Error 💥:', error);
  }

  res.status(error.statusCode).json(response);
};

module.exports = errorHandler;