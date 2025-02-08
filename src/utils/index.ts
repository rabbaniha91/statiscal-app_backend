import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { envs } from "../config/env";
import AppError from "../modules/error/services/AppError";

export const createhash = async (data: string) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(data, salt);
};

export const isMatchPassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};

interface KeyEnvType {
  PORT: string;
  MONGO_URL: string;
  JWT_SECRET_ACCESS: string;
  JWT_SECRET_REFRESH: string;
}

export const validateEnv = () => {
  (Object.keys(envs) as Array<keyof typeof envs>).forEach((key) => {
    if (!envs[key]) {
      throw new Error(`${key} are not defined in environment variables!`);
    }
  });
};
