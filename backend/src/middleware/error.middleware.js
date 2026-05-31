export function notFound(req, res, next) {
  const error = new Error(
    `Route not found: ${req.originalUrl}`
  );

  error.statusCode = 404;

  next(error);
}

export function errorHandler(
  error,
  req,
  res,
  next
) {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal Server Error";

  // MongoDB Invalid ObjectId
  if (error.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource ID";
  }

  // MongoDB Duplicate Key
  if (error.code === 11000) {
    statusCode = 409;
    message = "Resource already exists";
  }

  // Mongoose Validation Error
  if (error.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(error.errors)
      .map((item) => item.message)
      .join(", ");
  }

  // JWT Errors
  if (error.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid authentication token";
  }

  if (error.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Authentication token expired";
  }

  // Log server errors
  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,

    ...(process.env.NODE_ENV !== "production" && {
      stack: error.stack,
    }),
  });
}