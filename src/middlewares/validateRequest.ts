import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import AppError from "../modules/error/services/AppError";

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const results = validationResult(req);
  if (!results.isEmpty()) {
    const errors = results.array().map((err) => err.msg);
    return next(new AppError(errors.join(" | "), 400));
  }
  next();
};
