import { Request, Response } from "express";
import { omit } from "lodash";
import { CreateUserInput } from "../schema/user.schema";
import { createUser } from "../service/user.service";
import logger from "../utils/logger";

export async function createUserHandler(
  req: Request<{}, {}, CreateUserInput["body"]>,
  res: Response
) {
  try {
    const user = await createUser(omit(req.body, "passwordConfirmation"));
    return res.status(201).send(user);
  } catch (e: any) {
    logger.error(e);
    if (e.code === 11000) {
      return res.status(409).send("Account with this email already exists");
    }
    return res.status(400).send(e.message || "Failed to create user");
  }
}
