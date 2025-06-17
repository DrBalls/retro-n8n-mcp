import { WorkflowVersion, WorkflowBranch, VersionControlSettings, MergeResult, VersionDiff } from '../../types/version-control.types.js';
import { Workflow } from '../../types/n8n.types.js';
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
 * Version Control Manager
 * Provides Git-like version control for n8n workflows
 */
export declare class VersionControlManager {
    private readonly logger;
    private storage;
    private differ;
    constructor(storage?: IVersionStorage);
    /**
     * Initialize version control for a workflow
     */
    initializeWorkflow(workflowId: string, workflow: Workflow, settings?: Partial<VersionControlSettings>): Promise<WorkflowVersion>;
    /**
     * Create a new version of a workflow
     */
    createVersion(workflowId: string, workflow: Workflow, options?: {
        branch?: string;
        message?: string;
        author?: string;
        versionType?: 'major' | 'minor' | 'patch' | 'auto';
        tags?: string[];
        isSnapshot?: boolean;
    }): Promise<WorkflowVersion>;
    /**
     * Create a new branch
     */
    createBranch(workflowId: string, branchName: string, options?: {
        fromBranch?: string;
        fromVersionId?: string;
        author?: string;
        description?: string;
    }): Promise<WorkflowBranch>;
    /**
     * Merge a branch into another branch
     */
    mergeBranch(workflowId: string, sourceBranch: string, targetBranch: string, options?: {
        message?: string;
        author?: string;
        strategy?: 'auto' | 'manual' | 'ours' | 'theirs';
        autoResolve?: boolean;
    }): Promise<MergeResult>;
    /**
     * Rollback to a specific version
     */
    rollback(workflowId: string, targetVersionId: string, options?: {
        branch?: string;
        message?: string;
        author?: string;
        createBackup?: boolean;
    }): Promise<WorkflowVersion>;
    /**
     * Get version history
     */
    getVersionHistory(workflowId: string, options?: {
        branch?: string;
        limit?: number;
        offset?: number;
        author?: string;
        since?: number;
        until?: number;
    }): Promise<WorkflowVersion[]>;
    /**
     * Generate diff between two versions
     */
    generateVersionDiff(fromVersionId: string, toVersionId: string): Promise<VersionDiff>;
    private updateBranchHead;
    private convertDiffToChanges;
    private mapOperationToChangeType;
    private analyzeChanges;
    private canFastForwardMerge;
    private findCommonAncestor;
    private performThreeWayMerge;
}
//# sourceMappingURL=VersionControlManager.d.ts.map