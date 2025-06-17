/**
 * Metric registry implementation
 */
/**
 * Counter metric implementation
 */
class CounterMetric {
    name;
    help;
    labels;
    unit;
    type = 'counter';
    _value = 0;
    labeledValues = new Map();
    constructor(name, help, labels, unit) {
        this.name = name;
        this.help = help;
        this.labels = labels;
        this.unit = unit;
    }
    get value() {
        if (this.labeledValues.size === 0) {
            return this._value;
        }
        return Array.from(this.labeledValues.values()).reduce((sum, val) => sum + val, 0);
    }
    increment(labels, value = 1) {
        if (value < 0) {
            throw new Error('Counter can only be incremented with positive values');
        }
        if (labels && this.labels) {
            const key = this.getLabelKey(labels);
            const current = this.labeledValues.get(key) || 0;
            this.labeledValues.set(key, current + value);
        }
        else {
            this._value += value;
        }
    }
    getLabelKey(labels) {
        if (!this.labels)
            return '';
        return this.labels.map(label => labels[label] || '').join(':');
    }
    reset() {
        this._value = 0;
        this.labeledValues.clear();
    }
}
/**
 * Gauge metric implementation
 */
class GaugeMetric {
    name;
    help;
    labels;
    unit;
    type = 'gauge';
    _value = 0;
    labeledValues = new Map();
    constructor(name, help, labels, unit) {
        this.name = name;
        this.help = help;
        this.labels = labels;
        this.unit = unit;
    }
    get value() {
        if (this.labeledValues.size === 0) {
            return this._value;
        }
        // For gauges with labels, return the last set value
        const values = Array.from(this.labeledValues.values());
        return values.length > 0 ? values[values.length - 1] : 0;
    }
    set(value, labels) {
        if (labels && this.labels) {
            const key = this.getLabelKey(labels);
            this.labeledValues.set(key, value);
        }
        else {
            this._value = value;
        }
    }
    increment(labels, value = 1) {
        if (labels && this.labels) {
            const key = this.getLabelKey(labels);
            const current = this.labeledValues.get(key) || 0;
            this.labeledValues.set(key, current + value);
        }
        else {
            this._value += value;
        }
    }
    decrement(labels, value = 1) {
        this.increment(labels, -value);
    }
    getLabelKey(labels) {
        if (!this.labels)
            return '';
        return this.labels.map(label => labels[label] || '').join(':');
    }
    reset() {
        this._value = 0;
        this.labeledValues.clear();
    }
}
/**
 * Histogram metric implementation
 */
class HistogramMetric {
    name;
    help;
    labels;
    unit;
    type = 'histogram';
    buckets;
    observations = [];
    bucketCounts;
    labeledObservations = new Map();
    constructor(name, help, labels, unit, buckets) {
        this.name = name;
        this.help = help;
        this.labels = labels;
        this.unit = unit;
        // Default buckets if not provided
        this.buckets = buckets || [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];
        this.buckets.sort((a, b) => a - b);
        this.bucketCounts = new Map();
        this.buckets.forEach(bucket => this.bucketCounts.set(bucket, 0));
    }
    observe(value, labels) {
        if (labels && this.labels) {
            const key = this.getLabelKey(labels);
            const observations = this.labeledObservations.get(key) || [];
            observations.push(value);
            this.labeledObservations.set(key, observations);
        }
        else {
            this.observations.push(value);
        }
        // Update bucket counts
        for (const bucket of this.buckets) {
            if (value <= bucket) {
                this.bucketCounts.set(bucket, (this.bucketCounts.get(bucket) || 0) + 1);
            }
        }
    }
    getPercentile(percentile) {
        if (percentile < 0 || percentile > 100) {
            throw new Error('Percentile must be between 0 and 100');
        }
        const allObservations = this.getAllObservations();
        if (allObservations.length === 0)
            return 0;
        const sorted = [...allObservations].sort((a, b) => a - b);
        const index = Math.ceil((percentile / 100) * sorted.length) - 1;
        return sorted[Math.max(0, index)];
    }
    getAllObservations() {
        const all = [...this.observations];
        for (const obs of this.labeledObservations.values()) {
            all.push(...obs);
        }
        return all;
    }
    getLabelKey(labels) {
        if (!this.labels)
            return '';
        return this.labels.map(label => labels[label] || '').join(':');
    }
    reset() {
        this.observations = [];
        this.labeledObservations.clear();
        this.buckets.forEach(bucket => this.bucketCounts.set(bucket, 0));
    }
}
/**
 * Summary metric implementation
 */
class SummaryMetric {
    name;
    help;
    labels;
    unit;
    type = 'summary';
    quantiles;
    observations = [];
    labeledObservations = new Map();
    windowSize = 600; // 10 minutes worth of observations
    maxAge = 600000; // 10 minutes in milliseconds
    timestampedObservations = [];
    constructor(name, help, labels, unit, quantiles) {
        this.name = name;
        this.help = help;
        this.labels = labels;
        this.unit = unit;
        // Default quantiles if not provided
        this.quantiles = quantiles || [0.5, 0.9, 0.95, 0.99];
    }
    observe(value, labels) {
        const now = Date.now();
        // Clean old observations
        this.timestampedObservations = this.timestampedObservations.filter(obs => now - obs.timestamp <= this.maxAge);
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
        }
        else {
            this.observations.push(value);
            // Keep only recent observations
            if (this.observations.length > this.windowSize) {
                this.observations.shift();
            }
        }
    }
    getQuantile(quantile) {
        if (!this.quantiles.includes(quantile)) {
            throw new Error(`Quantile ${quantile} not configured for this summary`);
        }
        const values = this.timestampedObservations.map(obs => obs.value);
        if (values.length === 0)
            return 0;
        const sorted = [...values].sort((a, b) => a - b);
        const index = Math.ceil(quantile * sorted.length) - 1;
        return sorted[Math.max(0, index)];
    }
    getLabelKey(labels) {
        if (!this.labels)
            return '';
        return this.labels.map(label => labels[label] || '').join(':');
    }
    reset() {
        this.observations = [];
        this.labeledObservations.clear();
        this.timestampedObservations = [];
    }
}
/**
 * Metric registry implementation
 */
export class MetricRegistry {
    metrics = new Map();
    registerCounter(metric) {
        if (this.metrics.has(metric.name)) {
            throw new Error(`Metric ${metric.name} already registered`);
        }
        const counter = new CounterMetric(metric.name, metric.help, metric.labels, metric.unit);
        this.metrics.set(metric.name, counter);
        return counter;
    }
    registerGauge(metric) {
        if (this.metrics.has(metric.name)) {
            throw new Error(`Metric ${metric.name} already registered`);
        }
        const gauge = new GaugeMetric(metric.name, metric.help, metric.labels, metric.unit);
        this.metrics.set(metric.name, gauge);
        return gauge;
    }
    registerHistogram(metric) {
        if (this.metrics.has(metric.name)) {
            throw new Error(`Metric ${metric.name} already registered`);
        }
        const histogram = new HistogramMetric(metric.name, metric.help, metric.labels, metric.unit, metric.buckets);
        this.metrics.set(metric.name, histogram);
        return histogram;
    }
    registerSummary(metric) {
        if (this.metrics.has(metric.name)) {
            throw new Error(`Metric ${metric.name} already registered`);
        }
        const summary = new SummaryMetric(metric.name, metric.help, metric.labels, metric.unit, metric.quantiles);
        this.metrics.set(metric.name, summary);
        return summary;
    }
    getMetric(name) {
        return this.metrics.get(name);
    }
    getAllMetrics() {
        return Array.from(this.metrics.values());
    }
    reset() {
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
    exportPrometheus() {
        const lines = [];
        for (const metric of this.metrics.values()) {
            // Add help text
            lines.push(`# HELP ${metric.name} ${metric.help}`);
            // Add type
            lines.push(`# TYPE ${metric.name} ${metric.type}`);
            // Add metric value(s)
            switch (metric.type) {
                case 'counter':
                case 'gauge':
                    lines.push(`${metric.name} ${metric.value}`);
                    break;
                case 'histogram':
                    const hist = metric;
                    const observations = hist.getAllObservations();
                    const sum = observations.reduce((s, v) => s + v, 0);
                    // Bucket values
                    for (const bucket of hist.buckets) {
                        const count = hist.bucketCounts.get(bucket) || 0;
                        lines.push(`${metric.name}_bucket{le="${bucket}"} ${count}`);
                    }
                    lines.push(`${metric.name}_bucket{le="+Inf"} ${observations.length}`);
                    lines.push(`${metric.name}_sum ${sum}`);
                    lines.push(`${metric.name}_count ${observations.length}`);
                    break;
                case 'summary':
                    const summ = metric;
                    const summObs = summ.timestampedObservations.map((o) => o.value);
                    const summSum = summObs.reduce((s, v) => s + v, 0);
                    // Quantile values
                    for (const quantile of summ.quantiles) {
                        const value = summ.getQuantile(quantile);
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
//# sourceMappingURL=MetricRegistry.js.map