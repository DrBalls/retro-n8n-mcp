/**
 * Telemetry tracer implementation
 */

import { ITelemetryTracer, ITelemetrySpan } from '../../types/monitoring.js';
import { EventEmitter } from 'events';

/**
 * Span implementation
 */
class TelemetrySpan implements ITelemetrySpan {
  public endTime?: Date;
  public duration?: number;
  public status: 'ok' | 'error' = 'ok';
  public attributes: Record<string, any> = {};
  public events: Array<{
    name: string;
    timestamp: Date;
    attributes?: Record<string, any>;
  }> = [];

  constructor(
    public traceId: string,
    public spanId: string,
    public operation: string,
    public startTime: Date,
    public parentSpanId?: string
  ) {}

  end(): void {
    if (!this.endTime) {
      this.endTime = new Date();
      this.duration = this.endTime.getTime() - this.startTime.getTime();
    }
  }
}

/**
 * Trace context for managing active spans
 */
class TraceContext {
  private activeSpans: Map<string, TelemetrySpan> = new Map();
  private spanStack: TelemetrySpan[] = [];

  setActiveSpan(span: TelemetrySpan): void {
    this.activeSpans.set(span.spanId, span);
    this.spanStack.push(span);
  }

  getActiveSpan(): TelemetrySpan | undefined {
    return this.spanStack[this.spanStack.length - 1];
  }

  removeSpan(spanId: string): void {
    this.activeSpans.delete(spanId);
    this.spanStack = this.spanStack.filter(s => s.spanId !== spanId);
  }

  getSpan(spanId: string): TelemetrySpan | undefined {
    return this.activeSpans.get(spanId);
  }

  getAllSpans(): TelemetrySpan[] {
    return Array.from(this.activeSpans.values());
  }
}

/**
 * Telemetry exporter interface
 */
interface ITelemetryExporter {
  export(spans: ITelemetrySpan[]): Promise<void>;
}

/**
 * Console exporter for development
 */
class ConsoleExporter implements ITelemetryExporter {
  async export(spans: ITelemetrySpan[]): Promise<void> {
    spans.forEach(span => {
      console.error('Telemetry Span:', {
        traceId: span.traceId,
        spanId: span.spanId,
        operation: span.operation,
        duration: span.duration,
        status: span.status,
        attributes: span.attributes
      });
    });
  }
}

/**
 * In-memory exporter for testing
 */
class InMemoryExporter implements ITelemetryExporter {
  private spans: ITelemetrySpan[] = [];

  async export(spans: ITelemetrySpan[]): Promise<void> {
    this.spans.push(...spans);
  }

  getSpans(): ITelemetrySpan[] {
    return [...this.spans];
  }

  clear(): void {
    this.spans = [];
  }
}

/**
 * Telemetry tracer implementation
 */
export class TelemetryTracer extends EventEmitter implements ITelemetryTracer {
  private context: TraceContext;
  private exporter: ITelemetryExporter;
  private batchSize: number = 100;
  private exportInterval: number = 5000; // 5 seconds
  private pendingSpans: ITelemetrySpan[] = [];
  private exportTimer?: NodeJS.Timeout;
  private serviceName: string;

  constructor(config?: {
    exporter?: 'console' | 'memory' | ITelemetryExporter;
    serviceName?: string;
    batchSize?: number;
    exportInterval?: number;
  }) {
    super();
    this.context = new TraceContext();
    this.serviceName = config?.serviceName || 'n8n-mcp-server';
    
    // Set up exporter
    if (!config?.exporter || config.exporter === 'console') {
      this.exporter = new ConsoleExporter();
    } else if (config.exporter === 'memory') {
      this.exporter = new InMemoryExporter();
    } else {
      this.exporter = config.exporter;
    }

    if (config?.batchSize) {
      this.batchSize = config.batchSize;
    }
    if (config?.exportInterval) {
      this.exportInterval = config.exportInterval;
    }

    // Start export timer
    this.startExportTimer();
  }

  startSpan(operation: string, parentSpan?: ITelemetrySpan): ITelemetrySpan {
    const traceId = parentSpan?.traceId || this.generateTraceId();
    const spanId = this.generateSpanId();
    const parentSpanId = parentSpan?.spanId;

    const span = new TelemetrySpan(
      traceId,
      spanId,
      operation,
      new Date(),
      parentSpanId
    );

    // Add default attributes
    span.attributes = {
      'service.name': this.serviceName,
      'span.kind': parentSpanId ? 'internal' : 'server'
    };

    this.context.setActiveSpan(span);
    this.emit('span:start', span);

    return span;
  }

  endSpan(span: ITelemetrySpan): void {
    if (span instanceof TelemetrySpan) {
      span.end();
      this.context.removeSpan(span.spanId);
      this.pendingSpans.push(span);
      this.emit('span:end', span);

      // Export if batch size reached
      if (this.pendingSpans.length >= this.batchSize) {
        this.export();
      }
    }
  }

  addEvent(span: ITelemetrySpan, name: string, attributes?: Record<string, any>): void {
    if (span.events) {
      span.events.push({
        name,
        timestamp: new Date(),
        attributes
      });
    }
  }

  setAttribute(span: ITelemetrySpan, key: string, value: any): void {
    if (span.attributes) {
      span.attributes[key] = value;
    }
  }

  setStatus(span: ITelemetrySpan, status: 'ok' | 'error'): void {
    span.status = status;
  }

  /**
   * Trace operation helper
   */
  async trace<T>(
    operation: string,
    fn: (span: ITelemetrySpan) => Promise<T>,
    options?: {
      attributes?: Record<string, any>;
      parentSpan?: ITelemetrySpan;
    }
  ): Promise<T> {
    const span = this.startSpan(operation, options?.parentSpan);
    
    if (options?.attributes) {
      Object.entries(options.attributes).forEach(([key, value]) => {
        this.setAttribute(span, key, value);
      });
    }

    try {
      const result = await fn(span);
      this.setStatus(span, 'ok');
      return result;
    } catch (error) {
      this.setStatus(span, 'error');
      this.setAttribute(span, 'error', true);
      this.setAttribute(span, 'error.message', error instanceof Error ? error.message : 'Unknown error');
      if (error instanceof Error && error.stack) {
        this.setAttribute(span, 'error.stack', error.stack);
      }
      throw error;
    } finally {
      this.endSpan(span);
    }
  }

  /**
   * Get current active span
   */
  getCurrentSpan(): ITelemetrySpan | undefined {
    return this.context.getActiveSpan();
  }

  /**
   * Export pending spans
   */
  private async export(): Promise<void> {
    if (this.pendingSpans.length === 0) return;

    const spansToExport = [...this.pendingSpans];
    this.pendingSpans = [];

    try {
      await this.exporter.export(spansToExport);
      this.emit('export:success', spansToExport.length);
    } catch (error) {
      // Put spans back if export failed
      this.pendingSpans.unshift(...spansToExport);
      this.emit('export:error', error);
    }
  }

  private startExportTimer(): void {
    this.exportTimer = setInterval(() => {
      this.export().catch(error => {
        console.error('Error exporting telemetry:', error);
      });
    }, this.exportInterval);
  }

  stop(): void {
    if (this.exportTimer) {
      clearInterval(this.exportTimer);
      this.exportTimer = undefined;
    }

    // Export any remaining spans
    this.export().catch(error => {
      console.error('Error exporting final telemetry:', error);
    });
  }

  private generateTraceId(): string {
    return this.generateId(32);
  }

  private generateSpanId(): string {
    return this.generateId(16);
  }

  private generateId(length: number): string {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }

  /**
   * Create instrumented version of a function
   */
  instrument<T extends (...args: any[]) => any>(
    name: string,
    fn: T,
    options?: {
      attributes?: Record<string, any>;
    }
  ): T {
    const tracer = this;
    
    return (async function instrumented(...args: Parameters<T>): Promise<ReturnType<T>> {
      return tracer.trace(
        name,
        async (span) => {
          if (options?.attributes) {
            Object.entries(options.attributes).forEach(([key, value]) => {
              tracer.setAttribute(span, key, value);
            });
          }
          
          // Add argument info if not sensitive
          tracer.setAttribute(span, 'args.count', args.length);
          
          return fn(...args);
        }
      );
    }) as T;
  }

  /**
   * Get telemetry statistics
   */
  getStats(): {
    activeSpans: number;
    pendingExport: number;
    totalExported?: number;
  } {
    const stats: any = {
      activeSpans: this.context.getAllSpans().length,
      pendingExport: this.pendingSpans.length
    };

    if (this.exporter instanceof InMemoryExporter) {
      stats.totalExported = this.exporter.getSpans().length;
    }

    return stats;
  }

  /**
   * Standard span attributes
   */
  static readonly Attributes = {
    HTTP_METHOD: 'http.method',
    HTTP_URL: 'http.url',
    HTTP_STATUS_CODE: 'http.status_code',
    HTTP_USER_AGENT: 'http.user_agent',
    DB_SYSTEM: 'db.system',
    DB_OPERATION: 'db.operation',
    DB_STATEMENT: 'db.statement',
    RPC_SERVICE: 'rpc.service',
    RPC_METHOD: 'rpc.method',
    ERROR: 'error',
    ERROR_MESSAGE: 'error.message',
    ERROR_STACK: 'error.stack'
  };
}