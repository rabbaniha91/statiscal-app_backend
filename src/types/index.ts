import { Document, ObjectId, Types } from "mongoose";

export interface User {
  username: string;
  email: string;
  password: string;
  refreshToken?: string[];
  role?: "admin" | "user";
  statistcs?: Types.ObjectId[];
}

export interface UserDocument extends User, Document {}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
