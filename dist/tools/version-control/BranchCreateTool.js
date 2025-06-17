import { z } from 'zod';
import { BaseTool } from '../base/Tool.js';
import { VersionControlManager } from '../../services/version-control/VersionControlManager.js';
import { Logger } from '../../utils/Logger.js';
/**
 * Tool for creating a new branch from an existing branch or version
 * Implements Git-like branching functionality
 */
export class BranchCreateTool extends BaseTool {
    name = 'branch_create';
    description = 'Create a new workflow branch for feature development or experimentation';
    logger = new Logger('BranchCreateTool');
    versionManager = new VersionControlManager();
    inputSchema = z.object({
        workflowId: z.string().describe('ID of the workflow'),
        branchName: z.string().min(1).max(100).describe('Name of the new branch'),
        fromBranch: z.string().default('main').describe('Source branch to create from'),
        fromVersionId: z.string().optional().describe('Specific version ID to branch from (overrides fromBranch)'),
        author: z.string().optional().describe('Author creating the branch'),
        description: z.string().optional().describe('Description of the branch purpose'),
        autoSwitch: z.boolean().default(false).describe('Automatically switch to the new branch after creation'),
    });
    async execute(params, context) {
        const input = this.validateInput(params);
        try {
            this.logger.info('Creating new branch', {
                workflowId: input.workflowId,
                branchName: input.branchName,
                fromBranch: input.fromBranch,
                fromVersionId: input.fromVersionId,
            });
            // Validate branch name format
            if (!/^[a-zA-Z0-9._-]+$/.test(input.branchName)) {
                throw new Error('Branch name can only contain letters, numbers, dots, underscores, and hyphens');
            }
            if (['main', 'master', 'HEAD'].includes(input.branchName)) {
                throw new Error(`'${input.branchName}' is a reserved branch name`);
            }
            const branch = await this.versionManager.createBranch(input.workflowId, input.branchName, {
                fromBranch: input.fromBranch,
                fromVersionId: input.fromVersionId,
                author: input.author || 'user',
                description: input.description,
            });
            // Get information about the source version
            const sourceVersionId = input.fromVersionId || branch.baseVersionId;
            const sourceVersions = await this.versionManager.getVersionHistory(input.workflowId, {
                limit: 1,
            });
            const sourceVersion = sourceVersions.find(v => v.id === sourceVersionId);
            const result = {
                success: true,
                branch: {
                    id: branch.id,
                    name: branch.name,
                    workflowId: branch.workflowId,
                    description: branch.description,
                    author: branch.createdBy,
                    createdAt: branch.createdAt,
                    baseVersionId: branch.baseVersionId,
                    headVersionId: branch.headVersionId,
                    isActive: branch.isActive,
                },
                source: {
                    branch: input.fromBranch,
                    versionId: sourceVersionId,
                    version: sourceVersion?.versionString,
                    message: sourceVersion?.commitMessage,
                },
                metadata: {
                    fromBranch: input.fromBranch,
                    fromVersionId: input.fromVersionId,
                    autoSwitch: input.autoSwitch,
                },
                recommendations: this.generateBranchRecommendations(input.branchName),
            };
            this.logger.info('Branch created successfully', {
                branchId: branch.id,
                branchName: branch.name,
                baseVersionId: branch.baseVersionId,
            });
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify(result, null, 2),
                        mimeType: 'application/json'
                    }]
            };
        }
        catch (error) {
            this.logger.error('Failed to create branch', { error, input });
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify({
                            success: false,
                            error: error instanceof Error ? error.message : 'Unknown error',
                            workflowId: input.workflowId,
                            branchName: input.branchName,
                            timestamp: Date.now(),
                            suggestions: this.getErrorSuggestions(error),
                        }, null, 2),
                        mimeType: 'application/json'
                    }]
            };
        }
    }
    generateBranchRecommendations(branchName) {
        const recommendations = [];
        // Naming convention recommendations
        if (branchName.includes('feature') || branchName.includes('feat')) {
            recommendations.push('Consider using semantic commit messages when creating versions on this feature branch');
        }
        if (branchName.includes('fix') || branchName.includes('bug')) {
            recommendations.push('This appears to be a bug fix branch - consider incrementing patch version when merging');
        }
        if (branchName.includes('experiment') || branchName.includes('test')) {
            recommendations.push('Experimental branches can be safely deleted after testing');
        }
        // Best practices
        recommendations.push('Remember to create versions regularly to track your progress');
        recommendations.push('Use descriptive commit messages to document changes');
        if (!branchName.includes('-') && !branchName.includes('_') && branchName.length > 10) {
            recommendations.push('Consider using hyphens or underscores for better readability in longer branch names');
        }
        return recommendations;
    }
    getErrorSuggestions(error) {
        const suggestions = [];
        const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';
        if (errorMessage.includes('already exists')) {
            suggestions.push('Try a different branch name or check existing branches first');
            suggestions.push('Use "branch_list" tool to see all existing branches');
        }
        if (errorMessage.includes('not found')) {
            suggestions.push('Verify the source branch exists and the workflow ID is correct');
            suggestions.push('Check if version control is initialized for this workflow');
        }
        if (errorMessage.includes('reserved')) {
            suggestions.push('Use a different branch name (avoid "main", "master", "HEAD")');
            suggestions.push('Try adding a prefix like "feature/", "fix/", or "dev/"');
        }
        return suggestions;
    }
    getMetadata() {
        return {
            category: 'version-control',
            isMutating: true,
            requirements: ['workflow access'],
            tags: ['branching', 'git', 'workflow', 'development'],
        };
    }
}
//# sourceMappingURL=BranchCreateTool.js.map