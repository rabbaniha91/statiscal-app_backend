import { NextFunction, Request, Response } from "express";
import AppError from "../modules/error/services/AppError";
import { verifyToken } from "../services/tokenServisec";
import { envs } from "../config/env";
import { findUserById } from "../modules/user/services/userServices";

export const authenticateAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authorization = req.headers.authorization;
    if (!authorization || !authorization?.startsWith("Bearer "))
      return next(new AppError("Authorization header must be in the format 'Bearer [token]'", 400));

    const token = authorization.split(" ")[1];

    if (!token) return next(new AppError("Token not provided", 400));

    const { userId } = verifyToken(token, envs.JWT_SECRET_ACCESS);

    if (!userId) return next(new AppError("Invalid token payload", 401));

    const user = await findUserById(userId);

    if (!user) return next(new AppError("user not found", 404));

    req.user = user;
    next();
  } catch (error: any) {
    console.error("Error in authenticate: ", error);
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Token has expired", 401));
    } else if (error.name === "JsonWebTokenError") {
      return next(new AppError("Invalid token", 401));
    } else {
      return next(new AppError("Authentication failed", 500));
    }
  }
};
