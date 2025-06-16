import { z } from 'zod';
import { BaseTool } from '../base/Tool.js';
import { VersionControlService } from '../../services/VersionControlService.js';
export class CreateBranchTool extends BaseTool {
    name = 'version_control_create_branch';
    description = 'Create a new branch for workflow development with optional base version';
    inputSchema = z.object({
        workflowId: z.string().describe('The ID of the workflow to create a branch for'),
        branchName: z.string().min(1).max(100).describe('Name of the new branch'),
        description: z.string().optional().describe('Description of the branch purpose'),
        baseVersionId: z.string().optional().describe('Base version ID to branch from (default: latest main)'),
        createdBy: z.string().optional().describe('User creating the branch'),
    });
    versionControlService = new VersionControlService();
    async execute(params, context) {
        const input = this.validateInput(params);
        if (!context.apiClient) {
            throw new Error('n8n API client not configured');
        }
        try {
            // Create the branch
            const branch = await this.versionControlService.createBranch(input.workflowId, input.branchName, {
                description: input.description,
                baseVersionId: input.baseVersionId,
                createdBy: input.createdBy,
            });
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify({
                            success: true,
                            branch: {
                                id: branch.id,
                                name: branch.name,
                                workflowId: branch.workflowId,
                                description: branch.description,
                                baseVersionId: branch.baseVersionId,
                                headVersionId: branch.headVersionId,
                                isActive: branch.isActive,
                                createdBy: branch.createdBy,
                                createdAt: branch.createdAt,
                            },
                            message: `Branch '${branch.name}' created successfully`,
                            instructions: {
                                nextSteps: [
                                    'Make changes to your workflow',
                                    `Create versions using branchName: "${branch.name}"`,
                                    'Merge back to main when ready',
                                ],
                            },
                        }, null, 2),
                    }],
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new Error(`Failed to create branch: ${errorMessage}`);
        }
    }
    getMetadata() {
        return {
            category: 'version-control',
            isMutating: true,
            requirements: ['n8n API access'],
            tags: ['version-control', 'workflow', 'branch', 'git'],
        };
    }
}
//# sourceMappingURL=CreateBranchTool.js.map