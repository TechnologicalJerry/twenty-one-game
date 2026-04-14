import { FastifyInstance } from "fastify";
import { todoController } from "../controllers/todo.controller";
import { requireAuth } from "../middleware/auth.middleware";

async function todoRoutes(server: FastifyInstance) {
  server.addHook("preHandler", requireAuth);

  server.post("/", todoController.createTodo);
  server.get("/", todoController.getTodos);

  server.get("/:id", todoController.getSingleTodo);
  server.patch("/:id", todoController.updateTodo);
  server.delete("/:id", todoController.deleteTodo);
}

export default todoRoutes;
