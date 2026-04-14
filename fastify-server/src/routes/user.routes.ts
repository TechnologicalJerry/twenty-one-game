import { FastifyInstance } from "fastify";
import { userController } from "../controllers/user.controller";

async function userRoutes(server: FastifyInstance) {
  server.post("/", userController.createUser);
  server.get("/", userController.getAllUsers);

  server.get("/:id", userController.getUserById);
  server.patch("/:id", userController.updateUser);
  server.delete("/:id", userController.deleteUser);
}

export default userRoutes;
