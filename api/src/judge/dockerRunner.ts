import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import Docker from "dockerode";
import { config } from "../config";
import type { JudgeTaskId } from "./taskRegistry";
import type { RunnerResult } from "./types";

const docker = new Docker({ socketPath: "/var/run/docker.sock" });

const RUNNER_ENTRYPOINT = ["python", "/opt/run_tests.py"];

/** Docker multiplexes stdout/stderr with 8-byte frame headers. */
function demuxDockerLogs(buffer: Buffer): string {
    let offset = 0;
    let text = "";

    while (offset + 8 <= buffer.length) {
        const frameSize = buffer.readUInt32BE(offset + 4);
        offset += 8;
        text += buffer.subarray(offset, offset + frameSize).toString("utf8");
        offset += frameSize;
    }

    return text;
}

function parseRunnerStdout(raw: string): RunnerResult {
    const line = raw
        .split("\n")
        .map((part) => part.trim())
        .filter(Boolean)
        .at(-1);

    if (!line) {
        return { passed: 0, total: 0, error: "runner_no_output" };
    }

    try {
        const parsed = JSON.parse(line) as RunnerResult;
        if (typeof parsed.passed !== "number" || typeof parsed.total !== "number") {
            return { passed: 0, total: 0, error: "runner_invalid_json" };
        }
        return parsed;
    } catch {
        return { passed: 0, total: 0, error: "runner_invalid_json" };
    }
}

async function pullImageIfMissing(image: string): Promise<void> {
    try {
        await docker.getImage(image).inspect();
    } catch {
        await new Promise<void>((resolve, reject) => {
            docker.pull(image, (err: Error | null, stream: NodeJS.ReadableStream) => {
                if (err) {
                    reject(err);
                    return;
                }
                docker.modem.followProgress(stream, (pullErr) => {
                    if (pullErr) {
                        reject(pullErr);
                        return;
                    }
                    resolve();
                });
            });
        });
    }
}

export async function runSubmissionInDocker(
    taskId: JudgeTaskId,
    source: string,
): Promise<RunnerResult> {
    const workDir = await mkdtemp(join("/tmp/judge-submissions", "ows-judge-"));
    const submissionPath = join(workDir, "user.py");

    try {
        await writeFile(submissionPath, source, "utf8");
        await pullImageIfMissing(config.judge.runnerImage);

        const container = await docker.createContainer({
            Image: config.judge.runnerImage,
            Cmd: [...RUNNER_ENTRYPOINT, taskId],
            HostConfig: {
                AutoRemove: true,
                NetworkMode: "none",
                ReadonlyRootfs: true,
                Tmpfs: { "/tmp": "rw,noexec,nosuid,size=67108864" },
                Memory: config.judge.memoryBytes,
                NanoCpus: Math.floor(config.judge.cpus * 1e9),
                PidsLimit: config.judge.pidsLimit,
                CapDrop: ["ALL"],
                Binds: [`${submissionPath}:/submission/user.py:ro`],
            },
            User: "1000:1000",
        });

        await container.start();

        let timedOut = false;
        const waitResult = await Promise.race([
            container.wait(),
            new Promise<{ StatusCode: number }>((resolve) => {
                setTimeout(() => {
                    timedOut = true;
                    void container.kill().catch(() => undefined);
                    resolve({ StatusCode: 124 });
                }, config.judge.runTimeoutMs);
            }),
        ]);

        const logs = await container.logs({
            stdout: true,
            stderr: true,
            follow: false,
        });

        const stdout = Buffer.isBuffer(logs) ? demuxDockerLogs(logs) : String(logs);
        const parsed = parseRunnerStdout(stdout);

        if (timedOut) {
            return { passed: 0, total: 0, error: "run_timeout" };
        }

        if (waitResult.StatusCode !== 0 && parsed.total === 0 && !parsed.error) {
            return { passed: 0, total: 0, error: "runner_failed" };
        }

        return parsed;
    } catch (error) {
        return { passed: 0, total: 0, error: "runner_error" };
    } finally {
        await rm(workDir, { recursive: true, force: true });
    }
}

/** Ping Docker and verify the runner image exists (for /judge/health). */
export async function checkJudgeRuntime(): Promise<{ docker: boolean; runnerImage: boolean }> {
    let dockerOk = false;
    let runnerOk = false;

    try {
        await docker.ping();
        dockerOk = true;
    } catch {
        dockerOk = false;
    }

    if (dockerOk) {
        try {
            await docker.getImage(config.judge.runnerImage).inspect();
            runnerOk = true;
        } catch {
            runnerOk = false;
        }
    }

    return { docker: dockerOk, runnerImage: runnerOk };
}
