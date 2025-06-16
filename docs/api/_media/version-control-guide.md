# Version Control Guide for n8n MCP Server

This guide provides comprehensive documentation for the Git-like version control system implemented in the n8n MCP Server. The system enables workflow versioning, branching, merging, and rollback capabilities for n8n workflows.

## Table of Contents

1. [Overview](#overview)
2. [Core Concepts](#core-concepts)
3. [Getting Started](#getting-started)
4. [Common Workflows](#common-workflows)
5. [Best Practices](#best-practices)
6. [Advanced Topics](#advanced-topics)
7. [Troubleshooting](#troubleshooting)
8. [API Reference](#api-reference)

## Overview

The version control system provides Git-like functionality for n8n workflows, enabling teams to:

- Track workflow changes over time with semantic versioning
- Create feature branches for isolated development
- Merge changes with automatic conflict detection
- Rollback to previous versions with one-click restore
- Generate detailed diffs between workflow versions
- Maintain audit trails and change history

### Key Features

- **Semantic Versioning**: Automatic version numbering (major.minor.patch)
- **Branch Management**: Create and manage development branches
- **Merge Strategies**: Multiple merge strategies with conflict resolution
- **Diff Visualization**: Detailed change tracking and comparison
- **Atomic Operations**: Safe rollback with backup creation
- **Storage Abstraction**: Pluggable storage backends

## Core Concepts

### Semantic Versioning

The system follows semantic versioning (semver) principles:

- **Major** (X.0.0): Breaking changes, workflow restructuring
- **Minor** (1.X.0): New features, added nodes/connections
- **Patch** (1.0.X): Bug fixes, parameter adjustments

Example version progression:
```
1.0.0 → 1.0.1 (fix parameter)
1.0.1 → 1.1.0 (add new node)
1.1.0 → 2.0.0 (restructure workflow)
```

### Branches

Branches enable parallel development:

- **main**: The primary stable branch
- **feature/**: Feature development branches
- **hotfix/**: Emergency fix branches
- **release/**: Release preparation branches

### Version History

Every change creates a new version with:
- Unique version ID
- Version string (semantic version)
- Commit message
- Author information
- Timestamp
- Parent version reference
- Change summary

### Workflow Diffs

Diffs track changes between versions:
- Node additions/removals
- Connection modifications
- Parameter updates
- Settings changes
- Position adjustments

## Getting Started

### Creating Your First Version

```typescript
// Create initial version of a workflow
const result = await versionCreateTool.execute({
  workflowId: 'workflow-123',
  message: 'Initial workflow setup',
  author: 'john.doe@company.com',
  tags: ['v1.0', 'production']
});
```

### Viewing Version History

```typescript
// Get detailed version history
const history = await versionHistoryTool.execute({
  workflowId: 'workflow-123',
  format: 'detailed',
  includeChanges: true,
  limit: 20
});
```

### Creating a Feature Branch

```typescript
// Create a new feature branch
const branch = await branchCreateTool.execute({
  workflowId: 'workflow-123',
  branchName: 'feature/add-error-handling',
  fromBranch: 'main',
  description: 'Adding error handling nodes'
});
```

## Common Workflows

### Feature Development Workflow

1. **Create Feature Branch**
   ```typescript
   // Branch from main
   await branchCreateTool.execute({
     workflowId: 'workflow-123',
     branchName: 'feature/email-notifications',
     fromBranch: 'main'
   });
   ```

2. **Make Changes and Version**
   ```typescript
   // After modifying workflow in n8n
   await versionCreateTool.execute({
     workflowId: 'workflow-123',
     branch: 'feature/email-notifications',
     message: 'Add email notification nodes',
     versionType: 'minor'
   });
   ```

3. **Test and Iterate**
   ```typescript
   // Create additional versions as needed
   await versionCreateTool.execute({
     workflowId: 'workflow-123',
     branch: 'feature/email-notifications',
     message: 'Fix email template formatting',
     versionType: 'patch'
   });
   ```

4. **Merge to Main**
   ```typescript
   // Merge feature branch
   await branchMergeTool.execute({
     workflowId: 'workflow-123',
     sourceBranch: 'feature/email-notifications',
     targetBranch: 'main',
     message: 'Merge email notifications feature',
     strategy: 'auto',
     deleteSourceBranch: true
   });
   ```

### Hotfix Workflow

1. **Create Hotfix Branch**
   ```typescript
   await branchCreateTool.execute({
     workflowId: 'workflow-123',
     branchName: 'hotfix/critical-bug',
     fromBranch: 'main'
   });
   ```

2. **Apply Fix**
   ```typescript
   await versionCreateTool.execute({
     workflowId: 'workflow-123',
     branch: 'hotfix/critical-bug',
     message: 'Fix critical data processing bug',
     versionType: 'patch',
     tags: ['hotfix', 'urgent']
   });
   ```

3. **Fast-Track Merge**
   ```typescript
   await branchMergeTool.execute({
     workflowId: 'workflow-123',
     sourceBranch: 'hotfix/critical-bug',
     targetBranch: 'main',
     message: 'Emergency hotfix for data processing',
     priority: 'high'
   });
   ```

### Rollback Workflow

1. **Identify Target Version**
   ```typescript
   // Find the stable version to rollback to
   const history = await versionHistoryTool.execute({
     workflowId: 'workflow-123',
     branch: 'main',
     limit: 10
   });
   ```

2. **Execute Rollback**
   ```typescript
   await versionRollbackTool.execute({
     workflowId: 'workflow-123',
     targetVersionId: 'version-abc123',
     message: 'Rollback due to performance issues',
     reason: 'Workflow causing high CPU usage',
     createBackup: true,
     updateN8n: true
   });
   ```

### Comparing Versions

```typescript
// Generate detailed diff
const diff = await versionDiffTool.execute({
  workflowId: 'workflow-123',
  fromVersionId: 'version-old',
  toVersionId: 'version-new',
  format: 'detailed',
  includeContext: true
});
```

## Best Practices

### Version Naming Conventions

1. **Semantic Version Increments**
   - Use `patch` for bug fixes and minor adjustments
   - Use `minor` for new features and node additions
   - Use `major` for breaking changes or workflow restructuring
   - Use `auto` to let the system determine based on changes

2. **Commit Messages**
   - Be descriptive and concise
   - Start with action verb (Add, Fix, Update, Remove)
   - Reference ticket numbers if applicable
   - Examples:
     ```
     "Add error handling for API timeouts"
     "Fix webhook authentication issue (TICKET-123)"
     "Update email templates for new branding"
     "Remove deprecated legacy nodes"
     ```

### Branch Naming

1. **Feature Branches**
   - `feature/descriptive-name`
   - `feature/TICKET-123-description`
   - Examples:
     ```
     feature/customer-notifications
     feature/JIRA-456-payment-integration
     feature/oauth2-authentication
     ```

2. **Hotfix Branches**
   - `hotfix/issue-description`
   - `hotfix/INCIDENT-123`
   - Examples:
     ```
     hotfix/memory-leak
     hotfix/INCIDENT-789-api-timeout
     ```

3. **Release Branches**
   - `release/version-number`
   - Examples:
     ```
     release/2.0.0
     release/1.5.0-beta
     ```

### Merging Strategies

1. **Auto Merge** (Default)
   - Best for simple, non-conflicting changes
   - Automatically resolves trivial conflicts
   - Fails safely on complex conflicts

2. **Manual Merge**
   - Use for complex merges
   - Allows custom conflict resolution
   - Provides detailed conflict information

3. **Ours/Theirs**
   - Use when one version should take precedence
   - `ours`: Keep target branch changes
   - `theirs`: Accept all source branch changes

### Testing Before Merging

1. **Create Test Versions**
   ```typescript
   // Create a test snapshot before merging
   await versionCreateTool.execute({
     workflowId: 'workflow-123',
     branch: 'feature/complex-feature',
     message: 'Pre-merge test snapshot',
     isSnapshot: true
   });
   ```

2. **Validate Changes**
   - Test workflow execution in n8n
   - Verify all connections work
   - Check error handling paths
   - Validate performance impact

### Rollback Safety

1. **Always Create Backups**
   ```typescript
   await versionRollbackTool.execute({
     workflowId: 'workflow-123',
     targetVersionId: 'safe-version',
     createBackup: true,  // Always true for production
     skipWarnings: false  // Review warnings
   });
   ```

2. **Document Rollback Reasons**
   - Include specific issue description
   - Reference incident tickets
   - Note any data implications

## Advanced Topics

### Conflict Resolution

When merges result in conflicts:

1. **Understand Conflict Types**
   - `node_added_both`: Same node added in both branches
   - `node_modified_deleted`: Node modified in one, deleted in other
   - `connection_conflict`: Conflicting connection changes
   - `parameter_conflict`: Same parameter with different values

2. **Resolution Strategies**
   ```typescript
   // Manual conflict resolution
   await branchMergeTool.execute({
     workflowId: 'workflow-123',
     sourceBranch: 'feature/branch',
     targetBranch: 'main',
     strategy: 'manual',
     conflictResolutions: {
       'conflict-1': 'keep_source',
       'conflict-2': 'keep_target',
       'conflict-3': 'merge_both'
     }
   });
   ```

### Batch Operations

Version control operations on multiple workflows:

```typescript
// Version multiple workflows
const workflows = ['workflow-1', 'workflow-2', 'workflow-3'];

for (const workflowId of workflows) {
  await versionCreateTool.execute({
    workflowId,
    message: 'Quarterly maintenance update',
    versionType: 'patch',
    tags: ['Q1-2024', 'maintenance']
  });
}
```

### Custom Storage Backends

The system supports custom storage implementations:

```typescript
class CustomVersionStorage implements IVersionStorage {
  async saveVersion(version: WorkflowVersion): Promise<void> {
    // Custom implementation (e.g., database, S3)
  }
  
  async getVersion(versionId: string): Promise<WorkflowVersion> {
    // Retrieve from custom storage
  }
  
  // Implement other required methods...
}
```

### Webhook Integration

Trigger version control operations via webhooks:

```typescript
// Example: Auto-version on workflow save
app.post('/webhook/workflow-saved', async (req, res) => {
  const { workflowId, userId, changes } = req.body;
  
  await versionCreateTool.execute({
    workflowId,
    message: `Auto-save by ${userId}`,
    author: userId,
    versionType: 'auto'
  });
  
  res.json({ success: true });
});
```

## Troubleshooting

### Common Issues

1. **Merge Conflicts**
   - **Issue**: "Cannot auto-merge due to conflicts"
   - **Solution**: Use manual merge strategy or resolve conflicts individually

2. **Version Not Found**
   - **Issue**: "Version 'xyz' not found"
   - **Solution**: Verify version ID exists using history tool

3. **Branch Already Exists**
   - **Issue**: "Branch 'feature/x' already exists"
   - **Solution**: Use unique branch names or delete old branches

4. **Rollback Warnings**
   - **Issue**: "Rolling back will lose N changes"
   - **Solution**: Review changes, create backup, proceed if safe

### Performance Optimization

1. **Large History Queries**
   ```typescript
   // Use pagination for large histories
   await versionHistoryTool.execute({
     workflowId: 'workflow-123',
     limit: 50,
     offset: 100,
     format: 'summary'  // Less data per version
   });
   ```

2. **Diff Generation**
   ```typescript
   // Use summary format for quick comparisons
   await versionDiffTool.execute({
     workflowId: 'workflow-123',
     fromVersionId: 'v1',
     toVersionId: 'v2',
     format: 'summary'  // Faster than 'detailed'
   });
   ```

### Debugging

Enable debug logging:

```typescript
// Set environment variable
process.env.VERSION_CONTROL_DEBUG = 'true';

// Or configure logger
Logger.setLevel('debug');
```

## API Reference

### Version Control Tools

#### version_create
Creates a new version of a workflow.

**Parameters:**
- `workflowId` (required): Workflow to version
- `message` (required): Commit message
- `author`: Version author
- `versionType`: 'major' | 'minor' | 'patch' | 'auto'
- `branch`: Target branch (default: 'main')
- `tags`: Array of tags
- `isSnapshot`: Create snapshot version

#### version_history
Retrieves workflow version history.

**Parameters:**
- `workflowId` (required): Workflow to query
- `branch`: Filter by branch
- `author`: Filter by author
- `since`/`until`: Time range filters
- `limit`: Max versions to return
- `offset`: Pagination offset
- `format`: 'detailed' | 'summary' | 'oneline'

#### branch_create
Creates a new branch for workflow development.

**Parameters:**
- `workflowId` (required): Workflow ID
- `branchName` (required): New branch name
- `fromBranch`: Source branch (default: 'main')
- `description`: Branch description
- `author`: Branch creator

#### branch_merge
Merges branches with conflict detection.

**Parameters:**
- `workflowId` (required): Workflow ID
- `sourceBranch` (required): Branch to merge from
- `targetBranch`: Branch to merge into (default: 'main')
- `message`: Merge commit message
- `strategy`: 'auto' | 'manual' | 'ours' | 'theirs'
- `deleteSourceBranch`: Delete after merge

#### version_rollback
Rolls back to a previous workflow version.

**Parameters:**
- `workflowId` (required): Workflow ID
- `targetVersionId` (required): Version to rollback to
- `message`: Rollback message
- `reason`: Detailed reason
- `createBackup`: Create backup before rollback
- `updateN8n`: Update workflow in n8n

#### version_diff
Generates diff between workflow versions.

**Parameters:**
- `workflowId` (required): Workflow ID
- `fromVersionId` (required): Starting version
- `toVersionId` (required): Ending version
- `format`: 'detailed' | 'summary' | 'patch'
- `includeContext`: Include surrounding context

### Response Formats

All tools return standardized JSON responses:

```typescript
{
  success: boolean,
  message?: string,
  error?: string,
  data: {
    // Tool-specific data
  }
}
```

## Conclusion

The version control system provides powerful Git-like functionality for n8n workflows, enabling teams to collaborate effectively, track changes, and maintain workflow integrity. By following the best practices outlined in this guide, teams can leverage version control to improve their workflow development process and maintain high-quality automation solutions.

For additional support or feature requests, please refer to the project's issue tracker or documentation.