import { Router } from "express";
import type { Request, Response, Router as IRouter } from "express";
import type { HealthResponse } from "../types.js";
import { apiLogger } from "../logger.js";

const router: IRouter = Router();
const startTime = Date.now();

/**
 * GET /health
 * Returns health status of the API
 * Accessible without authentication for monitoring
 */
router.get("/", (req: Request, res: Response): void => {
  const uptime = (Date.now() - startTime) / 1000; // uptime in seconds

  const response: HealthResponse = {
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    uptime,
  };

  apiLogger.debug("Health check requested");
  res.status(200).json(response);
});

export default router;
