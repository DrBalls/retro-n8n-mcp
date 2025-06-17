import { EventEmitter } from 'events';
import { SimpleCache } from '../utils/SimpleCache.js';
export class DebugSession extends EventEmitter {
    session;
    apiClient;
    pollInterval;
    variableCache;
    constructor(options, apiClient) {
        super();
        this.apiClient = apiClient;
        this.variableCache = new SimpleCache({ defaultTtl: 300000 }); // 5 minute TTL
        this.session = {
            id: options.sessionId || this.generateSessionId(),
            workflowId: options.workflowId,
            executionId: options.executionId,
            startTime: new Date(),
            state: {
                isPaused: false,
                stepMode: null,
                callStack: [],
                variables: new Map(),
            },
            breakpoints: new Map(),
            watchExpressions: new Map(),
            timeline: [],
            isActive: true,
        };
        // Initialize breakpoints if provided
        if (options.breakpoints) {
            options.breakpoints.forEach(bp => {
                this.session.breakpoints.set(bp.id, bp);
            });
        }
        // Initialize watch expressions if provided
        if (options.watchExpressions) {
            options.watchExpressions.forEach(we => {
                this.session.watchExpressions.set(we.id, we);
            });
        }
    }
    generateSessionId() {
        return `debug_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    // Session Management
    getId() {
        return this.session.id;
    }
    getWorkflowId() {
        return this.session.workflowId;
    }
    getExecutionId() {
        return this.session.executionId;
    }
    isActive() {
        return this.session.isActive;
    }
    getState() {
        return { ...this.session.state };
    }
    getTimeline() {
        return [...this.session.timeline];
    }
    // Breakpoint Management
    addBreakpoint(breakpoint) {
        const bp = {
            ...breakpoint,
            hitCount: 0,
        };
        this.session.breakpoints.set(bp.id, bp);
        this.emit('breakpoint:added', bp);
        return bp;
    }
    removeBreakpoint(breakpointId) {
        const bp = this.session.breakpoints.get(breakpointId);
        if (bp) {
            this.session.breakpoints.delete(breakpointId);
            this.emit('breakpoint:removed', bp);
            return true;
        }
        return false;
    }
    enableBreakpoint(breakpointId) {
        const bp = this.session.breakpoints.get(breakpointId);
        if (bp) {
            bp.enabled = true;
            this.emit('breakpoint:enabled', bp);
            return true;
        }
        return false;
    }
    disableBreakpoint(breakpointId) {
        const bp = this.session.breakpoints.get(breakpointId);
        if (bp) {
            bp.enabled = false;
            this.emit('breakpoint:disabled', bp);
            return true;
        }
        return false;
    }
    getBreakpoints() {
        return Array.from(this.session.breakpoints.values());
    }
    // Watch Expression Management
    addWatchExpression(expression, nodeId) {
        const we = {
            id: `watch_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            expression,
            nodeId,
        };
        this.session.watchExpressions.set(we.id, we);
        this.emit('watch:added', we);
        // Evaluate immediately if possible
        this.evaluateWatchExpression(we.id).catch(() => {
            // Ignore errors during initial evaluation
        });
        return we;
    }
    removeWatchExpression(watchId) {
        const we = this.session.watchExpressions.get(watchId);
        if (we) {
            this.session.watchExpressions.delete(watchId);
            this.emit('watch:removed', we);
            return true;
        }
        return false;
    }
    async evaluateWatchExpression(watchId) {
        const we = this.session.watchExpressions.get(watchId);
        if (!we) {
            throw new Error(`Watch expression ${watchId} not found`);
        }
        try {
            // In a real implementation, this would evaluate the expression
            // in the context of the current execution state
            const value = await this.evaluateExpression(we.expression, we.nodeId);
            we.value = value;
            we.error = undefined;
            this.emit('watch:evaluated', we);
            return value;
        }
        catch (error) {
            we.error = error instanceof Error ? error.message : 'Evaluation failed';
            we.value = undefined;
            this.emit('watch:error', we);
            throw error;
        }
    }
    getWatchExpressions() {
        return Array.from(this.session.watchExpressions.values());
    }
    // Execution Control
    async start(executionId) {
        if (executionId) {
            this.session.executionId = executionId;
        }
        if (!this.session.executionId) {
            // Trigger new execution
            const execution = await this.apiClient.triggerWorkflow(this.session.workflowId, {});
            this.session.executionId = execution.id;
        }
        // Start monitoring the execution
        this.startMonitoring();
        this.emit('session:started', {
            sessionId: this.session.id,
            executionId: this.session.executionId,
        });
    }
    async pause() {
        this.session.state.isPaused = true;
        this.emit('session:paused', {
            sessionId: this.session.id,
            nodeId: this.session.state.currentNodeId,
        });
    }
    async resume() {
        this.session.state.isPaused = false;
        this.session.state.stepMode = null;
        this.emit('session:resumed', {
            sessionId: this.session.id,
        });
    }
    async stepOver() {
        this.session.state.stepMode = 'over';
        this.session.state.isPaused = false;
        // Wait for next node completion at same level
        await this.waitForStep('over');
    }
    async stepInto() {
        this.session.state.stepMode = 'into';
        this.session.state.isPaused = false;
        // Wait for next node execution
        await this.waitForStep('into');
    }
    async stepOut() {
        this.session.state.stepMode = 'out';
        this.session.state.isPaused = false;
        // Wait for current node completion
        await this.waitForStep('out');
    }
    async stop() {
        this.session.isActive = false;
        this.session.endTime = new Date();
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = undefined;
        }
        // Stop the execution if running
        if (this.session.executionId) {
            try {
                await this.apiClient.stopExecution(this.session.executionId);
            }
            catch (error) {
                // Ignore errors when stopping
            }
        }
        this.emit('session:stopped', {
            sessionId: this.session.id,
            duration: this.session.endTime.getTime() - this.session.startTime.getTime(),
        });
    }
    // Variable Inspection
    async inspectVariable(name, nodeId) {
        const cacheKey = `${nodeId || 'global'}_${name}`;
        const cached = this.variableCache.get(cacheKey);
        if (cached !== undefined) {
            return cached;
        }
        const value = await this.getVariableValue(name, nodeId);
        this.variableCache.set(cacheKey, value);
        return value;
    }
    async getVariables(nodeId) {
        // In a real implementation, this would fetch variables from the execution context
        const variables = {};
        for (const [key, value] of this.session.state.variables) {
            if (!nodeId || key.startsWith(`${nodeId}.`)) {
                variables[key] = value;
            }
        }
        return variables;
    }
    // Timeline Management
    addTimelineEvent(snapshot) {
        this.session.timeline.push(snapshot);
        this.emit('timeline:event', snapshot);
        // Check breakpoints
        this.checkBreakpoints(snapshot.nodeId);
    }
    getTimelineRange(startTime, endTime) {
        return this.session.timeline.filter(event => {
            if (startTime && event.timestamp < startTime)
                return false;
            if (endTime && event.timestamp > endTime)
                return false;
            return true;
        });
    }
    // Private Helper Methods
    startMonitoring() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
        }
        this.pollInterval = setInterval(async () => {
            if (!this.session.isActive || !this.session.executionId) {
                return;
            }
            try {
                const execution = await this.apiClient.getExecution(this.session.executionId);
                // Update execution state
                this.updateExecutionState(execution);
                // Check if execution completed
                if (execution.status === 'success' || execution.status === 'error' || execution.status === 'canceled') {
                    this.stop();
                }
            }
            catch (error) {
                this.emit('session:error', error);
            }
        }, 1000); // Poll every second
    }
    updateExecutionState(execution) {
        // Extract node execution data and update timeline
        if (execution.data?.resultData?.runData) {
            const runData = execution.data.resultData.runData;
            for (const [nodeId, nodeExecutions] of Object.entries(runData)) {
                if (Array.isArray(nodeExecutions)) {
                    for (const nodeExecution of nodeExecutions) {
                        const snapshot = {
                            timestamp: new Date(nodeExecution.startTime),
                            nodeId,
                            nodeName: nodeExecution.nodeName || nodeId,
                            nodeType: nodeExecution.nodeType || 'unknown',
                            inputData: nodeExecution.data?.main || [],
                            outputData: nodeExecution.data?.main || [],
                            error: nodeExecution.error?.message,
                            duration: nodeExecution.executionTime,
                        };
                        // Only add if not already in timeline
                        const exists = this.session.timeline.some(e => e.nodeId === nodeId && e.timestamp.getTime() === snapshot.timestamp.getTime());
                        if (!exists) {
                            this.addTimelineEvent(snapshot);
                        }
                    }
                }
            }
        }
    }
    checkBreakpoints(nodeId) {
        for (const breakpoint of this.session.breakpoints.values()) {
            if (breakpoint.enabled && breakpoint.nodeId === nodeId) {
                breakpoint.hitCount++;
                // Evaluate condition if present
                if (breakpoint.condition) {
                    try {
                        const shouldBreak = this.evaluateCondition(breakpoint.condition);
                        if (!shouldBreak)
                            continue;
                    }
                    catch (error) {
                        // Ignore condition errors
                        continue;
                    }
                }
                // Pause execution
                this.session.state.isPaused = true;
                this.session.state.currentNodeId = nodeId;
                this.emit('breakpoint:hit', {
                    breakpoint,
                    nodeId,
                    sessionId: this.session.id,
                });
                break; // Only hit first matching breakpoint
            }
        }
    }
    evaluateCondition(condition) {
        // In a real implementation, this would evaluate the condition
        // in the context of the current execution state
        return true; // Placeholder
    }
    async evaluateExpression(expression, nodeId) {
        // In a real implementation, this would evaluate the expression
        // in the context of the current execution state
        return null; // Placeholder
    }
    async getVariableValue(name, nodeId) {
        // In a real implementation, this would fetch the variable value
        // from the execution context
        return this.session.state.variables.get(`${nodeId || 'global'}.${name}`);
    }
    async waitForStep(mode) {
        return new Promise((resolve) => {
            const stepHandler = (snapshot) => {
                // Step logic based on mode
                let shouldStop = false;
                switch (mode) {
                    case 'into':
                        // Stop at next node
                        shouldStop = true;
                        break;
                    case 'over':
                        // Stop at next node at same call stack level
                        shouldStop = this.session.state.callStack.length <= 1;
                        break;
                    case 'out':
                        // Stop when returning from current call stack level
                        shouldStop = this.session.state.callStack.length < 1;
                        break;
                }
                if (shouldStop) {
                    this.session.state.isPaused = true;
                    this.session.state.stepMode = null;
                    this.session.state.currentNodeId = snapshot.nodeId;
                    this.off('timeline:event', stepHandler);
                    resolve();
                }
            };
            this.on('timeline:event', stepHandler);
        });
    }
    // Export session data
    exportSession() {
        return {
            ...this.session,
            breakpoints: new Map(this.session.breakpoints),
            watchExpressions: new Map(this.session.watchExpressions),
            timeline: [...this.session.timeline],
            state: {
                ...this.session.state,
                variables: new Map(this.session.state.variables),
            },
        };
    }
}
//# sourceMappingURL=DebugSession.js.map