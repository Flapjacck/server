// API request context with authenticated state
export interface AuthenticatedRequest {
  apiKey?: string;
  isHealthCheck?: boolean;
}

// Health check response
export interface HealthResponse {
  status: "ok" | "error";
  timestamp: string;
  version: string;
  uptime: number;
}

// Generic error response
export interface ErrorResponse {
  error: string;
  message: string;
  timestamp: string;
  requestId?: string;
}

// Configuration
export interface Config {
  port: number;
  nodeEnv: "development" | "production" | "test";
  apiKeys: string[];
  logLevel: string;
}

// ── Challenge / Code-runner types ─────────────────────────────────────────────

/** Result for a single pytest test case */
export interface TestCaseResult {
  /** Human-readable test name (function name without "test_" prefix) */
  name: string;
  /** Whether this individual test passed */
  passed: boolean;
  /** Assertion failure message shown to the user (empty when passed) */
  message: string;
  /** Wall-clock time in seconds */
  durationSeconds: number;
}

/** Full response returned from POST /api/challenges/:id/submit */
export interface SubmissionResult {
  /** True only when every test case passed */
  allPassed: boolean;
  /** Total wall-clock time for the entire pytest run */
  totalDurationSeconds: number;
  /** Per-test breakdown */
  tests: TestCaseResult[];
  /** Top-level error when code could not even be run (syntax error, timeout, etc.) */
  executionError?: string;
}

/** Raw output captured from the pytest subprocess */
export interface RawExecutionResult {
  /** Parsed pytest-json-report object; null when pytest itself couldn't run */
  report: PytestReport | null;
  /** Anything written to stderr (import errors, syntax errors) */
  stderr: string;
  /** Process exit code */
  exitCode: number;
  /** True when killed due to timeout */
  timedOut: boolean;
}

/** Shape of the JSON file produced by pytest-json-report */
export interface PytestReport {
  exitcode: number;
  duration: number;
  summary: {
    passed?: number;
    failed?: number;
    error?: number;
    total?: number;
  };
  tests: PytestTestEntry[];
}

export interface PytestTestEntry {
  nodeid: string;
  outcome: "passed" | "failed" | "error";
  duration: number;
  call?: {
    longrepr?: string;
    crash?: { message: string; lineno?: number };
  };
  setup?: { longrepr?: string };
}
