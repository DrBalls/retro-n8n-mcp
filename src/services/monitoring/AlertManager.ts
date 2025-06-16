/**
 * Alert manager implementation
 */

import {
  IAlert,
  IAlertInstance,
  IAlertManager,
  AlertSeverity
} from '../../types/monitoring.js';
import { EventEmitter } from 'events';
import { IMetricRegistry } from '../../types/monitoring.js';

/**
 * Alert evaluator for condition checking
 */
class AlertEvaluator {
  constructor(private metrics: IMetricRegistry) {}

  evaluate(condition: string, threshold?: number): { result: boolean; value?: number } {
    try {
      // Parse simple conditions like "metric_name > threshold"
      const match = condition.match(/^(\w+)\s*([><=]+)\s*(\d+(?:\.\d+)?)$/);
      if (!match) {
        // Try to evaluate as a more complex expression
        return this.evaluateExpression(condition);
      }

      const [, metricName, operator, thresholdStr] = match;
      const metric = this.metrics.getMetric(metricName);
      
      if (!metric) {
        return { result: false };
      }

      const value = this.getMetricValue(metric);
      const compareThreshold = threshold || parseFloat(thresholdStr);

      let result = false;
      switch (operator) {
        case '>':
          result = value > compareThreshold;
          break;
        case '>=':
          result = value >= compareThreshold;
          break;
        case '<':
          result = value < compareThreshold;
          break;
        case '<=':
          result = value <= compareThreshold;
          break;
        case '==':
        case '=':
          result = value === compareThreshold;
          break;
        case '!=':
          result = value !== compareThreshold;
          break;
      }

      return { result, value };
    } catch (error) {
      console.error('Error evaluating alert condition:', error);
      return { result: false };
    }
  }

  private evaluateExpression(expression: string): { result: boolean; value?: number } {
    // For complex expressions, we'd need a proper expression parser
    // For now, support basic metric value checks
    const metricName = expression.trim();
    const metric = this.metrics.getMetric(metricName);
    
    if (!metric) {
      return { result: false };
    }

    const value = this.getMetricValue(metric);
    return { result: value > 0, value };
  }

  private getMetricValue(metric: any): number {
    if ('value' in metric) {
      return metric.value;
    }
    return 0;
  }
}

/**
 * Alert silence manager
 */
class SilenceManager {
  private silences: Map<string, { until: Date; reason?: string }> = new Map();

  silence(alertId: string, duration: number, reason?: string): void {
    const until = new Date(Date.now() + duration);
    this.silences.set(alertId, { until, reason });
  }

  isSilenced(alertId: string): boolean {
    const silence = this.silences.get(alertId);
    if (!silence) return false;

    if (silence.until > new Date()) {
      return true;
    }

    // Remove expired silence
    this.silences.delete(alertId);
    return false;
  }

  getSilence(alertId: string): { until: Date; reason?: string } | undefined {
    const silence = this.silences.get(alertId);
    if (silence && silence.until > new Date()) {
      return silence;
    }
    return undefined;
  }

  removeSilence(alertId: string): void {
    this.silences.delete(alertId);
  }
}

/**
 * Alert manager implementation
 */
export class AlertManager extends EventEmitter implements IAlertManager {
  private alerts: Map<string, IAlert> = new Map();
  private instances: Map<string, IAlertInstance> = new Map();
  private evaluator: AlertEvaluator;
  private silenceManager: SilenceManager;
  private evaluationInterval: number = 60000; // 1 minute
  private evaluationTimer?: NodeJS.Timeout;
  private acknowledgements: Set<string> = new Set();

  constructor(
    private metrics: IMetricRegistry,
    config?: {
      evaluationInterval?: number;
    }
  ) {
    super();
    this.evaluator = new AlertEvaluator(metrics);
    this.silenceManager = new SilenceManager();
    
    if (config?.evaluationInterval) {
      this.evaluationInterval = config.evaluationInterval;
    }

    // Start evaluation loop
    this.startEvaluation();
  }

  registerAlert(alert: IAlert): void {
    if (this.alerts.has(alert.id)) {
      throw new Error(`Alert ${alert.id} already registered`);
    }

    this.alerts.set(alert.id, alert);
    this.emit('alert:registered', alert);
  }

  unregisterAlert(id: string): void {
    this.alerts.delete(id);
    this.instances.delete(id);
    this.acknowledgements.delete(id);
    this.emit('alert:unregistered', id);
  }

  async evaluate(): Promise<IAlertInstance[]> {
    const results: IAlertInstance[] = [];

    for (const alert of this.alerts.values()) {
      try {
        // Skip if silenced
        if (this.silenceManager.isSilenced(alert.id)) {
          continue;
        }

        const evaluation = this.evaluator.evaluate(alert.condition, alert.threshold);
        const existingInstance = this.instances.get(alert.id);

        if (evaluation.result) {
          // Alert should fire
          if (!existingInstance || existingInstance.status === 'resolved') {
            // New alert instance
            const instance: IAlertInstance = {
              alert,
              status: 'firing',
              firedAt: new Date(),
              value: evaluation.value,
              labels: alert.labels
            };

            this.instances.set(alert.id, instance);
            this.emit('alert:firing', instance);
            results.push(instance);
          } else {
            // Alert continues firing
            existingInstance.value = evaluation.value;
            results.push(existingInstance);
          }
        } else {
          // Alert should not fire
          if (existingInstance && existingInstance.status === 'firing') {
            // Resolve the alert
            existingInstance.status = 'resolved';
            existingInstance.resolvedAt = new Date();
            this.emit('alert:resolved', existingInstance);
            results.push(existingInstance);
          }
        }
      } catch (error) {
        console.error(`Error evaluating alert ${alert.id}:`, error);
        this.emit('alert:error', { alert, error });
      }
    }

    return results;
  }

  getActiveAlerts(): IAlertInstance[] {
    return Array.from(this.instances.values())
      .filter(instance => instance.status === 'firing');
  }

  acknowledge(alertId: string): void {
    const instance = this.instances.get(alertId);
    if (!instance || instance.status !== 'firing') {
      throw new Error(`Alert ${alertId} is not currently firing`);
    }

    this.acknowledgements.add(alertId);
    this.emit('alert:acknowledged', { alertId, acknowledgedAt: new Date() });
  }

  isAcknowledged(alertId: string): boolean {
    return this.acknowledgements.has(alertId);
  }

  silence(alertId: string, duration: number, reason?: string): void {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      throw new Error(`Alert ${alertId} not found`);
    }

    this.silenceManager.silence(alertId, duration, reason);
    this.emit('alert:silenced', { alertId, duration, reason });
  }

  private startEvaluation(): void {
    if (this.evaluationTimer) {
      clearInterval(this.evaluationTimer);
    }

    // Initial evaluation
    this.evaluate().catch(error => {
      console.error('Error in alert evaluation:', error);
    });

    // Schedule periodic evaluation
    this.evaluationTimer = setInterval(() => {
      this.evaluate().catch(error => {
        console.error('Error in alert evaluation:', error);
      });
    }, this.evaluationInterval);
  }

  stop(): void {
    if (this.evaluationTimer) {
      clearInterval(this.evaluationTimer);
      this.evaluationTimer = undefined;
    }
  }

  /**
   * Get alert statistics
   */
  getStats(): {
    total: number;
    firing: number;
    resolved: number;
    acknowledged: number;
    silenced: number;
    bySeverity: Record<AlertSeverity, number>;
  } {
    const stats = {
      total: this.alerts.size,
      firing: 0,
      resolved: 0,
      acknowledged: 0,
      silenced: 0,
      bySeverity: {
        [AlertSeverity.INFO]: 0,
        [AlertSeverity.WARNING]: 0,
        [AlertSeverity.ERROR]: 0,
        [AlertSeverity.CRITICAL]: 0
      }
    };

    for (const instance of this.instances.values()) {
      if (instance.status === 'firing') {
        stats.firing++;
        if (this.isAcknowledged(instance.alert.id)) {
          stats.acknowledged++;
        }
      } else {
        stats.resolved++;
      }
    }

    for (const alert of this.alerts.values()) {
      stats.bySeverity[alert.severity]++;
      if (this.silenceManager.isSilenced(alert.id)) {
        stats.silenced++;
      }
    }

    return stats;
  }

  /**
   * Create standard alerts
   */
  static createStandardAlerts(): IAlert[] {
    return [
      {
        id: 'high_error_rate',
        name: 'High Error Rate',
        condition: 'mcp_errors_total > 100',
        severity: AlertSeverity.ERROR,
        message: 'Error rate is above threshold',
        threshold: 100,
        duration: 300000, // 5 minutes
        labels: { category: 'errors' }
      },
      {
        id: 'high_response_time',
        name: 'High Response Time',
        condition: 'mcp_response_time_ms > 1000',
        severity: AlertSeverity.WARNING,
        message: 'Response time is above 1 second',
        threshold: 1000,
        duration: 60000, // 1 minute
        labels: { category: 'performance' }
      },
      {
        id: 'memory_usage_high',
        name: 'High Memory Usage',
        condition: 'process_heap_bytes > 1073741824', // 1GB
        severity: AlertSeverity.WARNING,
        message: 'Memory usage is above 1GB',
        threshold: 1073741824,
        labels: { category: 'resources' }
      },
      {
        id: 'api_down',
        name: 'API Unavailable',
        condition: 'n8n_api_up == 0',
        severity: AlertSeverity.CRITICAL,
        message: 'n8n API is not responding',
        threshold: 0,
        labels: { category: 'availability' }
      },
      {
        id: 'rate_limit_exceeded',
        name: 'Rate Limit Exceeded',
        condition: 'mcp_rate_limit_exceeded_total > 10',
        severity: AlertSeverity.WARNING,
        message: 'Rate limits being exceeded frequently',
        threshold: 10,
        duration: 600000, // 10 minutes
        labels: { category: 'limits' }
      }
    ];
  }
}