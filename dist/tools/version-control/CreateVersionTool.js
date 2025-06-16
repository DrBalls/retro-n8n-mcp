import { z } from 'zod';
import { BaseTool } from '../base/Tool.js';
import { VersionControlService } from '../../services/VersionControlService.js';
export class CreateVersionTool extends BaseTool {
    name = 'version_control_create_version';
    description = 'Create a new version of a workflow with semantic versioning, change tracking, and branch support';
    inputSchema = z.object({
        workflowId: z.string().describe('The ID of the workflow to version'),
        branchName: z.string().default('main').describe('Branch name (default: main)'),
        commitMessage: z.string().optional().describe('Optional commit message describing the changes'),
        author: z.string().optional().describe('Author of this version'),
        versionIncrement: z.enum(['major', 'minor', 'patch']).default('patch').describe('Type of version increment'),
        tags: z.array(z.string()).default([]).describe('Tags to associate with this version'),
        isSnapshot: z.boolean().default(false).describe('Whether this is a snapshot version'),
    });
    versionControlService = new VersionControlService();
    async execute(params, context) {
        const input = this.validateInput(params);
        if (!context.apiClient) {
            throw new Error('n8n API client not configured');
        }
        try {
            // Fetch the current workflow
            const workflow = await context.apiClient.getWorkflow(input.workflowId);
            // Create the version
            const version = await this.versionControlService.createVersion(input.workflowId, workflow, {
                branchName: input.branchName,
                commitMessage: input.commitMessage,
                author: input.author,
                versionIncrement: input.versionIncrement,
                tags: input.tags,
                isSnapshot: input.isSnapshot,
            });
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify({
                            success: true,
                            version: {
                                id: version.id,
                                versionString: version.versionString,
                                workflowId: version.workflowId,
                                branchName: version.branchName,
                                commitMessage: version.commitMessage,
                                author: version.author,
                                tags: version.tags,
                                changeCount: version.changes.length,
                                createdAt: version.createdAt,
                                isSnapshot: version.isSnapshot,
                            },
                            changes: version.changes.map(change => ({
                                type: change.type,
                                path: change.path,
                                description: change.description,
                            })),
                            message: `Version ${version.versionString} created successfully on branch '${version.branchName}'`,
                        }, null, 2),
                    }],
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new Error(`Failed to create version: ${errorMessage}`);
        }
    }
    getMetadata() {
        return {
            category: 'version-control',
            isMutating: true,
            requirements: ['n8n API access'],
            tags: ['version-control', 'workflow', 'git', 'versioning'],
        };
    }
}
//# sourceMappingURL=CreateVersionTool.js.map