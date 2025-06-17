/**
 * SLO (Service Level Objective) manager implementation
 */
import { ISLO, ISLOStatus, ISLOManager, IMetricRegistry } from '../../types/monitoring.js';
import { EventEmitter } from 'events';
/**
 * SLO manager implementation
 */
export declare class SLOManager extends EventEmitter implements ISLOManager {
    private metrics;
    private slos;
    private calculator;
    private windowTracker;
    private evaluationInterval;
    private evaluationTimer?;
    private lastStatuses;
    constructor(metrics: IMetricRegistry, config?: {
        evaluationInterval?: number;
    });
    registerSLO(slo: ISLO): void;
    unregisterSLO(id: string): void;
    getStatus(id: string): ISLOStatus | undefined;
    getAllStatuses(): ISLOStatus[];
    getErrorBudgetReport(id: string, start: Date, end: Date): any;
    private evaluate;
    private startEvaluation;
    stop(): void;
    private generateRecommendations;
    /**
     * Create standard SLOs
     */
    static createStandardSLOs(): ISLO[];
}
//# sourceMappingURL=SLOManager.d.ts.map