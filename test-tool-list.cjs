// Test script to debug tool listing
const { spawn } = require('child_process');

console.log('=== Testing Tool List for @drballs/n8n-mcp-server v0.1.4 ===\n');

// Test with npx
const child = spawn('npx', ['@drballs/n8n-mcp-server@0.1.4'], {
    env: {
        ...process.env,
        N8N_API_KEY: 'test-key',
        N8N_BASE_URL: 'https://test.com'
    },
    stdio: ['pipe', 'pipe', 'pipe']
});

// Send list tools request
const listToolsRequest = JSON.stringify({
    jsonrpc: '2.0',
    method: 'tools/list',
    id: 1
}) + '\n';

setTimeout(() => {
    console.log('Sending list tools request...');
    child.stdin.write(listToolsRequest);
}, 1000);

let response = '';

child.stdout.on('data', (data) => {
    response += data.toString();
    const lines = response.split('\n');
    
    for (const line of lines) {
        if (line.trim()) {
            try {
                const parsed = JSON.parse(line);
                if (parsed.id === 1) {
                    console.log('\nReceived response:');
                    console.log(JSON.stringify(parsed, null, 2));
                    
                    if (parsed.result && parsed.result.tools) {
                        console.log(`\nTotal tools: ${parsed.result.tools.length}`);
                        console.log('\nTool names:');
                        parsed.result.tools.forEach(tool => {
                            console.log(`- ${tool.name}`);
                        });
                    }
                }
            } catch (e) {
                // Not JSON, ignore
            }
        }
    }
});

child.stderr.on('data', (data) => {
    console.error('STDERR:', data.toString());
});

setTimeout(() => {
    child.kill();
    process.exit(0);
}, 5000);

child.on('error', (err) => {
    console.error('Failed to start:', err);
    process.exit(1);
});