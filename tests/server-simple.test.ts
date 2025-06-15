import { describe, it, expect } from 'vitest';
import { N8nMcpServer } from '../src/server/N8nMcpServer.js';

describe('N8nMcpServer Simple', () => {
  it('should create server instance', () => {
    const server = new N8nMcpServer();
    expect(server).toBeDefined();
  });

  it('should have required methods', () => {
    const server = new N8nMcpServer();
    expect(typeof server.connect).toBe('function');
    expect(typeof server.close).toBe('function');
  });
});