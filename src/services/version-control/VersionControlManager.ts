import {
  WorkflowVersion,
  WorkflowBranch,
  SemanticVersion,
  VersionControlSettings,
  MergeResult,
  MergeConflict,
  VersionDiff,
  WorkflowChange,
  ChangeType,
} from '../../types/version-control.types.js';
import { Workflow } from '../../types/n8n.types.js';
import { SemanticVersioning } from './SemanticVersioning.js';
import { WorkflowDiffer } from './WorkflowDiffer.js';
import { Logger } from '../../utils/Logger.js';
import { generateId } from '../../utils/generateId.js';
import { createHash } from 'crypto';

export interface IVersionStorage {
  saveVersion(version: WorkflowVersion): Promise<void>;
  getVersion(versionId: string): Promise<WorkflowVersion | null>;
  getVersions(workflowId: string, branch?: string): Promise<WorkflowVersion[]>;
  deleteVersion(versionId: string): Promise<void>;
  
  saveBranch(branch: WorkflowBranch): Promise<void>;
  getBranch(branchId: string): Promise<WorkflowBranch | null>;
  getBranches(workflowId: string): Promise<WorkflowBranch[]>;
  deleteBranch(branchId: string): Promise<void>;
  
  getSettings(workflowId: string): Promise<VersionControlSettings | null>;
  saveSettings(settings: VersionControlSettings): Promise<void>;
}

/**
 * In-memory implementation of version storage for development/testing
 */
class InMemoryVersionStorage implements IVersionStorage {
  private versions = new Map<string, WorkflowVersion>();
  private branches = new Map<string, WorkflowBranch>();
  private settings = new Map<string, VersionControlSettings>();
  
  async saveVersion(version: WorkflowVersion): Promise<void> {
    this.versions.set(version.id, version);
  }
  
  async getVersion(versionId: string): Promise<WorkflowVersion | null> {
    return this.versions.get(versionId) || null;
  }
  
  async getVersions(workflowId: string, branch?: string): Promise<WorkflowVersion[]> {
    const versions = Array.from(this.versions.values())
      .filter(v => v.workflowId === workflowId);
    
    if (branch) {
      return versions.filter(v => v.branchName === branch);
    }
    
    return versions;
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
  
  async getBranches(workflowId: string): Promise<WorkflowBranch[]> {
    return Array.from(this.branches.values())
      .filter(b => b.workflowId === workflowId && b.isActive);
  }
  
  async deleteBranch(branchId: string): Promise<void> {
    const branch = this.branches.get(branchId);
    if (branch) {
      branch.isActive = false;
      this.branches.set(branchId, branch);
    }
  }
  
  async getSettings(workflowId: string): Promise<VersionControlSettings | null> {
    return this.settings.get(workflowId) || null;
  }
  
  async saveSettings(settings: VersionControlSettings): Promise<void> {
    this.settings.set(settings.workflowId, settings);
  }
}

/**
 * Version Control Manager
 * Provides Git-like version control for n8n workflows
 */
export class VersionControlManager {
  private readonly logger = new Logger('VersionControlManager');
  private storage: IVersionStorage;
  private differ: WorkflowDiffer;
  
  constructor(storage?: IVersionStorage) {
    this.storage = storage || new InMemoryVersionStorage();
    this.differ = new WorkflowDiffer();
  }
  
  /**
   * Initialize version control for a workflow
   */
  async initializeWorkflow(
    workflowId: string,
    workflow: Workflow,
    settings?: Partial<VersionControlSettings>
  ): Promise<WorkflowVersion> {
    this.logger.info('Initializing version control', { workflowId });
    
    // Create default settings
    const defaultSettings: VersionControlSettings = {
      workflowId,
      autoVersion: true,
      versioningStrategy: 'semantic',
      autoSnapshot: false,
      snapshotInterval: 1,
      maxVersions: 100,
      retentionDays: 90,
      requireCommitMessage: false,
      allowBranching: true,
      defaultBranch: 'main',
      ...settings,
    };
    
    await this.storage.saveSettings(defaultSettings);
    
    // Create main branch
    const mainBranch: WorkflowBranch = {
      id: generateId(),
      workflowId,
      name: 'main',
      baseVersionId: '', // Will be set after first version
      headVersionId: '', // Will be set after first version
      isActive: true,
      isMerged: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    // Create initial version
    const initialVersion: WorkflowVersion = {
      id: generateId(),
      workflowId,
      branchName: 'main',
      version: SemanticVersioning.createInitialVersion(),
      versionString: '1.0.0',
      workflow,
      changes: [],
      commitMessage: 'Initial version',
      author: 'system',
      tags: [],
      createdAt: Date.now(),
      isSnapshot: false,
    };
    
    // Update branch references
    mainBranch.baseVersionId = initialVersion.id;
    mainBranch.headVersionId = initialVersion.id;
    
    await this.storage.saveVersion(initialVersion);
    await this.storage.saveBranch(mainBranch);
    
    this.logger.info('Version control initialized', { 
      workflowId,
      versionId: initialVersion.id,
      version: initialVersion.versionString,
    });
    
    return initialVersion;
  }
  
  /**
   * Create a new version of a workflow
   */
  async createVersion(
    workflowId: string,
    workflow: Workflow,
    options: {
      branch?: string;
      message?: string;
      author?: string;
      versionType?: 'major' | 'minor' | 'patch' | 'auto';
      tags?: string[];
      isSnapshot?: boolean;
    } = {}
  ): Promise<WorkflowVersion> {
    const {
      branch = 'main',
      message = 'Update workflow',
      author = 'user',
      versionType = 'auto',
      tags = [],
      isSnapshot = false,
    } = options;
    
    this.logger.info('Creating new version', { workflowId, branch, versionType });
    
    // Get current versions to determine next version number
    const existingVersions = await this.storage.getVersions(workflowId, branch);
    const currentVersion = existingVersions
      .sort((a, b) => SemanticVersioning.compare(b.version, a.version))[0];
    
    let newVersion: SemanticVersion;
    let changes: WorkflowChange[] = [];
    
    if (currentVersion) {
      // Generate diff and determine version increment
      const diff = await this.differ.generateDiff(currentVersion.workflow, workflow);
      changes = this.convertDiffToChanges(diff);
      
      // Analyze changes for auto-versioning
      const changeAnalysis = this.analyzeChanges(changes);
      newVersion = SemanticVersioning.getNextVersion(
        currentVersion.version,
        versionType,
        changeAnalysis
      );
    } else {
      // First version
      newVersion = SemanticVersioning.createInitialVersion();
    }
    
    const workflowVersion: WorkflowVersion = {
      id: generateId(),
      workflowId,
      parentVersionId: currentVersion?.id || null,
      branchName: branch,
      version: newVersion,
      versionString: SemanticVersioning.toString(newVersion),
      workflow,
      changes,
      commitMessage: message,
      author,
      tags: tags.map(tag => ({ name: tag })),
      createdAt: Date.now(),
      isSnapshot,
    };
    
    await this.storage.saveVersion(workflowVersion);
    
    // Update branch head
    await this.updateBranchHead(workflowId, branch, workflowVersion.id);
    
    this.logger.info('Version created successfully', {
      workflowId,
      versionId: workflowVersion.id,
      version: workflowVersion.versionString,
      changesCount: changes.length,
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
      fromBranch?: string;
      fromVersionId?: string;
      author?: string;
      description?: string;
    } = {}
  ): Promise<WorkflowBranch> {
    const {
      fromBranch = 'main',
      fromVersionId,
      author = 'user',
      description,
    } = options;
    
    this.logger.info('Creating new branch', { workflowId, branchName, fromBranch });
    
    // Check if branch already exists
    const existingBranches = await this.storage.getBranches(workflowId);
    const branchExists = existingBranches.some(b => b.name === branchName);
    
    if (branchExists) {
      throw new Error(`Branch '${branchName}' already exists`);
    }
    
    // Get source branch or version
    let baseVersionId: string;
    
    if (fromVersionId) {
      baseVersionId = fromVersionId;
    } else {
      const sourceBranch = existingBranches.find(b => b.name === fromBranch);
      if (!sourceBranch) {
        throw new Error(`Source branch '${fromBranch}' not found`);
      }
      baseVersionId = sourceBranch.headVersionId;
    }
    
    const newBranch: WorkflowBranch = {
      id: generateId(),
      workflowId,
      name: branchName,
      description,
      baseVersionId,
      headVersionId: baseVersionId,
      isActive: true,
      isMerged: false,
      createdBy: author,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    await this.storage.saveBranch(newBranch);
    
    this.logger.info('Branch created successfully', {
      workflowId,
      branchName,
      branchId: newBranch.id,
      baseVersionId,
    });
    
    return newBranch;
  }
  
  /**
   * Merge a branch into another branch
   */
  async mergeBranch(
    workflowId: string,
    sourceBranch: string,
    targetBranch: string,
    options: {
      message?: string;
      author?: string;
      strategy?: 'auto' | 'manual' | 'ours' | 'theirs';
      autoResolve?: boolean;
    } = {}
  ): Promise<MergeResult> {
    const {
      message = `Merge ${sourceBranch} into ${targetBranch}`,
      author = 'user',
      strategy = 'auto',
      autoResolve = true,
    } = options;
    
    this.logger.info('Starting branch merge', {
      workflowId,
      sourceBranch,
      targetBranch,
      strategy,
    });
    
    const branches = await this.storage.getBranches(workflowId);
    const source = branches.find(b => b.name === sourceBranch);
    const target = branches.find(b => b.name === targetBranch);
    
    if (!source || !target) {
      throw new Error('Source or target branch not found');
    }
    
    // Get the workflows for both branches
    const sourceVersion = await this.storage.getVersion(source.headVersionId);
    const targetVersion = await this.storage.getVersion(target.headVersionId);
    
    if (!sourceVersion || !targetVersion) {
      throw new Error('Could not retrieve branch versions');
    }
    
    // Check if fast-forward merge is possible
    const canFastForward = await this.canFastForwardMerge(source, target);
    
    if (canFastForward && strategy === 'auto') {
      // Fast-forward merge
      target.headVersionId = source.headVersionId;
      target.updatedAt = Date.now();
      await this.storage.saveBranch(target);
      
      const result: MergeResult = {
        id: generateId(),
        sourceBranchId: source.id,
        targetBranchId: target.id,
        mergedWorkflow: sourceVersion.workflow,
        conflicts: [],
        hasConflicts: false,
        isAutoMergeable: true,
        mergeStrategy: 'auto',
        createdAt: Date.now(),
        mergedAt: Date.now(),
      };
      
      this.logger.info('Fast-forward merge completed', { workflowId, mergeId: result.id });
      return result;
    }
    
    // Three-way merge
    const baseVersion = await this.findCommonAncestor(source, target);
    const mergeResult = await this.performThreeWayMerge(
      baseVersion?.workflow,
      sourceVersion.workflow,
      targetVersion.workflow,
      strategy,
      autoResolve
    );
    
    const result: MergeResult = {
      id: generateId(),
      sourceBranchId: source.id,
      targetBranchId: target.id,
      mergedWorkflow: mergeResult.mergedWorkflow,
      conflicts: mergeResult.conflicts,
      hasConflicts: mergeResult.conflicts.length > 0,
      isAutoMergeable: mergeResult.conflicts.length === 0,
      mergeStrategy: strategy,
      createdAt: Date.now(),
      resolvedAt: mergeResult.conflicts.length === 0 ? Date.now() : undefined,
      mergedAt: mergeResult.conflicts.length === 0 ? Date.now() : undefined,
    };
    
    // If merge is successful, create merge commit
    if (!result.hasConflicts && result.mergedWorkflow) {
      const mergeVersion = await this.createVersion(workflowId, result.mergedWorkflow, {
        branch: targetBranch,
        message,
        author,
        versionType: 'patch',
      });
      
      // Mark source branch as merged
      source.isMerged = true;
      source.mergedAt = Date.now();
      await this.storage.saveBranch(source);
      
      this.logger.info('Merge completed successfully', {
        workflowId,
        mergeId: result.id,
        mergeVersionId: mergeVersion.id,
      });
    } else {
      this.logger.warn('Merge has conflicts requiring manual resolution', {
        workflowId,
        mergeId: result.id,
        conflictCount: result.conflicts.length,
      });
    }
    
    return result;
  }
  
  /**
   * Rollback to a specific version
   */
  async rollback(
    workflowId: string,
    targetVersionId: string,
    options: {
      branch?: string;
      message?: string;
      author?: string;
      createBackup?: boolean;
    } = {}
  ): Promise<WorkflowVersion> {
    const {
      branch = 'main',
      message = `Rollback to version ${targetVersionId}`,
      author = 'user',
      createBackup = true,
    } = options;
    
    this.logger.info('Starting rollback', { workflowId, targetVersionId, branch });
    
    const targetVersion = await this.storage.getVersion(targetVersionId);
    if (!targetVersion) {
      throw new Error(`Target version ${targetVersionId} not found`);
    }
    
    // Create backup if requested
    if (createBackup) {
      const currentVersions = await this.storage.getVersions(workflowId, branch);
      const currentVersion = currentVersions
        .sort((a, b) => SemanticVersioning.compare(b.version, a.version))[0];
      
      if (currentVersion) {
        await this.createVersion(workflowId, currentVersion.workflow, {
          branch,
          message: `Backup before rollback to ${targetVersionId}`,
          author,
          versionType: 'patch',
          tags: ['backup'],
        });
      }
    }
    
    // Create new version with the target workflow content
    const rollbackVersion = await this.createVersion(workflowId, targetVersion.workflow, {
      branch,
      message,
      author,
      versionType: 'patch',
      tags: ['rollback'],
    });
    
    this.logger.info('Rollback completed', {
      workflowId,
      rollbackVersionId: rollbackVersion.id,
      targetVersionId,
    });
    
    return rollbackVersion;
  }
  
  /**
   * Get version history
   */
  async getVersionHistory(
    workflowId: string,
    options: {
      branch?: string;
      limit?: number;
      offset?: number;
      author?: string;
      since?: number;
      until?: number;
    } = {}
  ): Promise<WorkflowVersion[]> {
    const {
      branch,
      limit = 50,
      offset = 0,
      author,
      since,
      until,
    } = options;
    
    let versions = await this.storage.getVersions(workflowId, branch);
    
    // Apply filters
    if (author) {
      versions = versions.filter(v => v.author === author);
    }
    
    if (since) {
      versions = versions.filter(v => v.createdAt >= since);
    }
    
    if (until) {
      versions = versions.filter(v => v.createdAt <= until);
    }
    
    // Sort by creation time (newest first)
    versions.sort((a, b) => b.createdAt - a.createdAt);
    
    // Apply pagination
    return versions.slice(offset, offset + limit);
  }
  
  /**
   * Generate diff between two versions
   */
  async generateVersionDiff(
    fromVersionId: string,
    toVersionId: string
  ): Promise<VersionDiff> {
    const fromVersion = await this.storage.getVersion(fromVersionId);
    const toVersion = await this.storage.getVersion(toVersionId);
    
    if (!fromVersion || !toVersion) {
      throw new Error('Version not found for diff generation');
    }
    
    return this.differ.generateDiff(fromVersion.workflow, toVersion.workflow);
  }
  
  // Private helper methods
  
  private async updateBranchHead(
    workflowId: string,
    branchName: string,
    versionId: string
  ): Promise<void> {
    const branches = await this.storage.getBranches(workflowId);
    const branch = branches.find(b => b.name === branchName);
    
    if (branch) {
      branch.headVersionId = versionId;
      branch.updatedAt = Date.now();
      await this.storage.saveBranch(branch);
    }
  }
  
  private convertDiffToChanges(diff: VersionDiff): WorkflowChange[] {
    return diff.operations.map(op => ({
      id: generateId(),
      type: this.mapOperationToChangeType(op.operation),
      path: op.path,
      oldValue: op.oldValue,
      newValue: op.value,
      description: `${op.operation} at ${op.path}`,
      timestamp: Date.now(),
    }));
  }
  
  private mapOperationToChangeType(operation: string): ChangeType {
    switch (operation) {
      case 'add': return 'create';
      case 'remove': return 'delete';
      case 'replace': return 'update';
      case 'move': return 'move';
      default: return 'update';
    }
  }
  
  private analyzeChanges(changes: WorkflowChange[]): { breaking: boolean; features: number; fixes: number } {
    let breaking = false;
    let features = 0;
    let fixes = 0;
    
    for (const change of changes) {
      switch (change.type) {
        case 'delete':
        case 'node_remove':
          breaking = true;
          break;
        case 'create':
        case 'node_add':
          features++;
          break;
        case 'update':
        case 'parameter_change':
          fixes++;
          break;
      }
    }
    
    return { breaking, features, fixes };
  }
  
  private async canFastForwardMerge(
    source: WorkflowBranch,
    target: WorkflowBranch
  ): Promise<boolean> {
    // Check if target branch is ancestor of source branch
    // This is a simplified implementation
    return source.baseVersionId === target.headVersionId;
  }
  
  private async findCommonAncestor(
    branch1: WorkflowBranch,
    branch2: WorkflowBranch
  ): Promise<WorkflowVersion | null> {
    // Simplified common ancestor finding
    // In a full implementation, this would traverse the version graph
    const version = await this.storage.getVersion(branch1.baseVersionId);
    return version;
  }
  
  private async performThreeWayMerge(
    baseWorkflow: Workflow | undefined,
    sourceWorkflow: Workflow,
    targetWorkflow: Workflow,
    strategy: 'auto' | 'manual' | 'ours' | 'theirs',
    autoResolve: boolean
  ): Promise<{ mergedWorkflow?: Workflow; conflicts: MergeConflict[] }> {
    // This is a simplified merge implementation
    // A full implementation would perform sophisticated three-way merging
    
    if (strategy === 'ours') {
      return { mergedWorkflow: targetWorkflow, conflicts: [] };
    }
    
    if (strategy === 'theirs') {
      return { mergedWorkflow: sourceWorkflow, conflicts: [] };
    }
    
    // For now, return a simple conflict if workflows differ
    const conflicts: MergeConflict[] = [];
    
    if (JSON.stringify(sourceWorkflow) !== JSON.stringify(targetWorkflow)) {
      conflicts.push({
        id: generateId(),
        path: '/workflow',
        conflictType: 'property_conflict',
        sourceValue: sourceWorkflow,
        targetValue: targetWorkflow,
        baseValue: baseWorkflow,
        description: 'Workflow content differs between branches',
      });
    }
    
    return { conflicts };
  }
}