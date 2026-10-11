import { get } from "lodash";
import config from "config";
import { FilterQuery, UpdateQuery } from "mongoose";
import SessionModel, { SessionDocument } from "../models/session.model";
import { verifyJwt, signJwt } from "../utils/jwt.utils";
import { findUser } from "./user.service";
import { getCache, setCache, deleteCache } from "../utils/redis";

export async function createSession(userId: string, userAgent: string) {
  const session = await SessionModel.create({ user: userId, userAgent });
  const sessionJson = session.toJSON();

  // Cache in Redis for fast session lookup
  await setCache(`session:${session._id}`, { valid: true, user: userId }, 86400 * 30);

  return sessionJson;
}

export async function findSessions(query: FilterQuery<SessionDocument>) {
  return SessionModel.find(query).lean();
}

export async function updateSession(
  query: FilterQuery<SessionDocument>,
  update: UpdateQuery<SessionDocument>
) {
  if (query._id) {
    await deleteCache(`session:${query._id}`);
  }
  return SessionModel.updateOne(query, update);
}

export interface RotatedTokens {
  accessToken: string;
  refreshToken: string;
}

export async function reIssueAccessToken({
  refreshToken,
}: {
  refreshToken: string;
}): Promise<RotatedTokens | false> {
  const { decoded } = verifyJwt(refreshToken, "refreshTokenPublicKey");

  if (!decoded || !get(decoded, "session")) return false;

  const sessionId = get(decoded, "session");

  // Check Redis cache first to avoid hitting MongoDB
  const sessionData = await getCache<{ valid: boolean; user: any }>(
    `session:${sessionId}`
  );

  let userId: string | null = null;
  if (sessionData) {
    if (!sessionData.valid) return false;
    userId = sessionData.user;
  } else {
    // Cache miss: query MongoDB
    const session = await SessionModel.findById(sessionId);
    if (!session || !session.valid) {
      if (session && !session.valid) {
        await setCache(
          `session:${sessionId}`,
          { valid: false, user: session.user },
          3600
        );
      }
      return false;
    }
    userId = session.user.toString();
    await setCache(
      `session:${sessionId}`,
      { valid: true, user: userId },
      86400 * 30
    );
  }

  const user = await findUser({ _id: userId });
  if (!user) return false;

  // Sign new short-lived Access Token
  const accessToken = signJwt(
    { ...user, session: sessionId },
    "accessTokenPrivateKey",
    { expiresIn: config.get("accessTokenTtl") } // 15 minutes
  );

  // Rotate Refresh Token
  const newRefreshToken = signJwt(
    { ...user, session: sessionId },
    "refreshTokenPrivateKey",
    { expiresIn: config.get("refreshTokenTtl") } // 1 year
  );

  return { accessToken, refreshToken: newRefreshToken };
}
