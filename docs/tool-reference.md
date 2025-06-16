# n8n MCP Server Tool Reference

This document provides a comprehensive reference for all available tools in the n8n MCP Server. Tools are organized by category for easy navigation.

## Table of Contents

1. [Workflow Management](#workflow-management)
2. [Execution Control](#execution-control)
3. [Credential Management](#credential-management)
4. [Version Control](#version-control)
5. [Batch Operations](#batch-operations)
6. [Debugging Tools](#debugging-tools)
7. [Monitoring Tools](#monitoring-tools)
8. [Visualization Tools](#visualization-tools)
9. [System Tools](#system-tools)

## Tool Categories Overview

| Category | Tool Count | Description |
|----------|------------|-------------|
| Workflow | 7 | Create, manage, and control workflows |
| Execution | 6 | Trigger and monitor workflow executions |
| Credential | 6 | Manage workflow credentials securely |
| Version Control | 6 | Git-like version control for workflows |
| Batch | 6 | Bulk operations on multiple workflows |
| Debug | 11 | Interactive debugging capabilities |
| Monitoring | 2 | Real-time monitoring and metrics |
| Visualization | 3 | Generate diagrams and visualizations |
| System | 2 | Server health and connectivity |

## Workflow Management

### workflow_create
Create a new workflow in n8n.

**Parameters:**
- `name` (string, required): Workflow name
- `nodes` (array, required): Array of node definitions
- `connections` (object, required): Node connections
- `settings` (object, optional): Workflow settings
- `active` (boolean, optional): Activate on creation
- `tags` (array, optional): Workflow tags

**Example:**
```typescript
await workflow_create({
  name: "Email Automation",
  nodes: [
    {
      id: "trigger",
      type: "n8n-nodes-base.cronTrigger",
      position: [250, 300],
      parameters: {
        triggerTimes: { item: [{ hour: 9 }] }
      }
    }
  ],
  connections: {},
  active: true
});
```

### workflow_update
Update an existing workflow.

**Parameters:**
- `id` (string, required): Workflow ID
- `name` (string, optional): New name
- `nodes` (array, optional): Updated nodes
- `connections` (object, optional): Updated connections
- `settings` (object, optional): Updated settings
- `active` (boolean, optional): Activation status

**Example:**
```typescript
await workflow_update({
  id: "workflow-123",
  name: "Updated Email Automation",
  active: false
});
```

### workflow_delete
Delete a workflow permanently.

**Parameters:**
- `id` (string, required): Workflow ID

**Example:**
```typescript
await workflow_delete({
  id: "workflow-123"
});
```

### workflow_list
List workflows with filtering options.

**Parameters:**
- `limit` (number, optional): Maximum results (default: 100)
- `offset` (number, optional): Pagination offset
- `active` (boolean, optional): Filter by activation status
- `tags` (array, optional): Filter by tags
- `search` (string, optional): Search in names

**Example:**
```typescript
const workflows = await workflow_list({
  limit: 20,
  active: true,
  tags: ["production"]
});
```

### workflow_get
Get detailed information about a specific workflow.

**Parameters:**
- `id` (string, required): Workflow ID

**Example:**
```typescript
const workflow = await workflow_get({
  id: "workflow-123"
});
```

### workflow_activate
Activate a workflow to enable execution.

**Parameters:**
- `id` (string, required): Workflow ID

**Example:**
```typescript
await workflow_activate({
  id: "workflow-123"
});
```

### workflow_deactivate
Deactivate a workflow to disable execution.

**Parameters:**
- `id` (string, required): Workflow ID

**Example:**
```typescript
await workflow_deactivate({
  id: "workflow-123"
});
```

## Execution Control

### execution_trigger
Trigger a workflow execution with optional input data.

**Parameters:**
- `workflowId` (string, required): Workflow to execute
- `data` (object, optional): Input data for the workflow
- `mode` (string, optional): Execution mode ('manual', 'trigger')

**Example:**
```typescript
const execution = await execution_trigger({
  workflowId: "workflow-123",
  data: {
    customerEmail: "john@example.com",
    orderNumber: "ORD-12345"
  }
});
```

### execution_monitor
Monitor a running execution for real-time updates.

**Parameters:**
- `executionId` (string, required): Execution ID to monitor
- `pollInterval` (number, optional): Update interval in ms

**Example:**
```typescript
const status = await execution_monitor({
  executionId: "exec-456",
  pollInterval: 1000
});
```

### execution_stop
Stop a running execution.

**Parameters:**
- `executionId` (string, required): Execution ID to stop

**Example:**
```typescript
await execution_stop({
  executionId: "exec-456"
});
```

### execution_get
Get detailed information about an execution.

**Parameters:**
- `executionId` (string, required): Execution ID
- `includeData` (boolean, optional): Include execution data

**Example:**
```typescript
const execution = await execution_get({
  executionId: "exec-456",
  includeData: true
});
```

### execution_list
List execution history with filtering.

**Parameters:**
- `workflowId` (string, optional): Filter by workflow
- `status` (string, optional): Filter by status
- `limit` (number, optional): Maximum results
- `offset` (number, optional): Pagination offset

**Example:**
```typescript
const executions = await execution_list({
  workflowId: "workflow-123",
  status: "error",
  limit: 10
});
```

### execution_replay
Replay a previous execution with the same data.

**Parameters:**
- `executionId` (string, required): Execution to replay

**Example:**
```typescript
const newExecution = await execution_replay({
  executionId: "exec-456"
});
```

## Credential Management

### credential_create
Create new credentials for integrations.

**Parameters:**
- `name` (string, required): Credential name
- `type` (string, required): Credential type (e.g., 'slackApi')
- `data` (object, required): Credential data (encrypted)
- `nodesAccess` (array, optional): Nodes with access

**Example:**
```typescript
await credential_create({
  name: "Slack API Key",
  type: "slackApi",
  data: {
    accessToken: "xoxb-your-token"
  }
});
```

### credential_update
Update existing credentials.

**Parameters:**
- `id` (string, required): Credential ID
- `name` (string, optional): New name
- `data` (object, optional): Updated credential data
- `nodesAccess` (array, optional): Updated access list

**Example:**
```typescript
await credential_update({
  id: "cred-123",
  data: {
    accessToken: "xoxb-new-token"
  }
});
```

### credential_delete
Delete credentials.

**Parameters:**
- `id` (string, required): Credential ID

**Example:**
```typescript
await credential_delete({
  id: "cred-123"
});
```

### credential_get
Get credential details (without sensitive data).

**Parameters:**
- `id` (string, required): Credential ID

**Example:**
```typescript
const credential = await credential_get({
  id: "cred-123"
});
```

### credential_list
List available credentials.

**Parameters:**
- `type` (string, optional): Filter by credential type
- `limit` (number, optional): Maximum results
- `offset` (number, optional): Pagination offset

**Example:**
```typescript
const credentials = await credential_list({
  type: "slackApi",
  limit: 20
});
```

### credential_test
Test if credentials are valid.

**Parameters:**
- `id` (string, required): Credential ID to test

**Example:**
```typescript
const result = await credential_test({
  id: "cred-123"
});
// Returns: { valid: true/false, error?: string }
```

## Version Control

### version_create
Create a new version of a workflow.

**Parameters:**
- `workflowId` (string, required): Workflow ID
- `message` (string, required): Version message
- `versionType` (string, optional): 'major', 'minor', 'patch', 'auto'
- `branch` (string, optional): Branch name (default: 'main')
- `tags` (array, optional): Version tags

**Example:**
```typescript
await version_create({
  workflowId: "workflow-123",
  message: "Add error handling to email node",
  versionType: "minor",
  tags: ["stable", "production"]
});
```

### version_history
View version history for a workflow.

**Parameters:**
- `workflowId` (string, required): Workflow ID
- `branch` (string, optional): Filter by branch
- `limit` (number, optional): Maximum results
- `format` (string, optional): 'full', 'summary', 'oneline'

**Example:**
```typescript
const history = await version_history({
  workflowId: "workflow-123",
  branch: "main",
  limit: 10,
  format: "summary"
});
```

### version_diff
Compare two workflow versions.

**Parameters:**
- `workflowId` (string, required): Workflow ID
- `fromVersionId` (string, required): Source version
- `toVersionId` (string, required): Target version
- `format` (string, optional): 'json', 'text', 'detailed'

**Example:**
```typescript
const diff = await version_diff({
  workflowId: "workflow-123",
  fromVersionId: "v1.0.0",
  toVersionId: "v1.1.0",
  format: "detailed"
});
```

### version_rollback
Rollback to a previous version.

**Parameters:**
- `workflowId` (string, required): Workflow ID
- `targetVersionId` (string, required): Version to rollback to
- `reason` (string, required): Rollback reason
- `createBackup` (boolean, optional): Backup current version

**Example:**
```typescript
await version_rollback({
  workflowId: "workflow-123",
  targetVersionId: "v1.0.0",
  reason: "v1.1.0 causing data loss",
  createBackup: true
});
```

### branch_create
Create a development branch.

**Parameters:**
- `workflowId` (string, required): Workflow ID
- `branchName` (string, required): Branch name
- `fromBranch` (string, optional): Source branch
- `description` (string, optional): Branch description

**Example:**
```typescript
await branch_create({
  workflowId: "workflow-123",
  branchName: "feature/add-validation",
  fromBranch: "main",
  description: "Add input validation"
});
```

### branch_merge
Merge branches with conflict detection.

**Parameters:**
- `workflowId` (string, required): Workflow ID
- `sourceBranch` (string, required): Branch to merge from
- `targetBranch` (string, required): Branch to merge into
- `strategy` (string, optional): 'auto', 'manual', 'ours', 'theirs'
- `message` (string, optional): Merge commit message

**Example:**
```typescript
const result = await branch_merge({
  workflowId: "workflow-123",
  sourceBranch: "feature/add-validation",
  targetBranch: "main",
  strategy: "auto",
  message: "Merge validation feature"
});
```

## Batch Operations

### batch_workflows_create
Create multiple workflows at once.

**Parameters:**
- `workflows` (array, required): Array of workflow definitions
- `atomic` (boolean, optional): All-or-nothing execution

**Example:**
```typescript
await batch_workflows_create({
  workflows: [
    { name: "Workflow 1", nodes: [...], connections: {...} },
    { name: "Workflow 2", nodes: [...], connections: {...} }
  ],
  atomic: true
});
```

### batch_workflows_update
Update multiple workflows simultaneously.

**Parameters:**
- `updates` (array, required): Array of update operations
- `atomic` (boolean, optional): All-or-nothing execution

**Example:**
```typescript
await batch_workflows_update({
  updates: [
    { id: "wf-1", active: false },
    { id: "wf-2", name: "Updated Name" }
  ],
  atomic: true
});
```

### batch_workflows_delete
Delete multiple workflows.

**Parameters:**
- `workflowIds` (array, required): Workflow IDs to delete
- `force` (boolean, optional): Skip confirmation

**Example:**
```typescript
await batch_workflows_delete({
  workflowIds: ["wf-1", "wf-2", "wf-3"],
  force: true
});
```

### batch_workflows_activate
Activate multiple workflows.

**Parameters:**
- `workflowIds` (array, required): Workflow IDs to activate

**Example:**
```typescript
await batch_workflows_activate({
  workflowIds: ["wf-1", "wf-2", "wf-3"]
});
```

### batch_workflows_deactivate
Deactivate multiple workflows.

**Parameters:**
- `workflowIds` (array, required): Workflow IDs to deactivate

**Example:**
```typescript
await batch_workflows_deactivate({
  workflowIds: ["wf-1", "wf-2", "wf-3"]
});
```

### batch_operation_status
Check status of batch operations.

**Parameters:**
- `operationId` (string, required): Batch operation ID

**Example:**
```typescript
const status = await batch_operation_status({
  operationId: "batch-op-123"
});
```

## Debugging Tools

### debug_start
Start a debugging session for a workflow.

**Parameters:**
- `workflowId` (string, required): Workflow to debug
- `breakpoints` (array, optional): Node IDs for breakpoints
- `watchExpressions` (array, optional): Data paths to watch

**Example:**
```typescript
const session = await debug_start({
  workflowId: "workflow-123",
  breakpoints: ["EmailNode", "APINode"],
  watchExpressions: ["$input.customerEmail"]
});
```

### debug_step
Step to the next node in debug session.

**Parameters:**
- `sessionId` (string, required): Debug session ID

**Example:**
```typescript
await debug_step({
  sessionId: "debug-session-456"
});
```

### debug_resume
Resume execution until next breakpoint.

**Parameters:**
- `sessionId` (string, required): Debug session ID

**Example:**
```typescript
await debug_resume({
  sessionId: "debug-session-456"
});
```

### debug_pause
Pause execution at current node.

**Parameters:**
- `sessionId` (string, required): Debug session ID

**Example:**
```typescript
await debug_pause({
  sessionId: "debug-session-456"
});
```

### debug_stop
Stop debugging session.

**Parameters:**
- `sessionId` (string, required): Debug session ID

**Example:**
```typescript
await debug_stop({
  sessionId: "debug-session-456"
});
```

### debug_inspect
Inspect data at current execution point.

**Parameters:**
- `sessionId` (string, required): Debug session ID
- `path` (string, optional): Data path to inspect
- `nodeId` (string, optional): Specific node to inspect

**Example:**
```typescript
const data = await debug_inspect({
  sessionId: "debug-session-456",
  path: "EmailNode.inputData",
  nodeId: "EmailNode"
});
```

### debug_breakpoint
Manage breakpoints during debugging.

**Parameters:**
- `sessionId` (string, required): Debug session ID
- `action` (string, required): 'add', 'remove', 'toggle', 'list'
- `nodeId` (string, optional): Node ID for breakpoint
- `condition` (string, optional): Conditional expression

**Example:**
```typescript
await debug_breakpoint({
  sessionId: "debug-session-456",
  action: "add",
  nodeId: "APINode",
  condition: "statusCode !== 200"
});
```

### debug_watch
Manage watch expressions.

**Parameters:**
- `sessionId` (string, required): Debug session ID
- `action` (string, required): 'add', 'remove', 'list'
- `expression` (string, optional): Expression to watch

**Example:**
```typescript
await debug_watch({
  sessionId: "debug-session-456",
  action: "add",
  expression: "$json.customer.email"
});
```

### debug_status
Get current debug session status.

**Parameters:**
- `sessionId` (string, required): Debug session ID

**Example:**
```typescript
const status = await debug_status({
  sessionId: "debug-session-456"
});
```

### debug_timeline
View execution timeline.

**Parameters:**
- `sessionId` (string, required): Debug session ID
- `format` (string, optional): 'text', 'mermaid', 'json'

**Example:**
```typescript
const timeline = await debug_timeline({
  sessionId: "debug-session-456",
  format: "mermaid"
});
```

### debug_history
View debug session history.

**Parameters:**
- `sessionId` (string, required): Debug session ID
- `limit` (number, optional): Maximum entries

**Example:**
```typescript
const history = await debug_history({
  sessionId: "debug-session-456",
  limit: 20
});
```

## Monitoring Tools

### monitor_execution_realtime
Monitor executions in real-time.

**Parameters:**
- `workflowId` (string, optional): Filter by workflow
- `protocol` (string, optional): 'websocket', 'sse', 'polling'

**Example:**
```typescript
const monitor = await monitor_execution_realtime({
  workflowId: "workflow-123",
  protocol: "websocket"
});

// Returns a subscription that emits execution updates
```

### monitor_workflow_metrics
Get workflow performance metrics.

**Parameters:**
- `workflowId` (string, required): Workflow ID
- `timeRange` (string, optional): '1h', '24h', '7d', '30d'
- `metrics` (array, optional): Specific metrics to include

**Example:**
```typescript
const metrics = await monitor_workflow_metrics({
  workflowId: "workflow-123",
  timeRange: "24h",
  metrics: ["executionTime", "successRate", "errorRate"]
});
```

## Visualization Tools

### visualization_mermaid
Generate Mermaid diagram of workflow.

**Parameters:**
- `workflowId` (string, required): Workflow ID
- `theme` (string, optional): 'default', 'dark', 'forest'
- `showParameters` (boolean, optional): Include node parameters
- `showCredentials` (boolean, optional): Show credential usage

**Example:**
```typescript
const diagram = await visualization_mermaid({
  workflowId: "workflow-123",
  theme: "dark",
  showParameters: true
});
```

### visualization_dependency_graph
Generate dependency graph showing workflow relationships.

**Parameters:**
- `workflowId` (string, required): Workflow ID
- `format` (string, optional): 'json', 'dot', 'mermaid'
- `depth` (number, optional): Dependency depth to explore

**Example:**
```typescript
const graph = await visualization_dependency_graph({
  workflowId: "workflow-123",
  format: "mermaid",
  depth: 2
});
```

### visualization_workflow_map
Create interactive workflow map.

**Parameters:**
- `workflowId` (string, required): Workflow ID
- `format` (string, optional): 'json', 'html', 'svg'
- `includeMetrics` (boolean, optional): Add performance data

**Example:**
```typescript
const map = await visualization_workflow_map({
  workflowId: "workflow-123",
  format: "html",
  includeMetrics: true
});
```

## System Tools

### system_health
Check server and n8n instance health.

**Parameters:** None

**Example:**
```typescript
const health = await system_health();
// Returns server status, n8n version, API status, etc.
```

### system_test_connection
Test connection to n8n instance.

**Parameters:** None

**Example:**
```typescript
const result = await system_test_connection();
// Returns connection status and diagnostics
```

## Error Handling

All tools follow consistent error handling patterns:

```typescript
try {
  const result = await workflow_create({
    name: "My Workflow",
    // ... other parameters
  });
} catch (error) {
  if (error.code === 'VALIDATION_ERROR') {
    // Handle validation errors
    console.error('Invalid parameters:', error.details);
  } else if (error.code === 'AUTH_ERROR') {
    // Handle authentication errors
    console.error('Authentication failed:', error.message);
  } else if (error.code === 'RATE_LIMIT') {
    // Handle rate limiting
    console.error('Rate limited, retry after:', error.retryAfter);
  } else {
    // Handle other errors
    console.error('Unexpected error:', error);
  }
}
```

## Common Error Codes

| Code | Description | Resolution |
|------|-------------|------------|
| `VALIDATION_ERROR` | Invalid input parameters | Check parameter requirements |
| `AUTH_ERROR` | Authentication failed | Verify API key |
| `NOT_FOUND` | Resource not found | Check resource ID |
| `RATE_LIMIT` | API rate limit exceeded | Wait and retry |
| `CONFLICT` | Resource conflict | Resolve conflicts |
| `SERVER_ERROR` | Server-side error | Contact support |

## Best Practices

1. **Error Handling**: Always wrap tool calls in try-catch blocks
2. **Pagination**: Use limit/offset for large result sets
3. **Filtering**: Use filters to reduce data transfer
4. **Batch Operations**: Use batch tools for multiple operations
5. **Version Control**: Create versions before major changes
6. **Monitoring**: Use real-time monitoring for critical workflows
7. **Debugging**: Use debug tools to troubleshoot issues

## Performance Tips

1. **Caching**: Results are cached automatically where appropriate
2. **Batch Operations**: More efficient than individual operations
3. **Filtering**: Filter at the API level, not in your code
4. **Pagination**: Don't request more data than needed
5. **Real-time**: Use WebSocket for real-time updates when available

---

For more detailed API documentation, see the [TypeScript API Reference](./api/README.md).