"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
var sessionSchema = new mongoose_1.default.Schema({
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    valid: { type: Boolean, default: true },
    userAgent: { type: String },
    expiresAt: {
        type: Date,
        default: function () { return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); }, // 1 year TTL
    },
}, {
    timestamps: true,
});
// TTL index to automatically purge expired sessions from MongoDB
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// Compound index for querying user active sessions efficiently
sessionSchema.index({ user: 1, valid: 1 });
var SessionModel = mongoose_1.default.model("Session", sessionSchema);
exports.default = SessionModel;
