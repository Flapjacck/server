import pino from "pino";
import pinoHttp from "pino-http";
import { getConfig } from "./config.js";

// Create logger instance with environment-specific configuration
function createLogger() {
  const config = getConfig();
  const isDevelopment = config.nodeEnv === "development";

  return pino({
    level: config.logLevel,
    transport: isDevelopment
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
            singleLine: false,
          },
        }
      : undefined,
    base: {
      service: "secure-api",
      environment: config.nodeEnv,
    },
  });
}

// Global logger instance
export const logger = createLogger();

// HTTP request logging middleware
export function createHttpLogger() {
  return pinoHttp(
    {
      logger,
      autoLogging: true,
    }
  );
}

// Child loggers for specific modules
export const authLogger = logger.child({ module: "auth" });
export const apiLogger = logger.child({ module: "api" });
export const serverLogger = logger.child({ module: "server" });
