import { z } from 'zod';
import { BaseTool } from '../base/Tool.js';
export class InspectDebugTool extends BaseTool {
    name = 'debug_inspect';
    description = 'Inspect variables, node data, and execution state in a debug session';
    inputSchema = z.object({
        sessionId: z.string().describe('The ID of the debug session'),
        inspectType: z.enum(['variable', 'node', 'timeline', 'state', 'all']).default('all').describe('What to inspect'),
        variableName: z.string().optional().describe('Specific variable name to inspect (when inspectType is "variable")'),
        nodeId: z.string().optional().describe('Specific node ID to inspect data for'),
        timeRange: z.object({
            start: z.string().datetime().optional(),
            end: z.string().datetime().optional(),
        }).optional().describe('Time range for timeline inspection'),
    });
    async execute(params, context) {
        const input = this.validateInput(params);
        if (!global.debugSessionManager) {
            throw new Error('No debug sessions active. Use debug_start to create a session.');
        }
        const session = global.debugSessionManager.getSession(input.sessionId);
        if (!session) {
            throw new Error(`Debug session ${input.sessionId} not found`);
        }
        try {
            const result = {
                success: true,
                sessionId: input.sessionId,
                inspectType: input.inspectType,
            };
            const sessionData = session.exportSession();
            // Inspect based on type
            switch (input.inspectType) {
                case 'variable':
                    if (input.variableName) {
                        const value = await session.inspectVariable(input.variableName, input.nodeId);
                        result.variable = {
                            name: input.variableName,
                            value,
                            nodeContext: input.nodeId || 'global',
                        };
                    }
                    else {
                        const variables = await session.getVariables(input.nodeId);
                        result.variables = variables;
                        result.nodeContext = input.nodeId || 'global';
                    }
                    break;
                case 'node':
                    const nodeId = input.nodeId || sessionData.state.currentNodeId;
                    if (!nodeId) {
                        throw new Error('No node ID specified and no current node in execution');
                    }
                    // Find node data in timeline
                    const nodeEvents = sessionData.timeline.filter(event => event.nodeId === nodeId);
                    result.node = {
                        nodeId,
                        executions: nodeEvents.map(event => ({
                            timestamp: event.timestamp,
                            nodeName: event.nodeName,
                            nodeType: event.nodeType,
                            duration: event.duration,
                            hasError: !!event.error,
                            error: event.error,
                            inputDataCount: Array.isArray(event.inputData) ? event.inputData.length : 0,
                            outputDataCount: Array.isArray(event.outputData) ? event.outputData.length : 0,
                        })),
                        lastExecution: nodeEvents[nodeEvents.length - 1] || null,
                    };
                    break;
                case 'timeline':
                    const timeline = input.timeRange
                        ? session.getTimelineRange(input.timeRange.start ? new Date(input.timeRange.start) : undefined, input.timeRange.end ? new Date(input.timeRange.end) : undefined)
                        : session.getTimeline();
                    result.timeline = {
                        events: timeline.map(event => ({
                            timestamp: event.timestamp,
                            nodeId: event.nodeId,
                            nodeName: event.nodeName,
                            nodeType: event.nodeType,
                            duration: event.duration,
                            hasError: !!event.error,
                            memoryUsage: event.memoryUsage,
                        })),
                        totalEvents: timeline.length,
                        timeRange: {
                            start: timeline[0]?.timestamp,
                            end: timeline[timeline.length - 1]?.timestamp,
                        },
                    };
                    break;
                case 'state':
                    const state = session.getState();
                    result.state = {
                        currentNodeId: state.currentNodeId,
                        currentExecutionId: sessionData.executionId,
                        isPaused: state.isPaused,
                        stepMode: state.stepMode,
                        callStackDepth: state.callStack.length,
                        callStack: state.callStack,
                        variableCount: state.variables.size,
                        sessionStartTime: sessionData.startTime,
                        sessionActive: sessionData.isActive,
                        breakpointCount: sessionData.breakpoints.size,
                        watchExpressionCount: sessionData.watchExpressions.size,
                    };
                    break;
                case 'all':
                    // Provide a comprehensive overview
                    const currentState = session.getState();
                    const allTimeline = session.getTimeline();
                    result.overview = {
                        session: {
                            id: sessionData.id,
                            workflowId: sessionData.workflowId,
                            executionId: sessionData.executionId,
                            active: sessionData.isActive,
                            startTime: sessionData.startTime,
                            duration: sessionData.endTime
                                ? sessionData.endTime.getTime() - sessionData.startTime.getTime()
                                : Date.now() - sessionData.startTime.getTime(),
                        },
                        currentState: {
                            nodeId: currentState.currentNodeId,
                            isPaused: currentState.isPaused,
                            stepMode: currentState.stepMode,
                            callStackDepth: currentState.callStack.length,
                        },
                        breakpoints: Array.from(sessionData.breakpoints.values()).map(bp => ({
                            id: bp.id,
                            nodeId: bp.nodeId,
                            enabled: bp.enabled,
                            hitCount: bp.hitCount,
                            condition: bp.condition,
                        })),
                        watchExpressions: Array.from(sessionData.watchExpressions.values()).map(we => ({
                            id: we.id,
                            expression: we.expression,
                            value: we.value,
                            error: we.error,
                            nodeContext: we.nodeId,
                        })),
                        timeline: {
                            totalEvents: allTimeline.length,
                            uniqueNodes: new Set(allTimeline.map(e => e.nodeId)).size,
                            errors: allTimeline.filter(e => e.error).length,
                            averageDuration: allTimeline.length > 0
                                ? allTimeline.reduce((sum, e) => sum + (e.duration || 0), 0) / allTimeline.length
                                : 0,
                        },
                    };
                    break;
            }
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify(result, null, 2),
                    }],
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify({
                            success: false,
                            error: errorMessage,
                            sessionId: input.sessionId,
                            troubleshooting: {
                                sessionNotFound: 'Check if session is still active with debug_status',
                                variableNotFound: 'Variable may not exist in current scope',
                                nodeNotExecuted: 'Node may not have been executed yet',
                            },
                        }, null, 2),
                    }],
            };
        }
    }
    getMetadata() {
        return {
            category: 'debug',
            isMutating: false,
            requirements: ['Active debug session'],
            tags: ['debug', 'inspection', 'variables', 'state'],
        };
    }
}
//# sourceMappingURL=InspectDebugTool.js.map