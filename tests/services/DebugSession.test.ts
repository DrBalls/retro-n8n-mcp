import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { DebugSession, IDebugSessionOptions, IBreakpoint, IWatchExpression, IExecutionSnapshot } from '../../src/services/DebugSession.js';
import { N8nApiClient } from '../../src/services/N8nApiClient.js';

describe('DebugSession', () => {
  let mockApiClient: any;
  let debugSession: DebugSession;
  let sessionOptions: IDebugSessionOptions;

  beforeEach(() => {
    mockApiClient = {
      triggerWorkflow: vi.fn(),
      getExecution: vi.fn(),
      stopExecution: vi.fn(),
    };

    sessionOptions = {
      workflowId: 'workflow-123',
    };

    debugSession = new DebugSession(sessionOptions, mockApiClient as N8nApiClient);
  });

  afterEach(() => {
    debugSession.stop();
    vi.clearAllMocks();
  });

  describe('Session Management', () => {
    it('should create session with generated ID', () => {
      const id = debugSession.getId();
      expect(id).toMatch(/^debug_\d+_[a-z0-9]+$/);
    });

    it('should create session with provided ID', () => {
      const customSession = new DebugSession(
        { ...sessionOptions, sessionId: 'custom-id' },
        mockApiClient
      );
      expect(customSession.getId()).toBe('custom-id');
    });

    it('should initialize with correct workflow ID', () => {
      expect(debugSession.getWorkflowId()).toBe('workflow-123');
    });

    it('should start as active', () => {
      expect(debugSession.isActive()).toBe(true);
    });

    it('should have empty initial state', () => {
      const state = debugSession.getState();
      expect(state.isPaused).toBe(false);
      expect(state.stepMode).toBeNull();
      expect(state.callStack).toEqual([]);
      expect(state.variables.size).toBe(0);
    });

    it('should export session data', () => {
      const exported = debugSession.exportSession();
      expect(exported.id).toBe(debugSession.getId());
      expect(exported.workflowId).toBe('workflow-123');
      expect(exported.isActive).toBe(true);
      expect(exported.breakpoints).toBeInstanceOf(Map);
      expect(exported.watchExpressions).toBeInstanceOf(Map);
      expect(exported.timeline).toEqual([]);
    });
  });

  describe('Breakpoint Management', () => {
    it('should add breakpoint', () => {
      const breakpoint = debugSession.addBreakpoint({
        id: 'bp-1',
        workflowId: 'workflow-123',
        nodeId: 'node-1',
        enabled: true,
      });

      expect(breakpoint.hitCount).toBe(0);
      expect(debugSession.getBreakpoints()).toHaveLength(1);
      expect(debugSession.getBreakpoints()[0]).toEqual(breakpoint);
    });

    it('should add breakpoint with condition', () => {
      const breakpoint = debugSession.addBreakpoint({
        id: 'bp-1',
        workflowId: 'workflow-123',
        nodeId: 'node-1',
        condition: 'x > 10',
        enabled: true,
      });

      expect(breakpoint.condition).toBe('x > 10');
    });

    it('should remove breakpoint', () => {
      debugSession.addBreakpoint({
        id: 'bp-1',
        workflowId: 'workflow-123',
        nodeId: 'node-1',
        enabled: true,
      });

      const removed = debugSession.removeBreakpoint('bp-1');
      expect(removed).toBe(true);
      expect(debugSession.getBreakpoints()).toHaveLength(0);
    });

    it('should return false when removing non-existent breakpoint', () => {
      const removed = debugSession.removeBreakpoint('non-existent');
      expect(removed).toBe(false);
    });

    it('should enable breakpoint', () => {
      const bp = debugSession.addBreakpoint({
        id: 'bp-1',
        workflowId: 'workflow-123',
        nodeId: 'node-1',
        enabled: false,
      });

      const enabled = debugSession.enableBreakpoint('bp-1');
      expect(enabled).toBe(true);
      expect(bp.enabled).toBe(true);
    });

    it('should disable breakpoint', () => {
      const bp = debugSession.addBreakpoint({
        id: 'bp-1',
        workflowId: 'workflow-123',
        nodeId: 'node-1',
        enabled: true,
      });

      const disabled = debugSession.disableBreakpoint('bp-1');
      expect(disabled).toBe(true);
      expect(bp.enabled).toBe(false);
    });

    it('should emit events for breakpoint operations', () => {
      const addedSpy = vi.fn();
      const removedSpy = vi.fn();
      const enabledSpy = vi.fn();
      const disabledSpy = vi.fn();

      debugSession.on('breakpoint:added', addedSpy);
      debugSession.on('breakpoint:removed', removedSpy);
      debugSession.on('breakpoint:enabled', enabledSpy);
      debugSession.on('breakpoint:disabled', disabledSpy);

      const bp = debugSession.addBreakpoint({
        id: 'bp-1',
        workflowId: 'workflow-123',
        nodeId: 'node-1',
        enabled: true,
      });

      expect(addedSpy).toHaveBeenCalledWith(bp);

      debugSession.disableBreakpoint('bp-1');
      expect(disabledSpy).toHaveBeenCalledWith(bp);

      debugSession.enableBreakpoint('bp-1');
      expect(enabledSpy).toHaveBeenCalledWith(bp);

      debugSession.removeBreakpoint('bp-1');
      expect(removedSpy).toHaveBeenCalledWith(bp);
    });
  });

  describe('Watch Expression Management', () => {
    it('should add watch expression', () => {
      const watch = debugSession.addWatchExpression('variable.value');
      
      expect(watch.id).toMatch(/^watch_\d+_[a-z0-9]+$/);
      expect(watch.expression).toBe('variable.value');
      expect(watch.nodeId).toBeUndefined();
      expect(debugSession.getWatchExpressions()).toHaveLength(1);
    });

    it('should add watch expression with node context', () => {
      const watch = debugSession.addWatchExpression('input.data', 'node-1');
      
      expect(watch.nodeId).toBe('node-1');
    });

    it('should remove watch expression', () => {
      const watch = debugSession.addWatchExpression('variable.value');
      
      const removed = debugSession.removeWatchExpression(watch.id);
      expect(removed).toBe(true);
      expect(debugSession.getWatchExpressions()).toHaveLength(0);
    });

    it('should return false when removing non-existent watch', () => {
      const removed = debugSession.removeWatchExpression('non-existent');
      expect(removed).toBe(false);
    });

    it('should emit events for watch operations', () => {
      const addedSpy = vi.fn();
      const removedSpy = vi.fn();

      debugSession.on('watch:added', addedSpy);
      debugSession.on('watch:removed', removedSpy);

      const watch = debugSession.addWatchExpression('variable.value');
      expect(addedSpy).toHaveBeenCalledWith(watch);

      debugSession.removeWatchExpression(watch.id);
      expect(removedSpy).toHaveBeenCalledWith(watch);
    });

    it('should handle watch expression evaluation errors', async () => {
      const watch = debugSession.addWatchExpression('invalid.expression');
      
      await expect(debugSession.evaluateWatchExpression(watch.id)).rejects.toThrow();
    });
  });

  describe('Execution Control', () => {
    it('should start with new execution', async () => {
      mockApiClient.triggerWorkflow.mockResolvedValue({ id: 'exec-123' });
      const startedSpy = vi.fn();
      debugSession.on('session:started', startedSpy);

      await debugSession.start();

      expect(mockApiClient.triggerWorkflow).toHaveBeenCalledWith('workflow-123', {});
      expect(debugSession.getExecutionId()).toBe('exec-123');
      expect(startedSpy).toHaveBeenCalledWith({
        sessionId: debugSession.getId(),
        executionId: 'exec-123',
      });
    });

    it('should start with existing execution', async () => {
      const startedSpy = vi.fn();
      debugSession.on('session:started', startedSpy);

      await debugSession.start('existing-exec');

      expect(mockApiClient.triggerWorkflow).not.toHaveBeenCalled();
      expect(debugSession.getExecutionId()).toBe('existing-exec');
      expect(startedSpy).toHaveBeenCalledWith({
        sessionId: debugSession.getId(),
        executionId: 'existing-exec',
      });
    });

    it('should pause execution', async () => {
      const pausedSpy = vi.fn();
      debugSession.on('session:paused', pausedSpy);

      await debugSession.pause();

      expect(debugSession.getState().isPaused).toBe(true);
      expect(pausedSpy).toHaveBeenCalledWith({
        sessionId: debugSession.getId(),
        nodeId: undefined,
      });
    });

    it('should resume execution', async () => {
      const resumedSpy = vi.fn();
      debugSession.on('session:resumed', resumedSpy);

      await debugSession.pause();
      await debugSession.resume();

      expect(debugSession.getState().isPaused).toBe(false);
      expect(debugSession.getState().stepMode).toBeNull();
      expect(resumedSpy).toHaveBeenCalledWith({
        sessionId: debugSession.getId(),
      });
    });

    it('should stop execution', async () => {
      mockApiClient.triggerWorkflow.mockResolvedValue({ id: 'exec-123' });
      const stoppedSpy = vi.fn();
      debugSession.on('session:stopped', stoppedSpy);

      await debugSession.start();
      await debugSession.stop();

      expect(debugSession.isActive()).toBe(false);
      expect(mockApiClient.stopExecution).toHaveBeenCalledWith('exec-123');
      expect(stoppedSpy).toHaveBeenCalled();
    });

    it('should handle stop execution errors gracefully', async () => {
      mockApiClient.triggerWorkflow.mockResolvedValue({ id: 'exec-123' });
      mockApiClient.stopExecution.mockRejectedValue(new Error('Stop failed'));

      await debugSession.start();
      await debugSession.stop(); // Should not throw

      expect(debugSession.isActive()).toBe(false);
    });
  });

  describe('Step Execution', () => {
    it('should set step over mode', async () => {
      await debugSession.stepOver();
      expect(debugSession.getState().stepMode).toBe('over');
      expect(debugSession.getState().isPaused).toBe(false);
    });

    it('should set step into mode', async () => {
      await debugSession.stepInto();
      expect(debugSession.getState().stepMode).toBe('into');
      expect(debugSession.getState().isPaused).toBe(false);
    });

    it('should set step out mode', async () => {
      await debugSession.stepOut();
      expect(debugSession.getState().stepMode).toBe('out');
      expect(debugSession.getState().isPaused).toBe(false);
    });
  });

  describe('Variable Inspection', () => {
    it('should inspect variable', async () => {
      const value = await debugSession.inspectVariable('testVar');
      expect(value).toBeUndefined(); // No variables in initial state
    });

    it('should get variables for node', async () => {
      const vars = await debugSession.getVariables('node-1');
      expect(vars).toEqual({});
    });

    it('should cache variable values', async () => {
      // First call
      await debugSession.inspectVariable('testVar');
      
      // Second call should use cache (we can't directly test this without mocking internals)
      const value = await debugSession.inspectVariable('testVar');
      expect(value).toBeUndefined();
    });
  });

  describe('Timeline Management', () => {
    it('should add timeline events', () => {
      const eventSpy = vi.fn();
      debugSession.on('timeline:event', eventSpy);

      const snapshot: IExecutionSnapshot = {
        timestamp: new Date(),
        nodeId: 'node-1',
        nodeName: 'Test Node',
        nodeType: 'test',
        inputData: { test: true },
        outputData: { result: 'success' },
        duration: 100,
      };

      debugSession.addTimelineEvent(snapshot);

      expect(debugSession.getTimeline()).toHaveLength(1);
      expect(debugSession.getTimeline()[0]).toEqual(snapshot);
      expect(eventSpy).toHaveBeenCalledWith(snapshot);
    });

    it('should filter timeline by date range', () => {
      const now = new Date();
      const past = new Date(now.getTime() - 10000);
      const future = new Date(now.getTime() + 10000);

      const events: IExecutionSnapshot[] = [
        {
          timestamp: past,
          nodeId: 'node-1',
          nodeName: 'Past Node',
          nodeType: 'test',
          inputData: {},
        },
        {
          timestamp: now,
          nodeId: 'node-2',
          nodeName: 'Current Node',
          nodeType: 'test',
          inputData: {},
        },
        {
          timestamp: future,
          nodeId: 'node-3',
          nodeName: 'Future Node',
          nodeType: 'test',
          inputData: {},
        },
      ];

      events.forEach(e => debugSession.addTimelineEvent(e));

      const filtered = debugSession.getTimelineRange(
        new Date(now.getTime() - 5000),
        new Date(now.getTime() + 5000)
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].nodeId).toBe('node-2');
    });

    it('should check breakpoints when adding timeline events', () => {
      const hitSpy = vi.fn();
      debugSession.on('breakpoint:hit', hitSpy);

      debugSession.addBreakpoint({
        id: 'bp-1',
        workflowId: 'workflow-123',
        nodeId: 'node-1',
        enabled: true,
      });

      const snapshot: IExecutionSnapshot = {
        timestamp: new Date(),
        nodeId: 'node-1',
        nodeName: 'Test Node',
        nodeType: 'test',
        inputData: {},
      };

      debugSession.addTimelineEvent(snapshot);

      expect(hitSpy).toHaveBeenCalledWith({
        breakpoint: expect.objectContaining({
          id: 'bp-1',
          hitCount: 1,
        }),
        nodeId: 'node-1',
        sessionId: debugSession.getId(),
      });

      expect(debugSession.getState().isPaused).toBe(true);
      expect(debugSession.getState().currentNodeId).toBe('node-1');
    });

    it('should not trigger disabled breakpoints', () => {
      const hitSpy = vi.fn();
      debugSession.on('breakpoint:hit', hitSpy);

      debugSession.addBreakpoint({
        id: 'bp-1',
        workflowId: 'workflow-123',
        nodeId: 'node-1',
        enabled: false,
      });

      const snapshot: IExecutionSnapshot = {
        timestamp: new Date(),
        nodeId: 'node-1',
        nodeName: 'Test Node',
        nodeType: 'test',
        inputData: {},
      };

      debugSession.addTimelineEvent(snapshot);

      expect(hitSpy).not.toHaveBeenCalled();
      expect(debugSession.getState().isPaused).toBe(false);
    });
  });

  describe('Execution Monitoring', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should poll execution status', async () => {
      mockApiClient.triggerWorkflow.mockResolvedValue({ id: 'exec-123' });
      mockApiClient.getExecution.mockResolvedValue({
        id: 'exec-123',
        status: 'running',
        data: {},
      });

      await debugSession.start();

      // Advance timer to trigger polling
      vi.advanceTimersByTime(1000);

      expect(mockApiClient.getExecution).toHaveBeenCalledWith('exec-123');
    });

    it('should stop on execution completion', async () => {
      mockApiClient.triggerWorkflow.mockResolvedValue({ id: 'exec-123' });
      mockApiClient.getExecution.mockResolvedValue({
        id: 'exec-123',
        status: 'success',
        data: {},
      });

      const stoppedSpy = vi.fn();
      debugSession.on('session:stopped', stoppedSpy);

      await debugSession.start();

      // Advance timer to trigger polling
      vi.advanceTimersByTime(1000);
      await vi.runAllTimersAsync();

      expect(stoppedSpy).toHaveBeenCalled();
    });

    it('should update timeline from execution data', async () => {
      mockApiClient.triggerWorkflow.mockResolvedValue({ id: 'exec-123' });
      mockApiClient.getExecution.mockResolvedValue({
        id: 'exec-123',
        status: 'running',
        data: {
          resultData: {
            runData: {
              'node-1': [{
                startTime: new Date().toISOString(),
                nodeName: 'Test Node',
                nodeType: 'test',
                data: { main: [[{ json: { test: true } }]] },
                executionTime: 100,
              }],
            },
          },
        },
      });

      await debugSession.start();

      // Advance timer to trigger polling
      vi.advanceTimersByTime(1000);
      await vi.runAllTimersAsync();

      const timeline = debugSession.getTimeline();
      expect(timeline).toHaveLength(1);
      expect(timeline[0].nodeId).toBe('node-1');
    });

    it('should handle polling errors', async () => {
      mockApiClient.triggerWorkflow.mockResolvedValue({ id: 'exec-123' });
      mockApiClient.getExecution.mockRejectedValue(new Error('API Error'));

      const errorSpy = vi.fn();
      debugSession.on('session:error', errorSpy);

      await debugSession.start();

      // Advance timer to trigger polling
      vi.advanceTimersByTime(1000);
      await vi.runAllTimersAsync();

      expect(errorSpy).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('Initialization with Options', () => {
    it('should initialize with breakpoints', () => {
      const breakpoints: IBreakpoint[] = [
        {
          id: 'bp-1',
          workflowId: 'workflow-123',
          nodeId: 'node-1',
          enabled: true,
          hitCount: 0,
        },
        {
          id: 'bp-2',
          workflowId: 'workflow-123',
          nodeId: 'node-2',
          enabled: false,
          hitCount: 0,
        },
      ];

      const session = new DebugSession(
        { ...sessionOptions, breakpoints },
        mockApiClient
      );

      expect(session.getBreakpoints()).toHaveLength(2);
      expect(session.getBreakpoints()[0]).toEqual(breakpoints[0]);
      expect(session.getBreakpoints()[1]).toEqual(breakpoints[1]);
    });

    it('should initialize with watch expressions', () => {
      const watchExpressions: IWatchExpression[] = [
        {
          id: 'watch-1',
          expression: 'variable.value',
        },
        {
          id: 'watch-2',
          expression: 'node.output',
          nodeId: 'node-1',
        },
      ];

      const session = new DebugSession(
        { ...sessionOptions, watchExpressions },
        mockApiClient
      );

      expect(session.getWatchExpressions()).toHaveLength(2);
      expect(session.getWatchExpressions()[0]).toEqual(watchExpressions[0]);
      expect(session.getWatchExpressions()[1]).toEqual(watchExpressions[1]);
    });
  });
});