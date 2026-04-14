import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  userName: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  password: string;
}

const UserSchema: Schema = new Schema(
  {
    userName: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    middleName: { type: String, required: false },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);
