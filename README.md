# n8n MCP Server

A comprehensive MCP (Model Context Protocol) server for n8n workflow automation.

## Installation

```bash
npm install @retro/n8n-mcp-server
```

## Configuration

Create a `.env` file based on `.env.example`:

```env
N8N_API_URL=https://your-n8n-instance.com
N8N_API_KEY=your-api-key-here
```

## Usage

### As an MCP Server

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "n8n": {
      "command": "node",
      "args": ["node_modules/@retro/n8n-mcp-server/dist/index.js"],
      "env": {
        "N8N_API_URL": "https://your-n8n-instance.com",
        "N8N_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### Available Tools

The server provides 63 tools across these categories:
- **Workflow Management**: Create, update, delete, activate workflows
- **Execution Control**: Trigger, monitor, stop executions
- **Credential Management**: Secure credential handling
- **Debugging**: Interactive workflow debugging
- **Batch Operations**: Manage multiple workflows at once
- **Version Control**: Git-like version control for workflows
- **Visualization**: Generate workflow diagrams
- **Real-time Monitoring**: Live execution tracking

## Documentation

Full API documentation is available in the `docs/` directory.

## License

MIT License - see LICENSE file for details.
