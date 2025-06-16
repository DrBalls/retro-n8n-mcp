import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';

export class StepDebugTool extends BaseTool {
  name = 'debug_step';
  description = 'Control step-through execution in a debug session (step over, into, or out)';
  
  inputSchema = z.object({
    sessionId: z.string().describe('The ID of the debug session'),
    stepType: z.enum(['over', 'into', 'out']).describe('Type of step operation: over (next node at same level), into (next node), out (exit current level)'),
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
      let stepPromise: Promise<void>;
      let description: string;

      switch (input.stepType) {
        case 'over':
          stepPromise = session.stepOver();
          description = 'Stepping over to next node at same level';
          break;
        case 'into':
          stepPromise = session.stepInto();
          description = 'Stepping into next node';
          break;
        case 'out':
          stepPromise = session.stepOut();
          description = 'Stepping out of current level';
          break;
      }

      // Set a reasonable timeout for the step operation
      const timeoutPromise = new Promise<void>((_, reject) => {
        setTimeout(() => reject(new Error('Step operation timed out')), 30000);
      });

      await Promise.race([stepPromise, timeoutPromise]);

      const sessionData = session.exportSession();
      const currentState = session.getState();
      const timeline = session.getTimeline();
      const lastEvent = timeline[timeline.length - 1];

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            sessionId: input.sessionId,
            stepType: input.stepType,
            description,
            currentState: {
              nodeId: currentState.currentNodeId,
              isPaused: currentState.isPaused,
              callStackDepth: currentState.callStack.length,
            },
            lastExecutedNode: lastEvent ? {
              nodeId: lastEvent.nodeId,
              nodeName: lastEvent.nodeName,
              nodeType: lastEvent.nodeType,
              timestamp: lastEvent.timestamp,
              duration: lastEvent.duration,
              hasError: !!lastEvent.error,
            } : null,
            executionId: sessionData.executionId,
            timelineLength: timeline.length,
            nextActions: {
              continue: 'Use debug_resume to continue normal execution',
              stepAgain: `Use debug_step with same or different stepType`,
              inspect: `Use debug_inspect to examine variables at node ${currentState.currentNodeId}`,
              setBreakpoint: 'Use debug_breakpoint to set a breakpoint',
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
            stepType: input.stepType,
            troubleshooting: {
              timeout: 'Step operation may have timed out - check execution status',
              sessionEnded: 'Session may have ended - use debug_status to check',
              executionError: 'Execution may have encountered an error',
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
      tags: ['debug', 'execution', 'step-through'],
    };
  }
}