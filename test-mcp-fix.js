// Test script to verify MCP protocol compliance
const { spawn } = require('child_process');

console.log('=== Testing @drballs/n8n-mcp-server v0.1.4 ===\n');

// Test with npx
const child = spawn('npx', ['@drballs/n8n-mcp-server@0.1.4'], {
    env: {
        ...process.env,
        N8N_API_KEY: 'test-key',
        N8N_BASE_URL: 'https://test.com'
    },
    stdio: ['pipe', 'pipe', 'pipe']
});

let stdoutClean = true;
let stderrHasLogs = false;

child.stdout.on('data', (data) => {
    const text = data.toString();
    console.log('STDOUT:', text.substring(0, 100));
    
    // Check if it's a log message
    if (text.includes('[INFO]') || text.includes('[ERROR]') || text.includes('[WARN]')) {
        stdoutClean = false;
        console.log('❌ PROBLEM: Log message found in stdout!');
    }
    
    // Check if it's valid JSON-RPC
    try {
        const lines = text.trim().split('\n');
        for (const line of lines) {
            if (line.trim()) {
                JSON.parse(line);
                console.log('✅ Valid JSON-RPC in stdout');
            }
        }
    } catch (e) {
        console.log('⚠️  Non-JSON in stdout:', e.message);
    }
});

child.stderr.on('data', (data) => {
    const text = data.toString();
    console.log('STDERR:', text.substring(0, 100));
    
    if (text.includes('[INFO]') || text.includes('[ERROR]') || text.includes('[WARN]')) {
        stderrHasLogs = true;
        console.log('✅ Log messages correctly sent to stderr');
    }
});

setTimeout(() => {
    console.log('\n=== Test Results ===');
    console.log('Stdout clean:', stdoutClean ? '✅ YES' : '❌ NO');
    console.log('Logs in stderr:', stderrHasLogs ? '✅ YES' : '❌ NO');
    console.log('\nMCP Protocol Compliance:', stdoutClean ? '✅ PASSED' : '❌ FAILED');
    
    child.kill();
    process.exit(stdoutClean ? 0 : 1);
}, 3000);

child.on('error', (err) => {
    console.error('Failed to start:', err);
    process.exit(1);
});