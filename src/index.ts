#!/usr/bin/env node
import { N8nMcpServer } from './server/N8nMcpServer.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main(): Promise<void> {
  try {
    // Create server instance
    const server = new N8nMcpServer();

    // Create stdio transport
    const transport = new StdioServerTransport();

    // Connect server to transport
    await server.connect(transport);

    // Handle shutdown gracefully
    process.on('SIGINT', async () => {
      console.error('Shutting down n8n MCP server...');
      await server.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.error('Shutting down n8n MCP server...');
      await server.close();
      process.exit(0);
    });

    console.error('n8n MCP server started successfully');
  } catch (error) {
    console.error('Failed to start n8n MCP server:', error);
    process.exit(1);
  }
}

// Run the server
void main();