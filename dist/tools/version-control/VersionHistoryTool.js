import { z } from 'zod';
import { BaseTool } from '../base/Tool.js';
import { VersionControlManager } from '../../services/version-control/VersionControlManager.js';
import { Logger } from '../../utils/Logger.js';
/**
 * Tool for retrieving workflow version history
 * Provides Git-like log functionality with filtering options
 */
export class VersionHistoryTool extends BaseTool {
    name = 'version_history';
    description = 'Get version history for a workflow with Git-like log functionality and filtering';
    logger = new Logger('VersionHistoryTool');
    versionManager = new VersionControlManager();
    inputSchema = z.object({
        workflowId: z.string().describe('ID of the workflow'),
        branch: z.string().optional().describe('Filter by specific branch (shows all branches if not specified)'),
        limit: z.number().min(1).max(100).default(20).describe('Maximum number of versions to return'),
        offset: z.number().min(0).default(0).describe('Number of versions to skip (for pagination)'),
        author: z.string().optional().describe('Filter by author name'),
        since: z.number().optional().describe('Show versions created after this timestamp'),
        until: z.number().optional().describe('Show versions created before this timestamp'),
        format: z.enum(['detailed', 'summary', 'oneline']).default('detailed').describe('Output format'),
        includeTags: z.boolean().default(true).describe('Include version tags in output'),
        includeChanges: z.boolean().default(false).describe('Include change details for each version'),
    });
    async execute(params, context) {
        const input = this.validateInput(params);
        try {
            this.logger.info('Retrieving version history', {
                workflowId: input.workflowId,
                branch: input.branch,
                limit: input.limit,
                format: input.format,
            });
            const versions = await this.versionManager.getVersionHistory(input.workflowId, {
                branch: input.branch,
                limit: input.limit,
                offset: input.offset,
                author: input.author,
                since: input.since,
                until: input.until,
            });
            if (versions.length === 0) {
                return {
                    content: [{
                            type: 'text',
                            text: JSON.stringify({
                                success: true,
                                message: 'No versions found for this workflow',
                                workflowId: input.workflowId,
                                branch: input.branch,
                                totalVersions: 0,
                                versions: [],
                            }, null, 2),
                            mimeType: 'application/json'
                        }]
                };
            }
            const formattedVersions = versions.map(version => {
                const base = {
                    id: version.id,
                    version: version.versionString,
                    branch: version.branchName,
                    author: version.author,
                    timestamp: version.createdAt,
                    date: new Date(version.createdAt).toISOString(),
                    message: version.commitMessage,
                    parentVersion: version.parentVersionId,
                    isSnapshot: version.isSnapshot,
                };
                if (input.format === 'oneline') {
                    return {
                        version: version.versionString,
                        message: version.commitMessage,
                        author: version.author,
                        date: new Date(version.createdAt).toLocaleDateString(),
                    };
                }
                if (input.format === 'summary') {
                    return {
                        ...base,
                        changesCount: version.changes.length,
                        tagsCount: version.tags.length,
                    };
                }
                // Detailed format
                const detailed = {
                    ...base,
                    tags: input.includeTags ? version.tags.map(t => t.name) : undefined,
                    changes: input.includeChanges ? version.changes.map(change => ({
                        type: change.type,
                        path: change.path,
                        description: change.description,
                        timestamp: change.timestamp,
                    })) : {
                        count: version.changes.length,
                        summary: this.summarizeChanges(version.changes),
                    },
                };
                return detailed;
            });
            // Generate statistics
            const stats = this.generateHistoryStats(versions);
            const result = {
                success: true,
                workflowId: input.workflowId,
                branch: input.branch,
                filter: {
                    author: input.author,
                    since: input.since,
                    until: input.until,
                },
                pagination: {
                    limit: input.limit,
                    offset: input.offset,
                    returned: versions.length,
                },
                statistics: stats,
                versions: formattedVersions,
            };
            this.logger.info('Version history retrieved', {
                workflowId: input.workflowId,
                versionsCount: versions.length,
                format: input.format,
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
            this.logger.error('Failed to retrieve version history', { error, input });
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
    summarizeChanges(changes) {
        const summary = {};
        for (const change of changes) {
            summary[change.type] = (summary[change.type] || 0) + 1;
        }
        return summary;
    }
    generateHistoryStats(versions) {
        const authors = new Set(versions.map(v => v.author));
        const branches = new Set(versions.map(v => v.branchName));
        const totalChanges = versions.reduce((sum, v) => sum + v.changes.length, 0);
        const changeTypes = new Map();
        versions.forEach(v => {
            v.changes.forEach((change) => {
                changeTypes.set(change.type, (changeTypes.get(change.type) || 0) + 1);
            });
        });
        return {
            totalVersions: versions.length,
            uniqueAuthors: authors.size,
            uniqueBranches: branches.size,
            totalChanges,
            averageChangesPerVersion: Math.round(totalChanges / versions.length * 100) / 100,
            oldestVersion: versions[versions.length - 1]?.versionString,
            newestVersion: versions[0]?.versionString,
            timespan: {
                from: versions[versions.length - 1]?.createdAt,
                to: versions[0]?.createdAt,
                days: Math.ceil((versions[0]?.createdAt - versions[versions.length - 1]?.createdAt) / (1000 * 60 * 60 * 24)),
            },
            changeDistribution: Object.fromEntries(changeTypes),
        };
    }
    getMetadata() {
        return {
            category: 'version-control',
            isMutating: false,
            requirements: ['workflow access'],
            tags: ['versioning', 'history', 'log', 'workflow'],
        };
    }
}
//# sourceMappingURL=VersionHistoryTool.js.map