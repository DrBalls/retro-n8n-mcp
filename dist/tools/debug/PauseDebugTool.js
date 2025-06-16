import { z } from 'zod';
import { BaseTool } from '../base/Tool.js';
export class PauseDebugTool extends BaseTool {
    name = 'debug_pause';
    description = 'Pause execution in a debug session';
    inputSchema = z.object({
        sessionId: z.string().describe('The ID of the debug session to pause'),
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
            await session.pause();
            const state = session.getState();
            const sessionData = session.exportSession();
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify({
                            success: true,
                            sessionId: input.sessionId,
                            message: 'Execution paused',
                            currentState: {
                                isPaused: state.isPaused,
                                currentNodeId: state.currentNodeId,
                                executionId: sessionData.executionId,
                            },
                            nextActions: {
                                resume: 'Use debug_resume to continue execution',
                                step: 'Use debug_step to step through execution',
                                inspect: 'Use debug_inspect to examine current state',
                                breakpoint: 'Use debug_breakpoint to manage breakpoints',
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
                            sessionId: input.sessionId,
                            troubleshooting: {
                                alreadyPaused: 'Session may already be paused',
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
            tags: ['debug', 'execution control', 'pause'],
        };
    }
}
//# sourceMappingURL=PauseDebugTool.js.map