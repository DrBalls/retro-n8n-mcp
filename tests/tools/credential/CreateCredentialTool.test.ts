import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateCredentialTool } from '../../../src/tools/credential/CreateCredentialTool.js';
import { IToolContext } from '../../../src/tools/base/Tool.js';

describe('CreateCredentialTool', () => {
  let tool: CreateCredentialTool;
  let mockContext: IToolContext;
  let mockApiClient: any;

  beforeEach(() => {
    tool = new CreateCredentialTool();
    mockApiClient = {
      request: vi.fn()
    };
    mockContext = {
      apiClient: mockApiClient
    };
  });

  it('should have correct metadata', () => {
    expect(tool.name).toBe('credential_create');
    expect(tool.description).toBe('Create a new credential in n8n with encryption and validation');
    
    const metadata = tool.getMetadata();
    expect(metadata.category).toBe('credential');
    expect(metadata.isMutating).toBe(true);
    expect(metadata.requirements).toContain('n8n API access');
  });

  it('should validate required inputs', () => {
    const invalidInputs = [
      {},
      { name: 'test' },
      { type: 'httpBasicAuth' },
      { name: '', type: 'httpBasicAuth', data: {} }
    ];

    for (const input of invalidInputs) {
      expect(() => tool.validateInput(input)).toThrow();
    }
  });

  it('should create credential successfully', async () => {
    const input = {
      name: 'Test API Key',
      type: 'httpBasicAuth',
      data: {
        user: 'testuser',
        password: 'testpass'
      }
    };

    const mockCredentialTypes = {
      data: [
        { name: 'httpBasicAuth' },
        { name: 'apiKey' }
      ]
    };

    const mockResponse = {
      data: {
        id: 'cred_123',
        name: 'Test API Key',
        type: 'httpBasicAuth',
        createdAt: '2024-01-14T10:00:00Z',
        updatedAt: '2024-01-14T10:00:00Z',
        nodesAccess: [{ nodeType: '*', date: '2024-01-14T10:00:00Z' }]
      }
    };

    mockApiClient.request
      .mockResolvedValueOnce(mockCredentialTypes)
      .mockResolvedValueOnce(mockResponse);

    const result = await tool.execute(input, mockContext);
    
    expect(mockApiClient.request).toHaveBeenCalledTimes(2);
    expect(mockApiClient.request).toHaveBeenCalledWith('GET', '/credential-types');
    expect(mockApiClient.request).toHaveBeenCalledWith('POST', '/credentials', {
      data: {
        name: input.name,
        type: input.type,
        data: input.data,
        nodesAccess: [{ nodeType: '*', date: expect.any(String) }]
      }
    });

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe('text');
    expect(result.content[0].mimeType).toBe('application/json');
    
    const responseData = JSON.parse(result.content[0].text);
    expect(responseData.id).toBe('cred_123');
    expect(responseData.message).toContain('created successfully');
  });

  it('should handle invalid credential type', async () => {
    const input = {
      name: 'Test Credential',
      type: 'invalidType',
      data: {}
    };

    const mockCredentialTypes = {
      data: [
        { name: 'httpBasicAuth' },
        { name: 'apiKey' }
      ]
    };

    mockApiClient.request.mockResolvedValueOnce(mockCredentialTypes);

    await expect(tool.execute(input, mockContext)).rejects.toThrow('Invalid credential type');
  });

  it('should throw error when API client is not configured', async () => {
    const input = {
      name: 'Test Credential',
      type: 'httpBasicAuth',
      data: {}
    };

    await expect(tool.execute(input, {})).rejects.toThrow('n8n API client not configured');
  });
});