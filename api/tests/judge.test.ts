import assert from "node:assert/strict";
import test from "node:test";
import request from "supertest";
import { createApp } from "../src/app";
import {
    setJudgeHealthCheckForTests,
    setSubmissionRunnerForTests,
} from "../src/judge/submissionRunner";

const TEST_KEY = "test-judge-key";

test.beforeEach(() => {
    process.env.JUDGE_API_KEYS = TEST_KEY;
    setSubmissionRunnerForTests(async () => ({ passed: 4, total: 4 }));
    setJudgeHealthCheckForTests(async () => ({ docker: true, runnerImage: true }));
});

test.afterEach(() => {
    setSubmissionRunnerForTests(null);
    setJudgeHealthCheckForTests(null);
    delete process.env.JUDGE_API_KEYS;
});

test("POST /judge/run rejects missing API key", async () => {
    await request(createApp())
        .post("/judge/run")
        .send({ task_id: "example_sum_of_evens", source: "pass" })
        .expect(401);
});

test("POST /judge/run rejects invalid task_id", async () => {
    await request(createApp())
        .post("/judge/run")
        .set("X-API-Key", TEST_KEY)
        .send({ task_id: "not_a_task", source: "x = 1" })
        .expect(400);
});

test("POST /judge/run returns pass counts without leaking test details", async () => {
    const response = await request(createApp())
        .post("/judge/run")
        .set("X-API-Key", TEST_KEY)
        .send({
            task_id: "example_sum_of_evens",
            source: "def sum_of_evens(numbers):\n    return 0\n",
        })
        .expect(200);

    assert.equal(response.body.ok, true);
    assert.equal(response.body.task_id, "example_sum_of_evens");
    assert.equal(response.body.passed, 4);
    assert.equal(response.body.total, 4);
    assert.equal(typeof response.body.duration_ms, "number");
    assert.equal(response.body.message, undefined);
    assert.equal(JSON.stringify(response.body).includes("assert"), false);
});

test("POST /judge/run reports failure counts from runner", async () => {
    setSubmissionRunnerForTests(async () => ({ passed: 1, total: 4 }));

    const response = await request(createApp())
        .post("/judge/run")
        .set("X-API-Key", TEST_KEY)
        .send({
            task_id: "example_sum_of_evens",
            source: "def sum_of_evens(numbers):\n    return 1\n",
        })
        .expect(200);

    assert.equal(response.body.ok, false);
    assert.equal(response.body.failed, 3);
});

test("GET /judge/tasks lists allowlisted ids only", async () => {
    const response = await request(createApp())
        .get("/judge/tasks")
        .set("X-API-Key", TEST_KEY)
        .expect(200);

    assert.deepEqual(response.body.tasks, ["example_sum_of_evens"]);
});

test("GET /judge/health reflects runtime probe", async () => {
    const response = await request(createApp())
        .get("/judge/health")
        .set("X-API-Key", TEST_KEY)
        .expect(200);

    assert.equal(response.body.ok, true);
    assert.equal(response.body.docker, true);
    assert.equal(response.body.runner_image, true);
});
