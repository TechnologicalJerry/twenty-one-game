"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenCookieOptions = exports.accessTokenCookieOptions = void 0;
var isProduction = process.env.NODE_ENV === "production";
exports.accessTokenCookieOptions = {
    maxAge: 15 * 60 * 1000,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: isProduction,
};
exports.refreshTokenCookieOptions = {
    maxAge: 365 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: isProduction,
};
