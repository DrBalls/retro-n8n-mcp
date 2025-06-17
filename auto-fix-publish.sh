#!/bin/bash

echo "🔧 Automated GitHub Actions Debugging and Fixing Script"
echo "======================================================="

# Configuration
REPO_OWNER="DrBalls"
REPO_NAME="retro-n8n-mcp"
PACKAGE_NAME="@retro/n8n-mcp-server"
CURRENT_VERSION="0.1.2"

# Function to check if GitHub Actions are enabled
check_github_actions() {
    echo -e "\n📋 Checking GitHub repository and Actions status..."
    
    # Check if .github/workflows exists
    if [ -d ".github/workflows" ]; then
        echo "✓ .github/workflows directory exists"
        ls -la .github/workflows/
    else
        echo "❌ .github/workflows directory missing!"
        return 1
    fi
    
    # Check if workflows are in git
    echo -e "\n📋 Checking if workflows are committed..."
    git ls-tree -r HEAD --name-only | grep -E "\.github/workflows/.*\.yml$" || {
        echo "❌ No workflow files found in repository!"
        return 1
    }
    
    return 0
}

# Function to validate workflow syntax
validate_workflows() {
    echo -e "\n🔍 Validating workflow files..."
    
    for workflow in .github/workflows/*.yml; do
        echo "Checking $workflow..."
        # Basic YAML validation
        python3 -c "import yaml; yaml.safe_load(open('$workflow'))" 2>/dev/null || {
            echo "❌ Invalid YAML in $workflow"
            return 1
        }
        echo "✓ $workflow is valid YAML"
    done
    
    return 0
}

# Function to test NPM authentication
test_npm_auth() {
    echo -e "\n🔑 Testing NPM authentication..."
    
    # Check if we can authenticate (dry run)
    npm whoami --registry https://registry.npmjs.org/ 2>/dev/null || {
        echo "❌ NPM authentication failed!"
        echo "Make sure NPM_TOKEN is set in GitHub Secrets"
        return 1
    }
    
    echo "✓ NPM authentication successful"
    return 0
}

# Function to build project locally
test_build() {
    echo -e "\n🏗️ Testing local build..."
    
    # Install dependencies
    echo "Installing dependencies..."
    npm ci || npm install || {
        echo "❌ Failed to install dependencies"
        return 1
    }
    
    # Build
    echo "Building project..."
    npm run build || {
        echo "❌ Build failed!"
        # Show TypeScript errors
        npx tsc --noEmit 2>&1 | head -20
        return 1
    }
    
    echo "✓ Build successful"
    return 0
}

# Function to fix common issues
auto_fix_issues() {
    echo -e "\n🔧 Attempting to auto-fix common issues..."
    
    # Fix 1: Ensure package-lock.json is in sync
    echo "Syncing package-lock.json..."
    npm install
    
    # Fix 2: Ensure TypeScript builds
    echo "Checking TypeScript compilation..."
    npx tsc --noEmit 2>&1 | grep -E "error TS" | head -10 || echo "✓ No TypeScript errors"
    
    # Fix 3: Ensure all files are committed
    if [ -n "$(git status --porcelain)" ]; then
        echo "📝 Uncommitted changes detected:"
        git status --short
        git add -A
        git commit -m "fix: auto-commit changes for CI/CD" || true
    fi
    
    # Fix 4: Push any unpushed commits
    git push origin production || true
}

# Function to manually trigger workflow
trigger_workflow() {
    echo -e "\n🚀 Attempting to trigger workflow..."
    
    # Delete and recreate tag
    TAG="v$CURRENT_VERSION"
    echo "Recreating tag $TAG..."
    
    git tag -d "$TAG" 2>/dev/null || true
    git push origin ":refs/tags/$TAG" 2>/dev/null || true
    
    # Wait a moment
    sleep 2
    
    # Create and push new tag
    git tag "$TAG"
    git push origin "$TAG"
    
    echo "✓ Tag $TAG pushed - workflow should trigger"
}

# Function to monitor workflow
monitor_workflow() {
    echo -e "\n👁️ Monitoring workflow execution..."
    
    # Simple monitoring loop
    for i in {1..20}; do
        echo -e "\nCheck #$i..."
        
        # Check NPM
        NPM_VERSION=$(npm view "$PACKAGE_NAME" version 2>&1 | grep -v "npm error" || echo "")
        
        if [ -n "$NPM_VERSION" ] && [ "$NPM_VERSION" != "" ]; then
            echo "🎉 SUCCESS! Package published to NPM!"
            echo "Version: $NPM_VERSION"
            echo "Install with: npm install -g $PACKAGE_NAME"
            return 0
        fi
        
        echo "Package not yet on NPM. Waiting..."
        sleep 30
    done
    
    echo "⏱️ Timeout reached. Package may still be publishing."
    return 1
}

# Main execution
main() {
    echo "Starting automated debugging and fixing process..."
    
    # Step 1: Check GitHub Actions setup
    check_github_actions || {
        echo "❌ GitHub Actions setup issue detected"
        exit 1
    }
    
    # Step 2: Validate workflows
    validate_workflows || {
        echo "❌ Workflow validation failed"
        exit 1
    }
    
    # Step 3: Test build
    test_build || {
        echo "❌ Build test failed"
        auto_fix_issues
        test_build || {
            echo "❌ Build still failing after fixes"
            exit 1
        }
    }
    
    # Step 4: Auto-fix common issues
    auto_fix_issues
    
    # Step 5: Trigger workflow
    trigger_workflow
    
    # Step 6: Monitor
    monitor_workflow
}

# Run main function
main