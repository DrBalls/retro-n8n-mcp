import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';
import { N8nApiClient } from '../../services/N8nApiClient.js';

/**
 * Input schema for server health check
 */
const ServerHealthSchema = z.object({
  includeStats: z.boolean().default(true).describe('Include detailed statistics'),
});

type ServerHealthInput = z.infer<typeof ServerHealthSchema>;

/**
 * Tool for checking MCP server health
 */
export class ServerHealthTool extends BaseTool {
  readonly name = 'server_health';
  readonly description = 'Get the health status and statistics of the MCP server';
  readonly inputSchema = ServerHealthSchema;

  async execute(params: unknown, context: IToolContext): Promise<IToolResponse> {
    try {
      // Validate input
      const input = this.validateInput<ServerHealthInput>(params);

      // Get server stats from metadata
      const serverStats = context.metadata?.['serverStats'] as any;
      const uptime = context.metadata?.['uptime'] as number || 0;
      const version = context.metadata?.['version'] as string || '0.1.0';

      // Base health info
      const health: any = {
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
        const apiClient = context.apiClient as N8nApiClient;
        
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
        } catch (error) {
          health.n8nConnection = {
            connected: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      } else {
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

      return this.createTextResponse(
        JSON.stringify(health, null, 2),
        {
          status: health.status,
          uptime: health.uptime,
        }
      );
    } catch (error) {
      return this.createErrorResponse(error as Error);
    }
  }

  isAvailable(): boolean {
    // This tool is always available
    return true;
  }

  getMetadata(): IToolMetadata {
    return {
      category: 'system',
      tags: ['health', 'status', 'monitoring'],
      version: '1.0.0',
      isMutating: false,
      requirements: [],
    };
  }
}