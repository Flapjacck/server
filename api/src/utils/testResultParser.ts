/**
 * testResultParser.ts
 *
 * Converts the raw JSON report produced by pytest-json-report into the
 * user-facing SubmissionResult shape. Keeps the logic decoupled from I/O so
 * it can be unit-tested independently.
 */

import type {
  PytestReport,
  PytestTestEntry,
  RawExecutionResult,
  SubmissionResult,
  TestCaseResult,
} from "../types.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Turn a pytest nodeId like "test_challenge.py::test_example_1" into a
 * readable label like "example 1".
 */
function formatTestName(nodeId: string): string {
  // Extract just the function name part after "::"
  const parts = nodeId.split("::");
  const fnName = parts[parts.length - 1] ?? nodeId;
  // Strip leading "test_" and replace underscores with spaces
  return fnName.replace(/^test_/, "").replace(/_/g, " ");
}

/**
 * Extract a short, user-friendly failure message from a pytest test entry.
 * We show the crash message when available, falling back to the first few
 * lines of longrepr (the full traceback). We intentionally hide internal
 * framework lines.
 */
function extractFailureMessage(entry: PytestTestEntry): string {
  // Prefer the compact crash message
  const crash =
    entry.call?.crash?.message ?? entry.setup?.longrepr ?? entry.call?.longrepr;
  if (!crash) return "Test failed";

  // Keep only the first 3 non-blank lines to avoid overwhelming the user
  const lines = crash
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .slice(0, 3);

  return lines.join(" | ");
}

/** Map a single pytest entry to our TestCaseResult shape */
function parseTestEntry(entry: PytestTestEntry): TestCaseResult {
  const passed = entry.outcome === "passed";
  return {
    name: formatTestName(entry.nodeid),
    passed,
    message: passed ? "" : extractFailureMessage(entry),
    durationSeconds: Math.round(entry.duration * 1000) / 1000,
  };
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Convert a RawExecutionResult (from codeExecutor) into a SubmissionResult
 * that the HTTP route returns to the caller.
 */
export function parseExecutionResult(raw: RawExecutionResult): SubmissionResult {
  // ── Hard failures: timed out or subprocess couldn't start ──────────────────
  if (raw.timedOut) {
    return {
      allPassed: false,
      totalDurationSeconds: 0,
      tests: [],
      executionError: "Code execution exceeded the time limit (10 s). Check for infinite loops.",
    };
  }

  if (!raw.report) {
    // Pytest itself failed to start – typically a syntax error in the
    // submitted code. Grab the first meaningful lines of stderr.
    const errorLines = raw.stderr
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
      .slice(0, 6)
      .join("\n");

    return {
      allPassed: false,
      totalDurationSeconds: 0,
      tests: [],
      executionError: errorLines || "An unknown error occurred while running your code.",
    };
  }

  // ── Normal pytest output ───────────────────────────────────────────────────
  const report: PytestReport = raw.report;
  const tests = report.tests.map(parseTestEntry);
  const allPassed = tests.every((t) => t.passed);

  return {
    allPassed,
    totalDurationSeconds: Math.round(report.duration * 1000) / 1000,
    tests,
  };
}
