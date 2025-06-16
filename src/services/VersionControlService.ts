import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { 
  WorkflowVersion, 
  WorkflowBranch, 
  SemanticVersion, 
  WorkflowChange,
  VersionDiff,
  MergeResult,
  MergeConflict,
  VersionControlSettings,
  SemanticVersionSchema,
  WorkflowVersionSchema,
  WorkflowBranchSchema,
  VersionControlSettingsSchema,
  ChangeTypeSchema
} from '../types/version-control.types.js';
import { Workflow, WorkflowSchema } from '../types/n8n.types.js';
import { Logger } from '../utils/Logger.js';

interface IVersionControlStorage {
  // Version operations
  saveVersion(version: WorkflowVersion): Promise<void>;
  getVersion(versionId: string): Promise<WorkflowVersion | null>;
  listVersions(workflowId: string, branchName?: string): Promise<WorkflowVersion[]>;
  deleteVersion(versionId: string): Promise<void>;
  
  // Branch operations
  saveBranch(branch: WorkflowBranch): Promise<void>;
  getBranch(branchId: string): Promise<WorkflowBranch | null>;
  getBranchByName(workflowId: string, branchName: string): Promise<WorkflowBranch | null>;
  listBranches(workflowId: string): Promise<WorkflowBranch[]>;
  deleteBranch(branchId: string): Promise<void>;
  
  // Settings operations
  saveSettings(settings: VersionControlSettings): Promise<void>;
  getSettings(workflowId: string): Promise<VersionControlSettings | null>;
}

// In-memory storage implementation for now
class InMemoryVersionControlStorage implements IVersionControlStorage {
  private versions = new Map<string, WorkflowVersion>();
  private branches = new Map<string, WorkflowBranch>();
  private settings = new Map<string, VersionControlSettings>();

  async saveVersion(version: WorkflowVersion): Promise<void> {
    this.versions.set(version.id, version);
  }

  async getVersion(versionId: string): Promise<WorkflowVersion | null> {
    return this.versions.get(versionId) || null;
  }

  async listVersions(workflowId: string, branchName?: string): Promise<WorkflowVersion[]> {
    return Array.from(this.versions.values())
      .filter(v => v.workflowId === workflowId)
      .filter(v => !branchName || v.branchName === branchName)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async deleteVersion(versionId: string): Promise<void> {
    this.versions.delete(versionId);
  }

  async saveBranch(branch: WorkflowBranch): Promise<void> {
    this.branches.set(branch.id, branch);
  }

  async getBranch(branchId: string): Promise<WorkflowBranch | null> {
    return this.branches.get(branchId) || null;
  }

  async getBranchByName(workflowId: string, branchName: string): Promise<WorkflowBranch | null> {
    return Array.from(this.branches.values())
      .find(b => b.workflowId === workflowId && b.name === branchName) || null;
  }

  async listBranches(workflowId: string): Promise<WorkflowBranch[]> {
    return Array.from(this.branches.values())
      .filter(b => b.workflowId === workflowId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async deleteBranch(branchId: string): Promise<void> {
    this.branches.delete(branchId);
  }

  async saveSettings(settings: VersionControlSettings): Promise<void> {
    this.settings.set(settings.workflowId, settings);
  }

  async getSettings(workflowId: string): Promise<VersionControlSettings | null> {
    return this.settings.get(workflowId) || null;
  }
}

export class VersionControlService {
  private logger = new Logger('VersionControlService');
  private storage: IVersionControlStorage;

  constructor(storage?: IVersionControlStorage) {
    this.storage = storage || new InMemoryVersionControlStorage();
  }

  /**
   * Create a new version of a workflow
   */
  async createVersion(
    workflowId: string,
    workflow: Workflow,
    options: {
      branchName?: string;
      commitMessage?: string;
      author?: string;
      parentVersionId?: string;
      versionIncrement?: 'major' | 'minor' | 'patch';
      tags?: string[];
      isSnapshot?: boolean;
    } = {}
  ): Promise<WorkflowVersion> {
    const validatedWorkflow = WorkflowSchema.parse(workflow);
    const branchName = options.branchName || 'main';
    
    // Get or create branch
    let branch = await this.storage.getBranchByName(workflowId, branchName);
    if (!branch) {
      // For the first version, we need to create the branch without a base version
      const existingVersions = await this.storage.listVersions(workflowId);
      if (existingVersions.length === 0) {
        // This is the first version ever, create branch without base
        const newBranch: WorkflowBranch = {
          id: uuidv4(),
          workflowId,
          name: branchName,
          description: `Auto-created branch: ${branchName}`,
          baseVersionId: '', // Will be set after creating the first version
          headVersionId: '', // Will be set after creating the first version  
          isActive: true,
          isMerged: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await this.storage.saveBranch(newBranch);
        branch = newBranch;
      } else {
        branch = await this.createBranch(workflowId, branchName, {
          description: `Auto-created branch: ${branchName}`,
        });
      }
    }

    // Calculate version number
    const version = await this.calculateNextVersion(
      workflowId, 
      branchName, 
      options.versionIncrement || 'patch'
    );

    // Calculate changes
    const changes = await this.calculateChanges(
      workflowId, 
      branchName, 
      validatedWorkflow,
      options.parentVersionId
    );

    const workflowVersion: WorkflowVersion = {
      id: uuidv4(),
      workflowId,
      parentVersionId: options.parentVersionId || null,
      branchName,
      version,
      versionString: this.formatVersion(version),
      workflow: validatedWorkflow,
      changes,
      commitMessage: options.commitMessage,
      author: options.author,
      tags: (options.tags || []).map(name => ({ name })),
      createdAt: new Date().toISOString(),
      isSnapshot: options.isSnapshot || false,
    };

    await this.storage.saveVersion(workflowVersion);

    // Update branch head and base (if this is the first version)
    branch.headVersionId = workflowVersion.id;
    if (!branch.baseVersionId) {
      branch.baseVersionId = workflowVersion.id;
    }
    branch.updatedAt = new Date().toISOString();
    await this.storage.saveBranch(branch);

    this.logger.info('Version created', { 
      versionId: workflowVersion.id, 
      workflowId, 
      version: workflowVersion.versionString,
      branchName 
    });

    return workflowVersion;
  }

  /**
   * Create a new branch
   */
  async createBranch(
    workflowId: string,
    branchName: string,
    options: {
      description?: string;
      baseVersionId?: string;
      createdBy?: string;
    } = {}
  ): Promise<WorkflowBranch> {
    // Check if branch already exists
    const existingBranch = await this.storage.getBranchByName(workflowId, branchName);
    if (existingBranch) {
      throw new Error(`Branch '${branchName}' already exists for workflow ${workflowId}`);
    }

    // Get base version (latest from main branch if not specified)
    let baseVersionId = options.baseVersionId;
    if (!baseVersionId) {
      const mainVersions = await this.storage.listVersions(workflowId, 'main');
      if (mainVersions.length > 0) {
        baseVersionId = mainVersions[0].id;
      }
    }

    if (!baseVersionId) {
      throw new Error(`Cannot create branch '${branchName}': no base version found`);
    }

    const branch: WorkflowBranch = {
      id: uuidv4(),
      workflowId,
      name: branchName,
      description: options.description,
      baseVersionId,
      headVersionId: baseVersionId,
      isActive: true,
      isMerged: false,
      createdBy: options.createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.storage.saveBranch(branch);

    this.logger.info('Branch created', { 
      branchId: branch.id, 
      workflowId, 
      branchName, 
      baseVersionId 
    });

    return branch;
  }

  /**
   * Merge a branch into another branch
   */
  async mergeBranch(
    workflowId: string,
    sourceBranchName: string,
    targetBranchName: string,
    options: {
      strategy?: 'auto' | 'manual' | 'ours' | 'theirs';
      commitMessage?: string;
      author?: string;
      deleteSourceBranch?: boolean;
    } = {}
  ): Promise<MergeResult> {
    const sourceBranch = await this.storage.getBranchByName(workflowId, sourceBranchName);
    const targetBranch = await this.storage.getBranchByName(workflowId, targetBranchName);

    if (!sourceBranch || !targetBranch) {
      throw new Error(`Source or target branch not found`);
    }

    const sourceVersion = await this.storage.getVersion(sourceBranch.headVersionId);
    const targetVersion = await this.storage.getVersion(targetBranch.headVersionId);

    if (!sourceVersion || !targetVersion) {
      throw new Error(`Source or target version not found`);
    }

    // Detect conflicts
    const conflicts = await this.detectMergeConflicts(sourceVersion, targetVersion);
    const hasConflicts = conflicts.length > 0;
    const isAutoMergeable = !hasConflicts || options.strategy === 'auto';

    const mergeResult: MergeResult = {
      id: uuidv4(),
      sourceBranchId: sourceBranch.id,
      targetBranchId: targetBranch.id,
      conflicts,
      hasConflicts,
      isAutoMergeable,
      mergeStrategy: options.strategy || 'auto',
      createdAt: new Date().toISOString(),
    };

    // If auto-mergeable, create merged version
    if (isAutoMergeable) {
      const mergedWorkflow = await this.performMerge(sourceVersion, targetVersion, options.strategy || 'auto');
      mergeResult.mergedWorkflow = mergedWorkflow;
      
      // Create new version on target branch
      await this.createVersion(workflowId, mergedWorkflow, {
        branchName: targetBranchName,
        commitMessage: options.commitMessage || `Merge ${sourceBranchName} into ${targetBranchName}`,
        author: options.author,
        parentVersionId: targetVersion.id,
        versionIncrement: 'minor',
      });

      // Mark source branch as merged if requested
      if (options.deleteSourceBranch) {
        sourceBranch.isMerged = true;
        sourceBranch.mergedAt = new Date().toISOString();
        sourceBranch.isActive = false;
        await this.storage.saveBranch(sourceBranch);
      }

      mergeResult.mergedAt = new Date().toISOString();
    }

    this.logger.info('Branch merge attempted', {
      workflowId,
      sourceBranchName,
      targetBranchName,
      hasConflicts,
      isAutoMergeable,
      conflictCount: conflicts.length
    });

    return mergeResult;
  }

  /**
   * Get version history for a workflow
   */
  async getVersionHistory(
    workflowId: string, 
    options: {
      branchName?: string;
      limit?: number;
      offset?: number;
      includeSnapshots?: boolean;
    } = {}
  ): Promise<WorkflowVersion[]> {
    let versions = await this.storage.listVersions(workflowId, options.branchName);
    
    if (!options.includeSnapshots) {
      versions = versions.filter(v => !v.isSnapshot);
    }
    
    if (options.offset) {
      versions = versions.slice(options.offset);
    }
    
    if (options.limit) {
      versions = versions.slice(0, options.limit);
    }
    
    return versions;
  }

  /**
   * Rollback to a specific version
   */
  async rollbackToVersion(
    workflowId: string,
    targetVersionId: string,
    options: {
      branchName?: string;
      commitMessage?: string;
      author?: string;
      createBackup?: boolean;
    } = {}
  ): Promise<WorkflowVersion> {
    const targetVersion = await this.storage.getVersion(targetVersionId);
    if (!targetVersion) {
      throw new Error(`Version ${targetVersionId} not found`);
    }

    const branchName = options.branchName || 'main';

    // Create backup of current state if requested
    if (options.createBackup) {
      const currentVersions = await this.storage.listVersions(workflowId, branchName);
      if (currentVersions.length > 0) {
        const currentWorkflow = currentVersions[0].workflow;
        await this.createVersion(workflowId, currentWorkflow, {
          branchName,
          commitMessage: `Backup before rollback to ${targetVersion.versionString}`,
          author: options.author,
          isSnapshot: true,
        });
      }
    }

    // Create new version with rolled-back workflow
    const rolledBackVersion = await this.createVersion(workflowId, targetVersion.workflow, {
      branchName,
      commitMessage: options.commitMessage || `Rollback to version ${targetVersion.versionString}`,
      author: options.author,
      versionIncrement: 'patch',
    });

    this.logger.info('Workflow rolled back', {
      workflowId,
      targetVersionId,
      newVersionId: rolledBackVersion.id,
      branchName
    });

    return rolledBackVersion;
  }

  /**
   * Compare two versions and generate a diff
   */
  async compareVersions(fromVersionId: string, toVersionId: string): Promise<VersionDiff> {
    const fromVersion = await this.storage.getVersion(fromVersionId);
    const toVersion = await this.storage.getVersion(toVersionId);

    if (!fromVersion || !toVersion) {
      throw new Error('One or both versions not found');
    }

    return this.generateDiff(fromVersion, toVersion);
  }

  // Private helper methods

  private async calculateNextVersion(
    workflowId: string, 
    branchName: string, 
    increment: 'major' | 'minor' | 'patch'
  ): Promise<SemanticVersion> {
    const versions = await this.storage.listVersions(workflowId, branchName);
    
    if (versions.length === 0) {
      return { major: 1, minor: 0, patch: 0 };
    }

    const latestVersion = versions[0].version;
    
    switch (increment) {
      case 'major':
        return { major: latestVersion.major + 1, minor: 0, patch: 0 };
      case 'minor':
        return { major: latestVersion.major, minor: latestVersion.minor + 1, patch: 0 };
      case 'patch':
      default:
        return { major: latestVersion.major, minor: latestVersion.minor, patch: latestVersion.patch + 1 };
    }
  }

  private formatVersion(version: SemanticVersion): string {
    let versionString = `${version.major}.${version.minor}.${version.patch}`;
    
    if (version.prerelease) {
      versionString += `-${version.prerelease}`;
    }
    
    if (version.build) {
      versionString += `+${version.build}`;
    }
    
    return versionString;
  }

  private async calculateChanges(
    workflowId: string,
    branchName: string,
    newWorkflow: Workflow,
    parentVersionId?: string
  ): Promise<WorkflowChange[]> {
    // Get the previous version to compare against
    const versions = await this.storage.listVersions(workflowId, branchName);
    let previousWorkflow: Workflow | null = null;

    if (parentVersionId) {
      const parentVersion = await this.storage.getVersion(parentVersionId);
      previousWorkflow = parentVersion?.workflow || null;
    } else if (versions.length > 0) {
      previousWorkflow = versions[0].workflow;
    }

    if (!previousWorkflow) {
      // First version - everything is new
      return [{
        id: uuidv4(),
        type: 'create',
        path: '/',
        newValue: newWorkflow,
        description: 'Initial workflow version',
        timestamp: new Date().toISOString(),
      }];
    }

    // Calculate detailed changes between versions
    return this.diffWorkflows(previousWorkflow, newWorkflow);
  }

  private diffWorkflows(oldWorkflow: Workflow, newWorkflow: Workflow): WorkflowChange[] {
    const changes: WorkflowChange[] = [];
    const timestamp = new Date().toISOString();

    // Compare basic properties
    if (oldWorkflow.name !== newWorkflow.name) {
      changes.push({
        id: uuidv4(),
        type: 'rename',
        path: '/name',
        oldValue: oldWorkflow.name,
        newValue: newWorkflow.name,
        description: `Renamed workflow from "${oldWorkflow.name}" to "${newWorkflow.name}"`,
        timestamp,
      });
    }

    if (oldWorkflow.active !== newWorkflow.active) {
      changes.push({
        id: uuidv4(),
        type: 'activation_change',
        path: '/active',
        oldValue: oldWorkflow.active,
        newValue: newWorkflow.active,
        description: `Workflow ${newWorkflow.active ? 'activated' : 'deactivated'}`,
        timestamp,
      });
    }

    // Compare nodes
    const oldNodeMap = new Map(oldWorkflow.nodes.map(n => [n.id, n]));
    const newNodeMap = new Map(newWorkflow.nodes.map(n => [n.id, n]));

    // Find added nodes
    for (const [nodeId, node] of newNodeMap) {
      if (!oldNodeMap.has(nodeId)) {
        changes.push({
          id: uuidv4(),
          type: 'node_add',
          path: `/nodes/${nodeId}`,
          newValue: node,
          description: `Added node "${node.name}" (${node.type})`,
          timestamp,
        });
      }
    }

    // Find removed nodes
    for (const [nodeId, node] of oldNodeMap) {
      if (!newNodeMap.has(nodeId)) {
        changes.push({
          id: uuidv4(),
          type: 'node_remove',
          path: `/nodes/${nodeId}`,
          oldValue: node,
          description: `Removed node "${node.name}" (${node.type})`,
          timestamp,
        });
      }
    }

    // Find modified nodes
    for (const [nodeId, newNode] of newNodeMap) {
      const oldNode = oldNodeMap.get(nodeId);
      if (oldNode) {
        // Check for parameter changes
        if (JSON.stringify(oldNode.parameters) !== JSON.stringify(newNode.parameters)) {
          changes.push({
            id: uuidv4(),
            type: 'parameter_change',
            path: `/nodes/${nodeId}/parameters`,
            oldValue: oldNode.parameters,
            newValue: newNode.parameters,
            description: `Modified parameters for node "${newNode.name}"`,
            timestamp,
          });
        }

        // Check for position changes
        if (JSON.stringify(oldNode.position) !== JSON.stringify(newNode.position)) {
          changes.push({
            id: uuidv4(),
            type: 'move',
            path: `/nodes/${nodeId}/position`,
            oldValue: oldNode.position,
            newValue: newNode.position,
            description: `Moved node "${newNode.name}"`,
            timestamp,
          });
        }
      }
    }

    // Compare connections (simplified)
    if (JSON.stringify(oldWorkflow.connections) !== JSON.stringify(newWorkflow.connections)) {
      changes.push({
        id: uuidv4(),
        type: 'connection_change',
        path: '/connections',
        oldValue: oldWorkflow.connections,
        newValue: newWorkflow.connections,
        description: 'Modified workflow connections',
        timestamp,
      });
    }

    return changes;
  }

  private async detectMergeConflicts(
    sourceVersion: WorkflowVersion, 
    targetVersion: WorkflowVersion
  ): Promise<MergeConflict[]> {
    const conflicts: MergeConflict[] = [];
    const sourceWorkflow = sourceVersion.workflow;
    const targetWorkflow = targetVersion.workflow;

    // Simple conflict detection - check for nodes with same ID but different content
    const sourceNodeMap = new Map(sourceWorkflow.nodes.map(n => [n.id, n]));
    const targetNodeMap = new Map(targetWorkflow.nodes.map(n => [n.id, n]));

    for (const [nodeId, sourceNode] of sourceNodeMap) {
      const targetNode = targetNodeMap.get(nodeId);
      if (targetNode && JSON.stringify(sourceNode) !== JSON.stringify(targetNode)) {
        conflicts.push({
          id: uuidv4(),
          path: `/nodes/${nodeId}`,
          conflictType: 'node_conflict',
          sourceValue: sourceNode,
          targetValue: targetNode,
          description: `Node "${sourceNode.name}" has conflicting changes`,
        });
      }
    }

    return conflicts;
  }

  private async performMerge(
    sourceVersion: WorkflowVersion,
    targetVersion: WorkflowVersion,
    strategy: 'auto' | 'manual' | 'ours' | 'theirs'
  ): Promise<Workflow> {
    // Simple merge strategy implementation
    switch (strategy) {
      case 'ours':
        return targetVersion.workflow;
      case 'theirs':
        return sourceVersion.workflow;
      case 'auto':
      default:
        // For now, just use the source workflow
        // In a real implementation, this would intelligently merge non-conflicting changes
        return sourceVersion.workflow;
    }
  }

  private generateDiff(fromVersion: WorkflowVersion, toVersion: WorkflowVersion): VersionDiff {
    // Simplified diff implementation
    const operations: any[] = [];
    const summary = {
      nodesAdded: 0,
      nodesRemoved: 0,
      nodesModified: 0,
      connectionsAdded: 0,
      connectionsRemoved: 0,
      parametersChanged: 0,
    };

    // Count changes from the version changes
    for (const change of toVersion.changes) {
      switch (change.type) {
        case 'node_add':
          summary.nodesAdded++;
          operations.push({
            operation: 'add',
            path: change.path,
            value: change.newValue,
          });
          break;
        case 'node_remove':
          summary.nodesRemoved++;
          operations.push({
            operation: 'remove',
            path: change.path,
            oldValue: change.oldValue,
          });
          break;
        case 'parameter_change':
          summary.parametersChanged++;
          operations.push({
            operation: 'replace',
            path: change.path,
            value: change.newValue,
            oldValue: change.oldValue,
          });
          break;
        case 'connection_change':
          summary.connectionsAdded++;
          operations.push({
            operation: 'replace',
            path: change.path,
            value: change.newValue,
            oldValue: change.oldValue,
          });
          break;
      }
    }

    return {
      fromVersionId: fromVersion.id,
      toVersionId: toVersion.id,
      operations,
      summary,
      generatedAt: new Date().toISOString(),
    };
  }
}