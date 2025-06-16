import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';

export class StopDebugTool extends BaseTool {
  name = 'debug_stop';
  description = 'Stop and end a debug session';
  
  inputSchema = z.object({
    sessionId: z.string().describe('The ID of the debug session to stop'),
    stopExecution: z.boolean().default(true).describe('Also stop the workflow execution if running'),
  });

  async execute(params: unknown, context: IToolContext): Promise<IToolResponse> {
    const input = this.validateInput<z.infer<typeof this.inputSchema>>(params);
    
    if (!global.debugSessionManager) {
      throw new Error('No debug sessions active.');
    }

    const session = global.debugSessionManager.getSession(input.sessionId);
    if (!session) {
      throw new Error(`Debug session ${input.sessionId} not found`);
    }

    try {
      const sessionData = session.exportSession();
      const timeline = session.getTimeline();
      
      // Stop the session
      await session.stop();
      
      // Remove from manager
      await global.debugSessionManager.removeSession(input.sessionId);

      const duration = sessionData.endTime 
        ? sessionData.endTime.getTime() - sessionData.startTime.getTime()
        : Date.now() - sessionData.startTime.getTime();

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            sessionId: input.sessionId,
            message: 'Debug session stopped',
            summary: {
              workflowId: sessionData.workflowId,
              executionId: sessionData.executionId,
              duration: duration,
              durationFormatted: `${Math.floor(duration / 1000)}s`,
              startTime: sessionData.startTime,
              endTime: sessionData.endTime || new Date(),
            },
            statistics: {
              totalBreakpoints: sessionData.breakpoints.size,
              breakpointsHit: Array.from(sessionData.breakpoints.values())
                .reduce((sum, bp) => sum + bp.hitCount, 0),
              watchExpressions: sessionData.watchExpressions.size,
              timelineEvents: timeline.length,
              nodesExecuted: new Set(timeline.map(e => e.nodeId)).size,
              errors: timeline.filter(e => e.error).length,
            },
            nextActions: {
              viewHistory: 'Use debug_history to view past sessions',
              startNew: 'Use debug_start to begin a new session',
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
              alreadyStopped: 'Session may have already been stopped',
              sessionNotFound: 'Session ID may be incorrect',
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
      tags: ['debug', 'session management', 'stop'],
    };
  }
}