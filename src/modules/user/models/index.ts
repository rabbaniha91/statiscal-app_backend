import mongoose, { Types } from "mongoose";
import { User, UserDocument } from "../../../types";

const userSchema = new mongoose.Schema<UserDocument>(
  {
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    password: { type: String },
    refreshToken: [String],
    role: { type: String, enum: ["user", "admin"], default: "user" },
    statistcs: [{ type: Types.ObjectId, ref: "Statistic", default: [] }],
  },
  { timestamps: true }
);

const UserModel = mongoose.model<UserDocument>("UserModel", userSchema);

export default UserModel;
