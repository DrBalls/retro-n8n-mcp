import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BranchMergeTool } from '../../../src/tools/version-control/BranchMergeTool.js';
import { IToolContext } from '../../../src/base/Tool.js';

// Mock the dependencies
vi.mock('../../../src/services/version-control/VersionControlManager.js');
vi.mock('../../../src/utils/Logger.js');

describe('BranchMergeTool', () => {
  let tool: BranchMergeTool;
  let mockContext: IToolContext;
  let mockVersionManager: any;

  beforeEach(() => {
    mockVersionManager = {
      mergeBranch: vi.fn()
    };

    tool = new BranchMergeTool();
    (tool as any).versionManager = mockVersionManager;

    mockContext = {
      apiClient: {
        updateWorkflow: vi.fn().mockResolvedValue({ success: true })
      }
    } as any;
  });

  describe('Basic Properties', () => {
    it('should have correct name and description', () => {
      expect(tool.name).toBe('branch_merge');
      expect(tool.description).toContain('merge');
    });

    it('should have correct metadata', () => {
      const metadata = tool.getMetadata();
      expect(metadata.category).toBe('version-control');
      expect(metadata.isMutating).toBe(true);
      expect(metadata.tags).toContain('merging');
    });
  });

  describe('Input Validation', () => {
    it('should validate required fields', async () => {
      const invalidInputs = [
        {}, // Missing workflowId and sourceBranch
        { workflowId: 'test' }, // Missing sourceBranch
        { sourceBranch: 'feature' }, // Missing workflowId
        { workflowId: '', sourceBranch: 'feature' }, // Empty workflowId
        { workflowId: 'test', sourceBranch: '' }, // Empty sourceBranch
      ];

      for (const input of invalidInputs) {
        await expect(tool.execute(input, mockContext)).rejects.toThrow();
      }
    });

    it('should accept valid minimal input', async () => {
      mockVersionManager.mergeBranch.mockResolvedValue({
        id: 'merge-1',
        hasConflicts: false,
        mergedWorkflow: { id: 'workflow-1', name: 'Merged Workflow' },
        mergeStrategy: 'auto',
        mergedAt: Date.now(),
        conflictCount: 0,
        autoResolved: 0,
        manualResolutionRequired: false
      });

      const input = {
        workflowId: 'workflow-1',
        sourceBranch: 'feature/test'
      };

      const response = await tool.execute(input, mockContext);
      expect(response.content[0].type).toBe('text');
    });

    it('should validate strategy enum', async () => {
      const input = {
        workflowId: 'workflow-1',
        sourceBranch: 'feature/test',
        strategy: 'invalid' as any
      };

      await expect(tool.execute(input, mockContext)).rejects.toThrow();
    });

    it('should use default values for optional fields', async () => {
      mockVersionManager.mergeBranch.mockResolvedValue({
        id: 'merge-1',
        hasConflicts: false,
        mergedWorkflow: { id: 'workflow-1' },
        mergeStrategy: 'auto'
      });

      const input = {
        workflowId: 'workflow-1',
        sourceBranch: 'feature/test'
      };

      await tool.execute(input, mockContext);

      expect(mockVersionManager.mergeBranch).toHaveBeenCalledWith(
        'workflow-1',
        'feature/test',
        'main', // Default targetBranch
        expect.objectContaining({
          strategy: 'auto', // Default strategy
          autoResolve: true, // Default autoResolve
          author: 'user' // Default author
        })
      );
    });
  });

  describe('Successful Merge', () => {
    it('should handle successful merge without conflicts', async () => {
      const mergeResult = {
        id: 'merge-1',
        hasConflicts: false,
        mergedWorkflow: { id: 'workflow-1', name: 'Merged Workflow' },
        mergeStrategy: 'auto',
        mergedAt: Date.now(),
        conflictCount: 0,
        autoResolved: 0,
        manualResolutionRequired: false
      };

      mockVersionManager.mergeBranch.mockResolvedValue(mergeResult);

      const input = {
        workflowId: 'workflow-1',
        sourceBranch: 'feature/test',
        targetBranch: 'main',
        message: 'Merge feature into main',
        author: 'test-user',
        strategy: 'auto'
      };

      const response = await tool.execute(input, mockContext);
      const result = JSON.parse(response.content[0].text);

      expect(result.success).toBe(true);
      expect(result.status).toBe('completed');
      expect(result.mergeId).toBe('merge-1');
      expect(result.merge.sourceBranch).toBe('feature/test');
      expect(result.merge.targetBranch).toBe('main');
      expect(result.merge.strategy).toBe('auto');
      expect(result.statistics.conflictsDetected).toBe(0);
    });

    it('should update workflow in n8n after successful merge', async () => {
      const mergedWorkflow = { id: 'workflow-1', name: 'Merged Workflow' };
      const mergeResult = {
        id: 'merge-1',
        hasConflicts: false,
        mergedWorkflow,
        mergeStrategy: 'auto',
        mergedAt: Date.now()
      };

      mockVersionManager.mergeBranch.mockResolvedValue(mergeResult);

      const input = {
        workflowId: 'workflow-1',
        sourceBranch: 'feature/test'
      };

      const response = await tool.execute(input, mockContext);
      const result = JSON.parse(response.content[0].text);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Workflow updated in n8n');
      expect(mockContext.apiClient.updateWorkflow).toHaveBeenCalledWith(
        'workflow-1',
        mergedWorkflow
      );
    });

    it('should handle different merge strategies', async () => {
      const strategies = ['auto', 'manual', 'ours', 'theirs'] as const;

      for (const strategy of strategies) {
        const mergeResult = {
          id: `merge-${strategy}`,
          hasConflicts: false,
          mergedWorkflow: { id: 'workflow-1' },
          mergeStrategy: strategy,
          mergedAt: Date.now()
        };

        mockVersionManager.mergeBranch.mockResolvedValue(mergeResult);

        const input = {
          workflowId: 'workflow-1',
          sourceBranch: 'feature/test',
          strategy
        };

        const response = await tool.execute(input, mockContext);
        const result = JSON.parse(response.content[0].text);

        expect(result.success).toBe(true);
        expect(result.merge.strategy).toBe(strategy);
        expect(mockVersionManager.mergeBranch).toHaveBeenCalledWith(
          'workflow-1',
          'feature/test',
          'main',
          expect.objectContaining({ strategy })
        );
      }
    });

    it('should generate appropriate recommendations', async () => {
      const mergeResult = {
        id: 'merge-1',
        hasConflicts: false,
        mergedWorkflow: { id: 'workflow-1' },
        mergeStrategy: 'auto',
        mergedAt: Date.now()
      };

      mockVersionManager.mergeBranch.mockResolvedValue(mergeResult);

      const input = {
        workflowId: 'workflow-1',
        sourceBranch: 'feature/test',
        createBackup: false,
        deleteSourceBranch: true
      };

      const response = await tool.execute(input, mockContext);
      const result = JSON.parse(response.content[0].text);

      expect(result.recommendations).toContain('Test the merged workflow thoroughly before deploying to production');
      expect(result.recommendations).toContain('No backup was created - consider creating a manual backup of important branches');
      expect(result.recommendations).toContain('Source branch \'feature/test\' will be deleted - ensure no other work depends on it');
    });
  });

  describe('Merge Conflicts', () => {
    it('should handle merge conflicts', async () => {
      const conflicts = [
        {
          id: 'conflict-1',
          conflictType: 'property_modified',
          path: '/nodes/0/name',
          description: 'Node name modified in both branches',
          targetValue: 'Webhook Main',
          sourceValue: 'Webhook Feature',
          resolution: 'manual'
        },
        {
          id: 'conflict-2',
          conflictType: 'parameter_conflict',
          path: '/nodes/0/parameters/path',
          description: 'Parameter conflict',
          targetValue: '/main-webhook',
          sourceValue: '/feature-webhook',
          baseValue: '/webhook',
          resolution: 'manual'
        }
      ];

      const mergeResult = {
        id: 'merge-1',
        hasConflicts: true,
        conflicts,
        manualResolutionRequired: true,
        autoResolved: 1,
        conflictCount: 2
      };

      mockVersionManager.mergeBranch.mockResolvedValue(mergeResult);

      const input = {
        workflowId: 'workflow-1',
        sourceBranch: 'feature/test'
      };

      const response = await tool.execute(input, mockContext);
      const result = JSON.parse(response.content[0].text);

      expect(result.success).toBe(false);
      expect(result.status).toBe('conflicts');
      expect(result.mergeId).toBe('merge-1');
      expect(result.conflicts).toHaveLength(2);
      expect(result.resolutionRequired).toBe(true);
      expect(result.autoResolved).toBe(1);

      // Check conflict details
      const firstConflict = result.conflicts[0];
      expect(firstConflict.id).toBe('conflict-1');
      expect(firstConflict.type).toBe('property_modified');
      expect(firstConflict.path).toBe('/nodes/0/name');
      expect(firstConflict.options.current).toBe('Webhook Main');
      expect(firstConflict.options.incoming).toBe('Webhook Feature');

      const secondConflict = result.conflicts[1];
      expect(secondConflict.options.base).toBe('/webhook');

      expect(result.nextSteps).toContain('Review conflicts and choose resolution strategy');
      expect(result.nextSteps).toContain('Use "merge_resolve" tool to resolve conflicts');
    });

    it('should format conflict values appropriately', async () => {
      const conflicts = [
        {
          id: 'conflict-1',
          conflictType: 'object_modified',
          path: '/nodes/0/parameters',
          description: 'Complex object conflict',
          targetValue: { key1: 'value1', key2: { nested: 'data' } },
          sourceValue: { key1: 'value2', key3: 'newValue' },
          resolution: 'manual'
        },
        {
          id: 'conflict-2',
          conflictType: 'long_string',
          path: '/nodes/0/code',
          description: 'Long string conflict',
          targetValue: 'a'.repeat(150), // Long string that should be truncated
          sourceValue: null,
          resolution: 'manual'
        }
      ];

      const mergeResult = {
        id: 'merge-1',
        hasConflicts: true,
        conflicts,
        manualResolutionRequired: true
      };

      mockVersionManager.mergeBranch.mockResolvedValue(mergeResult);

      const input = {
        workflowId: 'workflow-1',
        sourceBranch: 'feature/test'
      };

      const response = await tool.execute(input, mockContext);
      const result = JSON.parse(response.content[0].text);

      const objectConflict = result.conflicts[0];
      expect(objectConflict.options.current).toContain('"key1": "value1"');
      expect(objectConflict.options.incoming).toContain('"key3": "newValue"');

      const stringConflict = result.conflicts[1];
      expect(stringConflict.options.current).toHaveLength(103); // 100 chars + '...'
      expect(stringConflict.options.current).toEndWith('...');
      expect(stringConflict.options.incoming).toBe('null');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing API client', async () => {
      const input = {
        workflowId: 'workflow-1',
        sourceBranch: 'feature/test'
      };

      const contextWithoutApi = {} as IToolContext;

      const response = await tool.execute(input, contextWithoutApi);
      const result = JSON.parse(response.content[0].text);

      expect(result.success).toBe(false);
      expect(result.error).toContain('n8n API client not configured');
    });

    it('should handle merge failures', async () => {
      mockVersionManager.mergeBranch.mockRejectedValue(
        new Error('Source branch not found')
      );

      const input = {
        workflowId: 'workflow-1',
        sourceBranch: 'non-existent'
      };

      const response = await tool.execute(input, mockContext);
      const result = JSON.parse(response.content[0].text);

      expect(result.success).toBe(false);
      expect(result.status).toBe('error');
      expect(result.error).toContain('Source branch not found');
      expect(result.suggestions).toContain('Verify both source and target branches exist');
    });

    it('should handle n8n update failures gracefully', async () => {
      const mergeResult = {
        id: 'merge-1',
        hasConflicts: false,
        mergedWorkflow: { id: 'workflow-1' },
        mergeStrategy: 'auto',
        mergedAt: Date.now()
      };

      mockVersionManager.mergeBranch.mockResolvedValue(mergeResult);
      mockContext.apiClient.updateWorkflow = vi.fn().mockRejectedValue(
        new Error('n8n update failed')
      );

      const input = {
        workflowId: 'workflow-1',
        sourceBranch: 'feature/test'
      };

      const response = await tool.execute(input, mockContext);
      const result = JSON.parse(response.content[0].text);

      expect(result.success).toBe(true); // Merge succeeded
      expect(result.message).toContain('Warning: Failed to update workflow in n8n');
    });

    it('should provide helpful error suggestions', async () => {
      const testCases = [
        {
          error: new Error('Branch not found'),
          expectedSuggestions: ['Verify both source and target branches exist', 'Use "branch_list" tool to see all available branches']
        },
        {
          error: new Error('Cannot merge same branch'),
          expectedSuggestions: ['Cannot merge a branch into itself', 'Specify different source and target branches']
        },
        {
          error: new Error('No changes to merge'),
          expectedSuggestions: ['Source branch has no changes to merge', 'Check if the branches are already in sync']
        },
        {
          error: new Error('Merge conflicts detected'),
          expectedSuggestions: ['Use manual strategy to handle conflicts step by step', 'Review the workflow differences before merging']
        }
      ];

      for (const { error, expectedSuggestions } of testCases) {
        mockVersionManager.mergeBranch.mockRejectedValue(error);

        const input = {
          workflowId: 'workflow-1',
          sourceBranch: 'feature/test'
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

  describe('Message Generation', () => {
    it('should use provided merge message', async () => {
      const mergeResult = {
        id: 'merge-1',
        hasConflicts: false,
        mergedWorkflow: { id: 'workflow-1' },
        mergeStrategy: 'auto'
      };

      mockVersionManager.mergeBranch.mockResolvedValue(mergeResult);

      const input = {
        workflowId: 'workflow-1',
        sourceBranch: 'feature/test',
        targetBranch: 'main',
        message: 'Custom merge message'
      };

      await tool.execute(input, mockContext);

      expect(mockVersionManager.mergeBranch).toHaveBeenCalledWith(
        'workflow-1',
        'feature/test',
        'main',
        expect.objectContaining({
          message: 'Custom merge message'
        })
      );
    });

    it('should auto-generate merge message when not provided', async () => {
      const mergeResult = {
        id: 'merge-1',
        hasConflicts: false,
        mergedWorkflow: { id: 'workflow-1' },
        mergeStrategy: 'auto'
      };

      mockVersionManager.mergeBranch.mockResolvedValue(mergeResult);

      const input = {
        workflowId: 'workflow-1',
        sourceBranch: 'feature/test',
        targetBranch: 'develop'
      };

      await tool.execute(input, mockContext);

      expect(mockVersionManager.mergeBranch).toHaveBeenCalledWith(
        'workflow-1',
        'feature/test',
        'develop',
        expect.objectContaining({
          message: 'Merge branch \'feature/test\' into \'develop\''
        })
      );
    });
  });

  describe('Response Format', () => {
    it('should return properly formatted JSON response for successful merge', async () => {
      const mergeResult = {
        id: 'merge-1',
        hasConflicts: false,
        mergedWorkflow: { id: 'workflow-1' },
        mergeStrategy: 'auto',
        mergedAt: Date.now(),
        conflictCount: 0,
        autoResolved: 0,
        manualResolutionRequired: false
      };

      mockVersionManager.mergeBranch.mockResolvedValue(mergeResult);

      const input = {
        workflowId: 'workflow-1',
        sourceBranch: 'feature/test'
      };

      const response = await tool.execute(input, mockContext);

      expect(response.content).toHaveLength(1);
      expect(response.content[0].type).toBe('text');
      expect(response.content[0].mimeType).toBe('application/json');

      const result = JSON.parse(response.content[0].text);
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('mergeId');
      expect(result).toHaveProperty('merge');
      expect(result).toHaveProperty('statistics');
      expect(result).toHaveProperty('actions');
      expect(result).toHaveProperty('recommendations');
    });

    it('should return properly formatted JSON response for conflicts', async () => {
      const mergeResult = {
        id: 'merge-1',
        hasConflicts: true,
        conflicts: [{
          id: 'conflict-1',
          conflictType: 'property_modified',
          path: '/nodes/0/name',
          description: 'Node name conflict',
          targetValue: 'value1',
          sourceValue: 'value2',
          resolution: 'manual'
        }],
        manualResolutionRequired: true,
        autoResolved: 0
      };

      mockVersionManager.mergeBranch.mockResolvedValue(mergeResult);

      const input = {
        workflowId: 'workflow-1',
        sourceBranch: 'feature/test'
      };

      const response = await tool.execute(input, mockContext);
      const result = JSON.parse(response.content[0].text);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('mergeId');
      expect(result).toHaveProperty('conflicts');
      expect(result).toHaveProperty('resolutionRequired');
      expect(result).toHaveProperty('autoResolved');
      expect(result).toHaveProperty('nextSteps');

      expect(result.success).toBe(false);
      expect(result.status).toBe('conflicts');
    });
  });
});