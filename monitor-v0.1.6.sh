#!/bin/bash

echo "=== Monitoring v0.1.6 Publishing and Testing ==="
echo "Started at: $(date)"
echo ""

# Function to check NPM
check_npm() {
    echo "Checking NPM for @drballs/n8n-mcp-server@0.1.6..."
    if npm view @drballs/n8n-mcp-server@0.1.6 version 2>/dev/null; then
        echo "✅ v0.1.6 is published to NPM!"
        return 0
    else
        echo "⏳ v0.1.6 not yet available on NPM"
        return 1
    fi
}

# Function to test the fix
test_fix() {
    echo ""
    echo "Testing environment variable fix..."
    
    # Create test directory
    TEST_DIR="/tmp/test-n8n-mcp-$$"
    mkdir -p "$TEST_DIR"
    cd "$TEST_DIR"
    
    # Create test script
    cat > test-tools.cjs << 'EOF'
const { spawn } = require('child_process');

console.log('Testing with N8N_BASE_URL environment variable...\n');

const child = spawn('npx', ['@drballs/n8n-mcp-server@0.1.6'], {
    env: {
        ...process.env,
        N8N_API_KEY: 'test-key-123',
        N8N_BASE_URL: 'https://test.n8n.instance.com'
    },
    stdio: ['pipe', 'pipe', 'pipe']
});

// Wait for server to start
setTimeout(() => {
    // Send tools/list request
    const request = JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/list',
        id: 1
    }) + '\n';
    
    child.stdin.write(request);
}, 2000);

let foundTools = false;
let toolCount = 0;

child.stdout.on('data', (data) => {
    const text = data.toString();
    try {
        const lines = text.split('\n');
        for (const line of lines) {
            if (line.trim()) {
                const parsed = JSON.parse(line);
                if (parsed.id === 1 && parsed.result && parsed.result.tools) {
                    foundTools = true;
                    toolCount = parsed.result.tools.length;
                    console.log(`\n✅ Response received: ${toolCount} tools`);
                    
                    if (toolCount > 50) {
                        console.log('🎉 SUCCESS! All tools are available!');
                        console.log('\nFirst 5 tools:');
                        parsed.result.tools.slice(0, 5).forEach(tool => {
                            console.log(`  - ${tool.name}`);
                        });
                        console.log(`  ... and ${toolCount - 5} more\n`);
                    } else if (toolCount === 1) {
                        console.log('❌ ISSUE PERSISTS: Only 1 tool (server_health)');
                        console.log('Tool:', parsed.result.tools[0].name);
                    } else {
                        console.log(`⚠️  Partial success: ${toolCount} tools`);
                    }
                }
            }
        }
    } catch (e) {
        // Not JSON
    }
});

let serverLogs = [];
child.stderr.on('data', (data) => {
    const text = data.toString();
    serverLogs.push(text);
    
    if (text.includes('n8n API client initialized successfully')) {
        console.log('✅ API client initialized');
    } else if (text.includes('n8n API client not configured')) {
        console.log('❌ API client NOT configured - this is the problem!');
    }
});

setTimeout(() => {
    child.kill();
    
    if (!foundTools) {
        console.log('\n❌ No response received');
        console.log('\nServer logs:');
        serverLogs.forEach(log => console.log(log));
    }
    
    process.exit(toolCount > 50 ? 0 : 1);
}, 5000);
EOF

    node test-tools.cjs
    local result=$?
    
    # Cleanup
    cd /
    rm -rf "$TEST_DIR"
    
    return $result
}

# Main monitoring loop
MAX_ATTEMPTS=30
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    ATTEMPT=$((ATTEMPT + 1))
    echo ""
    echo "=== Attempt $ATTEMPT/$MAX_ATTEMPTS ==="
    
    if check_npm; then
        echo ""
        echo "Package published! Waiting 5 seconds for propagation..."
        sleep 5
        
        if test_fix; then
            echo ""
            echo "🎉 SUCCESS! v0.1.6 is working correctly!"
            echo "The N8N_BASE_URL environment variable fix resolved the issue."
            exit 0
        else
            echo ""
            echo "⚠️  Package published but fix didn't work as expected"
            echo "The issue may require additional debugging"
            exit 1
        fi
    fi
    
    if [ $ATTEMPT -lt $MAX_ATTEMPTS ]; then
        echo "Waiting 10 seconds before next check..."
        sleep 10
    fi
done

echo ""
echo "❌ Timeout: Package not published after $MAX_ATTEMPTS attempts"
exit 1