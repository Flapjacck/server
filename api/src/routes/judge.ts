import express from "express";
import { acquireJudgeSlot } from "../judge/concurrency";
import { judgeRuntimeHealth, runSubmission } from "../judge/submissionRunner";
import { JUDGE_TASK_IDS, isJudgeTaskId } from "../judge/taskRegistry";
import type { JudgeRunResponse } from "../judge/types";
import { apiKeyAuth } from "../middleware/apiKeyAuth";
import { judgeRateLimit } from "../middleware/judgeRateLimit";
import { config } from "../config";

const JUDGE_JSON_LIMIT = "128kb";

export const judgeRouter = express.Router();

judgeRouter.use(apiKeyAuth);
judgeRouter.use(judgeRateLimit);

judgeRouter.get("/health", async (_req, res) => {
    const runtime = await judgeRuntimeHealth();
    const ok = runtime.docker && runtime.runnerImage;
    res.status(ok ? 200 : 503).json({
        ok,
        docker: runtime.docker,
        runner_image: runtime.runnerImage,
        image: config.judge.runnerImage,
    });
});

judgeRouter.get("/tasks", (_req, res) => {
    res.json({ ok: true, tasks: [...JUDGE_TASK_IDS] });
});

judgeRouter.post("/run", express.json({ limit: JUDGE_JSON_LIMIT }), async (req, res) => {
    const started = Date.now();
    const body = req.body as { task_id?: unknown; source?: unknown };

    if (typeof body.task_id !== "string" || !isJudgeTaskId(body.task_id)) {
        res.status(400).json({
            ok: false,
            error: "invalid_task_id",
            message: "Unknown or missing task_id",
        });
        return;
    }

    if (typeof body.source !== "string") {
        res.status(400).json({
            ok: false,
            error: "invalid_source",
            message: "source must be a string",
        });
        return;
    }

    if (body.source.includes("\0")) {
        res.status(400).json({
            ok: false,
            error: "invalid_source",
            message: "source contains invalid characters",
        });
        return;
    }

    const sourceBytes = Buffer.byteLength(body.source, "utf8");
    if (sourceBytes === 0 || sourceBytes > config.judge.maxSourceBytes) {
        res.status(400).json({
            ok: false,
            error: "invalid_source",
            message: "source is empty or too large",
        });
        return;
    }

    let release: (() => void) | undefined;
    try {
        release = await acquireJudgeSlot();
    } catch (error) {
        if (error instanceof Error && error.message === "judge_queue_timeout") {
            res.setHeader("Retry-After", "5");
            res.status(429).json({
                ok: false,
                error: "busy",
                message: "Judge is at capacity; try again shortly",
            });
            return;
        }
        res.status(503).json({
            ok: false,
            error: "judge_unavailable",
            message: "Could not acquire a judge slot",
        });
        return;
    }

    try {
        const result = await runSubmission(body.task_id, body.source);
        const duration_ms = Date.now() - started;

        if (result.error && result.total === 0) {
            const response: JudgeRunResponse = {
                ok: false,
                task_id: body.task_id,
                passed: 0,
                total: 0,
                duration_ms,
                error: result.error,
                message: "Run failed before tests completed",
            };
            res.status(503).json(response);
            return;
        }

        const failed = Math.max(result.total - result.passed, 0);
        const response: JudgeRunResponse = {
            ok: result.passed === result.total && result.total > 0,
            task_id: body.task_id,
            passed: result.passed,
            total: result.total,
            duration_ms,
        };
        if (failed > 0) {
            response.failed = failed;
        }
        res.status(200).json(response);
    } finally {
        release?.();
    }
});
