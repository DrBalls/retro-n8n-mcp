import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { StartDebugSessionTool } from '../../../src/tools/debug/StartDebugSessionTool.js';
import { N8nApiClient } from '../../../src/services/N8nApiClient.js';
import { DebugSessionManager } from '../../../src/services/DebugSessionManager.js';

// Mock the global debugSessionManager
vi.mock('../../../src/services/DebugSessionManager.js', () => {
  const actualModule = vi.importActual('../../../src/services/DebugSessionManager.js');
  return {
    ...actualModule,
    DebugSessionManager: vi.fn().mockImplementation(function(this: any, apiClient: any) {
      this.apiClient = apiClient;
      this.sessions = new Map();
      this.createSession = vi.fn().mockImplementation((options) => ({
        getId: () => 'debug_123_abc',
        getWorkflowId: () => options.workflowId,
        getExecutionId: () => options.executionId,
        isActive: () => true,
        getState: () => ({
          isPaused: false,
          stepMode: null,
          callStack: [],
          variables: new Map(),
        }),
        getBreakpoints: () => [],
        getWatchExpressions: () => [],
        getTimeline: () => [],
      }));
      this.getSession = vi.fn();
      this.stopSession = vi.fn();
    }),
  };
});

describe('StartDebugSessionTool', () => {
  let tool: StartDebugSessionTool;
  let mockApiClient: any;
  let mockContext: any;

  beforeEach(() => {
    // Clear the global debugSessionManager
    global.debugSessionManager = undefined;

    tool = new StartDebugSessionTool();
    
    mockApiClient = {
      request: vi.fn(),
      getWorkflow: vi.fn(),
      getExecution: vi.fn(),
    };

    mockContext = {
      apiClient: mockApiClient,
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    global.debugSessionManager = undefined;
  });

  describe('Basic Properties', () => {
    it('should have correct name', () => {
      expect(tool.name).toBe('debug_start');
    });

    it('should have correct description', () => {
      expect(tool.description).toContain('Start a new debug session');
    });

    it('should have correct metadata', () => {
      const metadata = tool.getMetadata();
      expect(metadata.category).toBe('debug');
      expect(metadata.isMutating).toBe(true);
      expect(metadata.tags).toContain('debug');
      expect(metadata.tags).toContain('execution');
      expect(metadata.tags).toContain('monitoring');
    });
  });

  describe('Input Validation', () => {
    it('should validate required workflow ID', async () => {
      await expect(tool.execute({}, mockContext)).rejects.toThrow();
    });

    it('should accept valid input with just workflow ID', async () => {
      mockApiClient.getWorkflow.mockResolvedValue({
        id: 'workflow-123',
        name: 'Test Workflow',
        active: true,
      });

      const result = await tool.execute(
        { workflowId: 'workflow-123' },
        mockContext
      );

      expect(result.isError).toBeFalsy();
    });

    it('should accept all optional parameters', async () => {
      mockApiClient.getWorkflow.mockResolvedValue({
        id: 'workflow-123',
        name: 'Test Workflow',
        active: true,
      });

      const input = {
        workflowId: 'workflow-123',
        executionId: 'exec-123',
        breakpoints: [
          {
            nodeId: 'node-1',
            condition: 'x > 10',
          },
        ],
        watchExpressions: ['variable.value', 'node.output'],
      };

      const result = await tool.execute(input, mockContext);
      expect(result.isError).toBeFalsy();
    });
  });

  describe('Session Creation', () => {
    it('should create debug session manager on first use', async () => {
      mockApiClient.getWorkflow.mockResolvedValue({
        id: 'workflow-123',
        name: 'Test Workflow',
        active: true,
      });

      expect(global.debugSessionManager).toBeUndefined();

      await tool.execute(
        { workflowId: 'workflow-123' },
        mockContext
      );

      expect(global.debugSessionManager).toBeDefined();
      expect(DebugSessionManager).toHaveBeenCalledWith(mockApiClient);
    });

    it('should reuse existing debug session manager', async () => {
      mockApiClient.getWorkflow.mockResolvedValue({
        id: 'workflow-123',
        name: 'Test Workflow',
        active: true,
      });

      // First call
      await tool.execute(
        { workflowId: 'workflow-123' },
        mockContext
      );

      const managerInstance = global.debugSessionManager;

      // Second call
      await tool.execute(
        { workflowId: 'workflow-456' },
        mockContext
      );

      // Should reuse the same instance
      expect(global.debugSessionManager).toBe(managerInstance);
      expect(DebugSessionManager).toHaveBeenCalledTimes(1);
    });

    it('should create session with breakpoints', async () => {
      mockApiClient.getWorkflow.mockResolvedValue({
        id: 'workflow-123',
        name: 'Test Workflow',
        active: true,
      });

      const input = {
        workflowId: 'workflow-123',
        breakpoints: [
          {
            nodeId: 'node-1',
            condition: 'x > 10',
          },
          {
            nodeId: 'node-2',
          },
        ],
      };

      await tool.execute(input, mockContext);

      const manager = global.debugSessionManager!;
      expect(manager.createSession).toHaveBeenCalledWith({
        workflowId: 'workflow-123',
        executionId: undefined,
        breakpoints: [
          {
            id: expect.stringMatching(/^bp_\d+_[a-z0-9]+$/),
            workflowId: 'workflow-123',
            nodeId: 'node-1',
            condition: 'x > 10',
            enabled: true,
          },
          {
            id: expect.stringMatching(/^bp_\d+_[a-z0-9]+$/),
            workflowId: 'workflow-123',
            nodeId: 'node-2',
            condition: undefined,
            enabled: true,
          },
        ],
        watchExpressions: [],
      });
    });

    it('should create session with watch expressions', async () => {
      mockApiClient.getWorkflow.mockResolvedValue({
        id: 'workflow-123',
        name: 'Test Workflow',
        active: true,
      });

      const input = {
        workflowId: 'workflow-123',
        watchExpressions: ['variable.value', 'node.output'],
      };

      await tool.execute(input, mockContext);

      const manager = global.debugSessionManager!;
      expect(manager.createSession).toHaveBeenCalledWith({
        workflowId: 'workflow-123',
        executionId: undefined,
        breakpoints: [],
        watchExpressions: [
          {
            id: expect.stringMatching(/^watch_\d+_[a-z0-9]+$/),
            expression: 'variable.value',
          },
          {
            id: expect.stringMatching(/^watch_\d+_[a-z0-9]+$/),
            expression: 'node.output',
          },
        ],
      });
    });

    it('should create session with execution ID', async () => {
      mockApiClient.getWorkflow.mockResolvedValue({
        id: 'workflow-123',
        name: 'Test Workflow',
        active: true,
      });

      mockApiClient.getExecution.mockResolvedValue({
        id: 'exec-123',
        workflowId: 'workflow-123',
        status: 'running',
      });

      const input = {
        workflowId: 'workflow-123',
        executionId: 'exec-123',
      };

      await tool.execute(input, mockContext);

      const manager = global.debugSessionManager!;
      expect(manager.createSession).toHaveBeenCalledWith({
        workflowId: 'workflow-123',
        executionId: 'exec-123',
        breakpoints: [],
        watchExpressions: [],
      });
    });
  });

  describe('Response Format', () => {
    it('should return session details on success', async () => {
      mockApiClient.getWorkflow.mockResolvedValue({
        id: 'workflow-123',
        name: 'Test Workflow',
        active: true,
      });

      const result = await tool.execute(
        { workflowId: 'workflow-123' },
        mockContext
      );

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].mimeType).toBe('application/json');

      const data = JSON.parse(result.content[0].text!);
      expect(data).toMatchObject({
        sessionId: 'debug_123_abc',
        workflowId: 'workflow-123',
        executionId: undefined,
        status: 'created',
        state: {
          isPaused: false,
          stepMode: null,
          callStack: [],
        },
        breakpoints: [],
        watchExpressions: [],
        timeline: [],
      });
    });

    it('should include instructions in response', async () => {
      mockApiClient.getWorkflow.mockResolvedValue({
        id: 'workflow-123',
        name: 'Test Workflow',
        active: true,
      });

      const result = await tool.execute(
        { workflowId: 'workflow-123' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.instructions).toBeDefined();
      expect(data.instructions).toContain('debug_step');
      expect(data.instructions).toContain('debug_inspect');
      expect(data.instructions).toContain('debug_breakpoint');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing API client', async () => {
      await expect(
        tool.execute({ workflowId: 'workflow-123' }, {})
      ).rejects.toThrow('n8n API client not configured');
    });

    it('should handle workflow not found', async () => {
      mockApiClient.getWorkflow.mockRejectedValue(
        new Error('Workflow not found')
      );

      await expect(
        tool.execute({ workflowId: 'workflow-123' }, mockContext)
      ).rejects.toThrow('Workflow not found');
    });

    it('should handle execution not found', async () => {
      mockApiClient.getWorkflow.mockResolvedValue({
        id: 'workflow-123',
        name: 'Test Workflow',
        active: true,
      });

      mockApiClient.getExecution.mockRejectedValue(
        new Error('Execution not found')
      );

      await expect(
        tool.execute(
          { workflowId: 'workflow-123', executionId: 'exec-123' },
          mockContext
        )
      ).rejects.toThrow('Execution not found');
    });

    it('should validate execution belongs to workflow', async () => {
      mockApiClient.getWorkflow.mockResolvedValue({
        id: 'workflow-123',
        name: 'Test Workflow',
        active: true,
      });

      mockApiClient.getExecution.mockResolvedValue({
        id: 'exec-123',
        workflowId: 'workflow-456', // Different workflow
        status: 'running',
      });

      await expect(
        tool.execute(
          { workflowId: 'workflow-123', executionId: 'exec-123' },
          mockContext
        )
      ).rejects.toThrow('Execution exec-123 does not belong to workflow workflow-123');
    });

    it('should handle session creation errors', async () => {
      mockApiClient.getWorkflow.mockResolvedValue({
        id: 'workflow-123',
        name: 'Test Workflow',
        active: true,
      });

      // Mock session manager to throw error
      const MockedDebugSessionManager = DebugSessionManager as any;
      MockedDebugSessionManager.mockImplementationOnce(function(this: any) {
        this.createSession = vi.fn().mockImplementation(() => {
          throw new Error('Failed to create session');
        });
      });

      await expect(
        tool.execute({ workflowId: 'workflow-123' }, mockContext)
      ).rejects.toThrow('Failed to create session');
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle inactive workflow warning', async () => {
      mockApiClient.getWorkflow.mockResolvedValue({
        id: 'workflow-123',
        name: 'Test Workflow',
        active: false, // Inactive
      });

      const result = await tool.execute(
        { workflowId: 'workflow-123' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.warning).toBe('Workflow is not active');
    });

    it('should generate unique IDs for breakpoints and watches', async () => {
      mockApiClient.getWorkflow.mockResolvedValue({
        id: 'workflow-123',
        name: 'Test Workflow',
        active: true,
      });

      const input = {
        workflowId: 'workflow-123',
        breakpoints: [
          { nodeId: 'node-1' },
          { nodeId: 'node-2' },
        ],
        watchExpressions: ['var1', 'var2'],
      };

      await tool.execute(input, mockContext);

      const manager = global.debugSessionManager!;
      const call = (manager.createSession as any).mock.calls[0][0];

      // Check that all IDs are unique
      const bpIds = call.breakpoints.map((bp: any) => bp.id);
      const watchIds = call.watchExpressions.map((we: any) => we.id);
      const allIds = [...bpIds, ...watchIds];
      const uniqueIds = new Set(allIds);

      expect(uniqueIds.size).toBe(allIds.length);
    });

    it('should handle execution status validation', async () => {
      mockApiClient.getWorkflow.mockResolvedValue({
        id: 'workflow-123',
        name: 'Test Workflow',
        active: true,
      });

      mockApiClient.getExecution.mockResolvedValue({
        id: 'exec-123',
        workflowId: 'workflow-123',
        status: 'success', // Completed execution
      });

      const result = await tool.execute(
        { workflowId: 'workflow-123', executionId: 'exec-123' },
        mockContext
      );

      const data = JSON.parse(result.content[0].text!);
      expect(data.warning).toBe('Execution has already completed with status: success');
    });
  });
});