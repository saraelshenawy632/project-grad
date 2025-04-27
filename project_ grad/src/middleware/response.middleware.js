const successResponse = (res, data, statusCode = 200) => {
  res.status(statusCode).json({
    status: 'success',
    data
  });
};

const errorResponse = (res, message, statusCode = 400) => {
  res.status(statusCode).json({
    status: 'error',
    message
  });
};

module.exports = { successResponse, errorResponse };