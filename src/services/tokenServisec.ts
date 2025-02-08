import jwt from "jsonwebtoken";
import AppError from "../modules/error/services/AppError";

type TokenPayload = { userId: string };

export const createToken = (payload: TokenPayload, secret: string, expiresIn: any): string => {
  if (!secret) throw new AppError("JWT secret is missing", 500);
  return jwt.sign(payload, secret, { expiresIn });
};

export const verifyToken = (token: string, secret: string): TokenPayload => {
  if (!secret) throw new AppError("JWT secret is missing", 500);
  return jwt.verify(token, secret) as TokenPayload;
};
