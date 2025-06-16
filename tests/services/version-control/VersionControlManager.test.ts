import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VersionControlManager } from '../../../src/services/version-control/VersionControlManager.js';
import { InMemoryVersionStorage } from '../../../src/services/version-control/storage/InMemoryVersionStorage.js';
import { WorkflowDiffer } from '../../../src/services/version-control/WorkflowDiffer.js';

// Mock the WorkflowDiffer
vi.mock('../../../src/services/version-control/WorkflowDiffer.js');

describe('VersionControlManager', () => {
  let manager: VersionControlManager;
  let mockStorage: InMemoryVersionStorage;
  let mockDiffer: any;

  const sampleWorkflow = {
    id: 'workflow-1',
    name: 'Sample Workflow',
    nodes: [
      { id: 'node-1', type: 'webhook', name: 'Webhook', position: [100, 100] },
      { id: 'node-2', type: 'function', name: 'Process Data', position: [300, 100] }
    ],
    connections: {
      'node-1': {
        main: [
          [{ node: 'node-2', type: 'main', index: 0 }]
        ]
      }
    },
    active: true,
    settings: {}
  };

  beforeEach(() => {
    mockStorage = new InMemoryVersionStorage();
    mockDiffer = {
      generateDiff: vi.fn(),
      getAddedNodes: vi.fn().mockReturnValue([]),
      getRemovedNodes: vi.fn().mockReturnValue([]),
      getModifiedNodes: vi.fn().mockReturnValue([]),
      getConnectionChanges: vi.fn().mockReturnValue({ added: [], removed: [] }),
      generateDiffDescription: vi.fn().mockReturnValue('Sample diff description'),
      generateVisualDiff: vi.fn().mockReturnValue({ type: 'text', content: 'visual diff' }),
    };

    manager = new VersionControlManager(mockStorage, mockDiffer);
  });

  describe('createVersion', () => {
    it('should create initial version with 1.0.0', async () => {
      const version = await manager.createVersion('workflow-1', sampleWorkflow, {
        message: 'Initial version',
        author: 'test-user'
      });

      expect(version.versionString).toBe('1.0.0');
      expect(version.commitMessage).toBe('Initial version');
      expect(version.author).toBe('test-user');
      expect(version.branchName).toBe('main');
      expect(version.workflowId).toBe('workflow-1');
      expect(version.isSnapshot).toBe(false);
    });

    it('should auto-increment version based on changes', async () => {
      // Create initial version
      await manager.createVersion('workflow-1', sampleWorkflow, {
        message: 'Initial version',
        author: 'test-user'
      });

      // Mock diff to return minor change
      mockDiffer.generateDiff.mockReturnValue({
        operations: [{ operation: 'add', path: '/nodes/2' }],
        summary: { nodesAdded: 1, nodesRemoved: 0, nodesModified: 0 }
      });

      const modifiedWorkflow = {
        ...sampleWorkflow,
        nodes: [
          ...sampleWorkflow.nodes,
          { id: 'node-3', type: 'email', name: 'Send Email', position: [500, 100] }
        ]
      };

      const version = await manager.createVersion('workflow-1', modifiedWorkflow, {
        message: 'Added email node',
        author: 'test-user',
        versionType: 'auto'
      });

      expect(version.versionString).toBe('1.1.0');
    });

    it('should respect explicit version type', async () => {
      // Create initial version
      await manager.createVersion('workflow-1', sampleWorkflow, {
        message: 'Initial version',
        author: 'test-user'
      });

      const version = await manager.createVersion('workflow-1', sampleWorkflow, {
        message: 'Major change',
        author: 'test-user',
        versionType: 'major'
      });

      expect(version.versionString).toBe('2.0.0');
    });

    it('should create version on specific branch', async () => {
      const version = await manager.createVersion('workflow-1', sampleWorkflow, {
        branch: 'feature/new-nodes',
        message: 'Feature branch version',
        author: 'test-user'
      });

      expect(version.branchName).toBe('feature/new-nodes');
    });

    it('should create snapshot version', async () => {
      const version = await manager.createVersion('workflow-1', sampleWorkflow, {
        message: 'Snapshot version',
        author: 'test-user',
        isSnapshot: true
      });

      expect(version.isSnapshot).toBe(true);
      expect(version.versionString).toMatch(/^1\.0\.0-snapshot\.\d+$/);
    });

    it('should handle tags', async () => {
      const version = await manager.createVersion('workflow-1', sampleWorkflow, {
        message: 'Tagged version',
        author: 'test-user',
        tags: ['release', 'stable']
      });

      expect(version.tags).toHaveLength(2);
      expect(version.tags.map(t => t.name)).toEqual(['release', 'stable']);
    });
  });

  describe('createBranch', () => {
    it('should create branch from main', async () => {
      // Create initial version on main
      await manager.createVersion('workflow-1', sampleWorkflow, {
        message: 'Initial version',
        author: 'test-user'
      });

      const branch = await manager.createBranch('workflow-1', 'feature/test', {
        fromBranch: 'main',
        author: 'test-user',
        description: 'Test branch'
      });

      expect(branch.name).toBe('feature/test');
      expect(branch.workflowId).toBe('workflow-1');
      expect(branch.description).toBe('Test branch');
      expect(branch.createdBy).toBe('test-user');
      expect(branch.isActive).toBe(true);
    });

    it('should create branch from specific version', async () => {
      // Create initial version
      const initialVersion = await manager.createVersion('workflow-1', sampleWorkflow, {
        message: 'Initial version',
        author: 'test-user'
      });

      const branch = await manager.createBranch('workflow-1', 'hotfix/urgent', {
        fromVersionId: initialVersion.id,
        author: 'test-user'
      });

      expect(branch.baseVersionId).toBe(initialVersion.id);
    });

    it('should throw error for duplicate branch name', async () => {
      await manager.createVersion('workflow-1', sampleWorkflow, {
        message: 'Initial version',
        author: 'test-user'
      });

      await manager.createBranch('workflow-1', 'feature/test', {
        fromBranch: 'main',
        author: 'test-user'
      });

      await expect(
        manager.createBranch('workflow-1', 'feature/test', {
          fromBranch: 'main',
          author: 'test-user'
        })
      ).rejects.toThrow('Branch feature/test already exists');
    });
  });

  describe('mergeBranch', () => {
    it('should merge branch without conflicts', async () => {
      // Setup: Create main branch version
      await manager.createVersion('workflow-1', sampleWorkflow, {
        message: 'Initial version',
        author: 'test-user'
      });

      // Create feature branch
      await manager.createBranch('workflow-1', 'feature/test', {
        fromBranch: 'main',
        author: 'test-user'
      });

      // Create version on feature branch
      const featureWorkflow = {
        ...sampleWorkflow,
        nodes: [
          ...sampleWorkflow.nodes,
          { id: 'node-3', type: 'email', name: 'Send Email', position: [500, 100] }
        ]
      };

      await manager.createVersion('workflow-1', featureWorkflow, {
        branch: 'feature/test',
        message: 'Added email functionality',
        author: 'test-user'
      });

      // Mock no conflicts
      mockDiffer.generateDiff.mockReturnValue({
        operations: [{ operation: 'add', path: '/nodes/2' }],
        summary: { nodesAdded: 1, nodesRemoved: 0, nodesModified: 0 }
      });

      const mergeResult = await manager.mergeBranch(
        'workflow-1',
        'feature/test',
        'main',
        {
          message: 'Merge feature/test into main',
          author: 'test-user',
          strategy: 'auto'
        }
      );

      expect(mergeResult.hasConflicts).toBe(false);
      expect(mergeResult.mergedWorkflow).toBeDefined();
      expect(mergeResult.mergeStrategy).toBe('auto');
    });

    it('should detect merge conflicts', async () => {
      // Setup: Create main branch version
      await manager.createVersion('workflow-1', sampleWorkflow, {
        message: 'Initial version',
        author: 'test-user'
      });

      // Create feature branch
      await manager.createBranch('workflow-1', 'feature/test', {
        fromBranch: 'main',
        author: 'test-user'
      });

      // Create conflicting changes on both branches
      const mainWorkflow = {
        ...sampleWorkflow,
        nodes: sampleWorkflow.nodes.map(node => 
          node.id === 'node-1' ? { ...node, name: 'Modified Webhook Main' } : node
        )
      };

      const featureWorkflow = {
        ...sampleWorkflow,
        nodes: sampleWorkflow.nodes.map(node => 
          node.id === 'node-1' ? { ...node, name: 'Modified Webhook Feature' } : node
        )
      };

      await manager.createVersion('workflow-1', mainWorkflow, {
        branch: 'main',
        message: 'Modified webhook in main',
        author: 'test-user'
      });

      await manager.createVersion('workflow-1', featureWorkflow, {
        branch: 'feature/test',
        message: 'Modified webhook in feature',
        author: 'test-user'
      });

      // Mock conflicts
      const mockConflicts = [
        {
          id: 'conflict-1',
          conflictType: 'property_modified',
          path: '/nodes/0/name',
          description: 'Node name modified in both branches',
          targetValue: 'Modified Webhook Main',
          sourceValue: 'Modified Webhook Feature',
          resolution: 'manual'
        }
      ];

      const mergeResult = await manager.mergeBranch(
        'workflow-1',
        'feature/test',
        'main',
        {
          message: 'Merge feature/test into main',
          author: 'test-user',
          strategy: 'auto'
        }
      );

      expect(mergeResult.hasConflicts).toBe(true);
      expect(mergeResult.manualResolutionRequired).toBe(true);
    });

    it('should handle different merge strategies', async () => {
      await manager.createVersion('workflow-1', sampleWorkflow, {
        message: 'Initial version',
        author: 'test-user'
      });

      await manager.createBranch('workflow-1', 'feature/test', {
        fromBranch: 'main',
        author: 'test-user'
      });

      const strategies = ['ours', 'theirs', 'manual'] as const;
      
      for (const strategy of strategies) {
        const mergeResult = await manager.mergeBranch(
          'workflow-1',
          'feature/test',
          'main',
          {
            message: `Merge with ${strategy} strategy`,
            author: 'test-user',
            strategy
          }
        );

        expect(mergeResult.mergeStrategy).toBe(strategy);
      }
    });
  });

  describe('rollback', () => {
    it('should rollback to previous version', async () => {
      // Create multiple versions
      const v1 = await manager.createVersion('workflow-1', sampleWorkflow, {
        message: 'Version 1',
        author: 'test-user'
      });

      const modifiedWorkflow = {
        ...sampleWorkflow,
        nodes: [
          ...sampleWorkflow.nodes,
          { id: 'node-3', type: 'email', name: 'Send Email', position: [500, 100] }
        ]
      };

      await manager.createVersion('workflow-1', modifiedWorkflow, {
        message: 'Version 2',
        author: 'test-user'
      });

      // Rollback to v1
      const rollbackVersion = await manager.rollback('workflow-1', v1.id, {
        message: 'Rollback to v1',
        author: 'test-user',
        createBackup: true
      });

      expect(rollbackVersion.commitMessage).toBe('Rollback to v1');
      expect(rollbackVersion.versionString).toBe('1.0.1'); // Should increment from latest
      expect(rollbackVersion.workflow).toEqual(sampleWorkflow);
    });

    it('should create backup when requested', async () => {
      const v1 = await manager.createVersion('workflow-1', sampleWorkflow, {
        message: 'Version 1',
        author: 'test-user'
      });

      const v2 = await manager.createVersion('workflow-1', sampleWorkflow, {
        message: 'Version 2',
        author: 'test-user'
      });

      const rollbackVersion = await manager.rollback('workflow-1', v1.id, {
        message: 'Rollback with backup',
        author: 'test-user',
        createBackup: true
      });

      // Verify backup was created
      const history = await manager.getVersionHistory('workflow-1', { limit: 10 });
      const backupVersion = history.find(v => v.commitMessage.includes('backup'));
      expect(backupVersion).toBeDefined();
    });

    it('should throw error for non-existent version', async () => {
      await expect(
        manager.rollback('workflow-1', 'non-existent-version', {
          message: 'Invalid rollback',
          author: 'test-user'
        })
      ).rejects.toThrow('Version non-existent-version not found');
    });
  });

  describe('getVersionHistory', () => {
    it('should return version history with filtering', async () => {
      // Create multiple versions on different branches
      await manager.createVersion('workflow-1', sampleWorkflow, {
        message: 'Version 1',
        author: 'user1'
      });

      await manager.createBranch('workflow-1', 'feature/test', {
        fromBranch: 'main',
        author: 'user2'
      });

      await manager.createVersion('workflow-1', sampleWorkflow, {
        branch: 'feature/test',
        message: 'Feature version',
        author: 'user2'
      });

      await manager.createVersion('workflow-1', sampleWorkflow, {
        branch: 'main',
        message: 'Version 2',
        author: 'user1'
      });

      // Test various filters
      const allVersions = await manager.getVersionHistory('workflow-1', {});
      expect(allVersions.length).toBe(3);

      const mainVersions = await manager.getVersionHistory('workflow-1', {
        branch: 'main'
      });
      expect(mainVersions.length).toBe(2);

      const user1Versions = await manager.getVersionHistory('workflow-1', {
        author: 'user1'
      });
      expect(user1Versions.length).toBe(2);

      const limitedVersions = await manager.getVersionHistory('workflow-1', {
        limit: 1
      });
      expect(limitedVersions.length).toBe(1);
    });

    it('should handle pagination', async () => {
      // Create multiple versions
      for (let i = 1; i <= 5; i++) {
        await manager.createVersion('workflow-1', sampleWorkflow, {
          message: `Version ${i}`,
          author: 'test-user'
        });
      }

      const page1 = await manager.getVersionHistory('workflow-1', {
        limit: 2,
        offset: 0
      });
      expect(page1.length).toBe(2);

      const page2 = await manager.getVersionHistory('workflow-1', {
        limit: 2,
        offset: 2
      });
      expect(page2.length).toBe(2);

      // Verify different results
      expect(page1[0].id).not.toBe(page2[0].id);
    });
  });

  describe('generateVersionDiff', () => {
    it('should generate diff between versions', async () => {
      const v1 = await manager.createVersion('workflow-1', sampleWorkflow, {
        message: 'Version 1',
        author: 'test-user'
      });

      const modifiedWorkflow = {
        ...sampleWorkflow,
        nodes: [
          ...sampleWorkflow.nodes,
          { id: 'node-3', type: 'email', name: 'Send Email', position: [500, 100] }
        ]
      };

      const v2 = await manager.createVersion('workflow-1', modifiedWorkflow, {
        message: 'Version 2',
        author: 'test-user'
      });

      mockDiffer.generateDiff.mockReturnValue({
        fromVersionId: v1.id,
        toVersionId: v2.id,
        operations: [{ operation: 'add', path: '/nodes/2' }],
        summary: { nodesAdded: 1, nodesRemoved: 0, nodesModified: 0 },
        generatedAt: Date.now()
      });

      const diff = await manager.generateVersionDiff(v1.id, v2.id);

      expect(diff.fromVersionId).toBe(v1.id);
      expect(diff.toVersionId).toBe(v2.id);
      expect(diff.operations).toHaveLength(1);
      expect(mockDiffer.generateDiff).toHaveBeenCalledWith(
        sampleWorkflow,
        modifiedWorkflow
      );
    });

    it('should throw error for non-existent versions', async () => {
      await expect(
        manager.generateVersionDiff('non-existent-1', 'non-existent-2')
      ).rejects.toThrow('One or both versions not found');
    });
  });
});