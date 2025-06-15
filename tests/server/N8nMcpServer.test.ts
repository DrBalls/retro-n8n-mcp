import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { N8nMcpServer } from '../../src/server/N8nMcpServer.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

describe('N8nMcpServer', () => {
  let server: N8nMcpServer;
  let client: Client;
  let clientTransport: InMemoryTransport;
  let serverTransport: InMemoryTransport;

  beforeEach(async () => {
    // Create server
    server = new N8nMcpServer();

    // Create in-memory transport pair
    [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    // Connect server
    await server.connect(serverTransport);

    // Create and connect client
    client = new Client(
      {
        name: 'test-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      },
    );
    await client.connect(clientTransport);
  });

  afterEach(async () => {
    // Clean up connections
    await client.close();
    await server.close();
  });

  it('should list available tools', async () => {
    const response = await client.listTools();
    
    expect(response.tools).toBeDefined();
    expect(response.tools.length).toBeGreaterThan(0);
    
    const toolNames = response.tools.map(tool => tool.name);
    expect(toolNames).toContain('test_connection');
    expect(toolNames).toContain('workflow_list');
  });

  it('should handle test_connection tool', async () => {
    const result = await client.callTool('test_connection', {});
    
    expect(result.content).toBeDefined();
    expect(result.content.length).toBeGreaterThan(0);
    expect(result.content[0]).toHaveProperty('type', 'text');
    expect(result.content[0]).toHaveProperty('text');
    expect(result.content[0].text).toContain('successful');
  });

  it('should handle workflow_list tool', async () => {
    const result = await client.callTool('workflow_list', {
      limit: 5,
    });
    
    expect(result.content).toBeDefined();
    expect(result.content.length).toBeGreaterThan(0);
    expect(result.content[0]).toHaveProperty('type', 'text');
    
    const workflows = JSON.parse(result.content[0].text);
    expect(Array.isArray(workflows)).toBe(true);
    expect(workflows.length).toBeLessThanOrEqual(5);
  });

  it('should filter workflows by active status', async () => {
    const result = await client.callTool('workflow_list', {
      active: true,
    });
    
    const workflows = JSON.parse(result.content[0].text);
    expect(workflows.every((w: any) => w.active === true)).toBe(true);
  });

  it('should handle unknown tool error', async () => {
    await expect(
      client.callTool('unknown_tool', {})
    ).rejects.toThrow('Unknown tool');
  });
});