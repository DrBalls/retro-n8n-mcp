import { WorkflowVersion, WorkflowBranch, VersionDiff, MergeResult, VersionControlSettings } from '../types/version-control.types.js';
import { Workflow } from '../types/n8n.types.js';
interface IVersionControlStorage {
    saveVersion(version: WorkflowVersion): Promise<void>;
    getVersion(versionId: string): Promise<WorkflowVersion | null>;
    listVersions(workflowId: string, branchName?: string): Promise<WorkflowVersion[]>;
    deleteVersion(versionId: string): Promise<void>;
    saveBranch(branch: WorkflowBranch): Promise<void>;
    getBranch(branchId: string): Promise<WorkflowBranch | null>;
    getBranchByName(workflowId: string, branchName: string): Promise<WorkflowBranch | null>;
    listBranches(workflowId: string): Promise<WorkflowBranch[]>;
    deleteBranch(branchId: string): Promise<void>;
    saveSettings(settings: VersionControlSettings): Promise<void>;
    getSettings(workflowId: string): Promise<VersionControlSettings | null>;
}
export declare class VersionControlService {
    private logger;
    private storage;
    constructor(storage?: IVersionControlStorage);
    /**
     * Create a new version of a workflow
     */
    createVersion(workflowId: string, workflow: Workflow, options?: {
        branchName?: string;
        commitMessage?: string;
        author?: string;
        parentVersionId?: string;
        versionIncrement?: 'major' | 'minor' | 'patch';
        tags?: string[];
        isSnapshot?: boolean;
    }): Promise<WorkflowVersion>;
    /**
     * Create a new branch
     */
    createBranch(workflowId: string, branchName: string, options?: {
        description?: string;
        baseVersionId?: string;
        createdBy?: string;
    }): Promise<WorkflowBranch>;
    /**
     * Merge a branch into another branch
     */
    mergeBranch(workflowId: string, sourceBranchName: string, targetBranchName: string, options?: {
        strategy?: 'auto' | 'manual' | 'ours' | 'theirs';
        commitMessage?: string;
        author?: string;
        deleteSourceBranch?: boolean;
    }): Promise<MergeResult>;
    /**
     * Get version history for a workflow
     */
    getVersionHistory(workflowId: string, options?: {
        branchName?: string;
        limit?: number;
        offset?: number;
        includeSnapshots?: boolean;
    }): Promise<WorkflowVersion[]>;
    /**
     * Rollback to a specific version
     */
    rollbackToVersion(workflowId: string, targetVersionId: string, options?: {
        branchName?: string;
        commitMessage?: string;
        author?: string;
        createBackup?: boolean;
    }): Promise<WorkflowVersion>;
    /**
     * Compare two versions and generate a diff
     */
    compareVersions(fromVersionId: string, toVersionId: string): Promise<VersionDiff>;
    private calculateNextVersion;
    private formatVersion;
    private calculateChanges;
    private diffWorkflows;
    private detectMergeConflicts;
    private performMerge;
    private generateDiff;
}
export {};
//# sourceMappingURL=VersionControlService.d.ts.map