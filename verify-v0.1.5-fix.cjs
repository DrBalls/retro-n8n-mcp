#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== Verifying v0.1.5 Fix ===\n');

// Step 1: Install the package locally
console.log('1. Installing @drballs/n8n-mcp-server@0.1.5 locally...');
try {
    execSync('npm install @drballs/n8n-mcp-server@0.1.5', { 
        cwd: '/tmp',
        stdio: 'inherit' 
    });
    console.log('✅ Package installed successfully\n');
} catch (e) {
    console.error('❌ Failed to install package:', e.message);
    process.exit(1);
}

// Step 2: Check if the executable exists
const execPath = path.join('/tmp/node_modules/.bin/n8n-mcp-server');
console.log('2. Checking for executable at:', execPath);
if (fs.existsSync(execPath)) {
    console.log('✅ Executable found!\n');
} else {
    console.error('❌ Executable not found!');
    process.exit(1);
}

// Step 3: Run the server and send tools/list request
console.log('3. Testing server with tools/list request...');
const { spawn } = require('child_process');

const child = spawn(execPath, [], {
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
    
    child.stdin.write(request);
}, 1000);

let foundTools = false;

child.stdout.on('data', (data) => {
    const text = data.toString();
    try {
        const lines = text.split('\n');
        for (const line of lines) {
            if (line.trim()) {
                const parsed = JSON.parse(line);
                if (parsed.id === 1 && parsed.result && parsed.result.tools) {
                    foundTools = true;
                    const toolCount = parsed.result.tools.length;
                    console.log(`\n✅ Found ${toolCount} tools!`);
                    
                    if (toolCount > 50) {
                        console.log('\n🎉 SUCCESS! All tools are now available!');
                        console.log('The bin field fix resolved the issue.');
                        
                        // Show first few tools
                        console.log('\nSample tools:');
                        parsed.result.tools.slice(0, 5).forEach(tool => {
                            console.log(`  - ${tool.name}: ${tool.description}`);
                        });
                        console.log(`  ... and ${toolCount - 5} more tools`);
                    } else {
                        console.log('⚠️  Fewer tools than expected');
                    }
                }
            }
        }
    } catch (e) {
        // Not JSON
    }
});

child.stderr.on('data', (data) => {
    const text = data.toString();
    if (text.includes('started successfully')) {
        console.log('✅ Server started');
    }
});

setTimeout(() => {
    child.kill();
    
    if (!foundTools) {
        console.log('\n❌ No tools response received');
    }
    
    console.log('\n=== Verification Complete ===');
    process.exit(foundTools ? 0 : 1);
}, 3000);