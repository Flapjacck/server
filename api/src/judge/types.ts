import type { JudgeTaskId } from "./taskRegistry";

export type JudgeRunRequest = {
    task_id: string;
    source: string;
};

export type JudgeRunResponse = {
    ok: boolean;
    task_id: JudgeTaskId;
    passed: number;
    total: number;
    failed?: number;
    duration_ms: number;
    error?: string;
    message?: string;
};

export type RunnerResult = {
    passed: number;
    total: number;
    error?: string;
};
