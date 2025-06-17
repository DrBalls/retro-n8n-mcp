#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== Debugging Tool Registration Issue ===\n');

// Create a test script that will run the server
const testScript = `
import { N8nMcpServer } from '@drballs/n8n-mcp-server/dist/server/N8nMcpServer.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

async function test() {
    console.error('[DEBUG] Starting server initialization...');
    
    const config = {
        baseUrl: 'https://test.com',
        apiKey: 'test-key'
    };
    
    console.error('[DEBUG] Creating server with config:', config);
    const server = new N8nMcpServer(config);
    
    console.error('[DEBUG] Server created, checking tool registry...');
    
    // Wait a bit for async tool registration
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Try to access the tool registry
    if (server.toolRegistry) {
        const tools = server.toolRegistry.getAll();
        console.error('[DEBUG] Tools registered:', tools.length);
        tools.forEach(tool => {
            console.error('[DEBUG] - Tool:', tool.name);
        });
    } else {
        console.error('[DEBUG] No toolRegistry found on server');
    }
    
    // Now connect to transport
    console.error('[DEBUG] Connecting to transport...');
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    console.error('[DEBUG] Server connected');
}

test().catch(err => {
    console.error('[DEBUG] Error:', err);
    process.exit(1);
});
`;

// Write test script
fs.writeFileSync('/tmp/test-tool-registration.mjs', testScript);

// Install package if needed
console.log('1. Installing package...');
try {
    require.resolve('@drballs/n8n-mcp-server');
} catch {
    const { execSync } = require('child_process');
    execSync('npm install @drballs/n8n-mcp-server@0.1.5', { cwd: '/tmp', stdio: 'inherit' });
}

console.log('\n2. Running debug test...\n');

// Run the test
const child = spawn('node', ['/tmp/test-tool-registration.mjs'], {
    cwd: '/tmp',
    env: {
        ...process.env,
        NODE_PATH: '/tmp/node_modules'
    },
    stdio: ['pipe', 'pipe', 'pipe']
});

child.stdout.on('data', (data) => {
    console.log('STDOUT:', data.toString());
});

child.stderr.on('data', (data) => {
    console.log('STDERR:', data.toString());
});

child.on('error', (err) => {
    console.error('Failed to start:', err);
});

child.on('exit', (code) => {
    console.log('\nProcess exited with code:', code);
    
    // Now test with the actual executable
    console.log('\n3. Testing with actual executable...\n');
    
    const execPath = '/tmp/node_modules/.bin/n8n-mcp-server';
    const child2 = spawn(execPath, [], {
        env: {
            ...process.env,
            N8N_API_KEY: 'test-key',
            N8N_BASE_URL: 'https://test.com'
        },
        stdio: ['pipe', 'pipe', 'pipe']
    });
    
    setTimeout(() => {
        const request = JSON.stringify({
            jsonrpc: '2.0',
            method: 'tools/list',
            id: 1
        }) + '\n';
        
        console.log('Sending tools/list request...');
        child2.stdin.write(request);
    }, 1000);
    
    let response = '';
    
    child2.stdout.on('data', (data) => {
        response += data.toString();
        const lines = response.split('\n');
        
        for (const line of lines) {
            if (line.trim()) {
                try {
                    const parsed = JSON.parse(line);
                    console.log('Response:', JSON.stringify(parsed, null, 2));
                } catch (e) {
                    // Not JSON
                }
            }
        }
    });
    
    child2.stderr.on('data', (data) => {
        console.log('Server log:', data.toString());
    });
    
    setTimeout(() => {
        child2.kill();
        process.exit(0);
    }, 3000);
});