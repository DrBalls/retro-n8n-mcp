/**
 * Telemetry tracer implementation
 */
import { EventEmitter } from 'events';
/**
 * Span implementation
 */
class TelemetrySpan {
    traceId;
    spanId;
    operation;
    startTime;
    parentSpanId;
    endTime;
    duration;
    status = 'ok';
    attributes = {};
    events = [];
    constructor(traceId, spanId, operation, startTime, parentSpanId) {
        this.traceId = traceId;
        this.spanId = spanId;
        this.operation = operation;
        this.startTime = startTime;
        this.parentSpanId = parentSpanId;
    }
    end() {
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
    activeSpans = new Map();
    spanStack = [];
    setActiveSpan(span) {
        this.activeSpans.set(span.spanId, span);
        this.spanStack.push(span);
    }
    getActiveSpan() {
        return this.spanStack[this.spanStack.length - 1];
    }
    removeSpan(spanId) {
        this.activeSpans.delete(spanId);
        this.spanStack = this.spanStack.filter(s => s.spanId !== spanId);
    }
    getSpan(spanId) {
        return this.activeSpans.get(spanId);
    }
    getAllSpans() {
        return Array.from(this.activeSpans.values());
    }
}
/**
 * Console exporter for development
 */
class ConsoleExporter {
    async export(spans) {
        spans.forEach(span => {
            console.log('Telemetry Span:', {
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
class InMemoryExporter {
    spans = [];
    async export(spans) {
        this.spans.push(...spans);
    }
    getSpans() {
        return [...this.spans];
    }
    clear() {
        this.spans = [];
    }
}
/**
 * Telemetry tracer implementation
 */
export class TelemetryTracer extends EventEmitter {
    context;
    exporter;
    batchSize = 100;
    exportInterval = 5000; // 5 seconds
    pendingSpans = [];
    exportTimer;
    serviceName;
    constructor(config) {
        super();
        this.context = new TraceContext();
        this.serviceName = config?.serviceName || 'n8n-mcp-server';
        // Set up exporter
        if (!config?.exporter || config.exporter === 'console') {
            this.exporter = new ConsoleExporter();
        }
        else if (config.exporter === 'memory') {
            this.exporter = new InMemoryExporter();
        }
        else {
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
    startSpan(operation, parentSpan) {
        const traceId = parentSpan?.traceId || this.generateTraceId();
        const spanId = this.generateSpanId();
        const parentSpanId = parentSpan?.spanId;
        const span = new TelemetrySpan(traceId, spanId, operation, new Date(), parentSpanId);
        // Add default attributes
        span.attributes = {
            'service.name': this.serviceName,
            'span.kind': parentSpanId ? 'internal' : 'server'
        };
        this.context.setActiveSpan(span);
        this.emit('span:start', span);
        return span;
    }
    endSpan(span) {
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
    addEvent(span, name, attributes) {
        if (span.events) {
            span.events.push({
                name,
                timestamp: new Date(),
                attributes
            });
        }
    }
    setAttribute(span, key, value) {
        if (span.attributes) {
            span.attributes[key] = value;
        }
    }
    setStatus(span, status) {
        span.status = status;
    }
    /**
     * Trace operation helper
     */
    async trace(operation, fn, options) {
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
        }
        catch (error) {
            this.setStatus(span, 'error');
            this.setAttribute(span, 'error', true);
            this.setAttribute(span, 'error.message', error instanceof Error ? error.message : 'Unknown error');
            if (error instanceof Error && error.stack) {
                this.setAttribute(span, 'error.stack', error.stack);
            }
            throw error;
        }
        finally {
            this.endSpan(span);
        }
    }
    /**
     * Get current active span
     */
    getCurrentSpan() {
        return this.context.getActiveSpan();
    }
    /**
     * Export pending spans
     */
    async export() {
        if (this.pendingSpans.length === 0)
            return;
        const spansToExport = [...this.pendingSpans];
        this.pendingSpans = [];
        try {
            await this.exporter.export(spansToExport);
            this.emit('export:success', spansToExport.length);
        }
        catch (error) {
            // Put spans back if export failed
            this.pendingSpans.unshift(...spansToExport);
            this.emit('export:error', error);
        }
    }
    startExportTimer() {
        this.exportTimer = setInterval(() => {
            this.export().catch(error => {
                console.error('Error exporting telemetry:', error);
            });
        }, this.exportInterval);
    }
    stop() {
        if (this.exportTimer) {
            clearInterval(this.exportTimer);
            this.exportTimer = undefined;
        }
        // Export any remaining spans
        this.export().catch(error => {
            console.error('Error exporting final telemetry:', error);
        });
    }
    generateTraceId() {
        return this.generateId(32);
    }
    generateSpanId() {
        return this.generateId(16);
    }
    generateId(length) {
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
    instrument(name, fn, options) {
        const tracer = this;
        return (async function instrumented(...args) {
            return tracer.trace(name, async (span) => {
                if (options?.attributes) {
                    Object.entries(options.attributes).forEach(([key, value]) => {
                        tracer.setAttribute(span, key, value);
                    });
                }
                // Add argument info if not sensitive
                tracer.setAttribute(span, 'args.count', args.length);
                return fn(...args);
            });
        });
    }
    /**
     * Get telemetry statistics
     */
    getStats() {
        const stats = {
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
    static Attributes = {
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
//# sourceMappingURL=TelemetryTracer.js.map