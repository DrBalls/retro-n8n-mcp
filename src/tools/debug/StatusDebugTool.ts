import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';

export class StatusDebugTool extends BaseTool {
  name = 'debug_status';
  description = 'Get the current status of debug sessions';
  
  inputSchema = z.object({
    sessionId: z.string().optional().describe('Specific session ID to get status for (omit for all sessions)'),
  });

  async execute(params: unknown, context: IToolContext): Promise<IToolResponse> {
    const input = this.validateInput<z.infer<typeof this.inputSchema>>(params);
    
    if (!global.debugSessionManager) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: 'No debug session manager initialized',
            activeSessions: 0,
            instructions: 'Use debug_start to create the first debug session',
          }, null, 2),
        }],
      };
    }

    try {
      if (input.sessionId) {
        // Get specific session status
        const session = global.debugSessionManager.getSession(input.sessionId);
        if (!session) {
          throw new Error(`Debug session ${input.sessionId} not found`);
        }

        const sessionData = session.exportSession();
        const state = session.getState();
        const timeline = session.getTimeline();

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              session: {
                id: sessionData.id,
                workflowId: sessionData.workflowId,
                executionId: sessionData.executionId,
                active: sessionData.isActive,
                startTime: sessionData.startTime,
                duration: Date.now() - sessionData.startTime.getTime(),
              },
              state: {
                isPaused: state.isPaused,
                currentNodeId: state.currentNodeId,
                stepMode: state.stepMode,
                callStackDepth: state.callStack.length,
                variableCount: state.variables.size,
              },
              breakpoints: {
                total: sessionData.breakpoints.size,
                enabled: Array.from(sessionData.breakpoints.values()).filter(bp => bp.enabled).length,
                hitCounts: Array.from(sessionData.breakpoints.values()).map(bp => ({
                  nodeId: bp.nodeId,
                  hitCount: bp.hitCount,
                })).filter(bp => bp.hitCount > 0),
              },
              watchExpressions: {
                total: sessionData.watchExpressions.size,
                evaluated: Array.from(sessionData.watchExpressions.values()).filter(we => we.value !== undefined).length,
                errored: Array.from(sessionData.watchExpressions.values()).filter(we => we.error !== undefined).length,
              },
              timeline: {
                events: timeline.length,
                nodesExecuted: new Set(timeline.map(e => e.nodeId)).size,
                errors: timeline.filter(e => e.error).length,
                lastEvent: timeline[timeline.length - 1] || null,
              },
            }, null, 2),
          }],
        };
      } else {
        // Get all sessions status
        const allSessions = global.debugSessionManager.getAllSessions();
        const activeSessions = global.debugSessionManager.getActiveSessions();
        const stats = global.debugSessionManager.getStatistics();

        const sessionList = allSessions.map(session => {
          const data = session.exportSession();
          const state = session.getState();
          return {
            id: data.id,
            workflowId: data.workflowId,
            executionId: data.executionId,
            active: data.isActive,
            isPaused: state.isPaused,
            currentNodeId: state.currentNodeId,
            breakpoints: data.breakpoints.size,
            watches: data.watchExpressions.size,
            timelineEvents: data.timeline.length,
            startTime: data.startTime,
            duration: Date.now() - data.startTime.getTime(),
          };
        });

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              summary: {
                totalSessions: stats.totalSessions,
                activeSessions: stats.activeSessions,
                cachedSessions: stats.cachedSessions,
                averageSessionDuration: Math.floor(stats.averageSessionDuration / 1000) + 's',
                averageBreakpoints: Math.round(stats.averageBreakpointsPerSession),
                averageTimelineEvents: Math.round(stats.averageTimelineEventsPerSession),
              },
              sessions: sessionList,
              instructions: sessionList.length === 0 ? {
                start: 'Use debug_start to create a new debug session',
              } : {
                inspect: 'Use debug_status with sessionId to get detailed status',
                control: 'Use debug_pause, debug_resume, debug_step to control execution',
                analyze: 'Use debug_inspect to examine variables and state',
              },
            }, null, 2),
          }],
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: errorMessage,
            troubleshooting: {
              sessionNotFound: 'Session may have ended or ID is incorrect',
              useList: 'Omit sessionId to see all active sessions',
            },
          }, null, 2),
        }],
      };
    }
  }

  getMetadata(): IToolMetadata {
    return {
      category: 'debug',
      isMutating: false,
      requirements: ['Debug session manager'],
      tags: ['debug', 'status', 'monitoring'],
    };
  }
}