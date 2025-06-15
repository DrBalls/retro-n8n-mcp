import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ToolRegistry } from '../../src/tools/ToolRegistry.js';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../../src/tools/base/Tool.js';
import { z } from 'zod';

// Mock tool for testing
class MockTool extends BaseTool {
  name = 'mock_tool';
  description = 'A mock tool for testing';
  inputSchema = z.object({
    message: z.string(),
  });

  async execute(params: unknown, context: IToolContext): Promise<IToolResponse> {
    const { message } = this.validateInput<{ message: string }>(params);
    return this.createTextResponse(`Mock response: ${message}`);
  }

  getMetadata(): IToolMetadata {
    return {
      category: 'utility',
      tags: ['test', 'mock'],
      version: '1.0.0',
      isMutating: false,
    };
  }
}

// Mock tool with dependencies
class DependentTool extends BaseTool {
  name = 'dependent_tool';
  description = 'A tool that depends on mock_tool';
  inputSchema = z.object({});

  async execute(params: unknown, context: IToolContext): Promise<IToolResponse> {
    return this.createTextResponse('Dependent tool executed');
  }
}

// Mock tool that's unavailable
class UnavailableTool extends BaseTool {
  name = 'unavailable_tool';
  description = 'A tool that is not available';
  inputSchema = z.object({});

  async execute(params: unknown, context: IToolContext): Promise<IToolResponse> {
    return this.createTextResponse('Should not execute');
  }

  isAvailable(): boolean {
    return false;
  }
}

describe('ToolRegistry', () => {
  let registry: ToolRegistry;

  beforeEach(() => {
    registry = new ToolRegistry();
  });

  describe('registration', () => {
    it('should register a tool', () => {
      const tool = new MockTool();
      registry.register(tool);

      expect(registry.has(tool.name)).toBe(true);
      expect(registry.get(tool.name)).toBe(tool);
    });

    it('should throw error when registering duplicate tool without override', () => {
      const tool = new MockTool();
      registry.register(tool);

      expect(() => registry.register(tool)).toThrow('Tool \'mock_tool\' is already registered');
    });

    it('should allow override when specified', () => {
      const tool1 = new MockTool();
      const tool2 = new MockTool();
      
      registry.register(tool1);
      registry.register(tool2, { override: true });

      expect(registry.get(tool1.name)).toBe(tool2);
    });

    it('should enforce dependencies', () => {
      const dependent = new DependentTool();

      expect(() => registry.register(dependent, { dependencies: ['mock_tool'] }))
        .toThrow('Dependency \'mock_tool\' for tool \'dependent_tool\' is not registered');
    });

    it('should register with valid dependencies', () => {
      const tool = new MockTool();
      const dependent = new DependentTool();

      registry.register(tool);
      registry.register(dependent, { dependencies: ['mock_tool'] });

      expect(registry.has(dependent.name)).toBe(true);
    });

    it('should not register unavailable tools', () => {
      const tool = new UnavailableTool();

      expect(() => registry.register(tool))
        .toThrow('Tool \'unavailable_tool\' is not available');
    });
  });

  describe('retrieval', () => {
    it('should get all tools', () => {
      const tool1 = new MockTool();
      const tool2 = new DependentTool();

      registry.register(tool1);
      registry.register(tool2);

      const tools = registry.getAll();
      expect(tools).toHaveLength(2);
      expect(tools).toContain(tool1);
      expect(tools).toContain(tool2);
    });

    it('should get tool names', () => {
      const tool1 = new MockTool();
      const tool2 = new DependentTool();

      registry.register(tool1);
      registry.register(tool2);

      const names = registry.getNames();
      expect(names).toEqual(['mock_tool', 'dependent_tool']);
    });

    it('should get tools by category', () => {
      const tool = new MockTool();
      registry.register(tool);

      const utilityTools = registry.getByCategory('utility');
      expect(utilityTools).toHaveLength(1);
      expect(utilityTools[0]).toBe(tool);

      const workflowTools = registry.getByCategory('workflow');
      expect(workflowTools).toHaveLength(0);
    });

    it('should get tools by tag', () => {
      const tool = new MockTool();
      registry.register(tool);

      const testTools = registry.getByTag('test');
      expect(testTools).toHaveLength(1);
      expect(testTools[0]).toBe(tool);

      const otherTools = registry.getByTag('other');
      expect(otherTools).toHaveLength(0);
    });

    it('should search tools by name and description', () => {
      const tool1 = new MockTool();
      const tool2 = new DependentTool();

      registry.register(tool1);
      registry.register(tool2);

      const mockResults = registry.search('mock');
      expect(mockResults).toHaveLength(2); // Both tools have 'mock' in name/description
      expect(mockResults).toContain(tool1);

      const dependentResults = registry.search('depends');
      expect(dependentResults).toHaveLength(1);
      expect(dependentResults[0]).toBe(tool2);
    });
  });

  describe('execution', () => {
    it('should execute a tool', async () => {
      const tool = new MockTool();
      registry.register(tool);

      const result = await registry.execute('mock_tool', { message: 'Hello' });
      expect(result.content[0].text).toBe('Mock response: Hello');
    });

    it('should throw error for non-existent tool', async () => {
      await expect(registry.execute('non_existent', {}))
        .rejects.toThrow('Tool \'non_existent\' not found');
    });

    it('should merge contexts', async () => {
      const tool = new MockTool();
      const executeSpy = vi.spyOn(tool, 'execute');

      registry.updateContext({ metadata: { global: 'value' } });
      registry.register(tool);

      await registry.execute('mock_tool', { message: 'Test' }, {
        metadata: { local: 'override' },
      });

      expect(executeSpy).toHaveBeenCalledWith(
        { message: 'Test' },
        expect.objectContaining({
          metadata: expect.objectContaining({ local: 'override' }),
          requestId: expect.stringMatching(/^req_/),
        })
      );
    });

    it('should track execution statistics', async () => {
      const tool = new MockTool();
      registry.register(tool);

      // Execute multiple times
      await registry.execute('mock_tool', { message: 'Test 1' });
      await registry.execute('mock_tool', { message: 'Test 2' });

      const stats = registry.getStats('mock_tool');
      expect(stats).toBeDefined();
      expect(stats?.executions).toBe(2);
      expect(stats?.errors).toBe(0);
      expect(stats?.averageDuration).toBeGreaterThanOrEqual(0);
      expect(stats?.totalDuration).toBeGreaterThanOrEqual(0);
      expect(stats?.lastExecuted).toBeInstanceOf(Date);
    });

    it('should track error statistics', async () => {
      const tool = new MockTool();
      vi.spyOn(tool, 'execute').mockRejectedValueOnce(new Error('Test error'));

      registry.register(tool);

      try {
        await registry.execute('mock_tool', { message: 'Test' });
      } catch (error) {
        // Expected error
      }

      const stats = registry.getStats('mock_tool');
      expect(stats?.errors).toBe(1);
      expect(stats?.lastError).toBeInstanceOf(Date);
    });
  });

  describe('unregistration', () => {
    it('should unregister a tool', () => {
      const tool = new MockTool();
      registry.register(tool);

      const result = registry.unregister(tool.name);
      expect(result).toBe(true);
      expect(registry.has(tool.name)).toBe(false);
    });

    it('should return false for non-existent tool', () => {
      const result = registry.unregister('non_existent');
      expect(result).toBe(false);
    });

    it('should prevent unregistering tools with dependents', () => {
      const tool = new MockTool();
      const dependent = new DependentTool();

      registry.register(tool);
      registry.register(dependent, { dependencies: ['mock_tool'] });

      expect(() => registry.unregister(tool.name))
        .toThrow('Cannot unregister \'mock_tool\': tools depend on it: dependent_tool');
    });
  });

  describe('events', () => {
    it('should emit tool:registered event', () => {
      const tool = new MockTool();
      const listener = vi.fn();

      registry.on('tool:registered', listener);
      registry.register(tool);

      expect(listener).toHaveBeenCalledWith(tool);
    });

    it('should emit tool:unregistered event', () => {
      const tool = new MockTool();
      const listener = vi.fn();

      registry.register(tool);
      registry.on('tool:unregistered', listener);
      registry.unregister(tool.name);

      expect(listener).toHaveBeenCalledWith(tool.name);
    });

    it('should emit tool:executed event', async () => {
      const tool = new MockTool();
      const listener = vi.fn();

      registry.register(tool);
      registry.on('tool:executed', listener);
      await registry.execute('mock_tool', { message: 'Test' });

      expect(listener).toHaveBeenCalledWith(
        'mock_tool',
        expect.any(Number)
      );
    });

    it('should emit tool:error event', async () => {
      const tool = new MockTool();
      const error = new Error('Test error');
      vi.spyOn(tool, 'execute').mockRejectedValueOnce(error);

      const listener = vi.fn();

      registry.register(tool);
      registry.on('tool:error', listener);

      try {
        await registry.execute('mock_tool', { message: 'Test' });
      } catch (e) {
        // Expected error
      }

      expect(listener).toHaveBeenCalledWith('mock_tool', error);
    });
  });

  describe('MCP conversion', () => {
    it('should convert tools to MCP format', () => {
      const tool = new MockTool();
      registry.register(tool);

      const mcpTools = registry.toMcpTools();
      expect(mcpTools).toHaveLength(1);
      expect(mcpTools[0]).toEqual({
        name: 'mock_tool',
        description: 'A mock tool for testing',
        inputSchema: expect.objectContaining({
          type: 'object',
          properties: expect.objectContaining({
            message: { type: 'string' },
          }),
        }),
      });
    });

    it('should exclude unavailable tools from MCP conversion', () => {
      const available = new MockTool();
      const unavailable = new UnavailableTool();

      // Force register unavailable tool by mocking isAvailable
      vi.spyOn(unavailable, 'isAvailable').mockReturnValueOnce(true);
      registry.register(available);
      registry.register(unavailable);

      // Restore original behavior
      vi.mocked(unavailable.isAvailable).mockRestore();

      const mcpTools = registry.toMcpTools();
      expect(mcpTools).toHaveLength(1);
      expect(mcpTools[0].name).toBe('mock_tool');
    });
  });
});