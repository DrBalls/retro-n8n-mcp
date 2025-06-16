import { z } from 'zod';
import { BaseTool } from '../base/Tool.js';
import { VersionControlService } from '../../services/VersionControlService.js';
export class CompareVersionsTool extends BaseTool {
    name = 'version_control_compare_versions';
    description = 'Compare two workflow versions and generate detailed diff visualization';
    inputSchema = z.object({
        fromVersionId: z.string().describe('Source version ID for comparison'),
        toVersionId: z.string().describe('Target version ID for comparison'),
        format: z.enum(['json', 'text', 'markdown']).default('json').describe('Output format for the diff'),
        includeMetadata: z.boolean().default(true).describe('Include version metadata in comparison'),
        showOnlyChanges: z.boolean().default(false).describe('Show only changed elements'),
    });
    versionControlService = new VersionControlService();
    async execute(params, context) {
        const input = this.validateInput(params);
        if (!context.apiClient) {
            throw new Error('n8n API client not configured');
        }
        try {
            // Generate the diff
            const diff = await this.versionControlService.compareVersions(input.fromVersionId, input.toVersionId);
            // Get version details for metadata
            const fromVersions = await this.versionControlService.getVersionHistory('', { limit: 1000 });
            const toVersions = await this.versionControlService.getVersionHistory('', { limit: 1000 });
            const fromVersion = fromVersions.find(v => v.id === input.fromVersionId);
            const toVersion = toVersions.find(v => v.id === input.toVersionId);
            if (!fromVersion || !toVersion) {
                throw new Error('One or both versions not found');
            }
            let diffContent;
            switch (input.format) {
                case 'markdown':
                    diffContent = this.formatDiffAsMarkdown(diff, fromVersion, toVersion, input);
                    break;
                case 'text':
                    diffContent = this.formatDiffAsText(diff, fromVersion, toVersion, input);
                    break;
                case 'json':
                default:
                    diffContent = JSON.stringify({
                        success: true,
                        comparison: {
                            fromVersion: input.includeMetadata ? {
                                id: fromVersion.id,
                                versionString: fromVersion.versionString,
                                branchName: fromVersion.branchName,
                                commitMessage: fromVersion.commitMessage,
                                author: fromVersion.author,
                                createdAt: fromVersion.createdAt,
                            } : { id: fromVersion.id, versionString: fromVersion.versionString },
                            toVersion: input.includeMetadata ? {
                                id: toVersion.id,
                                versionString: toVersion.versionString,
                                branchName: toVersion.branchName,
                                commitMessage: toVersion.commitMessage,
                                author: toVersion.author,
                                createdAt: toVersion.createdAt,
                            } : { id: toVersion.id, versionString: toVersion.versionString },
                        },
                        diff: {
                            summary: diff.summary,
                            operations: input.showOnlyChanges ?
                                diff.operations.filter(op => op.operation !== 'copy') :
                                diff.operations,
                            generatedAt: diff.generatedAt,
                        },
                        statistics: {
                            totalOperations: diff.operations.length,
                            additions: diff.operations.filter(op => op.operation === 'add').length,
                            deletions: diff.operations.filter(op => op.operation === 'remove').length,
                            modifications: diff.operations.filter(op => op.operation === 'replace').length,
                            moves: diff.operations.filter(op => op.operation === 'move').length,
                        },
                    }, null, 2);
            }
            return {
                content: [{
                        type: 'text',
                        text: diffContent,
                        mimeType: input.format === 'json' ? 'application/json' : 'text/plain',
                    }],
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new Error(`Failed to compare versions: ${errorMessage}`);
        }
    }
    formatDiffAsMarkdown(diff, fromVersion, toVersion, options) {
        const lines = [
            `# Workflow Version Comparison`,
            '',
            `## Versions`,
            `- **From:** ${fromVersion.versionString} (${fromVersion.id})`,
            `- **To:** ${toVersion.versionString} (${toVersion.id})`,
            '',
            `## Summary`,
            `- **Nodes Added:** ${diff.summary.nodesAdded}`,
            `- **Nodes Removed:** ${diff.summary.nodesRemoved}`,
            `- **Nodes Modified:** ${diff.summary.nodesModified}`,
            `- **Connections Added:** ${diff.summary.connectionsAdded}`,
            `- **Connections Removed:** ${diff.summary.connectionsRemoved}`,
            `- **Parameters Changed:** ${diff.summary.parametersChanged}`,
            '',
            `## Changes`,
        ];
        if (diff.operations.length === 0) {
            lines.push('*No changes detected between versions*');
        }
        else {
            diff.operations.forEach((op, index) => {
                lines.push(`### ${index + 1}. ${this.operationToReadableText(op)}`);
                lines.push(`- **Operation:** ${op.operation}`);
                lines.push(`- **Path:** \`${op.path}\``);
                if (op.oldValue !== undefined) {
                    lines.push(`- **Old Value:** \`${JSON.stringify(op.oldValue).substring(0, 100)}...\``);
                }
                if (op.value !== undefined) {
                    lines.push(`- **New Value:** \`${JSON.stringify(op.value).substring(0, 100)}...\``);
                }
                lines.push('');
            });
        }
        return lines.join('\n');
    }
    formatDiffAsText(diff, fromVersion, toVersion, options) {
        const lines = [
            `Workflow Version Comparison`,
            `==========================`,
            '',
            `From: ${fromVersion.versionString} (${fromVersion.id})`,
            `To:   ${toVersion.versionString} (${toVersion.id})`,
            '',
            `Summary:`,
            `  Nodes Added:       ${diff.summary.nodesAdded}`,
            `  Nodes Removed:     ${diff.summary.nodesRemoved}`,
            `  Nodes Modified:    ${diff.summary.nodesModified}`,
            `  Connections Added: ${diff.summary.connectionsAdded}`,
            `  Connections Removed: ${diff.summary.connectionsRemoved}`,
            `  Parameters Changed: ${diff.summary.parametersChanged}`,
            '',
            `Changes:`,
        ];
        if (diff.operations.length === 0) {
            lines.push('  No changes detected between versions');
        }
        else {
            diff.operations.forEach((op, index) => {
                lines.push(`  ${index + 1}. ${this.operationToReadableText(op)}`);
                lines.push(`     Operation: ${op.operation}`);
                lines.push(`     Path: ${op.path}`);
                if (op.oldValue !== undefined) {
                    lines.push(`     Old: ${JSON.stringify(op.oldValue).substring(0, 80)}...`);
                }
                if (op.value !== undefined) {
                    lines.push(`     New: ${JSON.stringify(op.value).substring(0, 80)}...`);
                }
                lines.push('');
            });
        }
        return lines.join('\n');
    }
    operationToReadableText(operation) {
        switch (operation.operation) {
            case 'add':
                return `Added ${this.pathToReadable(operation.path)}`;
            case 'remove':
                return `Removed ${this.pathToReadable(operation.path)}`;
            case 'replace':
                return `Modified ${this.pathToReadable(operation.path)}`;
            case 'move':
                return `Moved ${this.pathToReadable(operation.from)} to ${this.pathToReadable(operation.path)}`;
            case 'copy':
                return `Copied ${this.pathToReadable(operation.from)} to ${this.pathToReadable(operation.path)}`;
            default:
                return `${operation.operation} ${this.pathToReadable(operation.path)}`;
        }
    }
    pathToReadable(path) {
        const parts = path.split('/').filter(p => p);
        if (parts.length === 0)
            return 'root';
        if (parts[0] === 'nodes')
            return parts.length > 1 ? `node ${parts[1]}` : 'nodes';
        if (parts[0] === 'connections')
            return 'connections';
        if (parts[0] === 'name')
            return 'workflow name';
        if (parts[0] === 'active')
            return 'activation status';
        return parts.join(' > ');
    }
    getMetadata() {
        return {
            category: 'version-control',
            isMutating: false,
            requirements: ['n8n API access'],
            tags: ['version-control', 'workflow', 'diff', 'compare', 'visualization'],
        };
    }
}
//# sourceMappingURL=CompareVersionsTool.js.map