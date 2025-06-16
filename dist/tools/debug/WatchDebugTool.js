import { z } from 'zod';
import { BaseTool } from '../base/Tool.js';
export class WatchDebugTool extends BaseTool {
    name = 'debug_watch';
    description = 'Manage watch expressions to track variable values during debug execution';
    inputSchema = z.object({
        sessionId: z.string().describe('The ID of the debug session'),
        action: z.enum(['add', 'remove', 'evaluate', 'list']).describe('Watch expression action to perform'),
        expression: z.string().optional().describe('Expression to watch (for add action)'),
        watchId: z.string().optional().describe('ID of watch expression (for remove/evaluate actions)'),
        nodeId: z.string().optional().describe('Optional node context for the expression'),
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
            let result = {
                success: true,
                sessionId: input.sessionId,
                action: input.action,
            };
            switch (input.action) {
                case 'add':
                    if (!input.expression) {
                        throw new Error('expression is required for adding a watch');
                    }
                    const newWatch = session.addWatchExpression(input.expression, input.nodeId);
                    result.watchExpression = {
                        id: newWatch.id,
                        expression: newWatch.expression,
                        nodeContext: newWatch.nodeId || 'global',
                        value: newWatch.value,
                        error: newWatch.error,
                    };
                    result.message = `Watch expression added: ${input.expression}`;
                    break;
                case 'remove':
                    if (!input.watchId) {
                        throw new Error('watchId is required for removing a watch expression');
                    }
                    const removed = session.removeWatchExpression(input.watchId);
                    result.removed = removed;
                    result.message = removed
                        ? `Watch expression ${input.watchId} removed`
                        : `Watch expression ${input.watchId} not found`;
                    break;
                case 'evaluate':
                    if (!input.watchId) {
                        throw new Error('watchId is required for evaluating a watch expression');
                    }
                    try {
                        const value = await session.evaluateWatchExpression(input.watchId);
                        result.watchExpression = {
                            id: input.watchId,
                            value,
                            evaluated: true,
                        };
                        result.message = 'Watch expression evaluated successfully';
                    }
                    catch (evalError) {
                        result.watchExpression = {
                            id: input.watchId,
                            error: evalError instanceof Error ? evalError.message : 'Evaluation failed',
                            evaluated: false,
                        };
                        result.message = 'Watch expression evaluation failed';
                    }
                    break;
                case 'list':
                    const watchExpressions = session.getWatchExpressions();
                    result.watchExpressions = watchExpressions.map(we => ({
                        id: we.id,
                        expression: we.expression,
                        nodeContext: we.nodeId || 'global',
                        value: we.value,
                        error: we.error,
                        hasValue: we.value !== undefined,
                    }));
                    result.totalWatches = watchExpressions.length;
                    result.evaluatedWatches = watchExpressions.filter(we => we.value !== undefined).length;
                    result.erroredWatches = watchExpressions.filter(we => we.error !== undefined).length;
                    break;
            }
            // Add current execution state
            const state = session.getState();
            result.currentState = {
                isPaused: state.isPaused,
                currentNodeId: state.currentNodeId,
                variableCount: state.variables.size,
            };
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
                            action: input.action,
                            troubleshooting: {
                                invalidExpression: 'Ensure the expression syntax is valid',
                                watchNotFound: 'Use debug_watch with action "list" to see all watch expressions',
                                scopeError: 'Variable may not be available in the current scope',
                                sessionEnded: 'Session may have ended - use debug_status to check',
                            },
                        }, null, 2),
                    }],
            };
        }
    }
    getMetadata() {
        return {
            category: 'debug',
            isMutating: true,
            requirements: ['Active debug session'],
            tags: ['debug', 'watch', 'variables', 'monitoring'],
        };
    }
}
//# sourceMappingURL=WatchDebugTool.js.map