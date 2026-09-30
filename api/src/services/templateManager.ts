/**
 * templateManager.ts
 *
 * Resolves the filesystem path of a blank starter template for a given
 * challenge so the HTTP route can stream it as a file download.
 */

import fs from "fs/promises";
import path from "path";

// ── Path resolution ───────────────────────────────────────────────────────────

/**
 * Return the absolute path of the blank .py template for a challenge.
 * Accepts both hyphen-separated ("merge-two-sorted-lists") and
 * underscore-separated ("merge_two_sorted_lists") slugs.
 *
 * Layout (same in dev and Docker):
 *   api/templates/challenges/<challengeId>.py
 */
function resolveTemplatePath(challengeId: string): string {
  const normalized = challengeId.replace(/-/g, "_");
  const base = path.resolve(new URL(import.meta.url).pathname, "../../..");
  return path.join(base, "templates", "challenges", `${normalized}.py`);
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Verify the template exists and return its absolute path.
 *
 * @throws {Error} when no template is found for the given challengeId.
 *                 The route converts this to a 404.
 */
export async function getTemplatePath(challengeId: string): Promise<string> {
  const filePath = resolveTemplatePath(challengeId);

  try {
    await fs.access(filePath);
  } catch {
    throw new Error(`Template not found for challenge: "${challengeId}"`);
  }

  return filePath;
}

/**
 * Read and return the raw source of a template file.
 * Useful for JSON API responses that embed the template text inline.
 */
export async function getTemplateContent(challengeId: string): Promise<string> {
  const filePath = await getTemplatePath(challengeId);
  return fs.readFile(filePath, "utf8");
}
