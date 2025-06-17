import { z } from 'zod';
import { BaseTool } from '../base/Tool.js';
import { BatchOperationManager } from '../../services/BatchOperationManager.js';
export class BatchWorkflowsCreateTool extends BaseTool {
    name = 'batch_workflows_create';
    description = 'Create multiple workflows in a single batch operation with atomic transaction support';
    inputSchema = z.object({
        workflows: z.array(z.object({
            name: z.string().min(1).describe('Name of the workflow'),
            nodes: z.array(z.any()).describe('Array of node definitions'),
            connections: z.record(z.any()).describe('Connection definitions between nodes'),
            settings: z.record(z.any()).optional().describe('Workflow settings'),
            staticData: z.record(z.any()).optional().describe('Static data for the workflow'),
            tags: z.array(z.string()).optional().describe('Tags to assign to the workflow'),
            active: z.boolean().default(false).describe('Whether to activate the workflow immediately'),
        })).min(1).max(100).describe('Array of workflows to create (max 100)'),
        options: z.object({
            stopOnError: z.boolean().default(false).describe('Stop processing on first error'),
            atomic: z.boolean().default(true).describe('Use atomic transaction (all succeed or all fail)'),
            concurrency: z.number().min(1).max(10).default(5).describe('Number of concurrent operations'),
            validateWorkflows: z.boolean().default(true).describe('Validate workflow structure before creation'),
        }).optional().describe('Batch operation options'),
    });
    async execute(params, context) {
        const input = this.validateInput(params);
        if (!context.apiClient) {
            throw new Error('n8n API client not configured');
        }
        // Initialize batch operation manager
        const batchManager = new BatchOperationManager(context.apiClient);
        // Prepare workflow data
        const workflowsToCreate = input.workflows.map(workflow => ({
            name: workflow.name,
            nodes: workflow.nodes,
            connections: workflow.connections,
            settings: workflow.settings || {},
            staticData: workflow.staticData || {},
            tags: workflow.tags,
            active: workflow.active,
        }));
        // Prepare options
        const batchOptions = {
            stopOnError: input.options?.stopOnError ?? false,
            atomic: input.options?.atomic ?? true,
            concurrency: input.options?.concurrency ?? 5,
            maxRetries: 2,
            retryDelay: 1000,
        };
        // Add validation if requested
        if (input.options?.validateWorkflows) {
            batchOptions.validateItem = async (item) => {
                // Basic validation
                if (!item.name || item.name.trim().length === 0) {
                    throw new Error('Workflow name is required');
                }
                if (!Array.isArray(item.nodes) || item.nodes.length === 0) {
                    throw new Error('Workflow must have at least one node');
                }
                // Validate node structure
                for (const node of item.nodes) {
                    if (!node.name || !node.type || !node.typeVersion || !node.position) {
                        throw new Error(`Invalid node structure: ${JSON.stringify(node)}`);
                    }
                }
                return true;
            };
        }
        // Track progress
        const progressUpdates = [];
        batchOptions.onProgress = (progress) => {
            progressUpdates.push({
                timestamp: new Date().toISOString(),
                ...progress,
            });
        };
        try {
            // Start batch operation
            const operationId = await batchManager.createBatchOperation('create', workflowsToCreate, batchOptions);
            // Wait for completion with timeout
            const timeout = 300000; // 5 minutes
            const startTime = Date.now();
            let finalStatus;
            while (Date.now() - startTime < timeout) {
                const status = batchManager.getOperationStatus(operationId);
                if (!status) {
                    throw new Error('Operation status not found');
                }
                if (status.status === 'completed' ||
                    status.status === 'failed' ||
                    status.status === 'partially_completed' ||
                    status.status === 'rolled_back') {
                    finalStatus = status;
                    break;
                }
                // Wait before checking again
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            if (!finalStatus) {
                throw new Error('Operation timed out');
            }
            // Prepare response
            const response = {
                operationId,
                status: finalStatus.status,
                summary: {
                    total: finalStatus.totalItems,
                    successful: finalStatus.successfulItems,
                    failed: finalStatus.failedItems,
                    duration: finalStatus.endTime
                        ? finalStatus.endTime.getTime() - finalStatus.startTime.getTime()
                        : Date.now() - finalStatus.startTime.getTime(),
                },
                results: {
                    created: [],
                    failed: [],
                },
                progressHistory: progressUpdates,
            };
            // Collect results
            for (const item of finalStatus.items) {
                if (item.status === 'success' && item.result) {
                    response.results.created.push({
                        workflowId: item.result.id,
                        name: item.result.name,
                        active: item.result.active,
                        createdAt: item.result.createdAt,
                        updatedAt: item.result.updatedAt,
                    });
                }
                else if (item.status === 'failed') {
                    response.results.failed.push({
                        name: item.data.name,
                        error: item.error || 'Unknown error',
                        retryCount: item.retryCount || 0,
                    });
                }
            }
            // Add rollback information if atomic operation failed
            if (batchOptions.atomic && finalStatus.status === 'rolled_back') {
                response.rollback = {
                    reason: 'Atomic operation failed, all changes rolled back',
                    rolledBackCount: response.results.created.filter((w) => finalStatus.items.find((i) => i.result?.id === w.workflowId && i.status === 'rolled_back')).length,
                };
            }
            // Add warnings if any
            const warnings = [];
            if (finalStatus.status === 'partially_completed') {
                warnings.push(`${finalStatus.failedItems} workflows failed to create`);
            }
            if (response.results.failed.some((f) => f.retryCount > 0)) {
                warnings.push('Some operations required retries');
            }
            if (warnings.length > 0) {
                response.warnings = warnings;
            }
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify(response, null, 2),
                        mimeType: 'application/json',
                    }],
            };
        }
        catch (error) {
            console.error('Batch workflow creation failed', { error });
            // Try to get operation status for error details
            let operationError = 'Batch operation failed';
            if (error instanceof Error) {
                operationError = error.message;
            }
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify({
                            error: operationError,
                            status: 'failed',
                            details: error instanceof Error ? error.stack : undefined,
                        }, null, 2),
                        mimeType: 'application/json',
                    }],
            };
        }
    }
    getMetadata() {
        return {
            category: 'workflow',
            isMutating: true,
            requirements: ['n8n API access'],
            tags: ['batch', 'create', 'workflows', 'atomic', 'transaction'],
        };
    }
}
//# sourceMappingURL=BatchWorkflowsCreateTool.js.map