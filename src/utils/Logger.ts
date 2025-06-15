export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface ILogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
}

export class Logger {
  private name: string;
  private static logLevel: LogLevel = 'info';
  private static logs: ILogEntry[] = [];
  private static maxLogs = 1000;

  constructor(name: string) {
    this.name = name;
  }

  static setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  static getLogs(): ILogEntry[] {
    return [...this.logs];
  }

  static clearLogs(): void {
    this.logs = [];
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentIndex = levels.indexOf(Logger.logLevel);
    const targetIndex = levels.indexOf(level);
    return targetIndex >= currentIndex;
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: ILogEntry = {
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
    } else {
      logMethod(`[${entry.timestamp}] [${level.toUpperCase()}] ${entry.message}`);
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.log('error', message, context);
  }
}