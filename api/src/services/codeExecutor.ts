/**
 * codeExecutor.ts
 *
 * Runs user-submitted Python code against a challenge's pytest test file.
 * Execution happens in a temporary directory that is cleaned up after each
 * run, keeping the main filesystem tidy.
 *
 * Security notes:
 *   - Code runs with the same OS user as the Node process (nodejs in Docker).
 *   - pytest-timeout kills test cases that exceed TIMEOUT_SECONDS.
 *   - The subprocess itself is killed if it exceeds SUBPROCESS_TIMEOUT_MS.
 *   - No network calls are made inside the test environment.
 */

import { spawn } from "child_process";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { randomUUID } from "crypto";
import { logger } from "../logger.js";
import type { RawExecutionResult } from "../types.js";

// ── Constants ─────────────────────────────────────────────────────────────────

/** Per-test timeout passed to pytest-timeout (seconds) */
const TIMEOUT_SECONDS = 10;

/** Hard cap on the subprocess wall clock (ms) before we SIGKILL it */
const SUBPROCESS_TIMEOUT_MS = 15_000;

/** Max bytes we will buffer from stderr before truncating */
const MAX_STDERR_BYTES = 8_192;

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Locate the challenge test file on disk.
 * We resolve relative to this file's location so it works whether the code is
 * running from `src/` (tsx dev) or `dist/` (compiled).
 *
 * In Docker the layout is:
 *   /app/tests/challenges/<challengeId>_test.py
 *   /app/templates/challenges/<qN>.py  (see challenges/registry.ts)
 *
 * In local dev (running from api/):
 *   api/tests/challenges/<challengeId>_test.py
 */
function resolveTestFilePath(challengeId: string): string {
  // Normalize: allow both "merge-two-sorted-lists" and "merge_two_sorted_lists"
  const normalized = challengeId.replace(/-/g, "_");
  // __dirname is unavailable in ESM; walk up two levels from this file
  const base = path.resolve(new URL(import.meta.url).pathname, "../../..");
  return path.join(base, "tests", "challenges", `${normalized}_test.py`);
}

/**
 * Spawn python3 -m pytest inside `workDir` and collect results.
 * Returns the raw stdout, stderr, exit code, and a timedOut flag.
 */
async function runPytest(
  workDir: string,
  reportPath: string
): Promise<{ stdout: string; stderr: string; exitCode: number; timedOut: boolean }> {
  return new Promise((resolve) => {
    const args = [
      "-m",
      "pytest",
      "test_challenge.py",
      // Structured JSON report for machine parsing
      "--json-report",
      `--json-report-file=${reportPath}`,
      // Short traceback in the JSON report (still human-readable)
      "--tb=short",
      // Per-test timeout via pytest-timeout plugin
      `--timeout=${TIMEOUT_SECONDS}`,
      // Verbose names in the report
      "-v",
      // Don't write .pyc files into the temp dir
      "-p",
      "no:cacheprovider",
    ];

    const proc = spawn("python3", args, {
      cwd: workDir,
      // Prevent user code from inheriting env vars that could leak secrets
      env: {
        PATH: process.env.PATH,
        HOME: process.env.HOME,
        PYTHONPATH: workDir,
        // Disable bytecode caching
        PYTHONDONTWRITEBYTECODE: "1",
      },
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    proc.stdout.on("data", (d: Buffer) => {
      stdout += d.toString();
    });

    proc.stderr.on("data", (d: Buffer) => {
      if (stderr.length < MAX_STDERR_BYTES) {
        stderr += d.toString();
      }
    });

    // Hard kill if the whole process takes too long
    const killer = setTimeout(() => {
      timedOut = true;
      proc.kill("SIGKILL");
    }, SUBPROCESS_TIMEOUT_MS);

    proc.on("close", (code) => {
      clearTimeout(killer);
      resolve({ stdout, stderr, exitCode: code ?? 1, timedOut });
    });
  });
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Execute `userCode` against the test suite for `challengeId`.
 *
 * @param challengeId  Slug matching the test file name, e.g. "merge_two_sorted_lists"
 * @param userCode     Raw Python source submitted by the user
 * @returns            RawExecutionResult for the parser layer to interpret
 */
export async function executeCode(
  challengeId: string,
  userCode: string
): Promise<RawExecutionResult> {
  const testFilePath = resolveTestFilePath(challengeId);

  // Verify the test file exists before touching the filesystem
  try {
    await fs.access(testFilePath);
  } catch {
    throw new Error(`Challenge not found: "${challengeId}"`);
  }

  // Create an isolated temp directory for this submission
  const submissionId = randomUUID();
  const tmpDir = path.join(os.tmpdir(), `submission_${submissionId}`);
  await fs.mkdir(tmpDir, { recursive: true });

  logger.debug({ challengeId, submissionId }, "Starting code execution");

  try {
    // Write the user's code as solution.py so test files can `from solution import ...`
    await fs.writeFile(path.join(tmpDir, "solution.py"), userCode, "utf8");

    // Copy the challenge test file into the same directory
    await fs.copyFile(testFilePath, path.join(tmpDir, "test_challenge.py"));

    const reportPath = path.join(tmpDir, "report.json");
    const { stderr, exitCode, timedOut } = await runPytest(tmpDir, reportPath);

    if (timedOut) {
      logger.warn({ challengeId, submissionId }, "Submission timed out");
      return { report: null, stderr, exitCode, timedOut: true };
    }

    // Attempt to read the JSON report; pytest may not have written it on hard errors
    let report = null;
    try {
      const raw = await fs.readFile(reportPath, "utf8");
      report = JSON.parse(raw);
    } catch {
      // Report file missing → syntax error or import failure; stderr has the details
      logger.debug({ challengeId, submissionId }, "No pytest report generated");
    }

    logger.debug({ challengeId, submissionId, exitCode }, "Code execution finished");
    return { report, stderr, exitCode, timedOut: false };
  } finally {
    // Always clean up, even on errors
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {
      // Non-fatal – OS will clean /tmp eventually
    });
  }
}
