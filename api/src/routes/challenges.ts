/**
 * challenges.ts
 *
 * Endpoints:
 *   POST /api/challenges/:challengeId/submit
 *     Accept Python code (pasted string in JSON body OR uploaded .py file)
 *     and run it against the challenge's test suite.
 *
 *   GET  /api/challenges/:challengeId/template
 *     Download the blank starter template for a challenge.
 *
 * Both endpoints require a valid X-API-Key header (handled by global middleware).
 */

import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { runTests } from "../services/testRunner.js";
import {
  getTemplateDownloadFileName,
  getTemplatePath,
} from "../services/templateManager.js";
import { uploadMiddleware } from "../middleware/fileUploadHandler.js";
import { logger } from "../logger.js";
import type { ErrorResponse } from "../types.js";

const router: Router = Router();

// ── POST /api/challenges/:challengeId/submit ──────────────────────────────────

/**
 * Wrap uploadMiddleware so we can handle multer errors gracefully and return
 * a proper JSON response instead of an Express HTML error page.
 */
function handleUpload(req: Request, res: Response, next: NextFunction): void {
  uploadMiddleware(req, res, (err) => {
    if (err) {
      res.status(400).json({
        error: "Bad Request",
        message: err.message,
        timestamp: new Date().toISOString(),
      } satisfies ErrorResponse);
      return;
    }
    next();
  });
}

router.post(
  "/:challengeId/submit",
  handleUpload,
  async (req: Request, res: Response): Promise<void> => {
    const { challengeId } = req.params;

    // ── Extract code from request ───────────────────────────────────────────
    let userCode: string | undefined;

    if (req.file) {
      // Multipart upload: read buffer as UTF-8 text
      userCode = req.file.buffer.toString("utf8");
    } else if (typeof req.body?.code === "string") {
      // JSON body: { "code": "..." }
      userCode = req.body.code;
    }

    if (!userCode || userCode.trim().length === 0) {
      res.status(400).json({
        error: "Bad Request",
        message:
          'No code provided. Send a .py file as "code" (multipart) or a JSON body { "code": "..." }.',
        timestamp: new Date().toISOString(),
      } satisfies ErrorResponse);
      return;
    }

    // ── Basic size guard (belt-and-suspenders alongside multer) ────────────
    if (userCode.length > 100 * 1024) {
      res.status(400).json({
        error: "Bad Request",
        message: "Submitted code exceeds the 100 KB limit.",
        timestamp: new Date().toISOString(),
      } satisfies ErrorResponse);
      return;
    }

    // ── Run tests ──────────────────────────────────────────────────────────
    try {
      const result = await runTests(challengeId, userCode);
      res.status(200).json(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";

      // Challenge not found → 404
      if (message.includes("Challenge not found")) {
        res.status(404).json({
          error: "Not Found",
          message,
          timestamp: new Date().toISOString(),
        } satisfies ErrorResponse);
        return;
      }

      logger.error({ challengeId, err }, "Unexpected error during submission");
      res.status(500).json({
        error: "Internal Server Error",
        message: "An error occurred while running your code.",
        timestamp: new Date().toISOString(),
      } satisfies ErrorResponse);
    }
  }
);

// ── GET /api/challenges/:challengeId/template ─────────────────────────────────

router.get("/:challengeId/template", async (req: Request, res: Response): Promise<void> => {
  const { challengeId } = req.params;

  try {
    const filePath = await getTemplatePath(challengeId);
    const fileName = getTemplateDownloadFileName(challengeId);

    // Stream the file as a download attachment
    res.setHeader("Content-Type", "text/x-python");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.sendFile(filePath);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";

    if (message.includes("Template not found")) {
      res.status(404).json({
        error: "Not Found",
        message,
        timestamp: new Date().toISOString(),
      } satisfies ErrorResponse);
      return;
    }

    logger.error({ challengeId, err }, "Error serving template");
    res.status(500).json({
      error: "Internal Server Error",
      message: "Could not retrieve template.",
      timestamp: new Date().toISOString(),
    } satisfies ErrorResponse);
  }
});

export default router;
