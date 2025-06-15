import { z } from 'zod';
import { BaseTool } from '../base/Tool.js';
/**
 * Input schema for server health check
 */
const ServerHealthSchema = z.object({
    includeStats: z.boolean().default(true).describe('Include detailed statistics'),
});
/**
 * Tool for checking MCP server health
 */
export class ServerHealthTool extends BaseTool {
    name = 'server_health';
    description = 'Get the health status and statistics of the MCP server';
    inputSchema = ServerHealthSchema;
    async execute(params, context) {
        try {
            // Validate input
            const input = this.validateInput(params);
            // Get server stats from metadata
            const serverStats = context.metadata?.['serverStats'];
            const uptime = context.metadata?.['uptime'] || 0;
            const version = context.metadata?.['version'] || '0.1.0';
            // Base health info
            const health = {
                status: 'healthy',
                version,
                uptime: Math.floor(uptime / 1000), // Convert to seconds
                timestamp: new Date().toISOString(),
            };
            // Add stats if requested
            if (input.includeStats && serverStats) {
                health.stats = {
                    totalRequests: serverStats.totalRequests || 0,
                    totalErrors: serverStats.totalErrors || 0,
                    errorRate: serverStats.errorRate || 0,
                };
            }
            // Check API client status
            if (context.apiClient) {
                const apiClient = context.apiClient;
                try {
                    const connectionTest = await apiClient.testConnection();
                    health.n8nConnection = {
                        connected: connectionTest.connected,
                        version: connectionTest.version,
                    };
                    // Add cache and queue stats if available
                    if (input.includeStats) {
                        health.apiClient = {
                            cache: apiClient.getCacheStats(),
                            queue: apiClient.getQueueStats(),
                        };
                    }
                }
                catch (error) {
                    health.n8nConnection = {
                        connected: false,
                        error: error instanceof Error ? error.message : 'Unknown error',
                    };
                }
            }
            else {
                health.n8nConnection = {
                    connected: false,
                    error: 'API client not configured',
                };
            }
            // System info
            health.system = {
                nodeVersion: process.version,
                platform: process.platform,
                memory: {
                    used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                    total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                    unit: 'MB',
                },
            };
            return this.createTextResponse(JSON.stringify(health, null, 2), {
                status: health.status,
                uptime: health.uptime,
            });
        }
        catch (error) {
            return this.createErrorResponse(error);
        }
    }
    isAvailable() {
        // This tool is always available
        return true;
    }
    getMetadata() {
        return {
            category: 'system',
            tags: ['health', 'status', 'monitoring'],
            version: '1.0.0',
            isMutating: false,
            requirements: [],
        };
    }
}
//# sourceMappingURL=ServerHealthTool.js.map