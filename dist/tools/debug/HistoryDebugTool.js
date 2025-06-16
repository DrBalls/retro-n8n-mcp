import { z } from 'zod';
import { BaseTool } from '../base/Tool.js';
export class HistoryDebugTool extends BaseTool {
    name = 'debug_history';
    description = 'View history of past debug sessions';
    inputSchema = z.object({
        limit: z.number().min(1).max(50).default(10).describe('Number of sessions to retrieve'),
        workflowId: z.string().optional().describe('Filter by specific workflow ID'),
    });
    async execute(params, context) {
        const input = this.validateInput(params);
        if (!global.debugSessionManager) {
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify({
                            success: true,
                            message: 'No debug session manager initialized',
                            history: [],
                            instructions: 'Use debug_start to create the first debug session',
                        }, null, 2),
                    }],
            };
        }
        try {
            let history = global.debugSessionManager.getSessionHistory(input.limit);
            // Filter by workflow if specified
            if (input.workflowId) {
                history = history.filter(session => session.workflowId === input.workflowId);
            }
            const formattedHistory = history.map(session => ({
                sessionId: session.id,
                workflowId: session.workflowId,
                executionId: session.executionId,
                active: session.isActive,
                startTime: session.startTime,
                endTime: session.endTime,
                duration: session.endTime
                    ? session.endTime.getTime() - session.startTime.getTime()
                    : Date.now() - session.startTime.getTime(),
                durationFormatted: session.endTime
                    ? `${Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000)}s`
                    : 'ongoing',
                statistics: {
                    breakpoints: session.breakpoints.size,
                    breakpointsHit: Array.from(session.breakpoints.values())
                        .reduce((sum, bp) => sum + bp.hitCount, 0),
                    watchExpressions: session.watchExpressions.size,
                    timelineEvents: session.timeline.length,
                    nodesExecuted: new Set(session.timeline.map(e => e.nodeId)).size,
                    errors: session.timeline.filter(e => e.error).length,
                },
            }));
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify({
                            success: true,
                            filter: input.workflowId ? { workflowId: input.workflowId } : null,
                            totalSessions: formattedHistory.length,
                            history: formattedHistory,
                            summary: {
                                activeSessions: formattedHistory.filter(s => s.active).length,
                                completedSessions: formattedHistory.filter(s => !s.active).length,
                                averageDuration: formattedHistory.filter(s => !s.active).length > 0
                                    ? Math.floor(formattedHistory
                                        .filter(s => !s.active)
                                        .reduce((sum, s) => sum + s.duration, 0) /
                                        formattedHistory.filter(s => !s.active).length / 1000) + 's'
                                    : 'N/A',
                                totalErrors: formattedHistory.reduce((sum, s) => sum + s.statistics.errors, 0),
                            },
                            nextActions: {
                                resume: 'Use debug_start with an existing sessionId to resume',
                                status: 'Use debug_status to get detailed info on active sessions',
                                newSession: 'Use debug_start to create a new debug session',
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
                                noHistory: 'No debug sessions have been created yet',
                                invalidFilter: 'Check that the workflow ID is correct',
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
            requirements: ['Debug session manager'],
            tags: ['debug', 'history', 'monitoring'],
        };
    }
}
//# sourceMappingURL=HistoryDebugTool.js.map