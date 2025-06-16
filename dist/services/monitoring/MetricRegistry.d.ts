/**
 * Metric registry implementation
 */
import { IMetric, IMetricRegistry, ICounterMetric, IGaugeMetric, IHistogramMetric, ISummaryMetric } from '../../types/monitoring.js';
/**
 * Metric registry implementation
 */
export declare class MetricRegistry implements IMetricRegistry {
    private metrics;
    registerCounter(metric: Omit<ICounterMetric, 'type' | 'value' | 'increment'>): ICounterMetric;
    registerGauge(metric: Omit<IGaugeMetric, 'type' | 'value' | 'set' | 'increment' | 'decrement'>): IGaugeMetric;
    registerHistogram(metric: Omit<IHistogramMetric, 'type' | 'buckets' | 'observe' | 'getPercentile'> & {
        buckets?: number[];
    }): IHistogramMetric;
    registerSummary(metric: Omit<ISummaryMetric, 'type' | 'quantiles' | 'observe'> & {
        quantiles?: number[];
    }): ISummaryMetric;
    getMetric(name: string): IMetric | undefined;
    getAllMetrics(): IMetric[];
    reset(): void;
    /**
     * Export metrics in Prometheus format
     */
    exportPrometheus(): string;
}
//# sourceMappingURL=MetricRegistry.d.ts.map