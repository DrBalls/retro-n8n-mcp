# Getting Started with n8n MCP Server

Welcome to the n8n MCP Server! This guide will help you get up and running with our comprehensive Model Context Protocol server for n8n workflow automation.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Quick Start](#quick-start)
5. [Using with Claude Desktop](#using-with-claude-desktop)
6. [Basic Usage Examples](#basic-usage-examples)
7. [Next Steps](#next-steps)

## Prerequisites

Before you begin, ensure you have the following:

- **Node.js 18+** - The server requires Node.js version 18 or higher
- **n8n instance** - Either cloud-hosted or self-hosted n8n installation
- **n8n API Key** - Available with n8n paid plans (Pro, Team, or Enterprise)
- **Claude Desktop** (optional) - For using the MCP server with Claude

### Getting Your n8n API Key

1. Log into your n8n instance
2. Navigate to **Settings** → **API Settings**
3. Enable API access if not already enabled
4. Generate a new API key
5. Keep this key secure - you'll need it for configuration

## Installation

### Option 1: Using npm (Recommended)

```bash
npm install -g @retro/n8n-mcp-server
```

### Option 2: From Source

```bash
# Clone the repository
git clone https://github.com/DrBalls/retro-n8n-mcp.git
cd retro-n8n-mcp

# Install dependencies
npm install

# Build the project
npm run build
```

## Configuration

### Environment Variables

Create a `.env` file in your project root (or set system environment variables):

```bash
# Required
N8N_API_URL=https://your-n8n-instance.com
N8N_API_KEY=your-api-key-here

# Optional - For enhanced features
N8N_WS_URL=wss://your-n8n-instance.com  # For real-time monitoring
N8N_SSE_URL=https://your-n8n-instance.com/sse  # Alternative to WebSocket
CACHE_REDIS_URL=redis://localhost:6379  # For distributed caching
```

### Configuration File (Alternative)

You can also use a configuration file `n8n-mcp.config.json`:

```json
{
  "apiUrl": "https://your-n8n-instance.com",
  "apiKey": "your-api-key-here",
  "monitoring": {
    "protocol": "websocket",
    "wsUrl": "wss://your-n8n-instance.com"
  },
  "caching": {
    "enabled": true,
    "redis": {
      "url": "redis://localhost:6379"
    }
  }
}
```

## Quick Start

### Running the Server

If installed globally:
```bash
n8n-mcp-server
```

If running from source:
```bash
npm run dev  # Development mode with hot reload
# or
npm start    # Production mode
```

### Testing the Connection

Once the server is running, test your connection:

```bash
# Using the built-in test tool
n8n-mcp-server test-connection
```

You should see:
```
✓ Connected to n8n instance
✓ API key is valid
✓ Found 42 workflows
✓ Found 15 credentials
✓ Real-time monitoring: Available
```

## Using with Claude Desktop

### Setup

1. Open Claude Desktop settings
2. Navigate to the MCP Servers section
3. Add a new server configuration:

```json
{
  "mcpServers": {
    "n8n": {
      "command": "n8n-mcp-server",
      "env": {
        "N8N_API_URL": "https://your-n8n-instance.com",
        "N8N_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### Alternative Setup (Using npx)

```json
{
  "mcpServers": {
    "n8n": {
      "command": "npx",
      "args": ["@retro/n8n-mcp-server"],
      "env": {
        "N8N_API_URL": "https://your-n8n-instance.com",
        "N8N_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### Verifying Connection

In Claude, you can verify the connection by asking:
- "What n8n tools are available?"
- "List my n8n workflows"
- "Show me the server health status"

## Basic Usage Examples

### Example 1: List Your Workflows

```typescript
// Using the MCP tools directly
const workflows = await workflow_list({
  limit: 10,
  active: true
});

console.log(`Found ${workflows.count} active workflows`);
```

In Claude Desktop:
> "Show me my active workflows"

### Example 2: Create a Simple Workflow

```typescript
// Create a webhook-triggered workflow
const newWorkflow = await workflow_create({
  name: "My First MCP Workflow",
  nodes: [
    {
      id: "webhook",
      type: "n8n-nodes-base.webhook",
      position: [250, 300],
      parameters: {
        path: "my-webhook",
        responseMode: "onReceived",
        responseData: "allEntries"
      }
    },
    {
      id: "respondToWebhook",
      type: "n8n-nodes-base.respondToWebhook",
      position: [450, 300],
      parameters: {
        respondWith: "json",
        responseBody: '{"message": "Hello from MCP!"}'
      }
    }
  ],
  connections: {
    "webhook": {
      "main": [[{ "node": "respondToWebhook", "type": "main", "index": 0 }]]
    }
  }
});

console.log(`Created workflow: ${newWorkflow.id}`);
```

In Claude Desktop:
> "Create a simple webhook workflow that responds with a hello message"

### Example 3: Trigger Workflow Execution

```typescript
// Trigger a workflow with input data
const execution = await execution_trigger({
  workflowId: "workflow-123",
  data: {
    name: "John Doe",
    email: "john@example.com"
  }
});

// Monitor the execution
const status = await execution_monitor({
  executionId: execution.id
});

console.log(`Execution ${status.status}: ${status.id}`);
```

In Claude Desktop:
> "Run my 'Customer Onboarding' workflow with name 'John Doe' and email 'john@example.com'"

### Example 4: Version Control

```typescript
// Create a version before making changes
await version_create({
  workflowId: "workflow-123",
  message: "Before adding email notification",
  versionType: "minor"
});

// Make your changes...

// View version history
const history = await version_history({
  workflowId: "workflow-123",
  limit: 5
});

// Rollback if needed
await version_rollback({
  workflowId: "workflow-123",
  targetVersionId: "v1.2.0",
  reason: "Email node causing errors"
});
```

In Claude Desktop:
> "Create a version of my workflow before I make changes"
> "Show me the version history of my customer workflow"
> "Rollback to the previous version"

### Example 5: Debug Workflow Execution

```typescript
// Start a debug session
const session = await debug_start({
  workflowId: "workflow-123",
  breakpoints: ["EmailNode", "CustomerAPINode"]
});

// Step through execution
await debug_step({
  sessionId: session.id
});

// Inspect node data
const nodeData = await debug_inspect({
  sessionId: session.id,
  path: "EmailNode.inputData"
});

console.log("Node input:", nodeData);
```

In Claude Desktop:
> "Start debugging my workflow with breakpoints on the email and API nodes"
> "Step to the next node and show me the data"

## Available Tools

The n8n MCP Server provides 60+ tools organized into categories:

### Workflow Management
- `workflow_create` - Create new workflows
- `workflow_update` - Update existing workflows
- `workflow_delete` - Delete workflows
- `workflow_list` - List workflows with filtering
- `workflow_activate` - Activate workflows
- `workflow_deactivate` - Deactivate workflows

### Execution Control
- `execution_trigger` - Trigger workflow execution
- `execution_monitor` - Monitor execution progress
- `execution_stop` - Stop running execution
- `execution_get` - Get execution details
- `execution_list` - List execution history

### Version Control
- `version_create` - Create workflow versions
- `version_history` - View version history
- `version_diff` - Compare versions
- `version_rollback` - Rollback to previous version
- `branch_create` - Create development branches
- `branch_merge` - Merge branches

### And many more...
See the [Tool Reference](./tool-reference.md) for a complete list.

## Next Steps

Now that you have the basics:

1. **Explore Advanced Features**
   - [Version Control Guide](./version-control-guide.md) - Learn Git-like workflow management
   - [Workflow Patterns](./version-control-workflow-patterns.md) - Best practices for team collaboration
   - [Interactive Debugging](./debugging-guide.md) - Step through workflow executions

2. **Check the API Documentation**
   - [API Reference](./api/README.md) - Complete TypeScript API documentation
   - [Tool Reference](./tool-reference.md) - Detailed tool descriptions and examples

3. **Try Interactive Examples**
   - [Examples Repository](https://github.com/DrBalls/n8n-mcp-examples) - Ready-to-use workflow templates
   - [Video Tutorials](https://youtube.com/playlist?example) - Step-by-step video guides

4. **Join the Community**
   - [Discord Server](https://discord.gg/example) - Get help and share workflows
   - [GitHub Discussions](https://github.com/DrBalls/retro-n8n-mcp/discussions) - Feature requests and Q&A

## Troubleshooting

### Common Issues

**Connection Failed**
- Verify your n8n instance URL (include https://)
- Check your API key is valid and has proper permissions
- Ensure your n8n instance has API access enabled

**Tools Not Available in Claude**
- Restart Claude Desktop after configuration changes
- Check the MCP server logs: `~/.claude/logs/mcp-n8n.log`
- Verify environment variables are set correctly

**Workflow Execution Errors**
- Check workflow activation status
- Verify required credentials are configured
- Review execution logs for detailed error messages

For more help, see the [Troubleshooting Guide](./troubleshooting.md).

## Support

- **Documentation**: [docs.n8n-mcp.dev](https://docs.n8n-mcp.dev)
- **Issues**: [GitHub Issues](https://github.com/DrBalls/retro-n8n-mcp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/DrBalls/retro-n8n-mcp/discussions)
- **Email**: support@n8n-mcp.dev

---

Happy automating! 🚀