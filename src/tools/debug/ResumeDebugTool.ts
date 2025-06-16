import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';

export class ResumeDebugTool extends BaseTool {
  name = 'debug_resume';
  description = 'Resume normal execution in a paused debug session';
  
  inputSchema = z.object({
    sessionId: z.string().describe('The ID of the debug session to resume'),
  });

  async execute(params: unknown, context: IToolContext): Promise<IToolResponse> {
    const input = this.validateInput<z.infer<typeof this.inputSchema>>(params);
    
    if (!global.debugSessionManager) {
      throw new Error('No debug sessions active. Use debug_start to create a session.');
    }

    const session = global.debugSessionManager.getSession(input.sessionId);
    if (!session) {
      throw new Error(`Debug session ${input.sessionId} not found`);
    }

    try {
      await session.resume();
      
      const state = session.getState();
      const sessionData = session.exportSession();

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            sessionId: input.sessionId,
            message: 'Execution resumed',
            currentState: {
              isPaused: state.isPaused,
              currentNodeId: state.currentNodeId,
              executionId: sessionData.executionId,
            },
            breakpoints: {
              total: sessionData.breakpoints.size,
              active: Array.from(sessionData.breakpoints.values()).filter(bp => bp.enabled).length,
            },
            nextActions: {
              pause: 'Use debug_pause to pause execution again',
              stop: 'Use debug_stop to end the session',
              inspect: 'Use debug_inspect to check state while running',
              status: 'Use debug_status to get session status',
            },
          }, null, 2),
        }],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: errorMessage,
            sessionId: input.sessionId,
            troubleshooting: {
              notPaused: 'Session may not be paused',
              sessionEnded: 'Session may have ended - use debug_status to check',
              executionComplete: 'Execution may have already completed',
            },
          }, null, 2),
        }],
      };
    }
  }

  getMetadata(): IToolMetadata {
    return {
      category: 'debug',
      isMutating: true,
      requirements: ['Active debug session'],
      tags: ['debug', 'execution control', 'resume'],
    };
  }
}