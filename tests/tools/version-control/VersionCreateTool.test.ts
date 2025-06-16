import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VersionCreateTool } from '../../../src/tools/version-control/VersionCreateTool.js';
import { IToolContext } from '../../../src/base/Tool.js';

// Mock the dependencies
vi.mock('../../../src/services/version-control/VersionControlManager.js');
vi.mock('../../../src/utils/Logger.js');

describe('VersionCreateTool', () => {
  let tool: VersionCreateTool;
  let mockContext: IToolContext;
  let mockVersionManager: any;

  beforeEach(() => {
    mockVersionManager = {
      createVersion: vi.fn(),
      getVersionHistory: vi.fn().mockResolvedValue([])
    };

    // Mock the constructor injection
    tool = new VersionCreateTool();
    (tool as any).versionManager = mockVersionManager;

    mockContext = {
      apiClient: {
        getWorkflow: vi.fn(),
        updateWorkflow: vi.fn()
      }
    } as any;
  });

  describe('Basic Properties', () => {
    it('should have correct name and description', () => {
      expect(tool.name).toBe('version_create');
      expect(tool.description).toContain('Create a new version');
    });

    it('should have correct metadata', () => {
      const metadata = tool.getMetadata();
      expect(metadata.category).toBe('version-control');
      expect(metadata.isMutating).toBe(true);
      expect(metadata.tags).toContain('versioning');
    });
  });

  describe('Input Validation', () => {
    it('should validate required fields', async () => {
      const invalidInputs = [
        {}, // Missing workflowId and message
        { workflowId: 'test' }, // Missing message
        { message: 'test' }, // Missing workflowId
        { workflowId: '', message: 'test' }, // Empty workflowId
        { workflowId: 'test', message: '' }, // Empty message
      ];

      for (const input of invalidInputs) {
        await expect(tool.execute(input, mockContext)).rejects.toThrow();
      }
    });

    it('should accept valid minimal input', async () => {
      const sampleWorkflow = {
        id: 'workflow-1',
        name: 'Test Workflow',
        nodes: [],
        connections: {}
      };

      mockContext.apiClient.getWorkflow = vi.fn().mockResolvedValue(sampleWorkflow);
      mockVersionManager.createVersion.mockResolvedValue({
        id: 'version-1',
        versionString: '1.0.0',
        commitMessage: 'Test version',
        author: 'user',
        createdAt: Date.now(),
        branchName: 'main'
      });

      const input = {
        workflowId: 'workflow-1',
        message: 'Test version'
      };

      const response = await tool.execute(input, mockContext);
      expect(response.content[0].type).toBe('text');
    });

    it('should validate version type enum', async () => {
      const input = {
        workflowId: 'workflow-1',
        message: 'Test version',
        versionType: 'invalid' as any
      };

      await expect(tool.execute(input, mockContext)).rejects.toThrow();
    });

    it('should validate tags array', async () => {
      const input = {
        workflowId: 'workflow-1',
        message: 'Test version',
        tags: 'not-an-array' as any
      };

      await expect(tool.execute(input, mockContext)).rejects.toThrow();
    });
  });

  describe('Core Functionality', () => {
    beforeEach(() => {
      const sampleWorkflow = {
        id: 'workflow-1',
        name: 'Test Workflow',
        nodes: [
          { id: 'node-1', type: 'webhook', name: 'Webhook' }
        ],
        connections: {},
        active: true
      };

      mockContext.apiClient.getWorkflow = vi.fn().mockResolvedValue(sampleWorkflow);
    });

    it('should create version with auto increment', async () => {
      const expectedVersion = {
        id: 'version-1',
        versionString: '1.0.0',
        commitMessage: 'Initial version',
        author: 'test-user',
        createdAt: Date.now(),
        branchName: 'main',
        workflowId: 'workflow-1',
        isSnapshot: false,
        tags: []
      };

      mockVersionManager.createVersion.mockResolvedValue(expectedVersion);

      const input = {
        workflowId: 'workflow-1',
        message: 'Initial version',
        author: 'test-user',
        versionType: 'auto'
      };

      const response = await tool.execute(input, mockContext);
      const result = JSON.parse(response.content[0].text);

      expect(result.success).toBe(true);
      expect(result.version.versionString).toBe('1.0.0');
      expect(result.version.commitMessage).toBe('Initial version');
      expect(mockVersionManager.createVersion).toHaveBeenCalledWith(
        'workflow-1',
        expect.any(Object),
        expect.objectContaining({
          message: 'Initial version',
          author: 'test-user',
          versionType: 'auto'
        })
      );
    });

    it('should create version with specific increment type', async () => {
      const expectedVersion = {
        id: 'version-2',
        versionString: '2.0.0',
        commitMessage: 'Major changes',
        author: 'test-user',
        createdAt: Date.now(),
        branchName: 'main',
        workflowId: 'workflow-1',
        isSnapshot: false,
        tags: []
      };

      mockVersionManager.createVersion.mockResolvedValue(expectedVersion);

      const input = {
        workflowId: 'workflow-1',
        message: 'Major changes',
        author: 'test-user',
        versionType: 'major'
      };

      const response = await tool.execute(input, mockContext);
      const result = JSON.parse(response.content[0].text);

      expect(result.success).toBe(true);
      expect(result.version.versionString).toBe('2.0.0');
      expect(mockVersionManager.createVersion).toHaveBeenCalledWith(
        'workflow-1',
        expect.any(Object),
        expect.objectContaining({
          versionType: 'major'
        })
      );
    });

    it('should create version on specific branch', async () => {
      const expectedVersion = {
        id: 'version-1',
        versionString: '1.0.0',
        commitMessage: 'Feature version',
        author: 'test-user',
        createdAt: Date.now(),
        branchName: 'feature/test',
        workflowId: 'workflow-1',
        isSnapshot: false,
        tags: []
      };

      mockVersionManager.createVersion.mockResolvedValue(expectedVersion);

      const input = {
        workflowId: 'workflow-1',
        message: 'Feature version',
        author: 'test-user',
        branch: 'feature/test'
      };

      const response = await tool.execute(input, mockContext);
      const result = JSON.parse(response.content[0].text);

      expect(result.success).toBe(true);
      expect(result.version.branchName).toBe('feature/test');
      expect(mockVersionManager.createVersion).toHaveBeenCalledWith(
        'workflow-1',
        expect.any(Object),
        expect.objectContaining({
          branch: 'feature/test'
        })
      );
    });

    it('should create snapshot version', async () => {
      const expectedVersion = {
        id: 'version-1',
        versionString: '1.0.0-snapshot.1234567890',
        commitMessage: 'Snapshot version',
        author: 'test-user',
        createdAt: Date.now(),
        branchName: 'main',
        workflowId: 'workflow-1',
        isSnapshot: true,
        tags: []
      };

      mockVersionManager.createVersion.mockResolvedValue(expectedVersion);

      const input = {
        workflowId: 'workflow-1',
        message: 'Snapshot version',
        author: 'test-user',
        isSnapshot: true
      };

      const response = await tool.execute(input, mockContext);
      const result = JSON.parse(response.content[0].text);

      expect(result.success).toBe(true);
      expect(result.version.isSnapshot).toBe(true);
      expect(result.version.versionString).toContain('snapshot');
      expect(mockVersionManager.createVersion).toHaveBeenCalledWith(
        'workflow-1',
        expect.any(Object),
        expect.objectContaining({
          isSnapshot: true
        })
      );
    });

    it('should create version with tags', async () => {
      const expectedVersion = {
        id: 'version-1',
        versionString: '1.0.0',
        commitMessage: 'Tagged version',
        author: 'test-user',
        createdAt: Date.now(),
        branchName: 'main',
        workflowId: 'workflow-1',
        isSnapshot: false,
        tags: [
          { name: 'release', createdAt: Date.now() },
          { name: 'stable', createdAt: Date.now() }
        ]
      };

      mockVersionManager.createVersion.mockResolvedValue(expectedVersion);

      const input = {
        workflowId: 'workflow-1',
        message: 'Tagged version',
        author: 'test-user',
        tags: ['release', 'stable']
      };

      const response = await tool.execute(input, mockContext);
      const result = JSON.parse(response.content[0].text);

      expect(result.success).toBe(true);
      expect(result.version.tags).toHaveLength(2);
      expect(result.version.tags.map((t: any) => t.name)).toEqual(['release', 'stable']);
      expect(mockVersionManager.createVersion).toHaveBeenCalledWith(
        'workflow-1',
        expect.any(Object),
        expect.objectContaining({
          tags: ['release', 'stable']
        })
      );
    });

    it('should provide workflow update in n8n when requested', async () => {
      const expectedVersion = {
        id: 'version-1',
        versionString: '1.0.0',
        commitMessage: 'Test version',
        author: 'test-user',
        createdAt: Date.now(),
        branchName: 'main',
        workflowId: 'workflow-1',
        workflow: { id: 'workflow-1', name: 'Updated Workflow' }
      };

      mockVersionManager.createVersion.mockResolvedValue(expectedVersion);
      mockContext.apiClient.updateWorkflow = vi.fn().mockResolvedValue({ success: true });

      const input = {
        workflowId: 'workflow-1',
        message: 'Test version',
        updateN8n: true
      };

      const response = await tool.execute(input, mockContext);
      const result = JSON.parse(response.content[0].text);

      expect(result.success).toBe(true);
      expect(result.actions.n8nUpdated).toBe('success');
      expect(mockContext.apiClient.updateWorkflow).toHaveBeenCalledWith(
        'workflow-1',
        expectedVersion.workflow
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle missing API client', async () => {
      const input = {
        workflowId: 'workflow-1',
        message: 'Test version'
      };

      const contextWithoutApi = {} as IToolContext;

      const response = await tool.execute(input, contextWithoutApi);
      const result = JSON.parse(response.content[0].text);

      expect(result.success).toBe(false);
      expect(result.error).toContain('n8n API client not configured');
    });

    it('should handle workflow not found', async () => {
      mockContext.apiClient.getWorkflow = vi.fn().mockRejectedValue(
        new Error('Workflow not found')
      );

      const input = {
        workflowId: 'non-existent',
        message: 'Test version'
      };

      const response = await tool.execute(input, mockContext);
      const result = JSON.parse(response.content[0].text);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Workflow not found');
      expect(result.suggestions).toContain('Verify the workflow ID is correct');
    });

    it('should handle version creation failure', async () => {
      const sampleWorkflow = { id: 'workflow-1', name: 'Test', nodes: [], connections: {} };
      mockContext.apiClient.getWorkflow = vi.fn().mockResolvedValue(sampleWorkflow);
      mockVersionManager.createVersion.mockRejectedValue(
        new Error('Version creation failed')
      );

      const input = {
        workflowId: 'workflow-1',
        message: 'Test version'
      };

      const response = await tool.execute(input, mockContext);
      const result = JSON.parse(response.content[0].text);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Version creation failed');
    });

    it('should handle n8n update failure gracefully', async () => {
      const expectedVersion = {
        id: 'version-1',
        versionString: '1.0.0',
        commitMessage: 'Test version',
        author: 'test-user',
        createdAt: Date.now(),
        branchName: 'main',
        workflowId: 'workflow-1',
        workflow: { id: 'workflow-1', name: 'Updated Workflow' }
      };

      const sampleWorkflow = { id: 'workflow-1', name: 'Test', nodes: [], connections: {} };
      mockContext.apiClient.getWorkflow = vi.fn().mockResolvedValue(sampleWorkflow);
      mockVersionManager.createVersion.mockResolvedValue(expectedVersion);
      mockContext.apiClient.updateWorkflow = vi.fn().mockRejectedValue(
        new Error('Update failed')
      );

      const input = {
        workflowId: 'workflow-1',
        message: 'Test version',
        updateN8n: true
      };

      const response = await tool.execute(input, mockContext);
      const result = JSON.parse(response.content[0].text);

      expect(result.success).toBe(true); // Version creation succeeded
      expect(result.actions.n8nUpdated).toBe('failed');
      expect(result.warnings).toContain('Failed to update workflow in n8n');
    });

    it('should provide helpful error suggestions', async () => {
      const testCases = [
        {
          error: new Error('Workflow not found'),
          expectedSuggestions: ['Verify the workflow ID is correct', 'Check if the workflow exists']
        },
        {
          error: new Error('Branch does not exist'),
          expectedSuggestions: ['Create the branch first', 'Use an existing branch name']
        },
        {
          error: new Error('Invalid version format'),
          expectedSuggestions: ['Check version format requirements', 'Use semantic versioning format']
        }
      ];

      for (const { error, expectedSuggestions } of testCases) {
        const sampleWorkflow = { id: 'workflow-1', name: 'Test', nodes: [], connections: {} };
        mockContext.apiClient.getWorkflow = vi.fn().mockResolvedValue(sampleWorkflow);
        mockVersionManager.createVersion.mockRejectedValue(error);

        const input = {
          workflowId: 'workflow-1',
          message: 'Test version'
        };

        const response = await tool.execute(input, mockContext);
        const result = JSON.parse(response.content[0].text);

        expect(result.success).toBe(false);
        expectedSuggestions.forEach(suggestion => {
          expect(result.suggestions).toContain(suggestion);
        });
      }
    });
  });

  describe('Response Format', () => {
    it('should return properly formatted JSON response', async () => {
      const expectedVersion = {
        id: 'version-1',
        versionString: '1.0.0',
        commitMessage: 'Test version',
        author: 'test-user',
        createdAt: 1234567890,
        branchName: 'main',
        workflowId: 'workflow-1',
        isSnapshot: false,
        tags: []
      };

      const sampleWorkflow = { id: 'workflow-1', name: 'Test', nodes: [], connections: {} };
      mockContext.apiClient.getWorkflow = vi.fn().mockResolvedValue(sampleWorkflow);
      mockVersionManager.createVersion.mockResolvedValue(expectedVersion);

      const input = {
        workflowId: 'workflow-1',
        message: 'Test version'
      };

      const response = await tool.execute(input, mockContext);

      expect(response.content).toHaveLength(1);
      expect(response.content[0].type).toBe('text');
      expect(response.content[0].mimeType).toBe('application/json');

      const result = JSON.parse(response.content[0].text);
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('actions');
      expect(result).toHaveProperty('recommendations');
    });

    it('should include creation recommendations', async () => {
      const expectedVersion = {
        id: 'version-1',
        versionString: '1.0.0',
        commitMessage: 'Test version',
        author: 'test-user',
        createdAt: Date.now(),
        branchName: 'main',
        workflowId: 'workflow-1',
        isSnapshot: false,
        tags: []
      };

      const sampleWorkflow = { id: 'workflow-1', name: 'Test', nodes: [], connections: {} };
      mockContext.apiClient.getWorkflow = vi.fn().mockResolvedValue(sampleWorkflow);
      mockVersionManager.createVersion.mockResolvedValue(expectedVersion);

      const input = {
        workflowId: 'workflow-1',
        message: 'Test version'
      };

      const response = await tool.execute(input, mockContext);
      const result = JSON.parse(response.content[0].text);

      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations).toContain('Version created successfully');
    });
  });
});