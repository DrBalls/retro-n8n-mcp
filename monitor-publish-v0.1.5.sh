#!/bin/bash

echo "=== Monitoring v0.1.5 Publishing Status ==="
echo "Started at: $(date)"
echo ""

# Function to check NPM
check_npm() {
    echo "Checking NPM for @drballs/n8n-mcp-server@0.1.5..."
    if npm view @drballs/n8n-mcp-server@0.1.5 version 2>/dev/null; then
        echo "✅ v0.1.5 is published to NPM!"
        return 0
    else
        echo "⏳ v0.1.5 not yet available on NPM"
        return 1
    fi
}

# Function to test the executable
test_executable() {
    echo ""
    echo "Testing npx execution..."
    
    # Create test script
    cat > /tmp/test-npx-0.1.5.cjs << 'EOF'
const { spawn } = require('child_process');

console.log('Testing npx @drballs/n8n-mcp-server@0.1.5...');

const child = spawn('npx', ['@drballs/n8n-mcp-server@0.1.5'], {
    env: {
        ...process.env,
        N8N_API_KEY: 'test-key',
        N8N_BASE_URL: 'https://test.com'
    },
    stdio: ['pipe', 'pipe', 'pipe']
});

let foundTools = false;
let toolCount = 0;

// Send list tools request after a delay
setTimeout(() => {
    const request = JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/list',
        id: 1
    }) + '\n';
    child.stdin.write(request);
}, 2000);

child.stdout.on('data', (data) => {
    const text = data.toString();
    try {
        const lines = text.split('\n');
        for (const line of lines) {
            if (line.trim()) {
                const parsed = JSON.parse(line);
                if (parsed.id === 1 && parsed.result && parsed.result.tools) {
                    toolCount = parsed.result.tools.length;
                    foundTools = true;
                    console.log(`✅ Found ${toolCount} tools`);
                    if (toolCount > 1) {
                        console.log('✅ Multiple tools detected - issue appears fixed!');
                    } else {
                        console.log('❌ Only 1 tool detected - issue persists');
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
    if (text.includes('n8n MCP server started successfully')) {
        console.log('✅ Server started successfully');
    }
});

setTimeout(() => {
    child.kill();
    if (!foundTools) {
        console.log('❌ No tools response received');
    }
    process.exit(toolCount > 1 ? 0 : 1);
}, 5000);
EOF

    node /tmp/test-npx-0.1.5.cjs
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
        echo "Package is published! Running executable test..."
        sleep 5  # Give NPM a moment to fully propagate
        
        if test_executable; then
            echo ""
            echo "🎉 SUCCESS! v0.1.5 is published and working correctly!"
            echo "The bin field fix resolved the executable issue."
            exit 0
        else
            echo ""
            echo "⚠️  Package published but executable test failed"
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