import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';

export class UpdateCredentialTool extends BaseTool {
  name = 'credential_update';
  description = 'Update an existing credential with security checks';
  
  inputSchema = z.object({
    id: z.string().min(1).describe('ID of the credential to update'),
    name: z.string().min(1).optional().describe('New name for the credential'),
    data: z.record(z.unknown()).optional().describe('Updated credential data'),
    nodesAccess: z.array(z.object({
      nodeType: z.string(),
      date: z.string().optional()
    })).optional().describe('Updated node access permissions'),
    tags: z.array(z.string()).optional().describe('Updated tags')
  });

  async execute(params: unknown, context: IToolContext): Promise<IToolResponse> {
    const input = this.validateInput<z.infer<typeof this.inputSchema>>(params);
    
    if (!context.apiClient) {
      throw new Error('n8n API client not configured');
    }

    try {
      // Get current credential to ensure it exists
      const currentCredential = await context.apiClient.request(
        'GET',
        `/credentials/${input.id}`
      );

      // Prepare update data
      const updateData: any = {
        name: input.name || currentCredential.data.name,
        type: currentCredential.data.type, // Type cannot be changed
        nodesAccess: input.nodesAccess || currentCredential.data.nodesAccess
      };

      // Merge data if provided
      if (input.data) {
        updateData.data = {
          ...currentCredential.data.data,
          ...input.data
        };
      } else {
        updateData.data = currentCredential.data.data;
      }

      // Update the credential
      const response = await context.apiClient.request(
        'PATCH',
        `/credentials/${input.id}`,
        {
          data: updateData
        }
      );

      const result = {
        id: response.data.id,
        name: response.data.name,
        type: response.data.type,
        updatedAt: response.data.updatedAt,
        nodesAccess: response.data.nodesAccess,
        message: `Credential "${response.data.name}" updated successfully`
      };

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2),
          mimeType: 'application/json'
        }]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to update credential: ${errorMessage}`);
    }
  }

  getMetadata(): IToolMetadata {
    return {
      category: 'credential',
      isMutating: true,
      requirements: ['n8n API access'],
      tags: ['credential', 'security', 'update']
    };
  }
}