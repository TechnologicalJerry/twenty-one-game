import { CookieOptions } from "express";

const isProduction = process.env.NODE_ENV === "production";

export const accessTokenCookieOptions: CookieOptions = {
  maxAge: 15 * 60 * 1000, // 15 minutes
  httpOnly: true,
  path: "/",
  sameSite: "lax",
  secure: isProduction,
};

export const refreshTokenCookieOptions: CookieOptions = {
  maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
  httpOnly: true,
  path: "/",
  sameSite: "lax",
  secure: isProduction,
};
