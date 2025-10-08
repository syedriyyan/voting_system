import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

/**
 * Middleware to validate request using express-validator
 */
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.type === "field" ? err.path : undefined,
        message: err.msg,
      })),
    });
  }

  next();
};
