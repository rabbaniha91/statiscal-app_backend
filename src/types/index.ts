import { ObjectId } from "mongoose";

export interface User {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  refreshToken: string[];
  role: "admin" | "user";
  statistcs?: ObjectId[];
}
