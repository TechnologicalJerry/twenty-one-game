import { FastifyReply, FastifyRequest } from "fastify";
import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../models/user.model";
import { LoginSession } from "../models/session.model";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
} from "../middleware/jwt";

class SessionsController {
  login = async (request: FastifyRequest, reply: FastifyReply) => {
    const { email, password } = request.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return reply
        .code(StatusCodes.BAD_REQUEST)
        .send({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return reply.code(StatusCodes.UNAUTHORIZED).send({
        message: "User not found. Please sign up first.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return reply
        .code(StatusCodes.UNAUTHORIZED)
        .send({ message: "Invalid credentials" });
    }

    const userId = user._id.toString();
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);

    await LoginSession.create({
      userId,
      userName: user.userName,
      email: user.email,
      accessToken,
      refreshToken,
    });

    return reply.code(StatusCodes.OK).send({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
      },
    });
  };

  logout = async (request: FastifyRequest, reply: FastifyReply) => {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reply
        .code(StatusCodes.UNAUTHORIZED)
        .send({ message: "You are not logged in." });
    }

    const token = authHeader.split(" ")[1];

    try {
      const payload = verifyAccessToken(token) as JwtPayload;
      const userId = typeof payload.userId === "string" ? payload.userId : "";

      if (!userId) {
        return reply
          .code(StatusCodes.UNAUTHORIZED)
          .send({ message: "You are not logged in." });
      }

      await LoginSession.deleteOne({ userId });

      return reply
        .code(StatusCodes.OK)
        .send({ message: "Logout successful" });
    } catch {
      return reply
        .code(StatusCodes.UNAUTHORIZED)
        .send({ message: "You are not logged in." });
    }
  };

  me = async (request: FastifyRequest, reply: FastifyReply) => {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reply
        .code(StatusCodes.UNAUTHORIZED)
        .send({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const payload = verifyAccessToken(token) as JwtPayload;
      const userId = typeof payload.userId === "string" ? payload.userId : "";

      if (!userId) {
        return reply
          .code(StatusCodes.UNAUTHORIZED)
          .send({ message: "Unauthorized" });
      }

      const user = await User.findById(userId).select("-password");
      return reply.code(StatusCodes.OK).send({ user });
    } catch {
      return reply
        .code(StatusCodes.UNAUTHORIZED)
        .send({ message: "Unauthorized" });
    }
  };
}

export const sessionsController = new SessionsController();
