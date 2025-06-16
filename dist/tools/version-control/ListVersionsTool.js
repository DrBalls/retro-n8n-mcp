import { z } from 'zod';
import { BaseTool } from '../base/Tool.js';
import { VersionControlService } from '../../services/VersionControlService.js';
export class ListVersionsTool extends BaseTool {
    name = 'version_control_list_versions';
    description = 'List all versions of a workflow with filtering and pagination options';
    inputSchema = z.object({
        workflowId: z.string().describe('The ID of the workflow to list versions for'),
        branchName: z.string().optional().describe('Filter by specific branch name'),
        limit: z.number().min(1).max(100).default(20).describe('Maximum number of versions to return'),
        offset: z.number().min(0).default(0).describe('Number of versions to skip'),
        includeSnapshots: z.boolean().default(false).describe('Include snapshot versions'),
        includeDetails: z.boolean().default(false).describe('Include detailed change information'),
    });
    versionControlService = new VersionControlService();
    async execute(params, context) {
        const input = this.validateInput(params);
        if (!context.apiClient) {
            throw new Error('n8n API client not configured');
        }
        try {
            // Get version history
            const versions = await this.versionControlService.getVersionHistory(input.workflowId, {
                branchName: input.branchName,
                limit: input.limit,
                offset: input.offset,
                includeSnapshots: input.includeSnapshots,
            });
            const versionList = versions.map(version => ({
                id: version.id,
                versionString: version.versionString,
                branchName: version.branchName,
                commitMessage: version.commitMessage,
                author: version.author,
                tags: version.tags.map(tag => tag.name),
                changeCount: version.changes.length,
                createdAt: version.createdAt,
                isSnapshot: version.isSnapshot,
                ...(input.includeDetails && {
                    changes: version.changes.map(change => ({
                        type: change.type,
                        path: change.path,
                        description: change.description,
                    })),
                }),
            }));
            // Get branches for context
            const branches = await this.versionControlService.getVersionHistory(input.workflowId, { limit: 1000 });
            const branchNames = [...new Set(branches.map(v => v.branchName))];
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify({
                            success: true,
                            workflowId: input.workflowId,
                            filter: {
                                branchName: input.branchName,
                                includeSnapshots: input.includeSnapshots,
                                limit: input.limit,
                                offset: input.offset,
                            },
                            totalVersions: versions.length,
                            availableBranches: branchNames,
                            versions: versionList,
                            pagination: {
                                hasMore: versions.length === input.limit,
                                nextOffset: input.offset + input.limit,
                            },
                        }, null, 2),
                    }],
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new Error(`Failed to list versions: ${errorMessage}`);
        }
    }
    getMetadata() {
        return {
            category: 'version-control',
            isMutating: false,
            requirements: ['n8n API access'],
            tags: ['version-control', 'workflow', 'history', 'list'],
        };
    }
}
//# sourceMappingURL=ListVersionsTool.js.map