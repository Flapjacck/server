/**
 * fileUploadHandler.ts
 *
 * Multer configuration for accepting Python file uploads on the submission
 * endpoint. Files are held in memory (never written to disk by multer itself)
 * so we can hand the buffer straight to the code executor.
 *
 * Limits:
 *   - 100 KB max file size – sufficient for any reasonable solution
 *   - Only one file per request (field name: "code")
 *   - Only .py files accepted by extension check
 */

import multer, { type Multer } from "multer";
import type { Request, RequestHandler } from "express";

const MAX_FILE_SIZE_BYTES = 100 * 1024; // 100 KB

/** Reject anything that isn't a .py file */
function pyFileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void {
  if (!file.originalname.endsWith(".py")) {
    cb(new Error("Only .py files are accepted"));
    return;
  }
  cb(null, true);
}

const upload: Multer = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: pyFileFilter,
});

// Explicitly typed to avoid "cannot be named without reference" TS2742 error
export const uploadMiddleware: RequestHandler = upload.single("code") as RequestHandler;
