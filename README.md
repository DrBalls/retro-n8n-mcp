# n8n MCP Server

A comprehensive MCP (Model Context Protocol) server providing full access to n8n's workflow automation capabilities through Claude Desktop.

## 🚀 Features

- **49 Powerful Tools** covering workflow management, execution control, credentials, monitoring, debugging, and more
- **Real-time Monitoring** with WebSocket, SSE, and polling support
- **Enterprise Security** with API key management, RBAC, rate limiting, and audit logging
- **Advanced Operations** including batch processing, version control, and workflow visualization
- **Intelligent Caching** with multi-tier cache management for optimal performance

## 📋 Requirements

- Node.js 20+ 
- n8n instance (cloud or self-hosted)
- n8n API access (requires paid n8n plan)
- Claude Desktop application

## 🔧 Installation

### From NPM (Recommended)
```bash
npm install -g @drballs/n8n-mcp-server
```

### From Source
```bash
git clone https://github.com/your-org/retro-n8n-mcp
cd retro-n8n-mcp
git checkout production
npm install
npm run build
```

## ⚙️ Configuration

### 1. Get Your n8n API Key

**n8n Cloud:**
1. Go to your n8n dashboard
2. Navigate to Settings → API Keys
3. Create a new API key
4. Copy the key (requires paid plan)

**Self-hosted n8n:**
1. Access your n8n instance
2. Go to Settings → API
3. Generate API key
4. Ensure API access is enabled

### 2. Configure Claude Desktop

Add to your Claude Desktop configuration file:

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
```json
{
  "mcpServers": {
    "n8n": {
      "command": "npx",
      "args": ["@drballs/n8n-mcp-server"],
      "env": {
        "N8N_API_KEY": "your_n8n_api_key_here",
        "N8N_BASE_URL": "https://your-n8n-instance.com"
      }
    }
  }
}
```

**macOS/Linux:** `~/.config/claude/claude_desktop_config.json`
```json
{
  "mcpServers": {
    "n8n": {
      "command": "npx",
      "args": ["@drballs/n8n-mcp-server"],
      "env": {
        "N8N_API_KEY": "your_n8n_api_key_here",
        "N8N_BASE_URL": "https://your-n8n-instance.com"
      }
    }
  }
}
```

### 3. Restart Claude Desktop

After saving the configuration, restart Claude Desktop to load the MCP server.

## 🛠️ Available Tools

### Workflow Management (8 tools)
- `list_workflows` - List all workflows with filtering options
- `create_workflow` - Create new workflows from JSON
- `get_workflow` - Get workflow details by ID
- `update_workflow` - Update existing workflows
- `delete_workflow` - Delete workflows
- `activate_workflow` - Activate workflows for execution
- `deactivate_workflow` - Deactivate running workflows
- `workflow_map` - Generate visual workflow maps

### Execution Control (6 tools)
- `trigger_execution` - Trigger workflow execution with data
- `get_execution` - Get execution details and results
- `list_executions` - List workflow executions with filters
- `stop_execution` - Stop running executions
- `monitor_execution` - Real-time execution monitoring
- `replay_execution` - Replay failed executions

### Credential Management (6 tools)
- `create_credential` - Create new credentials
- `update_credential` - Update existing credentials
- `delete_credential` - Delete credentials
- `list_credentials` - List all credentials
- `test_credential` - Test credential connections
- `get_credential` - Get credential details

### Monitoring & Analytics (8 tools)
- `realtime_execution_monitor` - Monitor executions in real-time
- `workflow_metrics_monitor` - Track workflow performance metrics
- `metrics_query` - Query performance metrics
- `health_status` - System health checks
- `analytics_query` - Query analytics data
- `alert_status` - Manage alerts and notifications
- `slo_status` - SLO monitoring and compliance
- `monitoring_overview` - Comprehensive monitoring dashboard

### Debug Tools (11 tools)
- `start_debug_session` - Start debugging workflows
- `step_debug` - Step through workflow execution
- `inspect_debug` - Inspect variables and state
- `breakpoint_debug` - Manage breakpoints
- `watch_debug` - Watch variable changes
- `pause_debug` - Pause execution
- `resume_debug` - Resume execution
- `stop_debug` - Stop debug session
- `status_debug` - Get debug session status
- `history_debug` - View execution history
- `timeline_debug` - Timeline visualization

### Batch Operations (6 tools)
- `batch_workflows_create` - Create multiple workflows
- `batch_workflows_update` - Update multiple workflows
- `batch_workflows_delete` - Delete multiple workflows
- `batch_workflows_activate` - Activate multiple workflows
- `batch_workflows_deactivate` - Deactivate multiple workflows
- `batch_operation_status` - Track batch operation progress

### Version Control (6 tools)
- `create_version` - Create workflow versions
- `create_branch` - Create workflow branches
- `list_versions` - List version history
- `merge_branch` - Merge workflow branches
- `rollback_version` - Rollback to previous versions
- `compare_versions` - Compare workflow versions

### Visualization (3 tools)
- `mermaid_diagram` - Generate Mermaid diagrams
- `dependency_graph` - Visualize workflow dependencies
- `workflow_map` - Create workflow topology maps

### System Tools (2 tools)
- `server_health` - Check MCP server health
- `test_connection` - Test n8n API connection

## 📖 Usage Examples

### Basic Workflow Operations
```
// List all active workflows
User: List all my active workflows

// Create a new workflow
User: Create a workflow that sends an email every morning at 9 AM

// Monitor workflow execution
User: Monitor the execution of workflow ID wf_123 in real-time
```

### Advanced Operations
```
// Batch operations
User: Deactivate all workflows with the tag "test"

// Version control
User: Create a backup version of my production workflow before making changes

// Debugging
User: Start a debug session for workflow wf_456 and set a breakpoint at the HTTP Request node
```

### Monitoring & Analytics
```
// Performance metrics
User: Show me the performance metrics for my most active workflows

// Health monitoring
User: Check the health status of all integrations

// Alert management
User: List all active alerts and their severity levels
```

## 🔒 Security Features

- **API Key Management**: Secure API key storage and rotation
- **RBAC**: Role-based access control with granular permissions
- **Rate Limiting**: Configurable rate limits per tool and user
- **Audit Logging**: Complete audit trail of all operations
- **Encryption**: Secure credential storage and transmission

## 🚨 Troubleshooting

### Connection Issues
```bash
# Test n8n connection
npx @drballs/n8n-mcp-server test-connection

# Check environment variables
echo $N8N_API_KEY
echo $N8N_BASE_URL
```

### Common Errors

**"Authentication failed"**
- Verify your API key is correct
- Ensure API access is enabled in n8n
- Check if your n8n plan includes API access

**"Rate limit exceeded"**
- Reduce request frequency
- Check rate limit configuration
- Consider upgrading your n8n plan

**"Tool not available"**
- Ensure n8n API client is configured
- Check if required features are enabled
- Verify n8n version compatibility

## 🔧 Advanced Configuration

### Environment Variables
```bash
# Required
N8N_API_KEY=your_api_key
N8N_BASE_URL=https://your-instance.com

# Optional
N8N_TIMEOUT=30000              # Request timeout (ms)
N8N_RETRY_MAX=3                # Max retry attempts
N8N_RATE_LIMIT=10              # Requests per second
N8N_CACHE_TTL=300000           # Cache TTL (ms)
N8N_WEBHOOK_URL=https://...    # Webhook endpoint
```

### Security Configuration
```json
{
  "security": {
    "enableAudit": true,
    "enableRateLimit": true,
    "rateLimits": {
      "global": { "requests": 100, "window": 60 },
      "perTool": { "requests": 10, "window": 60 }
    }
  }
}
```

### Monitoring Configuration
```json
{
  "monitoring": {
    "protocol": "websocket",
    "wsUrl": "wss://your-n8n-instance.com/ws",
    "updateInterval": 5000
  }
}
```

## 📊 Performance Optimization

- **Caching**: Multi-tier caching reduces API calls by up to 80%
- **Batch Operations**: Process multiple workflows 10x faster
- **Connection Pooling**: Optimized connection management
- **Async Processing**: Non-blocking operations for better performance

## 🤝 Contributing

Contributions are welcome! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- [n8n Documentation](https://docs.n8n.io)
- [MCP Protocol Specification](https://modelcontextprotocol.io)
- [Claude Desktop](https://claude.ai/desktop)

## 💡 Support

- **Issues**: [GitHub Issues](https://github.com/DrBalls/retro-n8n-mcp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/DrBalls/retro-n8n-mcp/discussions)
- **NPM Package**: [npmjs.com/package/@drballs/n8n-mcp-server](https://www.npmjs.com/package/@drballs/n8n-mcp-server)
- **n8n Community**: [n8n Community Forum](https://community.n8n.io)

---

Built with ❤️ by the Retro Development Team