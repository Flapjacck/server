import type { Config } from "./types.js";

// Load configuration from environment variables with validation
export function loadConfig(): Config {
  const nodeEnv = (process.env.NODE_ENV || "development") as
    | "development"
    | "production"
    | "test";

  const port = parseInt(process.env.PORT || "3000", 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT: ${process.env.PORT}`);
  }

  // API keys are comma-separated in environment variable
  const apiKeysEnv = process.env.API_KEYS || "";
  if (!apiKeysEnv && nodeEnv !== "test") {
    throw new Error("API_KEYS environment variable is required");
  }

  const apiKeys = apiKeysEnv
    .split(",")
    .map((key) => key.trim())
    .filter((key) => key.length > 0);

  const logLevel = process.env.LOG_LEVEL || (nodeEnv === "production" ? "info" : "debug");

  return {
    port,
    nodeEnv,
    apiKeys,
    logLevel,
  };
}

// Create global config instance
let cachedConfig: Config | null = null;

export function getConfig(): Config {
  if (!cachedConfig) {
    cachedConfig = loadConfig();
  }
  return cachedConfig;
}
