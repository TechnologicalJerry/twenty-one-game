import { get } from "lodash";
import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../utils/jwt.utils";
import { reIssueAccessToken } from "../service/session.service";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "../utils/cookie.utils";

const deserializeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Extract access token from cookies or Authorization header
  const accessToken =
    get(req, "cookies.accessToken") ||
    get(req, "headers.authorization", "").replace(/^Bearer\s/, "");

  // Extract refresh token from cookies or x-refresh header
  const rawRefreshToken =
    get(req, "cookies.refreshToken") || get(req, "headers.x-refresh");
  const refreshToken = Array.isArray(rawRefreshToken)
    ? rawRefreshToken[0]
    : (rawRefreshToken as string | undefined);

  if (!accessToken) {
    // If access token is absent but refresh token is present, attempt automatic refresh
    if (refreshToken) {
      const tokens = await reIssueAccessToken({ refreshToken });

      if (tokens) {
        res.setHeader("x-access-token", tokens.accessToken);
        res.setHeader("x-refresh-token", tokens.refreshToken);

        res.cookie("accessToken", tokens.accessToken, accessTokenCookieOptions);
        res.cookie("refreshToken", tokens.refreshToken, refreshTokenCookieOptions);

        const result = verifyJwt(tokens.accessToken, "accessTokenPublicKey");
        res.locals.user = result.decoded;
        return next();
      }
    }
    return next();
  }

  const { decoded, expired } = verifyJwt(accessToken, "accessTokenPublicKey");

  if (decoded) {
    res.locals.user = decoded;
    return next();
  }

  // If access token has expired and a refresh token is present, rotate both tokens
  if (expired && refreshToken) {
    const tokens = await reIssueAccessToken({ refreshToken });

    if (tokens) {
      res.setHeader("x-access-token", tokens.accessToken);
      res.setHeader("x-refresh-token", tokens.refreshToken);

      res.cookie("accessToken", tokens.accessToken, accessTokenCookieOptions);
      res.cookie("refreshToken", tokens.refreshToken, refreshTokenCookieOptions);

      const result = verifyJwt(tokens.accessToken, "accessTokenPublicKey");
      res.locals.user = result.decoded;
      return next();
    } else {
      // Invalid/revoked session: clear stale cookies
      res.clearCookie("accessToken", { path: "/" });
      res.clearCookie("refreshToken", { path: "/" });
    }
  }

  return next();
};

export default deserializeUser;
