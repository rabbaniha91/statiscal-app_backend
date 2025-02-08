import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const createhash = async (data: string) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(data, salt);
};

export const isMatchPassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};

export const createToken = (id: string, secret: string, expires: any) => {
  return jwt.sign({ id }, secret, { expiresIn: expires });
};
