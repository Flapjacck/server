/** Allowlisted task ids — must match hidden test modules in the runner image. */
export const JUDGE_TASK_IDS = ["example_sum_of_evens"] as const;

export type JudgeTaskId = (typeof JUDGE_TASK_IDS)[number];

export function isJudgeTaskId(value: string): value is JudgeTaskId {
    return (JUDGE_TASK_IDS as readonly string[]).includes(value);
}
