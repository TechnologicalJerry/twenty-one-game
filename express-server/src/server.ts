import express, { Request, Response } from "express";
import dotenv from "dotenv";
import config from "config";
import responseTime from "response-time";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import connect from "./utils/connect";
import logger from "./utils/logger";
import routes from "./routes";
import deserializeUser from "./middleware/deserializeUser";
import { apiLimiter } from "./middleware/rateLimiter";
import { restResponseTimeHistogram, startMetricsServer } from "./utils/metrics";
import swaggerDocs from "./utils/swagger";

dotenv.config();

const port = config.get<number>("port");

const server = express();

// Security HTTP headers with CSP configured for Swagger UI support
server.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration supporting cookies and authorization headers
server.use(
  cors({
    origin: config.has("corsOrigin") ? config.get<string>("corsOrigin") : true,
    credentials: true,
  })
);

// Cookie parser for reading secure auth cookies
server.use(cookieParser());

server.use(express.json());

// Global rate limiting for API endpoints
server.use("/api", apiLimiter);

// Authentication deserialization middleware
server.use(deserializeUser);

server.use(
  responseTime((req: Request, res: Response, time: number) => {
    if (req?.route?.path) {
      restResponseTimeHistogram.observe(
        {
          method: req.method,
          route: req.route.path,
          status_code: res.statusCode,
        },
        time * 1000
      );
    }
  })
);

server.listen(port, async () => {
  logger.info(`Application Server is running at http://localhost:${port}`);

  await connect();

  routes(server);

  startMetricsServer();

  swaggerDocs(server, port);
});
