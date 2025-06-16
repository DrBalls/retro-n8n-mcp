import { z } from 'zod';
import { BaseTool } from '../base/Tool.js';
import { DebugSessionManager } from '../../services/DebugSessionManager.js';
const BreakpointSchema = z.object({
    nodeId: z.string().describe('The ID of the node to break at'),
    condition: z.string().optional().describe('Optional condition expression for conditional breakpoint'),
    enabled: z.boolean().default(true).describe('Whether the breakpoint is enabled'),
});
export class StartDebugSessionTool extends BaseTool {
    name = 'debug_start';
    description = 'Start a new debugging session for a workflow with optional breakpoints and execution data';
    inputSchema = z.object({
        workflowId: z.string().describe('The ID of the workflow to debug'),
        executionId: z.string().optional().describe('Optional existing execution ID to debug'),
        executionData: z.record(z.any()).optional().describe('Optional execution data to use when triggering the workflow'),
        breakpoints: z.array(BreakpointSchema).optional().describe('Optional initial breakpoints to set'),
        watchExpressions: z.array(z.string()).optional().describe('Optional expressions to watch during debugging'),
    });
    async execute(params, context) {
        const input = this.validateInput(params);
        if (!context.apiClient) {
            throw new Error('n8n API client not configured');
        }
        // Initialize DebugSessionManager if not already initialized
        if (!global.debugSessionManager) {
            global.debugSessionManager = new DebugSessionManager(context.apiClient);
        }
        const sessionManager = global.debugSessionManager;
        try {
            // Check if workflow exists
            const workflow = await context.apiClient.getWorkflow(input.workflowId);
            // Prepare breakpoints
            const breakpoints = input.breakpoints?.map((bp, index) => ({
                id: `bp_${Date.now()}_${index}`,
                workflowId: input.workflowId,
                nodeId: bp.nodeId,
                condition: bp.condition,
                enabled: bp.enabled,
                hitCount: 0,
            })) || [];
            // Prepare watch expressions
            const watchExpressions = input.watchExpressions?.map(expr => ({
                id: `watch_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                expression: expr,
            })) || [];
            // Create debug session
            const session = await sessionManager.createSession({
                workflowId: input.workflowId,
                executionId: input.executionId,
                breakpoints,
                watchExpressions,
            });
            // Start the session
            await session.start(input.executionId);
            // If execution data provided and no executionId, trigger with data
            if (!input.executionId && input.executionData) {
                const execution = await context.apiClient.triggerWorkflow(input.workflowId, input.executionData);
                // Update session with new execution ID
                const updatedSession = session.exportSession();
                updatedSession.executionId = execution.id;
            }
            const sessionData = session.exportSession();
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify({
                            success: true,
                            sessionId: sessionData.id,
                            workflowId: sessionData.workflowId,
                            executionId: sessionData.executionId,
                            workflowName: workflow.name,
                            status: 'active',
                            breakpoints: breakpoints.map(bp => ({
                                id: bp.id,
                                nodeId: bp.nodeId,
                                condition: bp.condition,
                                enabled: bp.enabled,
                            })),
                            watchExpressions: watchExpressions.map(we => ({
                                id: we.id,
                                expression: we.expression,
                            })),
                            state: {
                                isPaused: sessionData.state.isPaused,
                                currentNodeId: sessionData.state.currentNodeId,
                            },
                            message: `Debug session started for workflow "${workflow.name}"`,
                            instructions: {
                                pause: 'Use debug_pause to pause execution',
                                resume: 'Use debug_resume to continue execution',
                                step: 'Use debug_step to step through execution',
                                inspect: 'Use debug_inspect to examine variables',
                                breakpoint: 'Use debug_breakpoint to manage breakpoints',
                                watch: 'Use debug_watch to manage watch expressions',
                                stop: 'Use debug_stop to end the session',
                            },
                        }, null, 2),
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
                            troubleshooting: {
                                workflowNotFound: 'Ensure the workflow ID is correct',
                                apiError: 'Check your n8n API connection and credentials',
                                sessionLimit: 'Maximum number of debug sessions may be reached',
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
            requirements: ['n8n API access'],
            tags: ['debug', 'execution', 'troubleshooting'],
        };
    }
}
//# sourceMappingURL=StartDebugSessionTool.js.map