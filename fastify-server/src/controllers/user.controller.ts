import { FastifyReply, FastifyRequest } from "fastify";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcryptjs";
import { User } from "../models/user.model";

class UserController {
  createUser = async (request: FastifyRequest, reply: FastifyReply) => {
    const { userName, firstName, middleName, lastName, email, password } =
      request.body as {
        userName?: string;
        firstName?: string;
        middleName?: string;
        lastName?: string;
        email?: string;
        password?: string;
      };

    if (!userName || !firstName || !lastName || !email || !password) {
      return reply.code(StatusCodes.BAD_REQUEST).send({
        msg: "All fields (userName, firstName, lastName, email, password) are required.",
      });
    }

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return reply
          .code(StatusCodes.CONFLICT)
          .send({ msg: "Email already exists." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await User.create({
        userName,
        firstName,
        middleName,
        lastName,
        email,
        password: hashedPassword,
      });

      return reply
        .code(StatusCodes.CREATED)
        .send({ user: newUser, msg: "User created successfully." });
    } catch (error) {
      request.log.error(error);
      return reply
        .code(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({ msg: "Error creating user." });
    }
  };

  getAllUsers = async (_request: FastifyRequest, reply: FastifyReply) => {
    const users = await User.find().sort("-createdAt");
    return reply
      .code(StatusCodes.OK)
      .send({ users, msg: "All users fetched successfully." });
  };

  getUserById = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const user = await User.findById(id);

    if (!user) {
      return reply
        .code(StatusCodes.NOT_FOUND)
        .send({ msg: "User not found." });
    }

    return reply
      .code(StatusCodes.OK)
      .send({ user, msg: "User fetched successfully." });
  };

  updateUser = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const payload = request.body as Record<string, unknown>;

    const updatedUser = await User.findByIdAndUpdate(id, payload, {
      new: true,
    });

    if (!updatedUser) {
      return reply
        .code(StatusCodes.NOT_FOUND)
        .send({ msg: "User not found." });
    }

    return reply
      .code(StatusCodes.OK)
      .send({ user: updatedUser, msg: "User updated successfully." });
  };

  deleteUser = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return reply
        .code(StatusCodes.NOT_FOUND)
        .send({ msg: "User not found." });
    }

    return reply
      .code(StatusCodes.OK)
      .send({ user: deletedUser, msg: "User deleted successfully." });
  };
}

export const userController = new UserController();
