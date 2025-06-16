import { VersionDiff } from '../../types/version-control.types.js';
import { Workflow } from '../../types/n8n.types.js';
/**
 * WorkflowDiffer
 * Generates diffs between workflow versions and provides visualization
 */
export declare class WorkflowDiffer {
    /**
     * Generate a comprehensive diff between two workflows
     */
    generateDiff(fromWorkflow: Workflow, toWorkflow: Workflow): Promise<VersionDiff>;
    /**
     * Generate human-readable diff description
     */
    generateDiffDescription(diff: VersionDiff): string[];
    /**
     * Check if two workflows are identical
     */
    areWorkflowsIdentical(workflow1: Workflow, workflow2: Workflow): boolean;
    /**
     * Get nodes that were added between versions
     */
    getAddedNodes(fromWorkflow: Workflow, toWorkflow: Workflow): any[];
    /**
     * Get nodes that were removed between versions
     */
    getRemovedNodes(fromWorkflow: Workflow, toWorkflow: Workflow): any[];
    /**
     * Get nodes that were modified between versions
     */
    getModifiedNodes(fromWorkflow: Workflow, toWorkflow: Workflow): Array<{
        nodeId: string;
        changes: string[];
    }>;
    /**
     * Get connection changes between workflows
     */
    getConnectionChanges(fromWorkflow: Workflow, toWorkflow: Workflow): {
        added: any[];
        removed: any[];
    };
    /**
     * Generate visual diff for display purposes
     */
    generateVisualDiff(diff: VersionDiff): {
        type: 'unified' | 'split';
        content: string;
    };
    private generateJsonPatch;
    private generateArrayPatch;
    private generateObjectPatch;
    private escapeJsonPointer;
    private convertToVersionDiffOperation;
    private generateSummary;
    private getNodeChanges;
    private normalizeConnections;
    private formatValue;
}
//# sourceMappingURL=WorkflowDiffer.d.ts.map