import { Request, Response, NextFunction } from "express";
import AppError from "../../../modules/error/services/AppError";
import { createToken, verifyToken } from "../../../services/tokenServisec";
import { checkDuplicateEmail, createUser, findUserByRefreshToken, validateCredentials } from "../services/userServices";
import { LoginRequest, SignupRequest, User } from "../../../types";

// -------------------- Helper Functions --------------------
const setRefreshTokenCookie = (res: Response, token: string): void => {
  res.cookie("jwt", token, {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
  });
};

// -------------------- Controllers --------------------
export const signin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstname, lastname, email, password } = req.body as SignupRequest;

    await checkDuplicateEmail(email, next);
    const user = await createUser({ firstname, lastname, email, password });

    const accessToken = createToken({ userId: user.id }, process.env.JWT_SECRET_ACCESS!, "1h");
    const refreshToken = createToken({ userId: user.id }, process.env.JWT_SECRET_REFRESH!, "15d");
    if (user?.refreshToken?.length === 0) {
      user?.refreshToken.push(refreshToken);
    }
    await user.save();

    setRefreshTokenCookie(res, refreshToken);

    res.status(201).json({
      user: { firstname, lastname, email, role: user.role },
      accessToken,
      message: "User registered",
    });
  } catch (error: unknown) {
    next(error instanceof AppError ? error : new AppError("Internal Server Error", 500));
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as LoginRequest;
    const refreshToken = req.cookies?.jwt;

    const user = await validateCredentials(email, password);
    if (user?.refreshToken) user.refreshToken = user?.refreshToken.filter((rt) => rt !== refreshToken);

    const newRefreshToken = createToken({ userId: user.id }, process.env.JWT_SECRET_REFRESH!, "15d");
    const accessToken = createToken({ userId: user.id }, process.env.JWT_SECRET_ACCESS!, "1h");
    if (user?.refreshToken) user.refreshToken.push(newRefreshToken);
    await user.save();

    res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
    setRefreshTokenCookie(res, newRefreshToken);

    res.status(200).json({
      user: { firstname: user.firstname, lastname: user.lastname, email, role: user.role },
      accessToken,
      message: "User logged in",
    });
  } catch (error: unknown) {
    next(error instanceof AppError ? error : new AppError("Internal Server Error", 500));
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies?.jwt;
    if (!refreshToken) return res.sendStatus(204);

    const user = await findUserByRefreshToken(refreshToken);
    if (user && user.refreshToken) {
      user.refreshToken = user.refreshToken.filter((rt) => rt !== refreshToken);
      await user.save();
    }

    res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
    res.sendStatus(204);
  } catch (error: unknown) {
    next(error instanceof AppError ? error : new AppError("Internal Server Error", 500));
  }
};
