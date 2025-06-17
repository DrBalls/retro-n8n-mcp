/**
 * Telemetry tracer implementation
 */
import { ITelemetryTracer, ITelemetrySpan } from '../../types/monitoring.js';
import { EventEmitter } from 'events';
/**
 * Telemetry exporter interface
 */
interface ITelemetryExporter {
    export(spans: ITelemetrySpan[]): Promise<void>;
}
/**
 * Telemetry tracer implementation
 */
export declare class TelemetryTracer extends EventEmitter implements ITelemetryTracer {
    private context;
    private exporter;
    private batchSize;
    private exportInterval;
    private pendingSpans;
    private exportTimer?;
    private serviceName;
    constructor(config?: {
        exporter?: 'console' | 'memory' | ITelemetryExporter;
        serviceName?: string;
        batchSize?: number;
        exportInterval?: number;
    });
    startSpan(operation: string, parentSpan?: ITelemetrySpan): ITelemetrySpan;
    endSpan(span: ITelemetrySpan): void;
    addEvent(span: ITelemetrySpan, name: string, attributes?: Record<string, any>): void;
    setAttribute(span: ITelemetrySpan, key: string, value: any): void;
    setStatus(span: ITelemetrySpan, status: 'ok' | 'error'): void;
    /**
     * Trace operation helper
     */
    trace<T>(operation: string, fn: (span: ITelemetrySpan) => Promise<T>, options?: {
        attributes?: Record<string, any>;
        parentSpan?: ITelemetrySpan;
    }): Promise<T>;
    /**
     * Get current active span
     */
    getCurrentSpan(): ITelemetrySpan | undefined;
    /**
     * Export pending spans
     */
    private export;
    private startExportTimer;
    stop(): void;
    private generateTraceId;
    private generateSpanId;
    private generateId;
    /**
     * Create instrumented version of a function
     */
    instrument<T extends (...args: any[]) => any>(name: string, fn: T, options?: {
        attributes?: Record<string, any>;
    }): T;
    /**
     * Get telemetry statistics
     */
    getStats(): {
        activeSpans: number;
        pendingExport: number;
        totalExported?: number;
    };
    /**
     * Standard span attributes
     */
    static readonly Attributes: {
        HTTP_METHOD: string;
        HTTP_URL: string;
        HTTP_STATUS_CODE: string;
        HTTP_USER_AGENT: string;
        DB_SYSTEM: string;
        DB_OPERATION: string;
        DB_STATEMENT: string;
        RPC_SERVICE: string;
        RPC_METHOD: string;
        ERROR: string;
        ERROR_MESSAGE: string;
        ERROR_STACK: string;
    };
}
export {};
//# sourceMappingURL=TelemetryTracer.d.ts.map