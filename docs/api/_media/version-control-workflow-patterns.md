# Version Control Workflow Patterns

This document outlines recommended workflow patterns for different development scenarios using the n8n MCP Server version control system.

## Table of Contents

1. [GitFlow Pattern](#gitflow-pattern)
2. [GitHub Flow Pattern](#github-flow-pattern)
3. [Emergency Response Pattern](#emergency-response-pattern)
4. [Multi-Environment Pattern](#multi-environment-pattern)
5. [Collaborative Development Pattern](#collaborative-development-pattern)
6. [Release Management Pattern](#release-management-pattern)

## GitFlow Pattern

Ideal for teams with scheduled releases and multiple environments.

### Branch Structure
```
main (production)
├── develop (staging)
│   ├── feature/payment-integration
│   ├── feature/reporting-dashboard
│   └── feature/api-v2
├── release/1.2.0
└── hotfix/critical-bug
```

### Workflow Steps

1. **Start Feature Development**
   ```typescript
   // Create feature branch from develop
   await branchCreateTool.execute({
     workflowId: 'workflow-123',
     branchName: 'feature/payment-integration',
     fromBranch: 'develop',
     description: 'Integrate Stripe payment processing'
   });
   ```

2. **Regular Development**
   ```typescript
   // Commit changes regularly
   await versionCreateTool.execute({
     workflowId: 'workflow-123',
     branch: 'feature/payment-integration',
     message: 'Add Stripe webhook handler',
     versionType: 'minor'
   });
   ```

3. **Feature Complete**
   ```typescript
   // Merge back to develop
   await branchMergeTool.execute({
     workflowId: 'workflow-123',
     sourceBranch: 'feature/payment-integration',
     targetBranch: 'develop',
     message: 'Merge payment integration feature',
     deleteSourceBranch: true
   });
   ```

4. **Release Preparation**
   ```typescript
   // Create release branch
   await branchCreateTool.execute({
     workflowId: 'workflow-123',
     branchName: 'release/1.2.0',
     fromBranch: 'develop'
   });
   
   // Final adjustments
   await versionCreateTool.execute({
     workflowId: 'workflow-123',
     branch: 'release/1.2.0',
     message: 'Update version numbers and documentation',
     versionType: 'patch'
   });
   ```

5. **Deploy to Production**
   ```typescript
   // Merge to main
   await branchMergeTool.execute({
     workflowId: 'workflow-123',
     sourceBranch: 'release/1.2.0',
     targetBranch: 'main',
     message: 'Release version 1.2.0',
     tags: ['v1.2.0', 'release']
   });
   
   // Also merge back to develop
   await branchMergeTool.execute({
     workflowId: 'workflow-123',
     sourceBranch: 'release/1.2.0',
     targetBranch: 'develop',
     message: 'Merge release back to develop'
   });
   ```

## GitHub Flow Pattern

Simpler pattern for continuous deployment environments.

### Branch Structure
```
main (production)
├── feature/user-auth
├── feature/data-export
└── feature/notifications
```

### Workflow Steps

1. **Create Feature Branch**
   ```typescript
   await branchCreateTool.execute({
     workflowId: 'workflow-123',
     branchName: 'feature/user-auth',
     fromBranch: 'main',
     description: 'Implement OAuth2 authentication'
   });
   ```

2. **Develop and Test**
   ```typescript
   // Make changes and version
   await versionCreateTool.execute({
     workflowId: 'workflow-123',
     branch: 'feature/user-auth',
     message: 'Add OAuth2 provider nodes',
     versionType: 'minor'
   });
   
   // Create test snapshot
   await versionCreateTool.execute({
     workflowId: 'workflow-123',
     branch: 'feature/user-auth',
     message: 'Testing snapshot',
     isSnapshot: true
   });
   ```

3. **Code Review (Compare Changes)**
   ```typescript
   // Generate diff for review
   const diff = await versionDiffTool.execute({
     workflowId: 'workflow-123',
     fromVersionId: 'main-latest',
     toVersionId: 'feature-latest',
     format: 'detailed',
     includeContext: true
   });
   ```

4. **Deploy to Production**
   ```typescript
   // Direct merge to main
   await branchMergeTool.execute({
     workflowId: 'workflow-123',
     sourceBranch: 'feature/user-auth',
     targetBranch: 'main',
     message: 'Add OAuth2 authentication',
     strategy: 'auto',
     deleteSourceBranch: true
   });
   ```

## Emergency Response Pattern

For critical production issues requiring immediate attention.

### Workflow Steps

1. **Identify Stable Version**
   ```typescript
   // Find last known good version
   const history = await versionHistoryTool.execute({
     workflowId: 'workflow-123',
     branch: 'main',
     limit: 10,
     format: 'summary'
   });
   ```

2. **Immediate Rollback (if needed)**
   ```typescript
   // Quick rollback to stable
   await versionRollbackTool.execute({
     workflowId: 'workflow-123',
     targetVersionId: 'last-stable-version',
     message: 'Emergency rollback - critical issue',
     reason: 'Workflow causing data corruption',
     createBackup: true,
     updateN8n: true,
     skipWarnings: true  // Emergency only
   });
   ```

3. **Create Hotfix Branch**
   ```typescript
   // Branch from stable version
   await branchCreateTool.execute({
     workflowId: 'workflow-123',
     branchName: 'hotfix/data-corruption',
     fromBranch: 'main',
     author: 'oncall@company.com',
     description: 'INCIDENT-123: Fix data corruption issue'
   });
   ```

4. **Apply Fix**
   ```typescript
   // Quick fix
   await versionCreateTool.execute({
     workflowId: 'workflow-123',
     branch: 'hotfix/data-corruption',
     message: 'Fix data validation in webhook handler',
     versionType: 'patch',
     tags: ['hotfix', 'incident-123', 'urgent']
   });
   ```

5. **Fast-Track Deploy**
   ```typescript
   // Expedited merge
   await branchMergeTool.execute({
     workflowId: 'workflow-123',
     sourceBranch: 'hotfix/data-corruption',
     targetBranch: 'main',
     message: 'Emergency fix for data corruption (INCIDENT-123)',
     strategy: 'theirs',  // Take all hotfix changes
     priority: 'critical'
   });
   ```

## Multi-Environment Pattern

For organizations with dev, staging, and production environments.

### Environment Mapping
```
main         → production
staging      → staging environment
develop      → development environment
feature/*    → developer local
```

### Workflow Steps

1. **Development Environment**
   ```typescript
   // Feature development
   await versionCreateTool.execute({
     workflowId: 'workflow-dev-123',
     branch: 'feature/new-integration',
     message: 'Initial integration setup',
     environment: 'development'
   });
   ```

2. **Promote to Staging**
   ```typescript
   // Merge to staging branch
   await branchMergeTool.execute({
     workflowId: 'workflow-dev-123',
     sourceBranch: 'feature/new-integration',
     targetBranch: 'staging',
     message: 'Promote to staging for QA'
   });
   
   // Sync to staging environment
   await workflowSyncTool.execute({
     sourceWorkflowId: 'workflow-dev-123',
     targetWorkflowId: 'workflow-staging-123',
     environment: 'staging'
   });
   ```

3. **Production Deployment**
   ```typescript
   // After QA approval
   await branchMergeTool.execute({
     workflowId: 'workflow-staging-123',
     sourceBranch: 'staging',
     targetBranch: 'main',
     message: 'Deploy to production after QA approval',
     approvedBy: 'qa-team@company.com'
   });
   ```

## Collaborative Development Pattern

For teams working on interconnected workflows.

### Coordination Strategy

1. **Create Integration Branch**
   ```typescript
   // Shared integration branch
   await branchCreateTool.execute({
     workflowId: 'workflow-123',
     branchName: 'integration/q1-features',
     fromBranch: 'develop',
     description: 'Q1 feature integration branch'
   });
   ```

2. **Individual Feature Branches**
   ```typescript
   // Developer 1
   await branchCreateTool.execute({
     workflowId: 'workflow-123',
     branchName: 'feature/api-endpoints',
     fromBranch: 'integration/q1-features'
   });
   
   // Developer 2
   await branchCreateTool.execute({
     workflowId: 'workflow-123',
     branchName: 'feature/data-processing',
     fromBranch: 'integration/q1-features'
   });
   ```

3. **Regular Integration**
   ```typescript
   // Merge features to integration branch
   await branchMergeTool.execute({
     workflowId: 'workflow-123',
     sourceBranch: 'feature/api-endpoints',
     targetBranch: 'integration/q1-features',
     message: 'Integrate API endpoints',
     strategy: 'manual'  // Handle conflicts carefully
   });
   ```

4. **Conflict Resolution**
   ```typescript
   // When conflicts occur
   const mergeResult = await branchMergeTool.execute({
     workflowId: 'workflow-123',
     sourceBranch: 'feature/data-processing',
     targetBranch: 'integration/q1-features',
     strategy: 'manual'
   });
   
   if (mergeResult.hasConflicts) {
     // Review conflicts
     const conflicts = mergeResult.conflicts;
     
     // Resolve conflicts
     await mergeResolveTool.execute({
       mergeId: mergeResult.mergeId,
       resolutions: {
         'conflict-1': 'keep_source',
         'conflict-2': 'keep_target',
         'conflict-3': 'custom'  // Manual resolution
       }
     });
   }
   ```

## Release Management Pattern

For scheduled releases with approval workflows.

### Release Process

1. **Release Planning**
   ```typescript
   // Tag current development state
   await versionCreateTool.execute({
     workflowId: 'workflow-123',
     branch: 'develop',
     message: 'Pre-release checkpoint',
     tags: ['pre-release-2.0', 'checkpoint']
   });
   
   // Create release branch
   await branchCreateTool.execute({
     workflowId: 'workflow-123',
     branchName: 'release/2.0.0',
     fromBranch: 'develop',
     description: 'Version 2.0 release candidate'
   });
   ```

2. **Release Preparation**
   ```typescript
   // Version bump
   await versionCreateTool.execute({
     workflowId: 'workflow-123',
     branch: 'release/2.0.0',
     message: 'Bump version to 2.0.0',
     versionType: 'major',
     metadata: {
       releaseNotes: 'Major feature release',
       breakingChanges: ['API endpoints restructured']
     }
   });
   
   // Final testing snapshot
   await versionCreateTool.execute({
     workflowId: 'workflow-123',
     branch: 'release/2.0.0',
     message: 'Release candidate for testing',
     isSnapshot: true,
     tags: ['rc-2.0.0']
   });
   ```

3. **Release Approval**
   ```typescript
   // Generate release diff
   const releaseDiff = await versionDiffTool.execute({
     workflowId: 'workflow-123',
     fromVersionId: 'v1.9.0',
     toVersionId: 'rc-2.0.0',
     format: 'detailed',
     includeImpactAnalysis: true
   });
   
   // After approval, tag release
   await versionCreateTool.execute({
     workflowId: 'workflow-123',
     branch: 'release/2.0.0',
     message: 'Release 2.0.0 approved',
     tags: ['v2.0.0', 'release', 'approved'],
     metadata: {
       approvedBy: 'release-manager@company.com',
       approvalDate: new Date().toISOString()
     }
   });
   ```

4. **Production Deployment**
   ```typescript
   // Merge to production
   await branchMergeTool.execute({
     workflowId: 'workflow-123',
     sourceBranch: 'release/2.0.0',
     targetBranch: 'main',
     message: 'Release 2.0.0 to production',
     strategy: 'theirs',  // Take all release changes
     createBackup: true
   });
   
   // Tag production
   await versionCreateTool.execute({
     workflowId: 'workflow-123',
     branch: 'main',
     message: 'Production deployment 2.0.0',
     tags: ['production', 'v2.0.0-prod'],
     isSnapshot: false
   });
   
   // Merge back to develop
   await branchMergeTool.execute({
     workflowId: 'workflow-123',
     sourceBranch: 'release/2.0.0',
     targetBranch: 'develop',
     message: 'Merge release 2.0.0 back to develop'
   });
   ```

## Best Practices Summary

1. **Choose the Right Pattern**
   - GitFlow: Complex projects with scheduled releases
   - GitHub Flow: Continuous deployment, simpler projects
   - Emergency: Critical issues requiring immediate action
   - Multi-Environment: Enterprise with multiple stages
   - Collaborative: Large teams, parallel development
   - Release Management: Formal release processes

2. **Communication**
   - Use descriptive branch names
   - Write clear commit messages
   - Tag important versions
   - Document decisions in version metadata

3. **Safety**
   - Always create backups for production changes
   - Test on feature branches first
   - Use appropriate merge strategies
   - Review diffs before major operations

4. **Automation**
   - Integrate with CI/CD pipelines
   - Automate version creation on saves
   - Set up webhook triggers for deployments
   - Create scheduled backup versions

5. **Monitoring**
   - Track version metrics
   - Monitor rollback frequency
   - Analyze conflict patterns
   - Review merge success rates