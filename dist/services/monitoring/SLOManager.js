/**
 * SLO (Service Level Objective) manager implementation
 */
import { EventEmitter } from 'events';
/**
 * SLO calculator for metric-based calculations
 */
class SLOCalculator {
    metrics;
    constructor(metrics) {
        this.metrics = metrics;
    }
    calculateSLI(slo) {
        // In a real implementation, this would parse the metric queries
        // For now, we'll use simple metric lookups
        const goodMetric = this.metrics.getMetric(slo.indicator.good);
        const totalMetric = this.metrics.getMetric(slo.indicator.total);
        const good = goodMetric && 'value' in goodMetric ? goodMetric.value : 0;
        const total = totalMetric && 'value' in totalMetric ? totalMetric.value : 0;
        const percentage = total > 0 ? (good / total) * 100 : 100;
        return { good: good, total: total, percentage };
    }
    calculateErrorBudget(slo, currentPercentage) {
        const errorBudgetTotal = 100 - slo.target;
        const errorBudgetUsed = 100 - currentPercentage;
        const errorBudgetRemaining = Math.max(0, errorBudgetTotal - errorBudgetUsed);
        return (errorBudgetRemaining / errorBudgetTotal) * 100;
    }
    calculateBurnRate(slo, currentPercentage, timeElapsed) {
        const totalTime = slo.windowDuration * 1000; // Convert to ms
        const timeRemaining = totalTime - timeElapsed;
        if (timeRemaining <= 0)
            return 0;
        const errorBudgetTotal = 100 - slo.target;
        const errorBudgetUsed = 100 - currentPercentage;
        const errorBudgetRemaining = errorBudgetTotal - errorBudgetUsed;
        if (errorBudgetRemaining <= 0)
            return Infinity;
        // Burn rate = current rate / sustainable rate
        const currentRate = errorBudgetUsed / timeElapsed;
        const sustainableRate = errorBudgetTotal / totalTime;
        return currentRate / sustainableRate;
    }
    predictViolation(slo, currentPercentage, burnRate, timeElapsed) {
        if (currentPercentage < slo.target) {
            return { willViolate: true, timeToViolation: 0 };
        }
        if (burnRate <= 1) {
            return { willViolate: false };
        }
        const errorBudgetTotal = 100 - slo.target;
        const errorBudgetUsed = 100 - currentPercentage;
        const errorBudgetRemaining = errorBudgetTotal - errorBudgetUsed;
        const currentErrorRate = errorBudgetUsed / timeElapsed;
        const timeToViolation = errorBudgetRemaining / currentErrorRate;
        return {
            willViolate: true,
            timeToViolation: Math.max(0, timeToViolation)
        };
    }
}
/**
 * SLO window tracker
 */
class SLOWindowTracker {
    dataPoints = new Map();
    addDataPoint(sloId, good, total) {
        const points = this.dataPoints.get(sloId) || [];
        points.push({
            timestamp: new Date(),
            good,
            total
        });
        // Keep only data points within the window
        this.dataPoints.set(sloId, points);
    }
    getWindowData(slo) {
        const points = this.dataPoints.get(slo.id) || [];
        const now = new Date();
        const windowStart = new Date(now.getTime() - slo.windowDuration * 1000);
        // Filter points within window
        const windowPoints = points.filter(p => p.timestamp >= windowStart);
        // Clean up old points
        if (windowPoints.length < points.length) {
            this.dataPoints.set(slo.id, windowPoints);
        }
        const good = windowPoints.reduce((sum, p) => sum + p.good, 0);
        const total = windowPoints.reduce((sum, p) => sum + p.total, 0);
        return {
            good,
            total,
            startTime: windowPoints.length > 0 ? windowPoints[0].timestamp : now,
            endTime: now
        };
    }
    clear(sloId) {
        this.dataPoints.delete(sloId);
    }
}
/**
 * SLO manager implementation
 */
export class SLOManager extends EventEmitter {
    metrics;
    slos = new Map();
    calculator;
    windowTracker;
    evaluationInterval = 60000; // 1 minute
    evaluationTimer;
    lastStatuses = new Map();
    constructor(metrics, config) {
        super();
        this.metrics = metrics;
        this.calculator = new SLOCalculator(metrics);
        this.windowTracker = new SLOWindowTracker();
        if (config?.evaluationInterval) {
            this.evaluationInterval = config.evaluationInterval;
        }
        // Start evaluation loop
        this.startEvaluation();
    }
    registerSLO(slo) {
        if (this.slos.has(slo.id)) {
            throw new Error(`SLO ${slo.id} already registered`);
        }
        this.slos.set(slo.id, slo);
        this.emit('slo:registered', slo);
    }
    unregisterSLO(id) {
        this.slos.delete(id);
        this.lastStatuses.delete(id);
        this.windowTracker.clear(id);
        this.emit('slo:unregistered', id);
    }
    getStatus(id) {
        return this.lastStatuses.get(id);
    }
    getAllStatuses() {
        return Array.from(this.lastStatuses.values());
    }
    getErrorBudgetReport(id, start, end) {
        const slo = this.slos.get(id);
        if (!slo) {
            throw new Error(`SLO ${id} not found`);
        }
        const status = this.lastStatuses.get(id);
        if (!status) {
            return null;
        }
        // Calculate time-based metrics
        const duration = end.getTime() - start.getTime();
        const durationHours = duration / (1000 * 60 * 60);
        const errorBudgetTotal = (100 - slo.target) * durationHours;
        const errorBudgetUsed = (100 - status.current) * durationHours;
        return {
            slo: {
                id: slo.id,
                name: slo.name,
                target: slo.target
            },
            period: {
                start: start.toISOString(),
                end: end.toISOString(),
                durationHours
            },
            performance: {
                current: status.current,
                errorBudgetPercentage: status.errorBudget,
                burnRate: status.burnRate
            },
            budget: {
                total: errorBudgetTotal,
                used: errorBudgetUsed,
                remaining: errorBudgetTotal - errorBudgetUsed
            },
            prediction: status.prediction,
            recommendations: this.generateRecommendations(status)
        };
    }
    evaluate() {
        for (const slo of this.slos.values()) {
            try {
                // Get current SLI
                const sli = this.calculator.calculateSLI(slo);
                // Track data point
                this.windowTracker.addDataPoint(slo.id, sli.good, sli.total);
                // Get window data
                const windowData = this.windowTracker.getWindowData(slo);
                const windowPercentage = windowData.total > 0
                    ? (windowData.good / windowData.total) * 100
                    : 100;
                // Calculate metrics
                const timeElapsed = Date.now() - windowData.startTime.getTime();
                const errorBudget = this.calculator.calculateErrorBudget(slo, windowPercentage);
                const burnRate = this.calculator.calculateBurnRate(slo, windowPercentage, timeElapsed);
                const prediction = this.calculator.predictViolation(slo, windowPercentage, burnRate, timeElapsed);
                const status = {
                    slo,
                    current: windowPercentage,
                    errorBudget,
                    burnRate,
                    prediction
                };
                // Check for violations or warnings
                const previousStatus = this.lastStatuses.get(slo.id);
                if (windowPercentage < slo.target) {
                    this.emit('slo:violated', status);
                }
                else if (burnRate > 1.5 && (!previousStatus || previousStatus.burnRate <= 1.5)) {
                    this.emit('slo:warning', status);
                }
                this.lastStatuses.set(slo.id, status);
                this.emit('slo:evaluated', status);
            }
            catch (error) {
                console.error(`Error evaluating SLO ${slo.id}:`, error);
                this.emit('slo:error', { slo, error });
            }
        }
    }
    startEvaluation() {
        if (this.evaluationTimer) {
            clearInterval(this.evaluationTimer);
        }
        // Initial evaluation
        this.evaluate();
        // Schedule periodic evaluation
        this.evaluationTimer = setInterval(() => {
            this.evaluate();
        }, this.evaluationInterval);
    }
    stop() {
        if (this.evaluationTimer) {
            clearInterval(this.evaluationTimer);
            this.evaluationTimer = undefined;
        }
    }
    generateRecommendations(status) {
        const recommendations = [];
        if (status.current < status.slo.target) {
            recommendations.push('SLO is currently violated. Immediate action required.');
        }
        if (status.burnRate > 2) {
            recommendations.push('Error budget is being consumed rapidly. Investigate recent changes.');
        }
        else if (status.burnRate > 1.5) {
            recommendations.push('Error budget burn rate is elevated. Monitor closely.');
        }
        if (status.errorBudget < 20) {
            recommendations.push('Less than 20% error budget remaining. Consider freezing non-critical changes.');
        }
        if (status.prediction?.willViolate && status.prediction.timeToViolation) {
            const hoursToViolation = status.prediction.timeToViolation / (1000 * 60 * 60);
            if (hoursToViolation < 24) {
                recommendations.push(`SLO predicted to be violated within ${Math.round(hoursToViolation)} hours.`);
            }
        }
        if (recommendations.length === 0) {
            recommendations.push('SLO is healthy with adequate error budget.');
        }
        return recommendations;
    }
    /**
     * Create standard SLOs
     */
    static createStandardSLOs() {
        return [
            {
                id: 'api_availability',
                name: 'API Availability',
                description: 'Percentage of successful API requests',
                target: 99.9,
                window: 'rolling',
                windowDuration: 86400, // 24 hours
                indicator: {
                    good: 'mcp_requests_successful_total',
                    total: 'mcp_requests_total'
                }
            },
            {
                id: 'response_time',
                name: 'Response Time SLO',
                description: 'Percentage of requests under 1 second',
                target: 95,
                window: 'rolling',
                windowDuration: 3600, // 1 hour
                indicator: {
                    good: 'mcp_requests_fast_total',
                    total: 'mcp_requests_total'
                }
            },
            {
                id: 'error_rate',
                name: 'Error Rate SLO',
                description: 'Percentage of successful operations',
                target: 99.5,
                window: 'rolling',
                windowDuration: 7200, // 2 hours
                indicator: {
                    good: 'mcp_operations_successful_total',
                    total: 'mcp_operations_total'
                }
            }
        ];
    }
}
//# sourceMappingURL=SLOManager.js.map