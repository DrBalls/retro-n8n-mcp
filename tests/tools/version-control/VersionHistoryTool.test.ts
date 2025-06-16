import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VersionHistoryTool } from '../../../src/tools/version-control/VersionHistoryTool.js';
import { IToolContext } from '../../../src/base/Tool.js';

// Mock the dependencies
vi.mock('../../../src/services/version-control/VersionControlManager.js');
vi.mock('../../../src/utils/Logger.js');

describe('VersionHistoryTool', () => {
  let tool: VersionHistoryTool;
  let mockContext: IToolContext;
  let mockVersionManager: any;

  const sampleVersions = [
    {
      id: 'version-3',
      versionString: '1.2.0',
      branchName: 'main',
      author: 'user1',
      createdAt: 1640995200000, // 2022-01-01
      commitMessage: 'Added new features',
      parentVersionId: 'version-2',
      isSnapshot: false,
      tags: [{ name: 'release' }],
      changes: [
        { type: 'node_added', path: '/nodes/2', description: 'Added email node', timestamp: 1640995200000 }
      ]
    },
    {
      id: 'version-2',
      versionString: '1.1.0',
      branchName: 'main',
      author: 'user2',
      createdAt: 1640908800000, // 2021-12-31
      commitMessage: 'Minor improvements',
      parentVersionId: 'version-1',
      isSnapshot: false,
      tags: [],
      changes: [
        { type: 'parameter_modified', path: '/nodes/0/parameters', description: 'Updated webhook path', timestamp: 1640908800000 }
      ]
    },
    {
      id: 'version-1',
      versionString: '1.0.0',
      branchName: 'main',
      author: 'user1',
      createdAt: 1640822400000, // 2021-12-30
      commitMessage: 'Initial version',
      parentVersionId: null,
      isSnapshot: false,
      tags: [{ name: 'initial' }],
      changes: [
        { type: 'workflow_created', path: '/', description: 'Created workflow', timestamp: 1640822400000 }
      ]
    }
  ];

  beforeEach(() => {
    mockVersionManager = {
      getVersionHistory: vi.fn().mockResolvedValue(sampleVersions)
    };

    tool = new VersionHistoryTool();
    (tool as any).versionManager = mockVersionManager;

    mockContext = {} as IToolContext;
  });

  describe('Basic Properties', () => {
    it('should have correct name and description', () => {
      expect(tool.name).toBe('version_history');
      expect(tool.description).toContain('version history');
    });

    it('should have correct metadata', () => {
      const metadata = tool.getMetadata();
      expect(metadata.category).toBe('version-control');
      expect(metadata.isMutating).toBe(false);
      expect(metadata.tags).toContain('history');
    });
  });

  describe('Input Validation', () => {
    it('should validate required workflowId', async () => {
      const input = {}; // Missing workflowId

      await expect(tool.execute(input, mockContext)).rejects.toThrow();
    });

    it('should accept valid minimal input', async () => {
      const input = {
        workflowId: 'workflow-1'
      };

      const response = await tool.execute(input, mockContext);
      expect(response.content[0].type).toBe('text');
    });

    it('should validate limit boundaries', async () => {
      const invalidInputs = [
        { workflowId: 'workflow-1', limit: 0 }, // Below minimum
        { workflowId: 'workflow-1', limit: 101 }, // Above maximum
      ];

      for (const input of invalidInputs) {
        await expect(tool.execute(input, mockContext)).rejects.toThrow();
      }
    });

    it('should validate offset is non-negative', async () => {
      const input = {
        workflowId: 'workflow-1',
        offset: -1
      };

      await expect(tool.execute(input, mockContext)).rejects.toThrow();
    });

    it('should validate format enum', async () => {
      const input = {
        workflowId: 'workflow-1',
        format: 'invalid' as any
      };

      await expect(tool.execute(input, mockContext)).rejects.toThrow();
    });
  });

  describe('Core Functionality', () => {
    it('should retrieve version history with default parameters', async () => {
      const input = {
        workflowId: 'workflow-1'
      };

      const response = await tool.execute(input, mockContext);
      const result = JSON.parse(response.content[0].text);

      expect(result.success).toBe(true);
      expect(result.workflowId).toBe('workflow-1');
      expect(result.versions).toHaveLength(3);
      expect(mockVersionManager.getVersionHistory).toHaveBeenCalledWith(
        'workflow-1',
        expect.objectContaining({
          limit: 20,
          offset: 0
        })
      );
    });

    it('should filter by branch', async () => {
      const input = {
        workflowId: 'workflow-1',
        branch: 'feature/test'
      };

      await tool.execute(input, mockContext);

      expect(mockVersionManager.getVersionHistory).toHaveBeenCalledWith(
        'workflow-1',
        expect.objectContaining({
          branch: 'feature/test'
        })
      );
    });

    it('should filter by author', async () => {
      const input = {
        workflowId: 'workflow-1',
        author: 'user1'
      };

      await tool.execute(input, mockContext);

      expect(mockVersionManager.getVersionHistory).toHaveBeenCalledWith(
        'workflow-1',
        expect.objectContaining({
          author: 'user1'
        })
      );
    });

    it('should filter by time range', async () => {
      const input = {
        workflowId: 'workflow-1',
        since: 1640908800000,
        until: 1640995200000
      };

      await tool.execute(input, mockContext);

      expect(mockVersionManager.getVersionHistory).toHaveBeenCalledWith(
        'workflow-1',
        expect.objectContaining({
          since: 1640908800000,
          until: 1640995200000
        })
      );
    });

    it('should handle pagination', async () => {
      const input = {
        workflowId: 'workflow-1',
        limit: 10,
        offset: 5
      };

      const response = await tool.execute(input, mockContext);
      const result = JSON.parse(response.content[0].text);

      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.offset).toBe(5);
      expect(result.pagination.returned).toBe(3);
      expect(mockVersionManager.getVersionHistory).toHaveBeenCalledWith(
        'workflow-1',
        expect.objectContaining({
          limit: 10,
          offset: 5
        })
      );
    });
  });

  describe('Output Formats', () => {
    it('should format detailed output by default', async () => {
      const input = {
        workflowId: 'workflow-1'
      };

      const response = await tool.execute(input, mockContext);
      const result = JSON.parse(response.content[0].text);

      const firstVersion = result.versions[0];
      expect(firstVersion).toHaveProperty('id');
      expect(firstVersion).toHaveProperty('version');
      expect(firstVersion).toHaveProperty('branch');
      expect(firstVersion).toHaveProperty('author');
      expect(firstVersion).toHaveProperty('timestamp');
      expect(firstVersion).toHaveProperty('date');
      expect(firstVersion).toHaveProperty('message');
      expect(firstVersion).toHaveProperty('parentVersion');
      expect(firstVersion).toHaveProperty('isSnapshot');
      expect(firstVersion).toHaveProperty('changes');
    });

    it('should format summary output', async () => {
      const input = {
        workflowId: 'workflow-1',
        format: 'summary'
      };

      const response = await tool.execute(input, mockContext);
      const result = JSON.parse(response.content[0].text);

      const firstVersion = result.versions[0];
      expect(firstVersion).toHaveProperty('changesCount');
      expect(firstVersion).toHaveProperty('tagsCount');
      expect(firstVersion.changesCount).toBe(1);
      expect(firstVersion.tagsCount).toBe(1);
    });

    it('should format oneline output', async () => {
      const input = {
        workflowId: 'workflow-1',
        format: 'oneline'
      };

      const response = await tool.execute(input, mockContext);
      const result = JSON.parse(response.content[0].text);

      const firstVersion = result.versions[0];
      expect(firstVersion).toHaveProperty('version');
      expect(firstVersion).toHaveProperty('message');
      expect(firstVersion).toHaveProperty('author');
      expect(firstVersion).toHaveProperty('date');
      
      // Should not have detailed properties
      expect(firstVersion).not.toHaveProperty('id');
      expect(firstVersion).not.toHaveProperty('timestamp');
      expect(firstVersion).not.toHaveProperty('changes');
    });

    it('should include tags when requested', async () => {
      const input = {
        workflowId: 'workflow-1',
        includeTags: true
      };

      const response = await tool.execute(input, mockContext);
      const result = JSON.parse(response.content[0].text);

      const firstVersion = result.versions[0];
      expect(firstVersion.tags).toEqual(['release']);
    });

    it('should exclude tags when not requested', async () => {
      const input = {
        workflowId: 'workflow-1',
        includeTags: false
      };

      const response = await tool.execute(input, mockContext);
      const result = JSON.parse(response.content[0].text);

      const firstVersion = result.versions[0];
      expect(firstVersion.tags).toBeUndefined();
    });

    it('should include change details when requested', async () => {
      const input = {
        workflowId: 'workflow-1',
        includeChanges: true
      };

      const response = await tool.execute(input, mockContext);
      const result = JSON.parse(response.content[0].text);

      const firstVersion = result.versions[0];
      expect(firstVersion.changes).toBeInstanceOf(Array);
      expect(firstVersion.changes[0]).toHaveProperty('type');
      expect(firstVersion.changes[0]).toHaveProperty('path');
      expect(firstVersion.changes[0]).toHaveProperty('description');
    });

    it('should provide change summary when not including details', async () => {
      const input = {
        workflowId: 'workflow-1',
        includeChanges: false
      };

      const response = await tool.execute(input, mockContext);
      const result = JSON.parse(response.content[0].text);

      const firstVersion = result.versions[0];
      expect(firstVersion.changes).toHaveProperty('count');
      expect(firstVersion.changes).toHaveProperty('summary');
      expect(firstVersion.changes.count).toBe(1);
    });
  });

  describe('Statistics Generation', () => {
    it('should generate comprehensive statistics', async () => {
      const input = {
        workflowId: 'workflow-1'
      };

      const response = await tool.execute(input, mockContext);
      const result = JSON.parse(response.content[0].text);

      const stats = result.statistics;
      expect(stats).toHaveProperty('totalVersions');
      expect(stats).toHaveProperty('uniqueAuthors');
      expect(stats).toHaveProperty('uniqueBranches');
      expect(stats).toHaveProperty('totalChanges');
      expect(stats).toHaveProperty('averageChangesPerVersion');
      expect(stats).toHaveProperty('oldestVersion');
      expect(stats).toHaveProperty('newestVersion');
      expect(stats).toHaveProperty('timespan');
      expect(stats).toHaveProperty('changeDistribution');

      expect(stats.totalVersions).toBe(3);
      expect(stats.uniqueAuthors).toBe(2);
      expect(stats.uniqueBranches).toBe(1);
      expect(stats.totalChanges).toBe(3);
      expect(stats.oldestVersion).toBe('1.0.0');
      expect(stats.newestVersion).toBe('1.2.0');
    });

    it('should calculate timespan correctly', async () => {
      const input = {
        workflowId: 'workflow-1'
      };

      const response = await tool.execute(input, mockContext);
      const result = JSON.parse(response.content[0].text);

      const timespan = result.statistics.timespan;
      expect(timespan).toHaveProperty('from');
      expect(timespan).toHaveProperty('to');
      expect(timespan).toHaveProperty('days');
      expect(timespan.days).toBe(2); // 2022-01-01 - 2021-12-30 = 2 days
    });

    it('should generate change distribution', async () => {
      const input = {
        workflowId: 'workflow-1'
      };

      const response = await tool.execute(input, mockContext);
      const result = JSON.parse(response.content[0].text);

      const distribution = result.statistics.changeDistribution;
      expect(distribution).toHaveProperty('node_added');
      expect(distribution).toHaveProperty('parameter_modified');
      expect(distribution).toHaveProperty('workflow_created');
      expect(distribution.node_added).toBe(1);
      expect(distribution.parameter_modified).toBe(1);
      expect(distribution.workflow_created).toBe(1);
    });
  });

  describe('Empty Results Handling', () => {
    it('should handle empty version history', async () => {
      mockVersionManager.getVersionHistory.mockResolvedValue([]);

      const input = {
        workflowId: 'workflow-1'
      };

      const response = await tool.execute(input, mockContext);
      const result = JSON.parse(response.content[0].text);

      expect(result.success).toBe(true);
      expect(result.message).toContain('No versions found');
      expect(result.totalVersions).toBe(0);
      expect(result.versions).toHaveLength(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle version manager errors', async () => {
      mockVersionManager.getVersionHistory.mockRejectedValue(
        new Error('Failed to retrieve versions')
      );

      const input = {
        workflowId: 'workflow-1'
      };

      const response = await tool.execute(input, mockContext);
      const result = JSON.parse(response.content[0].text);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to retrieve versions');
    });

    it('should handle invalid workflow ID', async () => {
      mockVersionManager.getVersionHistory.mockRejectedValue(
        new Error('Workflow not found')
      );

      const input = {
        workflowId: 'non-existent'
      };

      const response = await tool.execute(input, mockContext);
      const result = JSON.parse(response.content[0].text);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Workflow not found');
    });
  });

  describe('Response Format', () => {
    it('should return properly formatted JSON response', async () => {
      const input = {
        workflowId: 'workflow-1'
      };

      const response = await tool.execute(input, mockContext);

      expect(response.content).toHaveLength(1);
      expect(response.content[0].type).toBe('text');
      expect(response.content[0].mimeType).toBe('application/json');

      const result = JSON.parse(response.content[0].text);
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('workflowId');
      expect(result).toHaveProperty('filter');
      expect(result).toHaveProperty('pagination');
      expect(result).toHaveProperty('statistics');
      expect(result).toHaveProperty('versions');
    });

    it('should include filter information in response', async () => {
      const input = {
        workflowId: 'workflow-1',
        branch: 'main',
        author: 'user1',
        since: 1640908800000,
        until: 1640995200000
      };

      const response = await tool.execute(input, mockContext);
      const result = JSON.parse(response.content[0].text);

      expect(result.filter.author).toBe('user1');
      expect(result.filter.since).toBe(1640908800000);
      expect(result.filter.until).toBe(1640995200000);
      expect(result.branch).toBe('main');
    });

    it('should include pagination information', async () => {
      const input = {
        workflowId: 'workflow-1',
        limit: 10,
        offset: 5
      };

      const response = await tool.execute(input, mockContext);
      const result = JSON.parse(response.content[0].text);

      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.offset).toBe(5);
      expect(result.pagination.returned).toBe(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle versions with missing properties', async () => {
      const incompleteVersions = [
        {
          id: 'version-1',
          versionString: '1.0.0',
          branchName: 'main',
          author: 'user1',
          createdAt: 1640822400000,
          commitMessage: 'Test version',
          // Missing some optional properties
          changes: [],
          tags: []
        }
      ];

      mockVersionManager.getVersionHistory.mockResolvedValue(incompleteVersions);

      const input = {
        workflowId: 'workflow-1'
      };

      const response = await tool.execute(input, mockContext);
      const result = JSON.parse(response.content[0].text);

      expect(result.success).toBe(true);
      expect(result.versions).toHaveLength(1);
    });

    it('should handle very large version counts', async () => {
      const manyVersions = Array.from({ length: 50 }, (_, i) => ({
        id: `version-${i}`,
        versionString: `1.0.${i}`,
        branchName: 'main',
        author: 'user1',
        createdAt: 1640822400000 + i * 86400000,
        commitMessage: `Version ${i}`,
        changes: [],
        tags: []
      }));

      mockVersionManager.getVersionHistory.mockResolvedValue(manyVersions);

      const input = {
        workflowId: 'workflow-1',
        limit: 100
      };

      const response = await tool.execute(input, mockContext);
      const result = JSON.parse(response.content[0].text);

      expect(result.success).toBe(true);
      expect(result.versions).toHaveLength(50);
      expect(result.statistics.totalVersions).toBe(50);
    });
  });
});