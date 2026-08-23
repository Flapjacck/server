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

export const config = {
    port: parsePort(process.env.PORT),
};
