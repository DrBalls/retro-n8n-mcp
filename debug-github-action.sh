#!/bin/bash

echo "=== Debugging GitHub Actions Publish Failure ==="
echo ""

# Check current package.json version
echo "Current package.json version:"
grep '"version"' package.json

echo ""
echo "Latest tag:"
git describe --tags --abbrev=0

echo ""
echo "All tags:"
git tag -l | tail -5

echo ""
echo "Checking GitHub Actions logs..."

# Get the latest workflow run
RUN_ID=$(curl -s "https://api.github.com/repos/DrBalls/retro-n8n-mcp/actions/runs?per_page=1" | grep -o '"id": [0-9]*' | head -1 | cut -d' ' -f2)

if [ -n "$RUN_ID" ]; then
    echo "Latest workflow run ID: $RUN_ID"
    echo ""
    echo "Workflow URL: https://github.com/DrBalls/retro-n8n-mcp/actions/runs/$RUN_ID"
    echo ""
    
    # Try to get job details
    echo "Fetching job details..."
    curl -s "https://api.github.com/repos/DrBalls/retro-n8n-mcp/actions/runs/$RUN_ID/jobs" | grep -E '"name"|"conclusion"|"completed_at"' | head -20
else
    echo "Could not fetch workflow run ID"
fi

echo ""
echo "=== Recommendations ==="
echo "1. The workflow likely failed because it tried to update package.json to v0.1.5"
echo "   but the version was already 0.1.5 in the production branch"
echo "2. The 'npm version' command fails when the version is already set"
echo ""
echo "To fix this for future releases:"
echo "- Always ensure package.json version is OLDER than the tag version"
echo "- Or modify the workflow to handle this case gracefully"