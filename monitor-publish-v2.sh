#!/bin/bash

# Automated GitHub Actions monitoring with Python
echo "🤖 Starting automated publish monitoring..."

REPO="DrBalls/retro-n8n-mcp"
CURRENT_VERSION="0.1.2"

# Create Python monitoring script
cat > monitor.py << 'EOF'
import requests
import time
import json
import subprocess
import sys

def check_github_actions(repo):
    """Check the latest workflow run status"""
    url = f"https://api.github.com/repos/{repo}/actions/runs"
    try:
        response = requests.get(url, params={"per_page": 1})
        if response.status_code == 200:
            data = response.json()
            if data['workflow_runs']:
                run = data['workflow_runs'][0]
                return {
                    'id': run['id'],
                    'name': run['name'],
                    'status': run['status'],
                    'conclusion': run.get('conclusion', 'pending'),
                    'created_at': run['created_at']
                }
    except Exception as e:
        print(f"Error checking GitHub Actions: {e}")
    return None

def get_workflow_errors(repo, run_id):
    """Get details about failed jobs"""
    url = f"https://api.github.com/repos/{repo}/actions/runs/{run_id}/jobs"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            errors = []
            for job in data.get('jobs', []):
                if job.get('conclusion') == 'failure':
                    failed_steps = []
                    for step in job.get('steps', []):
                        if step.get('conclusion') == 'failure':
                            failed_steps.append(step['name'])
                    errors.append({
                        'job': job['name'],
                        'failed_steps': failed_steps
                    })
            return errors
    except Exception as e:
        print(f"Error getting workflow details: {e}")
    return []

def check_npm_package(package_name):
    """Check if package is published on NPM"""
    try:
        result = subprocess.run(['npm', 'view', package_name, 'version'], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            return result.stdout.strip()
    except:
        pass
    return None

def main():
    repo = sys.argv[1]
    package_name = "@retro/n8n-mcp-server"
    max_attempts = 60  # 30 minutes max
    attempt = 0
    
    print(f"Monitoring {repo} for package {package_name}")
    
    while attempt < max_attempts:
        attempt += 1
        print(f"\n--- Check #{attempt} ---")
        
        # Check GitHub Actions
        workflow = check_github_actions(repo)
        if workflow:
            print(f"Workflow: {workflow['name']}")
            print(f"Status: {workflow['status']}")
            print(f"Conclusion: {workflow['conclusion']}")
            
            if workflow['conclusion'] == 'success':
                print("✅ Workflow completed successfully!")
                
                # Check NPM
                npm_version = check_npm_package(package_name)
                if npm_version:
                    print(f"🎉 Package published! Version: {npm_version}")
                    return 0
                else:
                    print("⏳ Waiting for NPM to update...")
                    
            elif workflow['conclusion'] == 'failure':
                print("❌ Workflow failed!")
                errors = get_workflow_errors(repo, workflow['id'])
                for error in errors:
                    print(f"\nFailed job: {error['job']}")
                    for step in error['failed_steps']:
                        print(f"  - Failed step: {step}")
                return 1
        
        # Wait before next check
        time.sleep(30)
    
    print("\n⏱️ Monitoring timeout reached")
    return 1

if __name__ == "__main__":
    sys.exit(main())
EOF

# Run the Python monitor
python3 monitor.py "$REPO"