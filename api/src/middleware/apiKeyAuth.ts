import { Request, Response, NextFunction } from "express";
import { getConfig } from "../config.js";
import { authLogger } from "../logger.js";
import crypto from "crypto";

// Constant-time string comparison to prevent timing attacks
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

// Middleware to validate API key from X-API-Key header
export function apiKeyAuth(req: Request, res: Response, next: NextFunction): void {
  // Skip authentication for health checks
  if (req.path === "/health") {
    next();
    return;
  }

  const config = getConfig();
  const apiKeyHeader = req.headers["x-api-key"];

  // Validate header exists
  if (!apiKeyHeader || typeof apiKeyHeader !== "string") {
    authLogger.warn({ path: req.path, ip: req.ip }, "Missing API key");
    res.status(401).json({
      error: "Unauthorized",
      message: "Missing X-API-Key header",
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Validate key against configured keys using constant-time comparison
  const keyIsValid = config.apiKeys.some((configKey) =>
    constantTimeEqual(apiKeyHeader, configKey)
  );

  if (!keyIsValid) {
    authLogger.warn(
      { path: req.path, ip: req.ip, keyLength: apiKeyHeader.length },
      "Invalid API key"
    );
    res.status(401).json({
      error: "Unauthorized",
      message: "Invalid API key",
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Store authenticated state on request object
  (req as any).authenticated = true;
  (req as any).apiKey = apiKeyHeader;

  authLogger.debug({ path: req.path, ip: req.ip }, "API key validated");
  next();
}
