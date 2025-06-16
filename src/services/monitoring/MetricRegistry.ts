/**
 * Metric registry implementation
 */

import {
  IMetric,
  IMetricRegistry,
  ICounterMetric,
  IGaugeMetric,
  IHistogramMetric,
  ISummaryMetric,
  MetricType
} from '../../types/monitoring.js';

/**
 * Counter metric implementation
 */
class CounterMetric implements ICounterMetric {
  public readonly type = 'counter' as const;
  private _value: number = 0;
  private labeledValues: Map<string, number> = new Map();

  constructor(
    public readonly name: string,
    public readonly help: string,
    public readonly labels?: string[],
    public readonly unit?: string
  ) {}

  get value(): number {
    if (this.labeledValues.size === 0) {
      return this._value;
    }
    return Array.from(this.labeledValues.values()).reduce((sum, val) => sum + val, 0);
  }

  increment(labels?: Record<string, string>, value: number = 1): void {
    if (value < 0) {
      throw new Error('Counter can only be incremented with positive values');
    }

    if (labels && this.labels) {
      const key = this.getLabelKey(labels);
      const current = this.labeledValues.get(key) || 0;
      this.labeledValues.set(key, current + value);
    } else {
      this._value += value;
    }
  }

  private getLabelKey(labels: Record<string, string>): string {
    if (!this.labels) return '';
    return this.labels.map(label => labels[label] || '').join(':');
  }

  reset(): void {
    this._value = 0;
    this.labeledValues.clear();
  }
}

/**
 * Gauge metric implementation
 */
class GaugeMetric implements IGaugeMetric {
  public readonly type = 'gauge' as const;
  private _value: number = 0;
  private labeledValues: Map<string, number> = new Map();

  constructor(
    public readonly name: string,
    public readonly help: string,
    public readonly labels?: string[],
    public readonly unit?: string
  ) {}

  get value(): number {
    if (this.labeledValues.size === 0) {
      return this._value;
    }
    // For gauges with labels, return the last set value
    const values = Array.from(this.labeledValues.values());
    return values.length > 0 ? values[values.length - 1] : 0;
  }

  set(value: number, labels?: Record<string, string>): void {
    if (labels && this.labels) {
      const key = this.getLabelKey(labels);
      this.labeledValues.set(key, value);
    } else {
      this._value = value;
    }
  }

  increment(labels?: Record<string, string>, value: number = 1): void {
    if (labels && this.labels) {
      const key = this.getLabelKey(labels);
      const current = this.labeledValues.get(key) || 0;
      this.labeledValues.set(key, current + value);
    } else {
      this._value += value;
    }
  }

  decrement(labels?: Record<string, string>, value: number = 1): void {
    this.increment(labels, -value);
  }

  private getLabelKey(labels: Record<string, string>): string {
    if (!this.labels) return '';
    return this.labels.map(label => labels[label] || '').join(':');
  }

  reset(): void {
    this._value = 0;
    this.labeledValues.clear();
  }
}

/**
 * Histogram metric implementation
 */
class HistogramMetric implements IHistogramMetric {
  public readonly type = 'histogram' as const;
  public readonly buckets: number[];
  private observations: number[] = [];
  private bucketCounts: Map<number, number>;
  private labeledObservations: Map<string, number[]> = new Map();

  constructor(
    public readonly name: string,
    public readonly help: string,
    public readonly labels?: string[],
    public readonly unit?: string,
    buckets?: number[]
  ) {
    // Default buckets if not provided
    this.buckets = buckets || [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];
    this.buckets.sort((a, b) => a - b);
    this.bucketCounts = new Map();
    this.buckets.forEach(bucket => this.bucketCounts.set(bucket, 0));
  }

  observe(value: number, labels?: Record<string, string>): void {
    if (labels && this.labels) {
      const key = this.getLabelKey(labels);
      const observations = this.labeledObservations.get(key) || [];
      observations.push(value);
      this.labeledObservations.set(key, observations);
    } else {
      this.observations.push(value);
    }

    // Update bucket counts
    for (const bucket of this.buckets) {
      if (value <= bucket) {
        this.bucketCounts.set(bucket, (this.bucketCounts.get(bucket) || 0) + 1);
      }
    }
  }

  getPercentile(percentile: number): number {
    if (percentile < 0 || percentile > 100) {
      throw new Error('Percentile must be between 0 and 100');
    }

    const allObservations = this.getAllObservations();
    if (allObservations.length === 0) return 0;

    const sorted = [...allObservations].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  private getAllObservations(): number[] {
    const all = [...this.observations];
    for (const obs of this.labeledObservations.values()) {
      all.push(...obs);
    }
    return all;
  }

  private getLabelKey(labels: Record<string, string>): string {
    if (!this.labels) return '';
    return this.labels.map(label => labels[label] || '').join(':');
  }

  reset(): void {
    this.observations = [];
    this.labeledObservations.clear();
    this.buckets.forEach(bucket => this.bucketCounts.set(bucket, 0));
  }
}

/**
 * Summary metric implementation
 */
class SummaryMetric implements ISummaryMetric {
  public readonly type = 'summary' as const;
  public readonly quantiles: number[];
  private observations: number[] = [];
  private labeledObservations: Map<string, number[]> = new Map();
  private windowSize: number = 600; // 10 minutes worth of observations
  private maxAge: number = 600000; // 10 minutes in milliseconds
  private timestampedObservations: Array<{ value: number; timestamp: number }> = [];

  constructor(
    public readonly name: string,
    public readonly help: string,
    public readonly labels?: string[],
    public readonly unit?: string,
    quantiles?: number[]
  ) {
    // Default quantiles if not provided
    this.quantiles = quantiles || [0.5, 0.9, 0.95, 0.99];
  }

  observe(value: number, labels?: Record<string, string>): void {
    const now = Date.now();
    
    // Clean old observations
    this.timestampedObservations = this.timestampedObservations.filter(
      obs => now - obs.timestamp <= this.maxAge
    );

    this.timestampedObservations.push({ value, timestamp: now });

    if (labels && this.labels) {
      const key = this.getLabelKey(labels);
      const observations = this.labeledObservations.get(key) || [];
      observations.push(value);
      
      // Keep only recent observations
      if (observations.length > this.windowSize) {
        observations.shift();
      }
      
      this.labeledObservations.set(key, observations);
    } else {
      this.observations.push(value);
      
      // Keep only recent observations
      if (this.observations.length > this.windowSize) {
        this.observations.shift();
      }
    }
  }

  getQuantile(quantile: number): number {
    if (!this.quantiles.includes(quantile)) {
      throw new Error(`Quantile ${quantile} not configured for this summary`);
    }

    const values = this.timestampedObservations.map(obs => obs.value);
    if (values.length === 0) return 0;

    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil(quantile * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  private getLabelKey(labels: Record<string, string>): string {
    if (!this.labels) return '';
    return this.labels.map(label => labels[label] || '').join(':');
  }

  reset(): void {
    this.observations = [];
    this.labeledObservations.clear();
    this.timestampedObservations = [];
  }
}

/**
 * Metric registry implementation
 */
export class MetricRegistry implements IMetricRegistry {
  private metrics: Map<string, IMetric> = new Map();

  registerCounter(
    metric: Omit<ICounterMetric, 'type' | 'value' | 'increment'>
  ): ICounterMetric {
    if (this.metrics.has(metric.name)) {
      throw new Error(`Metric ${metric.name} already registered`);
    }

    const counter = new CounterMetric(
      metric.name,
      metric.help,
      metric.labels,
      metric.unit
    );
    
    this.metrics.set(metric.name, counter);
    return counter;
  }

  registerGauge(
    metric: Omit<IGaugeMetric, 'type' | 'value' | 'set' | 'increment' | 'decrement'>
  ): IGaugeMetric {
    if (this.metrics.has(metric.name)) {
      throw new Error(`Metric ${metric.name} already registered`);
    }

    const gauge = new GaugeMetric(
      metric.name,
      metric.help,
      metric.labels,
      metric.unit
    );
    
    this.metrics.set(metric.name, gauge);
    return gauge;
  }

  registerHistogram(
    metric: Omit<IHistogramMetric, 'type' | 'buckets' | 'observe' | 'getPercentile'> & { buckets?: number[] }
  ): IHistogramMetric {
    if (this.metrics.has(metric.name)) {
      throw new Error(`Metric ${metric.name} already registered`);
    }

    const histogram = new HistogramMetric(
      metric.name,
      metric.help,
      metric.labels,
      metric.unit,
      metric.buckets
    );
    
    this.metrics.set(metric.name, histogram);
    return histogram;
  }

  registerSummary(
    metric: Omit<ISummaryMetric, 'type' | 'quantiles' | 'observe'> & { quantiles?: number[] }
  ): ISummaryMetric {
    if (this.metrics.has(metric.name)) {
      throw new Error(`Metric ${metric.name} already registered`);
    }

    const summary = new SummaryMetric(
      metric.name,
      metric.help,
      metric.labels,
      metric.unit,
      metric.quantiles
    );
    
    this.metrics.set(metric.name, summary);
    return summary;
  }

  getMetric(name: string): IMetric | undefined {
    return this.metrics.get(name);
  }

  getAllMetrics(): IMetric[] {
    return Array.from(this.metrics.values());
  }

  reset(): void {
    // Reset all metrics
    for (const metric of this.metrics.values()) {
      if ('reset' in metric && typeof metric.reset === 'function') {
        metric.reset();
      }
    }
  }

  /**
   * Export metrics in Prometheus format
   */
  exportPrometheus(): string {
    const lines: string[] = [];

    for (const metric of this.metrics.values()) {
      // Add help text
      lines.push(`# HELP ${metric.name} ${metric.help}`);
      
      // Add type
      lines.push(`# TYPE ${metric.name} ${metric.type}`);

      // Add metric value(s)
      switch (metric.type) {
        case 'counter':
        case 'gauge':
          lines.push(`${metric.name} ${(metric as ICounterMetric | IGaugeMetric).value}`);
          break;
          
        case 'histogram':
          const hist = metric as IHistogramMetric;
          const observations = (hist as any).getAllObservations();
          const sum = observations.reduce((s: number, v: number) => s + v, 0);
          
          // Bucket values
          for (const bucket of hist.buckets) {
            const count = (hist as any).bucketCounts.get(bucket) || 0;
            lines.push(`${metric.name}_bucket{le="${bucket}"} ${count}`);
          }
          lines.push(`${metric.name}_bucket{le="+Inf"} ${observations.length}`);
          lines.push(`${metric.name}_sum ${sum}`);
          lines.push(`${metric.name}_count ${observations.length}`);
          break;
          
        case 'summary':
          const summ = metric as ISummaryMetric;
          const summObs = (summ as any).timestampedObservations.map((o: any) => o.value);
          const summSum = summObs.reduce((s: number, v: number) => s + v, 0);
          
          // Quantile values
          for (const quantile of summ.quantiles) {
            const value = (summ as any).getQuantile(quantile);
            lines.push(`${metric.name}{quantile="${quantile}"} ${value}`);
          }
          lines.push(`${metric.name}_sum ${summSum}`);
          lines.push(`${metric.name}_count ${summObs.length}`);
          break;
      }
      
      lines.push(''); // Empty line between metrics
    }

    return lines.join('\n');
  }
}