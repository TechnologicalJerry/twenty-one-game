import mongoose from "mongoose";
import { UserDocument } from "./user.model";

export interface SessionDocument extends mongoose.Document {
  user: UserDocument["_id"];
  valid: boolean;
  userAgent: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    valid: { type: Boolean, default: true },
    userAgent: { type: String },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year TTL
    },
  },
  {
    timestamps: true,
  }
);

// TTL index to automatically purge expired sessions from MongoDB
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// Compound index for querying user active sessions efficiently
sessionSchema.index({ user: 1, valid: 1 });

const SessionModel = mongoose.model<SessionDocument>("Session", sessionSchema);

export default SessionModel;
