// Test script to verify v0.1.5 fixes the tool listing issue
const { spawn } = require('child_process');

console.log('=== Testing Tool List for @drballs/n8n-mcp-server v0.1.5 ===\n');

// Give NPM a moment to propagate
setTimeout(() => {
    console.log('Starting test...\n');
    
    const child = spawn('npx', ['@drballs/n8n-mcp-server@0.1.5'], {
        env: {
            ...process.env,
            N8N_API_KEY: 'test-key',
            N8N_BASE_URL: 'https://test.com'
        },
        stdio: ['pipe', 'pipe', 'pipe']
    });

    // Send list tools request
    setTimeout(() => {
        const listToolsRequest = JSON.stringify({
            jsonrpc: '2.0',
            method: 'tools/list',
            id: 1
        }) + '\n';
        
        console.log('Sending tools/list request...');
        child.stdin.write(listToolsRequest);
    }, 2000);

    let response = '';
    let serverStarted = false;

    child.stdout.on('data', (data) => {
        response += data.toString();
        const lines = response.split('\n');
        
        for (const line of lines) {
            if (line.trim()) {
                try {
                    const parsed = JSON.parse(line);
                    if (parsed.id === 1) {
                        console.log('\n✅ Received response from server');
                        
                        if (parsed.result && parsed.result.tools) {
                            const toolCount = parsed.result.tools.length;
                            console.log(`\n📊 Total tools found: ${toolCount}`);
                            
                            if (toolCount > 1) {
                                console.log('✅ SUCCESS! Multiple tools detected - bin field fix worked!');
                                console.log('\nTool names:');
                                parsed.result.tools.slice(0, 10).forEach(tool => {
                                    console.log(`  - ${tool.name}`);
                                });
                                if (toolCount > 10) {
                                    console.log(`  ... and ${toolCount - 10} more`);
                                }
                            } else if (toolCount === 1) {
                                console.log('❌ ISSUE: Only 1 tool detected');
                                console.log('Tool:', parsed.result.tools[0].name);
                            } else {
                                console.log('❌ ISSUE: No tools detected');
                            }
                        }
                    }
                } catch (e) {
                    // Not JSON, ignore
                }
            }
        }
    });

    child.stderr.on('data', (data) => {
        const text = data.toString();
        if (text.includes('n8n MCP server started successfully')) {
            serverStarted = true;
            console.log('✅ Server started successfully');
        } else if (text.includes('Error') || text.includes('error')) {
            console.error('❌ Server error:', text);
        }
    });

    child.on('error', (err) => {
        console.error('❌ Failed to start npx:', err.message);
    });

    // Cleanup after test
    setTimeout(() => {
        child.kill();
        console.log('\n=== Test completed ===');
        process.exit(0);
    }, 5000);
    
}, 3000); // Wait 3 seconds for NPM propagation