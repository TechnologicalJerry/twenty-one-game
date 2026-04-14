import mongoose, { Document, Schema } from "mongoose";

export interface ILoginSession extends Document {
  userId: string;
  userName: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  createdAt: Date;
}

const LoginSessionSchema = new Schema<ILoginSession>({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  email: { type: String, required: true },
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const LoginSession = mongoose.model<ILoginSession>(
  "LoginSession",
  LoginSessionSchema
);
