import UserModel from "../models";
import { createhash, isMatchPassword } from "../../../utils";
import AppError from "../../../modules/error/services/AppError";
import { User, UserDocument } from "../../../types";
import { NextFunction } from "express";

export const checkDuplicateEmail = async (email: string, next: NextFunction): Promise<void> => {
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    next(new AppError("A user has registered with this email address.", 400));
  }
};

export const createUser = async (userData: User): Promise<UserDocument> => {
  const hashedPassword = await createhash(userData.password);
  return await UserModel.create({ ...userData, password: hashedPassword });
};

export const validateCredentials = async (email: string, password: string, next: NextFunction): Promise<UserDocument | null | void> => {
  const user = await UserModel.findOne({ email });
  if (!user) {
    return next(new AppError("No user has registered with this email address.", 400));
  } else {
    const isValid = await isMatchPassword(password, user.password);
    if (!isValid) return next(new AppError("The password is incorrect.", 401));
    return user;
  }
};

export const findUserByRefreshToken = async (refreshToken: string): Promise<UserDocument | null> => {
  const user = await UserModel.findOne({ refreshToken });
  return user;
};
