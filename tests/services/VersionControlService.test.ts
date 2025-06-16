import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VersionControlService } from '../../src/services/VersionControlService.js';
import { createMockWorkflow } from '../helpers/mockWorkflowData.js';

describe('VersionControlService', () => {
  let service: VersionControlService;

  beforeEach(() => {
    service = new VersionControlService();
  });

  describe('Version Creation', () => {
    const mockWorkflow = createMockWorkflow({
      id: 'wf-123',
      name: 'Test Workflow',
      nodes: [
        {
          id: 'node1',
          name: 'Start',
          type: 'n8n-nodes-base.start',
          typeVersion: 1,
          position: [100, 100],
          parameters: {},
        },
      ],
    });

    it('should create first version with 1.0.0', async () => {
      const version = await service.createVersion('wf-123', mockWorkflow);

      expect(version.workflowId).toBe('wf-123');
      expect(version.branchName).toBe('main');
      expect(version.version).toEqual({ major: 1, minor: 0, patch: 0 });
      expect(version.versionString).toBe('1.0.0');
      expect(version.changes).toHaveLength(1);
      expect(version.changes[0].type).toBe('create');
    });

    it('should increment patch version by default', async () => {
      // Create first version
      await service.createVersion('wf-123', mockWorkflow);

      // Create second version
      const version2 = await service.createVersion('wf-123', mockWorkflow);

      expect(version2.version).toEqual({ major: 1, minor: 0, patch: 1 });
      expect(version2.versionString).toBe('1.0.1');
    });

    it('should support different increment types', async () => {
      // Create first version
      await service.createVersion('wf-123', mockWorkflow);

      // Create minor version
      const minorVersion = await service.createVersion('wf-123', mockWorkflow, {
        versionIncrement: 'minor',
      });

      expect(minorVersion.version).toEqual({ major: 1, minor: 1, patch: 0 });
      expect(minorVersion.versionString).toBe('1.1.0');

      // Create major version
      const majorVersion = await service.createVersion('wf-123', mockWorkflow, {
        versionIncrement: 'major',
      });

      expect(majorVersion.version).toEqual({ major: 2, minor: 0, patch: 0 });
      expect(majorVersion.versionString).toBe('2.0.0');
    });

    it('should create version on custom branch', async () => {
      const version = await service.createVersion('wf-123', mockWorkflow, {
        branchName: 'feature/test',
      });

      expect(version.branchName).toBe('feature/test');
    });

    it('should include metadata in version', async () => {
      const version = await service.createVersion('wf-123', mockWorkflow, {
        commitMessage: 'Test commit',
        author: 'test-user',
        tags: ['stable'],
      });

      expect(version.commitMessage).toBe('Test commit');
      expect(version.author).toBe('test-user');
      expect(version.tags).toHaveLength(1);
      expect(version.tags[0].name).toBe('stable');
    });
  });

  describe('Branch Management', () => {
    it('should create new branch', async () => {
      // Create initial version on main
      const mockWorkflow = createMockWorkflow({ id: 'wf-123' });
      const mainVersion = await service.createVersion('wf-123', mockWorkflow);

      // Create branch
      const branch = await service.createBranch('wf-123', 'feature/test', {
        description: 'Test feature branch',
        baseVersionId: mainVersion.id,
        createdBy: 'test-user',
      });

      expect(branch.name).toBe('feature/test');
      expect(branch.workflowId).toBe('wf-123');
      expect(branch.description).toBe('Test feature branch');
      expect(branch.baseVersionId).toBe(mainVersion.id);
      expect(branch.headVersionId).toBe(mainVersion.id);
      expect(branch.isActive).toBe(true);
      expect(branch.isMerged).toBe(false);
      expect(branch.createdBy).toBe('test-user');
    });

    it('should prevent duplicate branch names', async () => {
      const mockWorkflow = createMockWorkflow({ id: 'wf-123' });
      await service.createVersion('wf-123', mockWorkflow);

      // Create first branch
      await service.createBranch('wf-123', 'feature/test');

      // Try to create duplicate
      await expect(service.createBranch('wf-123', 'feature/test'))
        .rejects.toThrow("Branch 'feature/test' already exists");
    });

    it('should auto-create branch when creating version', async () => {
      const mockWorkflow = createMockWorkflow({ id: 'wf-123' });
      
      const version = await service.createVersion('wf-123', mockWorkflow, {
        branchName: 'feature/auto',
      });

      expect(version.branchName).toBe('feature/auto');
    });
  });

  describe('Version History', () => {
    it('should return versions in chronological order', async () => {
      const mockWorkflow = createMockWorkflow({ id: 'wf-history' });
      
      const version1 = await service.createVersion('wf-history', mockWorkflow);
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 1));
      const version2 = await service.createVersion('wf-history', mockWorkflow);
      await new Promise(resolve => setTimeout(resolve, 1));
      const version3 = await service.createVersion('wf-history', mockWorkflow);

      const history = await service.getVersionHistory('wf-history');

      expect(history).toHaveLength(3);
      expect(history[0].id).toBe(version3.id); // Most recent first
      expect(history[1].id).toBe(version2.id);
      expect(history[2].id).toBe(version1.id);
    });

    it('should filter by branch', async () => {
      const mockWorkflow = createMockWorkflow({ id: 'wf-123' });
      
      const mainVersion = await service.createVersion('wf-123', mockWorkflow);
      const featureVersion = await service.createVersion('wf-123', mockWorkflow, {
        branchName: 'feature/test',
      });

      const mainHistory = await service.getVersionHistory('wf-123', { branchName: 'main' });
      const featureHistory = await service.getVersionHistory('wf-123', { branchName: 'feature/test' });

      expect(mainHistory).toHaveLength(1);
      expect(mainHistory[0].id).toBe(mainVersion.id);
      
      expect(featureHistory).toHaveLength(1);
      expect(featureHistory[0].id).toBe(featureVersion.id);
    });

    it('should support pagination', async () => {
      const mockWorkflow = createMockWorkflow({ id: 'wf-123' });
      
      // Create multiple versions
      for (let i = 0; i < 5; i++) {
        await service.createVersion('wf-123', mockWorkflow);
      }

      const page1 = await service.getVersionHistory('wf-123', { limit: 2, offset: 0 });
      const page2 = await service.getVersionHistory('wf-123', { limit: 2, offset: 2 });

      expect(page1).toHaveLength(2);
      expect(page2).toHaveLength(2);
      expect(page1[0].id).not.toBe(page2[0].id);
    });

    it('should exclude snapshots by default', async () => {
      const mockWorkflow = createMockWorkflow({ id: 'wf-123' });
      
      await service.createVersion('wf-123', mockWorkflow);
      await service.createVersion('wf-123', mockWorkflow, { isSnapshot: true });
      await service.createVersion('wf-123', mockWorkflow);

      const history = await service.getVersionHistory('wf-123');
      const historyWithSnapshots = await service.getVersionHistory('wf-123', { includeSnapshots: true });

      expect(history).toHaveLength(2);
      expect(historyWithSnapshots).toHaveLength(3);
    });
  });

  describe('Merge Operations', () => {
    it('should merge branches without conflicts', async () => {
      const mockWorkflow = createMockWorkflow({ id: 'wf-123' });
      
      // Create main branch version
      const mainVersion = await service.createVersion('wf-123', mockWorkflow);

      // Create feature branch and version
      await service.createBranch('wf-123', 'feature/test', { baseVersionId: mainVersion.id });
      
      const modifiedWorkflow = { 
        ...mockWorkflow, 
        name: 'Modified Workflow',
      };
      await service.createVersion('wf-123', modifiedWorkflow, { branchName: 'feature/test' });

      // Merge feature into main
      const mergeResult = await service.mergeBranch('wf-123', 'feature/test', 'main');

      expect(mergeResult.hasConflicts).toBe(false);
      expect(mergeResult.isAutoMergeable).toBe(true);
      expect(mergeResult.mergedAt).toBeDefined();
      expect(mergeResult.mergedWorkflow).toBeDefined();
    });

    it('should detect merge conflicts', async () => {
      const baseWorkflow = createMockWorkflow({ 
        id: 'wf-conflicts',
        name: 'Original',
        nodes: [{
          id: 'shared-node',
          name: 'Shared Node',
          type: 'n8n-nodes-base.function',
          typeVersion: 1,
          position: [100, 100],
          parameters: { code: 'original code' },
        }]
      });
      
      // Create main branch version
      const mainVersion = await service.createVersion('wf-conflicts', baseWorkflow);

      // Create feature branch
      await service.createBranch('wf-conflicts', 'feature/test', { baseVersionId: mainVersion.id });

      // Modify the same node differently on each branch
      const mainModified = { 
        ...baseWorkflow, 
        nodes: [{
          ...baseWorkflow.nodes[0],
          parameters: { code: 'main branch code' }
        }]
      };
      await service.createVersion('wf-conflicts', mainModified);

      const featureModified = { 
        ...baseWorkflow, 
        nodes: [{
          ...baseWorkflow.nodes[0],
          parameters: { code: 'feature branch code' }
        }]
      };
      await service.createVersion('wf-conflicts', featureModified, { branchName: 'feature/test' });

      // Attempt merge
      const mergeResult = await service.mergeBranch('wf-conflicts', 'feature/test', 'main');

      expect(mergeResult.hasConflicts).toBe(true);
      expect(mergeResult.isAutoMergeable).toBe(false);
      expect(mergeResult.conflicts.length).toBeGreaterThan(0);
    });

    it('should support different merge strategies', async () => {
      const mockWorkflow = createMockWorkflow({ id: 'wf-123' });
      
      // Setup branches
      const mainVersion = await service.createVersion('wf-123', mockWorkflow);
      await service.createBranch('wf-123', 'feature/test', { baseVersionId: mainVersion.id });
      
      const featureWorkflow = { ...mockWorkflow, name: 'Feature' };
      await service.createVersion('wf-123', featureWorkflow, { branchName: 'feature/test' });

      // Test 'theirs' strategy
      const theirsResult = await service.mergeBranch('wf-123', 'feature/test', 'main', {
        strategy: 'theirs',
      });

      expect(theirsResult.mergeStrategy).toBe('theirs');
      expect(theirsResult.mergedWorkflow?.name).toBe('Feature');

      // Test 'ours' strategy
      const oursResult = await service.mergeBranch('wf-123', 'feature/test', 'main', {
        strategy: 'ours',
      });

      expect(oursResult.mergeStrategy).toBe('ours');
    });
  });

  describe('Rollback Operations', () => {
    it('should rollback to previous version', async () => {
      const mockWorkflow = createMockWorkflow({ id: 'wf-123', name: 'Original' });
      
      const version1 = await service.createVersion('wf-123', mockWorkflow);
      
      const modifiedWorkflow = { ...mockWorkflow, name: 'Modified' };
      await service.createVersion('wf-123', modifiedWorkflow);

      // Rollback to version 1
      const rolledBack = await service.rollbackToVersion('wf-123', version1.id);

      expect(rolledBack.workflow.name).toBe('Original');
      expect(rolledBack.commitMessage).toContain(`Rollback to version ${version1.versionString}`);
    });

    it('should create backup when rolling back', async () => {
      const mockWorkflow = createMockWorkflow({ id: 'wf-123' });
      
      const version1 = await service.createVersion('wf-123', mockWorkflow);
      await service.createVersion('wf-123', mockWorkflow);

      // Rollback with backup
      await service.rollbackToVersion('wf-123', version1.id, { createBackup: true });

      const history = await service.getVersionHistory('wf-123', { includeSnapshots: true });
      const backupVersions = history.filter(v => v.isSnapshot && v.commitMessage?.includes('Backup before rollback'));
      
      expect(backupVersions).toHaveLength(1);
    });

    it('should handle rollback to non-existent version', async () => {
      await expect(service.rollbackToVersion('wf-123', 'non-existent'))
        .rejects.toThrow('Version non-existent not found');
    });
  });

  describe('Version Comparison', () => {
    it('should generate diff between versions', async () => {
      const workflow1 = createMockWorkflow({ id: 'wf-123', name: 'Version 1' });
      const workflow2 = createMockWorkflow({ id: 'wf-123', name: 'Version 2' });
      
      const version1 = await service.createVersion('wf-123', workflow1);
      const version2 = await service.createVersion('wf-123', workflow2);

      const diff = await service.compareVersions(version1.id, version2.id);

      expect(diff.fromVersionId).toBe(version1.id);
      expect(diff.toVersionId).toBe(version2.id);
      expect(diff.operations).toBeDefined();
      expect(diff.summary).toBeDefined();
      expect(diff.generatedAt).toBeDefined();
    });

    it('should handle comparison of non-existent versions', async () => {
      await expect(service.compareVersions('non-existent-1', 'non-existent-2'))
        .rejects.toThrow('One or both versions not found');
    });
  });

  describe('Change Detection', () => {
    it('should detect node additions', async () => {
      const workflow1 = createMockWorkflow({
        id: 'wf-123',
        nodes: [
          {
            id: 'node1',
            name: 'Start',
            type: 'n8n-nodes-base.start',
            typeVersion: 1,
            position: [100, 100],
            parameters: {},
          },
        ],
      });

      const workflow2 = createMockWorkflow({
        id: 'wf-123',
        nodes: [
          ...workflow1.nodes,
          {
            id: 'node2',
            name: 'End',
            type: 'n8n-nodes-base.end',
            typeVersion: 1,
            position: [200, 100],
            parameters: {},
          },
        ],
      });

      await service.createVersion('wf-123', workflow1);
      const version2 = await service.createVersion('wf-123', workflow2);

      const nodeAddChanges = version2.changes.filter(c => c.type === 'node_add');
      expect(nodeAddChanges).toHaveLength(1);
      expect(nodeAddChanges[0].description).toContain('End');
    });

    it('should detect workflow name changes', async () => {
      const workflow1 = createMockWorkflow({ id: 'wf-123', name: 'Original Name' });
      const workflow2 = createMockWorkflow({ id: 'wf-123', name: 'New Name' });

      await service.createVersion('wf-123', workflow1);
      const version2 = await service.createVersion('wf-123', workflow2);

      const nameChanges = version2.changes.filter(c => c.type === 'rename');
      expect(nameChanges).toHaveLength(1);
      expect(nameChanges[0].oldValue).toBe('Original Name');
      expect(nameChanges[0].newValue).toBe('New Name');
    });

    it('should detect activation changes', async () => {
      const workflow1 = createMockWorkflow({ id: 'wf-123', active: false });
      const workflow2 = createMockWorkflow({ id: 'wf-123', active: true });

      await service.createVersion('wf-123', workflow1);
      const version2 = await service.createVersion('wf-123', workflow2);

      const activationChanges = version2.changes.filter(c => c.type === 'activation_change');
      expect(activationChanges).toHaveLength(1);
      expect(activationChanges[0].description).toContain('activated');
    });
  });
});