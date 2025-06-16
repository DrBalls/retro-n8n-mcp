import { z } from 'zod';
import { BaseTool } from '../base/Tool.js';
import { VersionControlManager } from '../../services/version-control/VersionControlManager.js';
import { Logger } from '../../utils/Logger.js';
/**
 * Tool for rolling back to a previous version
 * Implements one-click rollback with safety features
 */
export class VersionRollbackTool extends BaseTool {
    name = 'version_rollback';
    description = 'Rollback workflow to a previous version with safety checks and backup creation';
    logger = new Logger('VersionRollbackTool');
    versionManager = new VersionControlManager();
    inputSchema = z.object({
        workflowId: z.string().describe('ID of the workflow to rollback'),
        targetVersionId: z.string().describe('Version ID to rollback to'),
        branch: z.string().default('main').describe('Branch to perform rollback on'),
        message: z.string().optional().describe('Rollback commit message (auto-generated if not provided)'),
        author: z.string().optional().describe('Author of the rollback'),
        createBackup: z.boolean().default(true).describe('Create backup of current version before rollback'),
        updateN8n: z.boolean().default(true).describe('Update the workflow in n8n after rollback'),
        force: z.boolean().default(false).describe('Force rollback even if there are warnings'),
        reason: z.string().optional().describe('Reason for the rollback (for audit purposes)'),
    });
    async execute(params, context) {
        const input = this.validateInput(params);
        if (!context.apiClient) {
            throw new Error('n8n API client not configured');
        }
        try {
            this.logger.info('Starting version rollback', {
                workflowId: input.workflowId,
                targetVersionId: input.targetVersionId,
                branch: input.branch,
            });
            // Get target version and current version for validation
            const targetVersionHistory = await this.versionManager.getVersionHistory(input.workflowId, {
                limit: 100, // Get enough history to find the target
            });
            const targetVersion = targetVersionHistory.find(v => v.id === input.targetVersionId);
            if (!targetVersion) {
                throw new Error(`Target version ${input.targetVersionId} not found`);
            }
            const currentVersion = targetVersionHistory[0]; // Most recent version
            // Safety checks
            const warnings = this.performSafetyChecks(targetVersion, currentVersion, input);
            if (warnings.length > 0 && !input.force) {
                return {
                    content: [{
                            type: 'text',
                            text: JSON.stringify({
                                success: false,
                                status: 'warnings',
                                message: 'Rollback blocked by safety warnings. Use force=true to override.',
                                warnings,
                                targetVersion: {
                                    id: targetVersion.id,
                                    version: targetVersion.versionString,
                                    message: targetVersion.commitMessage,
                                    author: targetVersion.author,
                                    createdAt: targetVersion.createdAt,
                                    age: this.calculateAge(targetVersion.createdAt),
                                },
                                currentVersion: {
                                    id: currentVersion.id,
                                    version: currentVersion.versionString,
                                    message: currentVersion.commitMessage,
                                    author: currentVersion.author,
                                    createdAt: currentVersion.createdAt,
                                },
                                recommendations: [
                                    'Review the warnings carefully',
                                    'Consider using force=true if rollback is necessary',
                                    'Ensure you have appropriate backups',
                                    'Test the target version thoroughly after rollback',
                                ],
                            }, null, 2),
                            mimeType: 'application/json'
                        }]
                };
            }
            // Generate rollback message
            const rollbackMessage = input.message ||
                `Rollback to version ${targetVersion.versionString} (${targetVersion.commitMessage})`;
            // Perform rollback
            const rollbackVersion = await this.versionManager.rollback(input.workflowId, input.targetVersionId, {
                branch: input.branch,
                message: rollbackMessage,
                author: input.author || 'user',
                createBackup: input.createBackup,
            });
            // Update n8n workflow if requested
            let n8nUpdateResult = null;
            if (input.updateN8n && context.apiClient) {
                try {
                    await context.apiClient.updateWorkflow(input.workflowId, targetVersion.workflow);
                    n8nUpdateResult = 'success';
                    this.logger.info('Workflow updated in n8n after rollback');
                }
                catch (updateError) {
                    n8nUpdateResult = 'failed';
                    this.logger.warn('Failed to update workflow in n8n', { updateError });
                }
            }
            // Calculate version difference
            const versionDiff = await this.versionManager.generateVersionDiff(currentVersion.id, targetVersion.id);
            const result = {
                success: true,
                status: 'completed',
                message: 'Rollback completed successfully',
                rollback: {
                    fromVersion: {
                        id: currentVersion.id,
                        version: currentVersion.versionString,
                        message: currentVersion.commitMessage,
                    },
                    toVersion: {
                        id: targetVersion.id,
                        version: targetVersion.versionString,
                        message: targetVersion.commitMessage,
                        age: this.calculateAge(targetVersion.createdAt),
                    },
                    rollbackVersion: {
                        id: rollbackVersion.id,
                        version: rollbackVersion.versionString,
                        createdAt: rollbackVersion.createdAt,
                    },
                    reason: input.reason,
                },
                changes: {
                    summary: versionDiff.summary,
                    totalOperations: versionDiff.operations.length,
                    description: this.generateChangeDescription(versionDiff.summary),
                },
                actions: {
                    backupCreated: input.createBackup,
                    n8nUpdated: n8nUpdateResult,
                    warningsOverridden: warnings.length > 0 && input.force,
                },
                warnings: warnings,
                audit: {
                    performer: input.author || 'user',
                    timestamp: Date.now(),
                    reason: input.reason || 'Manual rollback',
                    forced: input.force,
                },
                nextSteps: [
                    'Test the rolled-back workflow thoroughly',
                    'Monitor workflow execution for any issues',
                    'Consider creating a new version after testing',
                    'Document any issues found and their resolutions',
                ],
            };
            this.logger.info('Version rollback completed', {
                rollbackVersionId: rollbackVersion.id,
                targetVersionId: input.targetVersionId,
                n8nUpdated: n8nUpdateResult,
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
            this.logger.error('Failed to rollback version', { error, input });
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify({
                            success: false,
                            status: 'error',
                            error: error instanceof Error ? error.message : 'Unknown error',
                            workflowId: input.workflowId,
                            targetVersionId: input.targetVersionId,
                            timestamp: Date.now(),
                            suggestions: this.getErrorSuggestions(error),
                        }, null, 2),
                        mimeType: 'application/json'
                    }]
            };
        }
    }
    performSafetyChecks(targetVersion, currentVersion, input) {
        const warnings = [];
        // Age warning
        const ageInDays = this.calculateAge(targetVersion.createdAt);
        if (ageInDays > 30) {
            warnings.push(`Target version is ${ageInDays} days old - rolling back significant time`);
        }
        // Version gap warning
        const versionGap = this.calculateVersionGap(targetVersion.version, currentVersion.version);
        if (versionGap.major > 0) {
            warnings.push(`Rolling back ${versionGap.major} major version(s) - significant functionality may be lost`);
        }
        else if (versionGap.minor > 5) {
            warnings.push(`Rolling back ${versionGap.minor} minor version(s) - multiple features may be lost`);
        }
        // Snapshot warning
        if (targetVersion.isSnapshot) {
            warnings.push('Target version is a snapshot - may not be stable for production use');
        }
        // Branch mismatch warning
        if (targetVersion.branchName !== input.branch) {
            warnings.push(`Target version is from branch '${targetVersion.branchName}', rolling back on '${input.branch}'`);
        }
        return warnings;
    }
    calculateAge(timestamp) {
        return Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
    }
    calculateVersionGap(targetVersion, currentVersion) {
        return {
            major: currentVersion.major - targetVersion.major,
            minor: currentVersion.minor - targetVersion.minor,
            patch: currentVersion.patch - targetVersion.patch,
        };
    }
    generateChangeDescription(summary) {
        const descriptions = [];
        if (summary.nodesAdded > 0) {
            descriptions.push(`${summary.nodesAdded} node(s) will be removed`);
        }
        if (summary.nodesRemoved > 0) {
            descriptions.push(`${summary.nodesRemoved} node(s) will be restored`);
        }
        if (summary.nodesModified > 0) {
            descriptions.push(`${summary.nodesModified} node(s) will be reverted`);
        }
        if (summary.connectionsAdded > 0) {
            descriptions.push(`${summary.connectionsAdded} connection(s) will be removed`);
        }
        if (summary.connectionsRemoved > 0) {
            descriptions.push(`${summary.connectionsRemoved} connection(s) will be restored`);
        }
        return descriptions;
    }
    getErrorSuggestions(error) {
        const suggestions = [];
        const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';
        if (errorMessage.includes('not found')) {
            suggestions.push('Verify the target version ID exists');
            suggestions.push('Use "version_history" tool to see available versions');
        }
        if (errorMessage.includes('same version')) {
            suggestions.push('Cannot rollback to the current version');
            suggestions.push('Choose a different target version');
        }
        if (errorMessage.includes('branch')) {
            suggestions.push('Ensure the branch exists and has versions');
            suggestions.push('Check branch permissions and access');
        }
        return suggestions;
    }
    getMetadata() {
        return {
            category: 'version-control',
            isMutating: true,
            requirements: ['workflow access', 'n8n API access'],
            tags: ['rollback', 'revert', 'workflow', 'safety', 'backup'],
        };
    }
}
//# sourceMappingURL=VersionRollbackTool.js.map