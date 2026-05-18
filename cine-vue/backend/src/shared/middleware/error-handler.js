const { errorResponse } = require("../utils/response");

const errorHandler = (err, req, res, next) => {
  console.error(
    `[${req.method}] ${req.path} >> StatusCode:: ${err.status || 500}, Message:: ${err.message}`,
  );

  if (err.name === "ValidationError") {
    return errorResponse(res, "Validation Error", 400, err.details);
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return errorResponse(res, "Invalid or expired token", 401);
  }

  if (err.code === "ER_DUP_ENTRY") {
    return errorResponse(res, "Duplicate entry", 409);
  }

  return errorResponse(
    res,
    err.message || "Internal Server Error",
    err.status || 500,
    err.errors || null,
  );
};

module.exports = errorHandler;
