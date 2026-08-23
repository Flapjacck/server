import assert from "node:assert/strict";
import test from "node:test";
import request from "supertest";
import { createApp } from "../src/app";
import { OWS_API_SERVICE } from "../src/types";

test("GET /health returns the ows-api payload", async () => {
    const response = await request(createApp()).get("/health").expect(200);

    assert.equal(response.body.ok, true);
    assert.equal(response.body.service, OWS_API_SERVICE);
    assert.equal(typeof response.body.timestamp, "string");
    assert.ok(!Number.isNaN(Date.parse(response.body.timestamp)));
});

test("GET /strings is gone", async () => {
    await request(createApp()).get("/strings").expect(404);
});
