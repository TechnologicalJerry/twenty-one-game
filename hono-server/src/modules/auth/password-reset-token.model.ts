import { Schema, model, type InferSchemaType, type Types } from 'mongoose';

const passwordResetTokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    tokenHash: {
      type: String,
      required: true,
      index: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    },
    usedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

passwordResetTokenSchema.index({ userId: 1, createdAt: -1 });

export type PasswordResetTokenDocument = InferSchemaType<typeof passwordResetTokenSchema> & {
  _id: Types.ObjectId;
};

export const PasswordResetTokenModel = model('PasswordResetToken', passwordResetTokenSchema);
