import mongoose, { Types } from "mongoose";
import { User } from "../../../types";

const userSchema = new mongoose.Schema<User>(
  {
    firstname: { type: String },
    lastname: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    refreshToken: [String],
    role: { type: String, enum: ["user", "admin"], default: "user" },
    statistcs: [{ type: Types.ObjectId, ref: "Statistic" }],
  },
  { timestamps: true }
);

const UserModel = mongoose.model<User>("UserModel", userSchema);

export default UserModel;
