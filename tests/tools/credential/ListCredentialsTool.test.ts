import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ListCredentialsTool } from '../../../src/tools/credential/ListCredentialsTool.js';
import { IToolContext } from '../../../src/tools/base/Tool.js';
import { N8nApiClient } from '../../../src/services/N8nApiClient.js';

describe('ListCredentialsTool', () => {
  let tool: ListCredentialsTool;
  let mockApiClient: Partial<N8nApiClient>;
  let context: IToolContext;

  const mockCredentials = {
    data: [
      {
        id: 'cred1',
        name: 'Google Sheets API',
        type: 'googleSheetsApi',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z',
        nodesAccess: [{ nodeType: 'n8n-nodes-base.googleSheets' }],
        tags: ['production', 'google'],
        data: { clientId: 'hidden', clientSecret: 'hidden' },
      },
      {
        id: 'cred2',
        name: 'Slack OAuth',
        type: 'slackOAuth2Api',
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-14T00:00:00Z',
        nodesAccess: [{ nodeType: 'n8n-nodes-base.slack' }],
        tags: ['production'],
        data: { accessToken: 'hidden' },
      },
      {
        id: 'cred3',
        name: 'HTTP Basic Auth',
        type: 'httpBasicAuth',
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-13T00:00:00Z',
        nodesAccess: [{ nodeType: 'n8n-nodes-base.httpRequest' }],
        tags: ['test'],
        data: { username: 'user', password: 'hidden' },
      },
      {
        id: 'cred4',
        name: 'Google Drive API',
        type: 'googleDriveOAuth2Api',
        createdAt: '2024-01-04T00:00:00Z',
        updatedAt: '2024-01-12T00:00:00Z',
        nodesAccess: [{ nodeType: 'n8n-nodes-base.googleDrive' }],
        // No tags array - testing undefined tags
      },
    ],
  };

  beforeEach(() => {
    tool = new ListCredentialsTool();
    
    // Mock API client
    mockApiClient = {
      request: vi.fn().mockResolvedValue(mockCredentials),
    };

    context = {
      apiClient: mockApiClient as N8nApiClient,
      metadata: {},
    };
  });

  describe('Basic Properties', () => {
    it('should have correct name and description', () => {
      expect(tool.name).toBe('credential_list');
      expect(tool.description).toBe('List all credentials with filtering options');
    });

    it('should have correct metadata', () => {
      const metadata = tool.getMetadata();
      expect(metadata.category).toBe('credential');
      expect(metadata.isMutating).toBe(false);
      expect(metadata.tags).toContain('credential');
      expect(metadata.tags).toContain('security');
      expect(metadata.requirements).toContain('n8n API access');
    });
  });

  describe('Input Validation', () => {
    it('should accept empty input', async () => {
      const result = await tool.execute({}, context);
      
      expect(mockApiClient.request).toHaveBeenCalledWith(
        'GET',
        '/credentials',
        {
          params: {
            includeData: false,
          }
        }
      );
      
      const response = JSON.parse(result.content[0].text);
      expect(response.total).toBe(4);
    });

    it('should accept all valid parameters', async () => {
      const input = {
        type: 'googleSheetsApi',
        search: 'Google',
        tags: ['production'],
        includeData: true,
      };

      await tool.execute(input, context);
      
      expect(mockApiClient.request).toHaveBeenCalledWith(
        'GET',
        '/credentials',
        {
          params: {
            includeData: true,
          }
        }
      );
    });
  });

  describe('Credential Listing', () => {
    it('should list all credentials without sensitive data by default', async () => {
      const result = await tool.execute({}, context);
      const response = JSON.parse(result.content[0].text);

      expect(response.total).toBe(4);
      expect(response.credentials).toHaveLength(4);
      
      // Check first credential
      const firstCred = response.credentials[0];
      expect(firstCred.id).toBe('cred1');
      expect(firstCred.name).toBe('Google Sheets API');
      expect(firstCred.type).toBe('googleSheetsApi');
      expect(firstCred.tags).toEqual(['production', 'google']);
      expect(firstCred.data).toBeUndefined(); // No sensitive data
    });

    it('should include sensitive data when requested', async () => {
      const input = {
        includeData: true,
      };

      const result = await tool.execute(input, context);
      const response = JSON.parse(result.content[0].text);

      expect(response.credentials[0].data).toEqual({
        clientId: 'hidden',
        clientSecret: 'hidden',
      });
    });

    it('should filter by credential type', async () => {
      const input = {
        type: 'slackOAuth2Api',
      };

      const result = await tool.execute(input, context);
      const response = JSON.parse(result.content[0].text);

      expect(response.total).toBe(1);
      expect(response.credentials[0].name).toBe('Slack OAuth');
    });

    it('should search by name (case-insensitive)', async () => {
      const input = {
        search: 'google',
      };

      const result = await tool.execute(input, context);
      const response = JSON.parse(result.content[0].text);

      expect(response.total).toBe(2);
      expect(response.credentials.map((c: any) => c.name)).toEqual([
        'Google Sheets API',
        'Google Drive API',
      ]);
    });

    it('should filter by tags', async () => {
      const input = {
        tags: ['production'],
      };

      const result = await tool.execute(input, context);
      const response = JSON.parse(result.content[0].text);

      expect(response.total).toBe(2);
      expect(response.credentials.map((c: any) => c.id)).toEqual(['cred1', 'cred2']);
    });

    it('should handle multiple filters', async () => {
      const input = {
        search: 'Google',
        tags: ['production'],
      };

      const result = await tool.execute(input, context);
      const response = JSON.parse(result.content[0].text);

      expect(response.total).toBe(1);
      expect(response.credentials[0].name).toBe('Google Sheets API');
    });

    it('should group credentials by type', async () => {
      const result = await tool.execute({}, context);
      const response = JSON.parse(result.content[0].text);

      expect(response.byType).toHaveProperty('googleSheetsApi');
      expect(response.byType).toHaveProperty('slackOAuth2Api');
      expect(response.byType).toHaveProperty('httpBasicAuth');
      expect(response.byType).toHaveProperty('googleDriveOAuth2Api');
      
      expect(response.byType.googleSheetsApi).toHaveLength(1);
      expect(response.types).toContain('googleSheetsApi');
    });

    it('should handle credentials without tags', async () => {
      const input = {
        tags: ['google'],
      };

      const result = await tool.execute(input, context);
      const response = JSON.parse(result.content[0].text);

      // cred1 has 'google' tag, cred4 has no tags array so should not match
      expect(response.total).toBe(1);
      expect(response.credentials[0].id).toBe('cred1');
    });

    it('should handle empty response', async () => {
      mockApiClient.request = vi.fn().mockResolvedValue({ data: [] });

      const result = await tool.execute({}, context);
      const response = JSON.parse(result.content[0].text);

      expect(response.total).toBe(0);
      expect(response.credentials).toEqual([]);
      expect(response.byType).toEqual({});
      expect(response.types).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing API client', async () => {
      await expect(
        tool.execute({}, { apiClient: undefined })
      ).rejects.toThrow('n8n API client not configured');
    });

    it('should handle API errors with descriptive message', async () => {
      mockApiClient.request = vi.fn().mockRejectedValue(
        new Error('403: Forbidden')
      );

      await expect(
        tool.execute({}, context)
      ).rejects.toThrow('Failed to list credentials: 403: Forbidden');
    });

    it('should handle network errors', async () => {
      mockApiClient.request = vi.fn().mockRejectedValue(
        new Error('Network timeout')
      );

      await expect(
        tool.execute({}, context)
      ).rejects.toThrow('Failed to list credentials: Network timeout');
    });

    it('should handle non-Error exceptions', async () => {
      mockApiClient.request = vi.fn().mockRejectedValue('String error');

      await expect(
        tool.execute({}, context)
      ).rejects.toThrow('Failed to list credentials: Unknown error occurred');
    });

    it('should handle missing data in response', async () => {
      mockApiClient.request = vi.fn().mockResolvedValue({
        // No data property
      });

      const result = await tool.execute({}, context);
      const response = JSON.parse(result.content[0].text);

      expect(response.total).toBe(0);
      expect(response.credentials).toEqual([]);
    });
  });

  describe('Response Format', () => {
    it('should return valid JSON with proper formatting', async () => {
      const result = await tool.execute({}, context);
      
      // Should be valid JSON
      expect(() => JSON.parse(result.content[0].text)).not.toThrow();
      expect(result.content[0].mimeType).toBe('application/json');
      
      // Should be properly formatted
      expect(result.content[0].text).toContain('\n  ');
    });

    it('should handle complex filtering scenarios', async () => {
      // No results scenario
      const input = {
        type: 'nonExistentType',
      };

      const result = await tool.execute(input, context);
      const response = JSON.parse(result.content[0].text);

      expect(response.total).toBe(0);
      expect(response.credentials).toEqual([]);
      expect(response.byType).toEqual({});
    });
  });
});