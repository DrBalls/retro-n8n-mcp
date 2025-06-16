export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export interface ILogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    context?: Record<string, unknown>;
}
export declare class Logger {
    private name;
    private static logLevel;
    private static logs;
    private static maxLogs;
    constructor(name: string);
    static setLogLevel(level: LogLevel): void;
    static getLogs(): ILogEntry[];
    static clearLogs(): void;
    private shouldLog;
    private log;
    debug(message: string, context?: Record<string, unknown>): void;
    info(message: string, context?: Record<string, unknown>): void;
    warn(message: string, context?: Record<string, unknown>): void;
    error(message: string, context?: Record<string, unknown>): void;
}
//# sourceMappingURL=Logger.d.ts.map