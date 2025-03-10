import { Request, Response, NextFunction } from "express";
import AppError from "../../../modules/error/services/AppError";
import { createToken, verifyToken } from "../../../services/tokenServisec";
import { checkDuplicateEmail, createUser, findUserById, findUserByRefreshToken, validateCredentials } from "../services/userServices";
import { LoginRequest, SignupRequest, User } from "../../../types";
import { envs } from "../../../config/env";

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
export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password } = req.body as SignupRequest;

    await checkDuplicateEmail(email, next);
    const user = await createUser({ username, email, password });

    const accessToken = createToken({ userId: user.id }, envs.JWT_SECRET_ACCESS, "1h");
    const refreshToken = createToken({ userId: user.id }, envs.JWT_SECRET_REFRESH, "15d");
    if (user?.refreshToken?.length === 0) {
      user?.refreshToken.push(refreshToken);
    }
    await user.save();

    setRefreshTokenCookie(res, refreshToken);

    res.status(201).json({
      user: { username, email, role: user.role },
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

    const user = await validateCredentials(email, password, next);
    if (user) {
      if (user?.refreshToken) user.refreshToken = user?.refreshToken.filter((rt) => rt !== refreshToken);

      const newRefreshToken = createToken({ userId: user.id }, envs.JWT_SECRET_REFRESH, "15d");
      const accessToken = createToken({ userId: user.id }, envs.JWT_SECRET_ACCESS, "1h");
      if (user?.refreshToken) user.refreshToken.push(newRefreshToken);
      await user.save();

      res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
      setRefreshTokenCookie(res, newRefreshToken);

      res.status(200).json({
        user: { username: user.username, email, role: user.role },
        accessToken,
        message: "User logged in",
      });
    }
  } catch (error: unknown) {
    next(error instanceof AppError ? error : new AppError("Internal Server Error", 500));
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies?.jwt;
    if (!refreshToken) return next(new AppError("", 204));

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

export const refreshTokens = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies?.jwt;
    if (!refreshToken) throw new AppError("Unauthorized", 401);

    // Verify refresh token
    const decoded = verifyToken(refreshToken, process.env.JWT_SECRET_REFRESH!);

    // Check if user exists and token is valid
    const user = await findUserById(decoded.userId);
    if (!user || (user?.refreshToken && !user?.refreshToken.includes(refreshToken))) {
      throw new AppError("Invalid refresh token", 403);
    }

    // Generate new tokens
    const newAccessToken = createToken({ userId: user.id }, process.env.JWT_SECRET_ACCESS!, "1h");
    const newRefreshToken = createToken({ userId: user.id }, process.env.JWT_SECRET_REFRESH!, "15d");

    // Remove old refresh token and add the new one
    if (user?.refreshToken) {
      user.refreshToken = user.refreshToken.filter((rt) => rt !== refreshToken);
      user.refreshToken.push(newRefreshToken);
      await user.save();
    }

    // Set new refresh token in cookie
    res.cookie("jwt", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
    });

    res.status(200).json({
      accessToken: newAccessToken,
      message: "Tokens refreshed successfully",
    });
  } catch (error: unknown) {
    next(error instanceof AppError ? error : new AppError("Internal Server Error", 500));
  }
};
