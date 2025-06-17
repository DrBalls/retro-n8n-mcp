/**
 * Alert manager implementation
 */
import { IAlert, IAlertInstance, IAlertManager, AlertSeverity } from '../../types/monitoring.js';
import { EventEmitter } from 'events';
import { IMetricRegistry } from '../../types/monitoring.js';
/**
 * Alert manager implementation
 */
export declare class AlertManager extends EventEmitter implements IAlertManager {
    private metrics;
    private alerts;
    private instances;
    private evaluator;
    private silenceManager;
    private evaluationInterval;
    private evaluationTimer?;
    private acknowledgements;
    constructor(metrics: IMetricRegistry, config?: {
        evaluationInterval?: number;
    });
    registerAlert(alert: IAlert): void;
    unregisterAlert(id: string): void;
    evaluate(): Promise<IAlertInstance[]>;
    getActiveAlerts(): IAlertInstance[];
    acknowledge(alertId: string): void;
    isAcknowledged(alertId: string): boolean;
    silence(alertId: string, duration: number, reason?: string): void;
    private startEvaluation;
    stop(): void;
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
    };
    /**
     * Create standard alerts
     */
    static createStandardAlerts(): IAlert[];
}
//# sourceMappingURL=AlertManager.d.ts.map