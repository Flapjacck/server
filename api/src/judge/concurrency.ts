import { config } from "../config";

type Waiter = {
    resolve: () => void;
    reject: (error: Error) => void;
    timer: ReturnType<typeof setTimeout>;
};

let active = 0;
const waitQueue: Waiter[] = [];

function releaseOne(): void {
    active -= 1;
    const next = waitQueue.shift();
    if (next) {
        clearTimeout(next.timer);
        active += 1;
        next.resolve();
    }
}

/** Limits parallel Docker judge runs across all clients. */
export async function acquireJudgeSlot(): Promise<() => void> {
    if (active < config.judge.maxConcurrent) {
        active += 1;
        return releaseOne;
    }

    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            const index = waitQueue.findIndex((w) => w.timer === timer);
            if (index >= 0) {
                waitQueue.splice(index, 1);
            }
            reject(new Error("judge_queue_timeout"));
        }, config.judge.queueTimeoutMs);

        waitQueue.push({
            resolve: () => resolve(releaseOne),
            reject,
            timer,
        });
    });
}
