import { FastifyReply, FastifyRequest } from "fastify";
import { StatusCodes } from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { verifyAccessToken } from "./jwt";

declare module "fastify" {
  interface FastifyRequest {
    userId?: string;
  }
}

export const requireAuth = async (request: FastifyRequest, reply: FastifyReply) => {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return reply
      .code(StatusCodes.UNAUTHORIZED)
      .send({ message: "Unauthorized access" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyAccessToken(token) as JwtPayload;

    if (!payload?.userId || typeof payload.userId !== "string") {
      return reply
        .code(StatusCodes.UNAUTHORIZED)
        .send({ message: "Unauthorized access" });
    }

    request.userId = payload.userId;
  } catch {
    return reply
      .code(StatusCodes.UNAUTHORIZED)
      .send({ message: "Unauthorized access" });
  }
};
