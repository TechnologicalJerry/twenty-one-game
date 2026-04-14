import { FastifyInstance } from "fastify";
import userRoutes from "./user.routes";
import sessionsRoutes from "./sessions.routes";
import todoRoutes from "./todo.routes";

async function indexRoutes(server: FastifyInstance) {
  server.register(userRoutes, { prefix: "/users" });
  server.register(sessionsRoutes, { prefix: "/sessions" });
  server.register(todoRoutes, { prefix: "/todos" });
}

export default indexRoutes;
