import { FastifyInstance } from "fastify";
import { sessionsController } from "../controllers/sessions.controller";

async function sessionsRoutes(server: FastifyInstance) {
  server.post("/login", sessionsController.login);
  server.post("/logout", sessionsController.logout);
  server.get("/me", sessionsController.me);
}

export default sessionsRoutes;
