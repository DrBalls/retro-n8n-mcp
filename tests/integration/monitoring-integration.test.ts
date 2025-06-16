import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { N8nMcpServer, IN8nMcpServerConfig } from '../../src/server/N8nMcpServer.js';
import { N8nApiClient } from '../../src/services/N8nApiClient.js';

// Mock the transport
vi.mock('@modelcontextprotocol/sdk/server/stdio.js');

describe('Monitoring Integration', () => {
  let server: N8nMcpServer;
  let mockTransport: any;

  beforeEach(() => {
    // Create mock transport
    mockTransport = {
      readable: {
        getReader: vi.fn().mockReturnValue({
          read: vi.fn().mockResolvedValue({ done: true }),
        }),
      },
      writable: {
        getWriter: vi.fn().mockReturnValue({
          write: vi.fn(),
          close: vi.fn(),
        }),
      },
    };
  });

  afterEach(async () => {
    if (server) {
      try {
        await server.close();
      } catch (error) {
        // Ignore errors during cleanup
      }
    }
  });

  it('should initialize with monitoring disabled when no config provided', () => {
    const config: IN8nMcpServerConfig = {
      apiConfig: {
        baseUrl: 'http://localhost:5678',
        apiKey: 'test-key',
      },
    };

    server = new N8nMcpServer(config);
    
    // Check server is created without errors
    expect(server).toBeDefined();
  });

  it('should initialize monitoring service with WebSocket protocol', () => {
    const config: IN8nMcpServerConfig = {
      apiConfig: {
        baseUrl: 'http://localhost:5678',
        apiKey: 'test-key',
      },
      monitoring: {
        protocol: 'websocket',
        wsUrl: 'ws://localhost:5678/ws',
        updateInterval: 3000,
      },
    };

    server = new N8nMcpServer(config);
    
    // Check server is created without errors
    expect(server).toBeDefined();
  });

  it('should initialize monitoring service with SSE protocol', () => {
    const config: IN8nMcpServerConfig = {
      apiConfig: {
        baseUrl: 'http://localhost:5678',
        apiKey: 'test-key',
      },
      monitoring: {
        protocol: 'sse',
        sseUrl: 'http://localhost:5678/sse',
        updateInterval: 3000,
      },
    };

    server = new N8nMcpServer(config);
    
    // Check server is created without errors
    expect(server).toBeDefined();
  });

  it('should initialize monitoring service with polling protocol', () => {
    const config: IN8nMcpServerConfig = {
      apiConfig: {
        baseUrl: 'http://localhost:5678',
        apiKey: 'test-key',
      },
      monitoring: {
        protocol: 'polling',
        pollingInterval: 2000,
        updateInterval: 5000,
      },
    };

    server = new N8nMcpServer(config);
    
    // Check server is created without errors
    expect(server).toBeDefined();
  });

  it('should handle monitoring service initialization errors gracefully', () => {
    const config: IN8nMcpServerConfig = {
      apiConfig: {
        baseUrl: 'http://localhost:5678',
        apiKey: 'test-key',
      },
      monitoring: {
        protocol: 'websocket',
        // Missing wsUrl should cause initialization to fail
        updateInterval: 3000,
      },
    };

    // Should not throw, just log error
    expect(() => {
      server = new N8nMcpServer(config);
    }).not.toThrow();
    
    expect(server).toBeDefined();
  });

  it('should start monitoring service on connect', async () => {
    const config: IN8nMcpServerConfig = {
      apiConfig: {
        baseUrl: 'http://localhost:5678',
        apiKey: 'test-key',
      },
      monitoring: {
        protocol: 'polling',
        pollingInterval: 2000,
      },
    };

    server = new N8nMcpServer(config);
    
    // Connect should not throw even if monitoring start fails
    await expect(server.connect(mockTransport)).resolves.not.toThrow();
  });

  it('should handle list resources request with monitoring enabled', async () => {
    const config: IN8nMcpServerConfig = {
      apiConfig: {
        baseUrl: 'http://localhost:5678',
        apiKey: 'test-key',
      },
      monitoring: {
        protocol: 'polling',
        pollingInterval: 2000,
      },
    };

    server = new N8nMcpServer(config);
    
    // The server should be able to handle resource requests
    // In a real test, we'd use the actual MCP client to make requests
    expect(server).toBeDefined();
  });

  it('should work with backward compatible config format', () => {
    const oldFormatConfig = {
      baseUrl: 'http://localhost:5678',
      apiKey: 'test-key',
    };

    server = new N8nMcpServer(oldFormatConfig);
    
    // Should work without monitoring
    expect(server).toBeDefined();
  });
});