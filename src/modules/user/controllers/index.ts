import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import AppError from "../../error/services/AppError";
import { User } from "../../../types";
import UserModel from "../models";
import { createhash, createToken, isMatchPassword } from "../../../utils";

export const signin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const results = validationResult(req);
    if (!results.isEmpty()) {
      console.error("Error in validate data in signin: ", results.array());
      const firstError = results.array()[0].msg;
      return next(new AppError(firstError, 400));
    }

    const { firstname, lastname, email, password } = req.body as User;

    const repeatUser = await UserModel.findOne({ email });

    if (repeatUser) {
      return next(new AppError("A user has registered with this email address.", 400));
    }

    const hashPassword = await createhash(password);

    const user = await UserModel.create({ firstname, lastname, email, password: hashPassword });

    const refreshToken = createToken(user?.id, process.env.JWT_SECRET_REFRESH as string, "15d");
    const accessToken = createToken(user?.id, process.env.JWT_SECRET_ACCESS as string, "1h");

    user.refreshToken.push(refreshToken);
    await user.save();

    res.cookie("jwt", refreshToken, { httpOnly: true, sameSite: "none", secure: true });

    res.status(200).json({
      user: { firstname, lastname, email, role: user.role },
      accessToken,
      message: "User registred",
    });
  } catch (error: any) {
    console.error("Error in signin: ", error);
    next(new AppError(error.message, 500));
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const results = validationResult(req);
    if (!results.isEmpty()) {
      console.error("Error in validate data in login: ", results.array());
      const firstError = results.array()[0].msg;
      return next(new AppError(firstError, 400));
    }
    const { email, password } = req.body;
    const cookies = req.cookies;
    const refreshToken = cookies?.jwt;
    const user = await UserModel.findOne({ email });

    if (!user) return next(new AppError("No user has registered with this email address.", 400));
    const matchedPassword = await isMatchPassword(password, user.password);

    if (!matchedPassword) return next(new AppError("The password is incorrect.", 401));

    const refreshTokensArray = user.refreshToken.filter((rt) => {
      return rt !== refreshToken;
    });

    const newRefreshToken = createToken(user?.id, process.env.JWT_SECRET_REFRESH as string, "15d");
    const accessToken = createToken(user?.id, process.env.JWT_SECRET_ACCESS as string, "1h");

    refreshTokensArray.push(newRefreshToken);

    user.refreshToken = refreshTokensArray;
    await user.save();

    res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });

    res.cookie("jwt", newRefreshToken, { httpOnly: true, sameSite: "none", secure: true });

    res.status(200).json({
      user: { firstname: user.firstname, lastname: user.lastname, email, role: user.role },
      accessToken,
      message: "User loged in",
    });
  } catch (error: any) {
    console.error("Error in login: ", error);
    next(new AppError(error.message, 500));
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cookies = req.cookies;

    if (!cookies?.jwt) return next(new AppError("", 204));
    const refreshToken = cookies.jwt;
    const foundUser = await UserModel.findOne({ refreshToken });
    if (!foundUser) {
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });
      return next(new AppError("", 204));
    }

    foundUser.refreshToken = foundUser.refreshToken.filter((rt) => rt !== refreshToken);
    await foundUser.save();
    res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
    res.sendStatus(204);
  } catch (error: any) {
    console.error("Error in logout: ", error);
    next(new AppError(error.message, 500));
  }
};
