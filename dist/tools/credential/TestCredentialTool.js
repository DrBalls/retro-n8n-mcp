import { z } from 'zod';
import { BaseTool } from '../base/Tool.js';
export class TestCredentialTool extends BaseTool {
    name = 'credential_test';
    description = 'Test a credential to verify it works correctly';
    inputSchema = z.object({
        id: z.string().min(1).describe('ID of the credential to test'),
        nodeToTestWith: z.string().optional().describe('Specific node type to test with')
    });
    async execute(params, context) {
        const input = this.validateInput(params);
        if (!context.apiClient) {
            throw new Error('n8n API client not configured');
        }
        try {
            // Get credential details
            const credential = await context.apiClient.request('GET', `/credentials/${input.id}`);
            // Test the credential
            const testResponse = await context.apiClient.request('POST', `/credentials/${input.id}/test`, {
                data: {
                    nodeToTestWith: input.nodeToTestWith || null
                }
            });
            const result = {
                id: input.id,
                name: credential.data.name,
                type: credential.data.type,
                testResult: testResponse.data,
                testedAt: new Date().toISOString(),
                status: testResponse.data.status || 'unknown',
                message: testResponse.data.message || 'Test completed',
                details: testResponse.data.details || null
            };
            // Enhance message based on status
            if (result.status === 'OK' || result.status === 'success') {
                result.message = `✓ Credential "${credential.data.name}" is working correctly`;
            }
            else if (result.status === 'Error' || result.status === 'failed') {
                result.message = `✗ Credential "${credential.data.name}" test failed: ${result.message}`;
            }
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify(result, null, 2),
                        mimeType: 'application/json'
                    }]
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            // Parse error details if available
            let errorDetails = {};
            if (error instanceof Error && 'response' in error) {
                const response = error.response;
                if (response?.data) {
                    errorDetails = response.data;
                }
            }
            const result = {
                id: input.id,
                status: 'failed',
                message: `Failed to test credential: ${errorMessage}`,
                error: errorMessage,
                details: errorDetails,
                testedAt: new Date().toISOString()
            };
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify(result, null, 2),
                        mimeType: 'application/json'
                    }]
            };
        }
    }
    getMetadata() {
        return {
            category: 'credential',
            isMutating: false,
            requirements: ['n8n API access'],
            tags: ['credential', 'security', 'test', 'validation']
        };
    }
}
//# sourceMappingURL=TestCredentialTool.js.map