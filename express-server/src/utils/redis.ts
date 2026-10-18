import Redis from "ioredis";
import config from "config";
import logger from "./logger";

let redisClient: Redis | null = null;
let isConnected = false;

try {
  let redisUri = "redis://localhost:6379";
  if (config.has("redisUri")) {
    redisUri = config.get<string>("redisUri");
  }

  redisClient = new Redis(redisUri, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      if (times > 3) {
        return null; // Stop reconnecting after 3 attempts in local dev if not available
      }
      return Math.min(times * 200, 2000);
    },
  });

  redisClient.on("connect", () => {
    isConnected = true;
    logger.info("Connected to Redis successfully");
  });

  redisClient.on("ready", () => {
    isConnected = true;
  });

  redisClient.on("error", (err) => {
    isConnected = false;
    logger.warn(`Redis connection warning: ${err.message}`);
  });

  redisClient.on("close", () => {
    isConnected = false;
  });

  // Attempt initial non-blocking connection
  redisClient.connect().catch((err) => {
    logger.warn(`Redis not available on startup: ${err.message}. Falling back to MongoDB.`);
  });
} catch (error: any) {
  logger.warn(`Failed to initialize Redis client: ${error.message}`);
}

export async function getCache<T = any>(key: string): Promise<T | null> {
  if (!redisClient || !isConnected) return null;
  try {
    const data = await redisClient.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (err: any) {
    logger.warn(`Redis getCache error for key ${key}: ${err.message}`);
    return null;
  }
}

export async function setCache(
  key: string,
  value: any,
  ttlSeconds: number = 3600
): Promise<void> {
  if (!redisClient || !isConnected) return;
  try {
    const serialized = JSON.stringify(value);
    await redisClient.set(key, serialized, "EX", ttlSeconds);
  } catch (err: any) {
    logger.warn(`Redis setCache error for key ${key}: ${err.message}`);
  }
}

export async function deleteCache(key: string): Promise<void> {
  if (!redisClient || !isConnected) return;
  try {
    await redisClient.del(key);
  } catch (err: any) {
    logger.warn(`Redis deleteCache error for key ${key}: ${err.message}`);
  }
}

export { redisClient };
