import express, { Express, Request, Response, NextFunction } from "express";
import compression from "compression";
import { createHttpLogger, logger } from "./logger.js";
import { apiKeyAuth } from "./middleware/apiKeyAuth.js";
import healthRoutes from "./routes/health.js";
import type { ErrorResponse } from "./types.js";

export function createApp(): Express {
  const app = express();

  // Trust proxy headers from Nginx
  app.set("trust proxy", 1);

  // Middleware: Request logging (skips health checks)
  app.use(createHttpLogger());

  // Middleware: Compression
  app.use(compression());

  // Middleware: JSON body parsing
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));

  // Middleware: CORS - configure based on environment
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Set CORS headers
    res.header("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "http://localhost");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, X-API-Key");
    res.header("Access-Control-Max-Age", "86400");

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }

    next();
  });

  // Routes: Health check (no auth required)
  app.use("/health", healthRoutes);

  // Middleware: API key authentication (applied to all routes except health)
  app.use(apiKeyAuth);

  // Routes: API routes (authenticated)
  app.get("/api/status", (req: Request, res: Response): void => {
    res.status(200).json({
      message: "API is running",
      timestamp: new Date().toISOString(),
    });
  });

  // 404 handler
  app.use((req: Request, res: Response): void => {
    const errorResponse: ErrorResponse = {
      error: "Not Found",
      message: `Route ${req.method} ${req.path} not found`,
      timestamp: new Date().toISOString(),
    };

    res.status(404).json(errorResponse);
  });

  // Global error handler
  app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
    logger.error({ error: err }, "Unhandled error");

    const errorResponse: ErrorResponse = {
      error: "Internal Server Error",
      message: process.env.NODE_ENV === "production" ? "An error occurred" : err.message,
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(errorResponse);
  });

  return app;
}
