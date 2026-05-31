import { validationResult } from "express-validator";

export function validate(req, res, next) {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const formattedErrors = errors.array().map((error) => ({
    field: error.path,
    message: error.msg,
    value: error.value,
  }));

  return res.status(422).json({
    success: false,
    statusCode: 422,
    message: "Validation failed",
    errors: formattedErrors,
  });
}