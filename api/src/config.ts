export function requireEnv(name: string): string {
    const value = process.env[name]?.trim();

    if (!value) {
        throw new Error(`${name} is required`);
    }

    return value;
}

export const config = {
    port: Number(process.env.PORT) || 3000,
    apiKey: requireEnv("API_KEY"),
};
