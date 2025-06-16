# n8n MCP Server

A comprehensive Model Context Protocol (MCP) server for n8n that provides full access to n8n's workflow automation capabilities.

## Features

- **Full n8n API Coverage**: Access all n8n endpoints through MCP tools
- **Workflow Management**: Create, read, update, delete, and manage workflows
- **Execution Control**: Trigger, monitor, and control workflow executions
- **Credential Management**: Secure handling of credentials for 400+ integrations
- **Real-time Monitoring**: WebSocket/SSE support for live updates
- **Interactive Debugging**: Step-through execution with breakpoints
- **AI-Powered Features**: Natural language workflow generation and optimization
- **Comprehensive Monitoring**: Metrics, health checks, analytics, alerts, SLOs, and distributed tracing
- **Dashboard APIs**: Build custom monitoring dashboards with real-time data

## Installation

```bash
npm install @retro/n8n-mcp-server
```

## Configuration

Create a `.env` file with your n8n configuration:

```env
N8N_API_URL=https://your-n8n-instance.com
N8N_API_KEY=your-api-key
```

## Usage

### With Claude Desktop

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "n8n": {
      "command": "npx",
      "args": ["@retro/n8n-mcp-server"]
    }
  }
}
```

### Programmatic Usage

```typescript
import { N8nMcpServer } from '@retro/n8n-mcp-server';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new N8nMcpServer();
const transport = new StdioServerTransport();

await server.connect(transport);
```

## Available Tools

### Workflow Management
- `workflow_create` - Create new workflows
- `workflow_update` - Update existing workflows
- `workflow_delete` - Delete workflows
- `workflow_list` - List workflows with filtering
- `workflow_activate` - Activate workflows
- `workflow_deactivate` - Deactivate workflows

### Execution Management
- `execution_trigger` - Trigger workflow execution
- `execution_monitor` - Monitor execution progress
- `execution_stop` - Stop running execution
- `execution_get` - Get execution details
- `execution_list` - List execution history

### Credential Management
- `credential_create` - Create credentials
- `credential_update` - Update credentials
- `credential_delete` - Delete credentials
- `credential_test` - Test credential validity
- `credential_list` - List available credentials

### Version Control (NEW)
- `version_create` - Create workflow versions with semantic versioning
- `version_history` - View workflow version history
- `version_diff` - Compare workflow versions
- `version_rollback` - Rollback to previous versions
- `branch_create` - Create development branches
- `branch_merge` - Merge branches with conflict detection

### Batch Operations
- `batch_workflows_create` - Create multiple workflows
- `batch_workflows_update` - Update multiple workflows
- `batch_workflows_delete` - Delete multiple workflows
- `batch_operation_status` - Check batch operation status

### Monitoring & Analytics (NEW)
- `monitoring_overview` - Get comprehensive system status
- `metrics_query` - Query performance metrics
- `health_status` - Check system and dependency health
- `analytics_query` - Query usage analytics and insights
- `alert_status` - Manage alerts and notifications
- `slo_status` - Track service level objectives

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Architecture

The server follows a modular architecture:

- `src/server/` - Core MCP server implementation
- `src/tools/` - Individual tool implementations
- `src/services/` - Business logic and n8n API integration
- `src/utils/` - Utility functions
- `src/types/` - TypeScript type definitions

## Documentation

### Getting Started
- [Getting Started Guide](docs/getting-started.md) - Quick start guide for new users
- [Tool Reference](docs/tool-reference.md) - Complete reference for all 60+ tools
- [Monitoring Guide](docs/monitoring-guide.md) - Comprehensive monitoring and analytics guide

### API Documentation
- [TypeScript API Reference](docs/api/README.md) - Auto-generated API documentation
- [Architecture Overview](docs/architecture.md) - System architecture and design decisions
- [Module Reference](docs/api/modules.md) - Detailed module documentation

### Feature Guides
- [Version Control Guide](docs/version-control-guide.md) - Comprehensive guide to Git-like version control
- [Version Control Quick Reference](docs/version-control-quick-reference.md) - Quick command reference
- [Workflow Patterns](docs/version-control-workflow-patterns.md) - Common development patterns

### Advanced Topics
- [Test Coverage Plan](docs/test-coverage-plan.md) - Testing strategy and coverage goals
- [Troubleshooting Guide](docs/troubleshooting.md) - Common issues and solutions

### Examples
- [Interactive Examples](examples/) - Ready-to-run code examples
- [Hello World](examples/hello-world.ts) - Your first n8n workflow
- [Version Control Demo](examples/version-control-basics.ts) - Learn version control

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our repository.

## License

MIT License - see LICENSE file for details