import { z } from 'zod';
import { BaseTool } from '../base/Tool.js';
/**
 * Input schema for test connection
 */
const TestConnectionSchema = z.object({}).describe('No parameters required');
/**
 * Tool for testing connection to n8n instance
 */
export class TestConnectionTool extends BaseTool {
    name = 'test_connection';
    description = 'Test connection to the configured n8n instance';
    inputSchema = TestConnectionSchema;
    async execute(params, context) {
        try {
            // Validate input (empty object expected)
            this.validateInput(params);
            // Check if API client is available
            if (!context.apiClient) {
                return this.createTextResponse(JSON.stringify({
                    connected: false,
                    error: 'n8n API client not configured. Please set N8N_API_URL and N8N_API_KEY environment variables.',
                    timestamp: new Date().toISOString(),
                }, null, 2), { connected: false });
            }
            const apiClient = context.apiClient;
            // Test connection
            const startTime = Date.now();
            const result = await apiClient.testConnection();
            const responseTime = Date.now() - startTime;
            // Get additional info if connected
            let additionalInfo = {};
            if (result.connected) {
                try {
                    // Try to get some basic stats
                    await apiClient.getWorkflows({ limit: 1 });
                    additionalInfo = {
                        sampleRequest: {
                            success: true,
                            responseTime: `${responseTime}ms`,
                        },
                    };
                }
                catch (error) {
                    // Non-critical error
                    additionalInfo = {
                        sampleRequest: {
                            success: false,
                            error: error instanceof Error ? error.message : 'Unknown error',
                        },
                    };
                }
            }
            // Create response
            return this.createTextResponse(JSON.stringify({
                connected: result.connected,
                ...(result.version && { version: result.version }),
                timestamp: new Date().toISOString(),
                responseTime: `${responseTime}ms`,
                ...additionalInfo,
                ...(result.connected && {
                    message: 'Successfully connected to n8n instance',
                }),
                ...(!result.connected && {
                    message: 'Failed to connect to n8n instance. Please check your configuration.',
                }),
            }, null, 2), {
                connected: result.connected,
                responseTime,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return this.createTextResponse(JSON.stringify({
                connected: false,
                error: errorMessage,
                timestamp: new Date().toISOString(),
                message: `Connection test failed: ${errorMessage}`,
            }, null, 2), { connected: false });
        }
    }
    isAvailable() {
        // This tool is always available to attempt
        return true;
    }
    getMetadata() {
        return {
            category: 'system',
            tags: ['test', 'connection', 'diagnostic'],
            version: '1.0.0',
            isMutating: false,
            requirements: [],
        };
    }
}
//# sourceMappingURL=TestConnectionTool.js.map