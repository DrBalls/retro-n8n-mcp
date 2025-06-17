# Basic Usage Examples

## Getting Started

Once you have configured the n8n MCP server in Claude Desktop, you can start using it immediately.

## Common Operations

### 1. List All Workflows
```
User: Show me all my workflows

// Or with filters
User: List only active workflows
User: Show workflows created in the last week
```

### 2. Create a Simple Workflow
```
User: Create a workflow that checks my website every hour and sends me an email if it's down
```

### 3. Monitor Executions
```
User: Show me the last 10 executions of my "Daily Report" workflow
User: Monitor workflow wf_123 in real-time
```

### 4. Debug a Workflow
```
User: Start debugging my "API Integration" workflow
User: Set a breakpoint at the HTTP Request node
User: Inspect the variables at this breakpoint
```

### 5. Batch Operations
```
User: Deactivate all workflows tagged with "development"
User: Create backups of all production workflows
```

## Advanced Examples

### Version Control
```
User: Create a version of my "Customer Onboarding" workflow before I make changes
User: Show me the version history of workflow wf_456
User: Rollback workflow wf_789 to yesterday's version
```

### Performance Monitoring
```
User: Show me performance metrics for my most active workflows
User: Which workflows are consuming the most resources?
User: Alert me if any workflow takes longer than 5 minutes to execute
```

### Credential Management
```
User: List all my API credentials
User: Test if my Slack credential is still working
User: Update my database connection password
```

## Tips

1. **Be specific with IDs**: When referencing workflows or executions, use their IDs for precision
2. **Use filters**: Many tools support filtering - use them to narrow down results
3. **Chain operations**: You can ask to perform multiple operations in sequence
4. **Check status first**: Before making changes, check the current status of workflows

## Error Handling

If you encounter errors:

1. **Check connection**: Ask "Test the n8n connection"
2. **Verify permissions**: Ensure your API key has the necessary permissions
3. **Check rate limits**: You might be hitting rate limits if making many requests

## Need Help?

- Ask: "What tools are available?"
- Ask: "Show me how to use the [tool_name] tool"
- Ask: "What parameters does [tool_name] accept?"