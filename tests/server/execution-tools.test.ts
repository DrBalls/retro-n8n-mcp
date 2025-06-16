import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { N8nMcpServer } from '../../src/server/N8nMcpServer.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

describe('N8nMcpServer Execution Tools', () => {
  let server: N8nMcpServer;
  let client: Client;
  let serverTransport: InMemoryTransport;
  let clientTransport: InMemoryTransport;

  beforeEach(async () => {
    // Create server with mock API config
    server = new N8nMcpServer({
      baseUrl: 'https://test.app.n8n.cloud',
      apiKey: 'test-api-key',
    });

    // Create transports
    [serverTransport, clientTransport] = InMemoryTransport.createLinkedPair();

    // Connect server
    await server.connect(serverTransport);

    // Create and connect client
    client = new Client(
      {
        name: 'test-client',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    await client.connect(clientTransport);
  });

  afterEach(async () => {
    await server.close();
    await client.close();
  });

  it('should list all execution tools', async () => {
    const { tools } = await client.listTools();

    // Check that all execution tools are present
    const executionTools = tools.filter(tool => tool.name.includes('execution'));
    
    expect(executionTools).toHaveLength(7); // Including monitor_execution_realtime
    
    const toolNames = executionTools.map(t => t.name);
    expect(toolNames).toContain('trigger_execution');
    expect(toolNames).toContain('get_execution');
    expect(toolNames).toContain('list_executions');
    expect(toolNames).toContain('stop_execution');
    expect(toolNames).toContain('monitor_execution');
    expect(toolNames).toContain('replay_execution');
  });

  it('should have correct descriptions for execution tools', async () => {
    const { tools } = await client.listTools();
    
    const triggerTool = tools.find(t => t.name === 'trigger_execution');
    expect(triggerTool?.description).toBe('Trigger a workflow execution with optional input data');
    
    const getTool = tools.find(t => t.name === 'get_execution');
    expect(getTool?.description).toBe('Get detailed information about a specific workflow execution');
    
    const listTool = tools.find(t => t.name === 'list_executions');
    expect(listTool?.description).toBe('List workflow executions with filtering and pagination options');
    
    const stopTool = tools.find(t => t.name === 'stop_execution');
    expect(stopTool?.description).toBe('Stop a running workflow execution');
    
    const monitorTool = tools.find(t => t.name === 'monitor_execution');
    expect(monitorTool?.description).toBe('Monitor a workflow execution in real-time, providing updates on its progress');
    
    const replayTool = tools.find(t => t.name === 'replay_execution');
    expect(replayTool?.description).toBe('Replay a previous workflow execution with the same or modified input data');
  });

  it('should have input schemas for execution tools', async () => {
    const { tools } = await client.listTools();
    
    const triggerTool = tools.find(t => t.name === 'trigger_execution');
    expect(triggerTool?.inputSchema).toBeDefined();
    expect(triggerTool?.inputSchema?.properties?.workflowId).toBeDefined();
    expect(triggerTool?.inputSchema?.properties?.waitForCompletion).toBeDefined();
    
    const getTool = tools.find(t => t.name === 'get_execution');
    expect(getTool?.inputSchema?.properties?.executionId).toBeDefined();
    expect(getTool?.inputSchema?.properties?.includeData).toBeDefined();
  });
});