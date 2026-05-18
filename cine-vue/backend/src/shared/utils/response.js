const errorResponse = (res, message = "Internal Server Error", statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  errorResponse,
};
