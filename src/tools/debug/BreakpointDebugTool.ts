import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';

export class BreakpointDebugTool extends BaseTool {
  name = 'debug_breakpoint';
  description = 'Manage breakpoints in a debug session (add, remove, enable, disable, list)';
  
  inputSchema = z.object({
    sessionId: z.string().describe('The ID of the debug session'),
    action: z.enum(['add', 'remove', 'enable', 'disable', 'list']).describe('Breakpoint action to perform'),
    breakpointId: z.string().optional().describe('ID of breakpoint for remove/enable/disable actions'),
    nodeId: z.string().optional().describe('Node ID for adding a new breakpoint'),
    condition: z.string().optional().describe('Optional condition expression for conditional breakpoint'),
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
      let result: any = {
        success: true,
        sessionId: input.sessionId,
        action: input.action,
      };

      switch (input.action) {
        case 'add':
          if (!input.nodeId) {
            throw new Error('nodeId is required for adding a breakpoint');
          }
          
          const newBreakpoint = session.addBreakpoint({
            id: `bp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            workflowId: session.getWorkflowId(),
            nodeId: input.nodeId,
            condition: input.condition,
            enabled: true,
          });
          
          result.breakpoint = {
            id: newBreakpoint.id,
            nodeId: newBreakpoint.nodeId,
            condition: newBreakpoint.condition,
            enabled: newBreakpoint.enabled,
            hitCount: newBreakpoint.hitCount,
          };
          result.message = `Breakpoint added at node ${input.nodeId}`;
          break;

        case 'remove':
          if (!input.breakpointId) {
            throw new Error('breakpointId is required for removing a breakpoint');
          }
          
          const removed = session.removeBreakpoint(input.breakpointId);
          result.removed = removed;
          result.message = removed 
            ? `Breakpoint ${input.breakpointId} removed`
            : `Breakpoint ${input.breakpointId} not found`;
          break;

        case 'enable':
          if (!input.breakpointId) {
            throw new Error('breakpointId is required for enabling a breakpoint');
          }
          
          const enabled = session.enableBreakpoint(input.breakpointId);
          result.enabled = enabled;
          result.message = enabled 
            ? `Breakpoint ${input.breakpointId} enabled`
            : `Breakpoint ${input.breakpointId} not found`;
          break;

        case 'disable':
          if (!input.breakpointId) {
            throw new Error('breakpointId is required for disabling a breakpoint');
          }
          
          const disabled = session.disableBreakpoint(input.breakpointId);
          result.disabled = disabled;
          result.message = disabled 
            ? `Breakpoint ${input.breakpointId} disabled`
            : `Breakpoint ${input.breakpointId} not found`;
          break;

        case 'list':
          const breakpoints = session.getBreakpoints();
          result.breakpoints = breakpoints.map(bp => ({
            id: bp.id,
            nodeId: bp.nodeId,
            condition: bp.condition,
            enabled: bp.enabled,
            hitCount: bp.hitCount,
          }));
          result.totalBreakpoints = breakpoints.length;
          result.activeBreakpoints = breakpoints.filter(bp => bp.enabled).length;
          break;
      }

      // Add current execution state
      const state = session.getState();
      result.currentState = {
        isPaused: state.isPaused,
        currentNodeId: state.currentNodeId,
      };

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2),
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
            action: input.action,
            troubleshooting: {
              nodeNotFound: 'Ensure the node ID exists in the workflow',
              breakpointNotFound: 'Use debug_breakpoint with action "list" to see all breakpoints',
              sessionEnded: 'Session may have ended - use debug_status to check',
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
      tags: ['debug', 'breakpoint', 'execution control'],
    };
  }
}