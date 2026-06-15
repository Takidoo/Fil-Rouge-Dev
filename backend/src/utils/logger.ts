type LogLevel = "info" | "warn" | "error";

const write = (level: LogLevel, scope: string, message: string, ...args: unknown[]) => {
    const line = `[${new Date().toISOString()}] [${scope}] ${message}`;
    console[level](line, ...args);
};

export function createLogger(scope: string) {
    return {
        info: (message: string, ...args: unknown[]) => write("info", scope, message, ...args),
        warn: (message: string, ...args: unknown[]) => write("warn", scope, message, ...args),
        error: (message: string, ...args: unknown[]) => write("error", scope, message, ...args),
    };
}
