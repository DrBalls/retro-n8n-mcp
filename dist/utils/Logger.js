export class Logger {
    name;
    static logLevel = 'info';
    static logs = [];
    static maxLogs = 1000;
    constructor(name) {
        this.name = name;
    }
    static setLogLevel(level) {
        this.logLevel = level;
    }
    static getLogs() {
        return [...this.logs];
    }
    static clearLogs() {
        this.logs = [];
    }
    shouldLog(level) {
        const levels = ['debug', 'info', 'warn', 'error'];
        const currentIndex = levels.indexOf(Logger.logLevel);
        const targetIndex = levels.indexOf(level);
        return targetIndex >= currentIndex;
    }
    log(level, message, context) {
        if (!this.shouldLog(level)) {
            return;
        }
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            message: `[${this.name}] ${message}`,
            context
        };
        // Add to internal log buffer
        Logger.logs.push(entry);
        if (Logger.logs.length > Logger.maxLogs) {
            Logger.logs.shift();
        }
        // Output to console
        const logMethod = level === 'error' ? console.error :
            level === 'warn' ? console.warn :
                level === 'debug' ? console.debug :
                    console.log;
        if (context && Object.keys(context).length > 0) {
            logMethod(`[${entry.timestamp}] [${level.toUpperCase()}] ${entry.message}`, context);
        }
        else {
            logMethod(`[${entry.timestamp}] [${level.toUpperCase()}] ${entry.message}`);
        }
    }
    debug(message, context) {
        this.log('debug', message, context);
    }
    info(message, context) {
        this.log('info', message, context);
    }
    warn(message, context) {
        this.log('warn', message, context);
    }
    error(message, context) {
        this.log('error', message, context);
    }
}
//# sourceMappingURL=Logger.js.map