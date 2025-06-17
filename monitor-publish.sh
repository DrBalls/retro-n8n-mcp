#!/bin/bash

# Automated GitHub Actions monitoring script
echo "🤖 Starting automated publish monitoring..."

REPO="DrBalls/retro-n8n-mcp"
WORKFLOW_NAME="Publish to NPM"
MAX_ATTEMPTS=30
CHECK_INTERVAL=30

check_workflow_status() {
    # Get the latest workflow run
    LATEST_RUN=$(curl -s "https://api.github.com/repos/$REPO/actions/runs?per_page=1" | \
        jq -r '.workflow_runs[0] | {id: .id, name: .name, status: .status, conclusion: .conclusion, created_at: .created_at}')
    
    if [ "$LATEST_RUN" != "null" ]; then
        echo "$LATEST_RUN"
    else
        echo "No runs found"
    fi
}

check_npm_package() {
    npm view @retro/n8n-mcp-server version 2>&1 | grep -v "npm error" || echo "Not published"
}

# Main monitoring loop
attempt=1
while [ $attempt -le $MAX_ATTEMPTS ]; do
    echo -e "\n--- Check #$attempt at $(date) ---"
    
    # Check workflow status
    echo "Checking GitHub Actions..."
    STATUS=$(check_workflow_status)
    echo "$STATUS"
    
    # Extract conclusion
    CONCLUSION=$(echo "$STATUS" | jq -r '.conclusion // "pending"')
    
    if [ "$CONCLUSION" = "success" ]; then
        echo "✅ Workflow completed successfully!"
        
        # Check NPM
        echo "Checking NPM package..."
        NPM_VERSION=$(check_npm_package)
        echo "NPM Version: $NPM_VERSION"
        
        if [ "$NPM_VERSION" != "Not published" ]; then
            echo "🎉 Package published successfully!"
            exit 0
        else
            echo "⏳ Waiting for NPM to update..."
        fi
    elif [ "$CONCLUSION" = "failure" ]; then
        echo "❌ Workflow failed! Getting logs..."
        
        # Get run ID
        RUN_ID=$(echo "$STATUS" | jq -r '.id')
        
        # Get failed jobs
        echo "Fetching failed job details..."
        curl -s "https://api.github.com/repos/$REPO/actions/runs/$RUN_ID/jobs" | \
            jq -r '.jobs[] | select(.conclusion == "failure") | {name: .name, steps: .steps[] | select(.conclusion == "failure") | {name: .name, conclusion: .conclusion}}'
        
        exit 1
    fi
    
    # Wait before next check
    echo "Waiting $CHECK_INTERVAL seconds..."
    sleep $CHECK_INTERVAL
    
    attempt=$((attempt + 1))
done

echo "⏱️ Monitoring timeout reached"
exit 1