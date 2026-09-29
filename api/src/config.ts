const DEFAULT_PORT = 3000;
const MIN_PORT = 1;
const MAX_PORT = 65535;

function parsePort(raw: string | undefined): number {
    const port = Number(raw);

    // Non-numeric PORT would become NaN and crash listen().
    if (!Number.isInteger(port) || port < MIN_PORT || port > MAX_PORT) {
        return DEFAULT_PORT;
    }

    return port;
}

function parsePositiveInt(raw: string | undefined, fallback: number): number {
    const value = Number(raw);
    if (!Number.isInteger(value) || value < 1) {
        return fallback;
    }
    return value;
}

function parseApiKeys(raw: string | undefined): string[] {
    if (!raw?.trim()) {
        return [];
    }
    return raw
        .split(",")
        .map((key) => key.trim())
        .filter((key) => key.length > 0);
}

export type JudgeConfig = {
    apiKeys: string[];
    runnerImage: string;
    maxConcurrent: number;
    runTimeoutMs: number;
    rateLimitPerMin: number;
    maxSourceBytes: number;
    queueTimeoutMs: number;
    memoryBytes: number;
    pidsLimit: number;
    cpus: number;
};

function buildJudgeConfig(): JudgeConfig {
    return {
        apiKeys: parseApiKeys(process.env.JUDGE_API_KEYS),
        runnerImage: process.env.JUDGE_RUNNER_IMAGE?.trim() || "ows-judge-runner:local",
        maxConcurrent: parsePositiveInt(process.env.JUDGE_MAX_CONCURRENT, 8),
        runTimeoutMs: parsePositiveInt(process.env.JUDGE_RUN_TIMEOUT_MS, 8000),
        rateLimitPerMin: parsePositiveInt(process.env.JUDGE_RATE_LIMIT_PER_MIN, 20),
        maxSourceBytes: parsePositiveInt(process.env.JUDGE_MAX_SOURCE_BYTES, 65536),
        queueTimeoutMs: parsePositiveInt(process.env.JUDGE_QUEUE_TIMEOUT_MS, 30_000),
        memoryBytes: parsePositiveInt(process.env.JUDGE_MEMORY_MB, 256) * 1024 * 1024,
        pidsLimit: parsePositiveInt(process.env.JUDGE_PIDS_LIMIT, 64),
        cpus: Number(process.env.JUDGE_CPUS) > 0 ? Number(process.env.JUDGE_CPUS) : 1,
    };
}

export const config = {
    port: parsePort(process.env.PORT),
    get judge(): JudgeConfig {
        return buildJudgeConfig();
    },
};
