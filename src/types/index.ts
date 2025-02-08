import { Document, ObjectId, Types } from "mongoose";

export interface User {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  refreshToken: string[];
  role: "admin" | "user";
  statistcs?: Types.ObjectId[];
}

export interface UserDocument extends User, Document {}
