import { z } from 'zod';
import { BaseTool } from '../base/Tool.js';
import { VersionControlManager } from '../../services/version-control/VersionControlManager.js';
import { Logger } from '../../utils/Logger.js';
/**
 * Tool for creating a new version of a workflow
 * Implements Git-like commit functionality with semantic versioning
 */
export class VersionCreateTool extends BaseTool {
    name = 'version_create';
    description = 'Create a new version of a workflow with Git-like versioning and commit message';
    logger = new Logger('VersionCreateTool');
    versionManager = new VersionControlManager();
    inputSchema = z.object({
        workflowId: z.string().describe('ID of the workflow to version'),
        message: z.string().min(1).describe('Commit message describing the changes'),
        author: z.string().optional().describe('Author of the version (defaults to current user)'),
        branch: z.string().default('main').describe('Branch to create the version on'),
        versionType: z.enum(['major', 'minor', 'patch', 'auto'])
            .default('auto')
            .describe('Type of version increment (auto determines based on changes)'),
        tags: z.array(z.string()).default([]).describe('Tags to associate with this version'),
        isRelease: z.boolean().default(false).describe('Mark this version as a release'),
    });
    async execute(params, context) {
        const input = this.validateInput(params);
        if (!context.apiClient) {
            throw new Error('n8n API client not configured');
        }
        try {
            this.logger.info('Creating workflow version', {
                workflowId: input.workflowId,
                branch: input.branch,
                versionType: input.versionType,
            });
            // Get current workflow from n8n
            const workflow = await context.apiClient.getWorkflow(input.workflowId);
            // Check if this is the first version
            const existingVersions = await this.versionManager.getVersionHistory(input.workflowId, {
                branch: input.branch,
                limit: 1,
            });
            let version;
            if (existingVersions.length === 0) {
                // Initialize version control for new workflow
                version = await this.versionManager.initializeWorkflow(input.workflowId, workflow, {
                    defaultBranch: input.branch,
                    autoVersion: true,
                    requireCommitMessage: true,
                });
            }
            else {
                // Create new version
                version = await this.versionManager.createVersion(input.workflowId, workflow, {
                    branch: input.branch,
                    message: input.message,
                    author: input.author || 'user',
                    versionType: input.versionType,
                    tags: input.tags,
                    isSnapshot: false,
                });
            }
            const result = {
                success: true,
                version: {
                    id: version.id,
                    versionString: version.versionString,
                    branch: version.branchName,
                    message: version.commitMessage,
                    author: version.author,
                    timestamp: version.createdAt,
                    tags: version.tags.map(t => t.name),
                    changesCount: version.changes.length,
                    isRelease: input.isRelease,
                },
                changes: version.changes.map(change => ({
                    type: change.type,
                    path: change.path,
                    description: change.description,
                })),
                stats: {
                    totalVersions: existingVersions.length + 1,
                    parentVersion: version.parentVersionId,
                },
            };
            this.logger.info('Version created successfully', {
                versionId: version.id,
                versionString: version.versionString,
                changesCount: version.changes.length,
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
            this.logger.error('Failed to create version', { error, input });
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify({
                            success: false,
                            error: error instanceof Error ? error.message : 'Unknown error',
                            workflowId: input.workflowId,
                            timestamp: Date.now(),
                        }, null, 2),
                        mimeType: 'application/json'
                    }]
            };
        }
    }
    getMetadata() {
        return {
            category: 'version-control',
            isMutating: true,
            requirements: ['n8n API access'],
            tags: ['versioning', 'git', 'workflow', 'commit'],
        };
    }
}
//# sourceMappingURL=VersionCreateTool.js.map