import { NextFunction, Request, Response } from "express";
import AppError from "../modules/error/services/AppError";
import { verifyToken } from "../services/tokenServisec";
import { envs } from "../config/env";
import { findUserById } from "../modules/user/services/userServices";

export const authenticateAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authorization = req.headers.authorization;
    if (!authorization?.startsWith("Bearer")) return next(new AppError("Authorization token must be send with Bearer word", 400));
    const token = authorization.split(" ")[1];
    if (!token) return next(new AppError("Please send token", 400));
    const { userId } = verifyToken(token, envs.JWT_SECRET_ACCESS);
    if (!userId) return next(new AppError("Token not valid", 401));
    const user = await findUserById(userId);
    if (!user) return next(new AppError("Access denide", 403));
    req.user = user;
    next();
  } catch (error: any) {
    console.error("Error in authenticate: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
