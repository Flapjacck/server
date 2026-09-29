import { checkJudgeRuntime, runSubmissionInDocker } from "./dockerRunner";
import type { JudgeTaskId } from "./taskRegistry";
import type { RunnerResult } from "./types";

type RunFn = (taskId: JudgeTaskId, source: string) => Promise<RunnerResult>;

let runOverride: RunFn | null = null;
let healthOverride: (() => Promise<{ docker: boolean; runnerImage: boolean }>) | null = null;

/** Test hook — replaces Docker runs with a stub. */
export function setSubmissionRunnerForTests(runFn: RunFn | null): void {
    runOverride = runFn;
}

export function setJudgeHealthCheckForTests(
    fn: (() => Promise<{ docker: boolean; runnerImage: boolean }>) | null,
): void {
    healthOverride = fn;
}

export async function runSubmission(
    taskId: JudgeTaskId,
    source: string,
): Promise<RunnerResult> {
    if (runOverride) {
        return runOverride(taskId, source);
    }
    return runSubmissionInDocker(taskId, source);
}

export async function judgeRuntimeHealth(): Promise<{ docker: boolean; runnerImage: boolean }> {
    if (healthOverride) {
        return healthOverride();
    }
    return checkJudgeRuntime();
}
