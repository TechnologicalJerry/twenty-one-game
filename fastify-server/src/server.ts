import Fastify from "fastify";
import cors from "@fastify/cors";
import indexRoutes from "./routes/index.routes";

function buildServer() {
  const server = Fastify({ logger: true });

  const allowedOrigins = ["http://localhost:3000", "http://localhost:4200"];

  server.register(cors, {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"), false);
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  });

  server.get("/healthcheck", async () => {
    return { status: "OK" };
  });

  server.get("/check", async (_request, reply) => {
    return reply.type("text/html").send(`
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Server Health Check</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f9;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
            }
            .container {
              text-align: center;
              background-color: #fff;
              padding: 50px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
              width: 80%;
              max-width: 600px;
            }
            h1 {
              font-size: 2.5rem;
              color: #333;
            }
            p {
              font-size: 1.2rem;
              color: #555;
            }
            .status {
              font-size: 1.5rem;
              color: green;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Todo List API</h1>
            <p>Welcome to the Todo List Application built with TypeScript, Fastify, and MongoDB.</p>
            <div class="status">Server is Healthy and Running!</div>
          </div>
        </body>
      </html>
    `);
  });

  server.register(indexRoutes, { prefix: "/api" });

  return server;
}

export default buildServer;
