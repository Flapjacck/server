import assert from "node:assert/strict";
import test from "node:test";
import request from "supertest";
import { createApp } from "../src/app";
import { setSubmissionRunnerForTests } from "../src/judge/submissionRunner";

const TEST_KEY = "integration-judge-key";
const RUN_INTEGRATION = process.env.JUDGE_INTEGRATION === "1";

test("judge docker integration", { skip: !RUN_INTEGRATION }, async () => {
    process.env.JUDGE_API_KEYS = TEST_KEY;
    setSubmissionRunnerForTests(null);

    const good = await request(createApp())
        .post("/judge/run")
        .set("X-API-Key", TEST_KEY)
        .send({
            task_id: "example_sum_of_evens",
            source: "def sum_of_evens(numbers):\n    return sum(n for n in numbers if n % 2 == 0)\n",
        })
        .expect(200);

    assert.equal(good.body.ok, true);
    assert.equal(good.body.passed, good.body.total);

    const bad = await request(createApp())
        .post("/judge/run")
        .set("X-API-Key", TEST_KEY)
        .send({
            task_id: "example_sum_of_evens",
            source: "def sum_of_evens(numbers):\n    return -1\n",
        })
        .expect(200);

    assert.equal(bad.body.ok, false);
    assert.ok(bad.body.failed >= 1);
});
