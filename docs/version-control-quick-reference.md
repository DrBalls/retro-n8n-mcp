# Version Control Quick Reference

## Essential Commands

### Create Version
```typescript
// Basic version
version_create --workflowId "wf-123" --message "Fix webhook timeout"

// With version type
version_create --workflowId "wf-123" --message "Add email node" --versionType "minor"

// With tags
version_create --workflowId "wf-123" --message "Release v2.0" --tags "release,v2.0"
```

### View History
```typescript
// Basic history
version_history --workflowId "wf-123"

// Filtered by branch
version_history --workflowId "wf-123" --branch "feature/oauth"

// One-line format
version_history --workflowId "wf-123" --format "oneline" --limit 10
```

### Branch Operations
```typescript
// Create branch
branch_create --workflowId "wf-123" --branchName "feature/error-handling"

// Merge branch
branch_merge --workflowId "wf-123" --sourceBranch "feature/error-handling" --targetBranch "main"

// List branches
branch_list --workflowId "wf-123"
```

### Compare Versions
```typescript
// Basic diff
version_diff --workflowId "wf-123" --fromVersionId "v1" --toVersionId "v2"

// Detailed with context
version_diff --workflowId "wf-123" --fromVersionId "v1" --toVersionId "v2" --format "detailed" --includeContext
```

### Rollback
```typescript
// Safe rollback with backup
version_rollback --workflowId "wf-123" --targetVersionId "stable-version" --createBackup --reason "Performance issues"
```

## Common Patterns

### Feature Development
```bash
1. branch_create --workflowId "wf-123" --branchName "feature/new-integration"
2. # Make changes in n8n
3. version_create --workflowId "wf-123" --branch "feature/new-integration" --message "Add integration nodes"
4. # Test thoroughly
5. branch_merge --workflowId "wf-123" --sourceBranch "feature/new-integration" --targetBranch "main"
```

### Emergency Hotfix
```bash
1. branch_create --workflowId "wf-123" --branchName "hotfix/critical-bug" --fromBranch "main"
2. # Fix issue in n8n
3. version_create --workflowId "wf-123" --branch "hotfix/critical-bug" --message "Fix data loss bug" --versionType "patch"
4. branch_merge --workflowId "wf-123" --sourceBranch "hotfix/critical-bug" --targetBranch "main" --priority "high"
```

### Review Changes
```bash
1. version_history --workflowId "wf-123" --limit 5 --format "summary"
2. version_diff --workflowId "wf-123" --fromVersionId "yesterday" --toVersionId "today"
3. # If issues found
4. version_rollback --workflowId "wf-123" --targetVersionId "yesterday" --createBackup
```

## Version Types

| Change Type | Version Increment | Example |
|------------|------------------|---------|
| Bug fixes | Patch (0.0.X) | Fix timeout issue |
| New features | Minor (0.X.0) | Add email notifications |
| Breaking changes | Major (X.0.0) | Restructure workflow |
| Auto | System decides | Based on change analysis |

## Branch Naming

| Type | Pattern | Example |
|------|---------|---------|
| Feature | feature/description | feature/oauth-integration |
| Hotfix | hotfix/issue | hotfix/memory-leak |
| Release | release/version | release/2.0.0 |
| Experiment | experiment/name | experiment/ml-nodes |

## Merge Strategies

| Strategy | Use Case | Behavior |
|----------|----------|----------|
| auto | Most merges | Auto-resolve simple conflicts |
| manual | Complex merges | Require explicit conflict resolution |
| ours | Preserve target | Keep target branch changes |
| theirs | Accept source | Take all source branch changes |

## Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| success | Operation completed | Continue |
| conflicts | Merge conflicts detected | Resolve manually |
| error | Operation failed | Check error message |
| warning | Proceed with caution | Review warnings |

## Tips

1. **Always use descriptive commit messages**
2. **Tag important versions** (releases, milestones)
3. **Create backups before major operations**
4. **Test on feature branches before merging**
5. **Review diffs before rollback**
6. **Use semantic versioning consistently**
7. **Delete merged branches to keep clean**
8. **Document rollback reasons**

## Emergency Commands

```bash
# Quick rollback to last known good
version_rollback --workflowId "wf-123" --targetVersionId "last-stable" --createBackup --updateN8n

# Find recent changes
version_history --workflowId "wf-123" --since "1 hour ago" --includeChanges

# Compare with production
version_diff --workflowId "wf-123" --fromVersionId "production" --toVersionId "HEAD"
```