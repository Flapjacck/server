/**
 * testRunner.ts
 *
 * Thin orchestration layer between the HTTP route and the low-level
 * codeExecutor. Validates that a challenge exists, runs the code, and hands
 * the raw result to the parser.
 */

import { executeCode } from "./codeExecutor.js";
import { parseExecutionResult } from "../utils/testResultParser.js";
import { logger } from "../logger.js";
import type { SubmissionResult } from "../types.js";

/**
 * Run the user's code against the challenge test suite.
 *
 * @throws {Error}  When the challengeId doesn't correspond to a known test file.
 *                  The HTTP route converts this to a 404.
 */
export async function runTests(
  challengeId: string,
  userCode: string
): Promise<SubmissionResult> {
  logger.info({ challengeId }, "Running submission");

  // executeCode throws if the challenge test file doesn't exist
  const rawResult = await executeCode(challengeId, userCode);
  const result = parseExecutionResult(rawResult);

  logger.info(
    { challengeId, allPassed: result.allPassed, testCount: result.tests.length },
    "Submission complete"
  );

  return result;
}
