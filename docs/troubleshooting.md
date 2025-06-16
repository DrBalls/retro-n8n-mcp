# Troubleshooting Guide

This guide helps you diagnose and fix common issues with the n8n MCP Server.

## Table of Contents

1. [Connection Issues](#connection-issues)
2. [Authentication Problems](#authentication-problems)
3. [Tool Execution Errors](#tool-execution-errors)
4. [Performance Issues](#performance-issues)
5. [Claude Desktop Integration](#claude-desktop-integration)
6. [Debugging Techniques](#debugging-techniques)
7. [Common Error Messages](#common-error-messages)
8. [Getting Help](#getting-help)

## Connection Issues

### Cannot Connect to n8n Instance

**Symptoms:**
- "Connection refused" errors
- "ECONNREFUSED" or "ETIMEDOUT" errors
- Tools not responding

**Solutions:**

1. **Verify n8n URL**
   ```bash
   # Check if URL is accessible
   curl -I https://your-n8n-instance.com/api/v1/version
   ```
   - Ensure you include the protocol (https:// or http://)
   - Don't include trailing slashes
   - For local instances, use http://localhost:5678

2. **Check Network Connectivity**
   ```bash
   # Test network connection
   ping your-n8n-instance.com
   
   # Check if port is open
   nc -zv your-n8n-instance.com 443
   ```

3. **Firewall and Proxy Settings**
   - Ensure your firewall allows outbound HTTPS connections
   - If behind a proxy, set proxy environment variables:
   ```bash
   export HTTP_PROXY=http://proxy.company.com:8080
   export HTTPS_PROXY=http://proxy.company.com:8080
   ```

4. **SSL Certificate Issues**
   - For self-signed certificates, you may need to:
   ```bash
   export NODE_TLS_REJECT_UNAUTHORIZED=0  # Use only for testing!
   ```
   - Better solution: Add your certificate to the trust store

### WebSocket Connection Failed

**Symptoms:**
- Real-time monitoring not working
- "WebSocket connection failed" errors

**Solutions:**

1. **Check WebSocket Support**
   - Verify your n8n instance supports WebSocket connections
   - Some reverse proxies may block WebSocket upgrades

2. **Use Alternative Protocols**
   ```javascript
   // In your configuration
   {
     "monitoring": {
       "protocol": "sse"  // Use Server-Sent Events instead
     }
   }
   ```

3. **Nginx Configuration** (if using Nginx)
   ```nginx
   location / {
     proxy_pass http://n8n;
     proxy_http_version 1.1;
     proxy_set_header Upgrade $http_upgrade;
     proxy_set_header Connection "upgrade";
   }
   ```

## Authentication Problems

### Invalid API Key

**Symptoms:**
- "401 Unauthorized" errors
- "Invalid API key" messages

**Solutions:**

1. **Verify API Key**
   - Log into n8n and go to Settings → API
   - Ensure API access is enabled
   - Generate a new key if needed

2. **Check Environment Variables**
   ```bash
   # Verify environment variable is set
   echo $N8N_API_KEY
   
   # Check for spaces or special characters
   echo "$N8N_API_KEY" | cat -A
   ```

3. **Test API Key Directly**
   ```bash
   curl -H "X-N8N-API-KEY: your-api-key" \
        https://your-n8n-instance.com/api/v1/workflows
   ```

### Permission Denied

**Symptoms:**
- "403 Forbidden" errors
- "Insufficient permissions" messages

**Solutions:**

1. **Check User Permissions**
   - Ensure your n8n user has appropriate permissions
   - Admin access may be required for some operations

2. **API Scope Limitations**
   - Some n8n plans have API limitations
   - Upgrade to Pro or Enterprise for full API access

## Tool Execution Errors

### Workflow Not Found

**Symptoms:**
- "Workflow with ID 'xxx' not found" errors

**Solutions:**

1. **Verify Workflow ID**
   ```typescript
   // List all workflows to find correct ID
   const workflows = await workflow_list();
   console.log(workflows.data.map(w => ({ id: w.id, name: w.name })));
   ```

2. **Check Workflow Visibility**
   - Ensure the workflow isn't deleted
   - Check if you have access to the workflow

### Execution Failed

**Symptoms:**
- Workflow executions failing immediately
- "Workflow is not active" errors

**Solutions:**

1. **Activate Workflow**
   ```typescript
   await workflow_activate({ id: "workflow-123" });
   ```

2. **Check Required Credentials**
   - Ensure all required credentials are configured
   - Test credentials individually:
   ```typescript
   await credential_test({ id: "cred-123" });
   ```

3. **Validate Workflow Structure**
   - Check for missing connections
   - Ensure all required node parameters are set

### Rate Limiting

**Symptoms:**
- "429 Too Many Requests" errors
- "Rate limit exceeded" messages

**Solutions:**

1. **Implement Retry Logic**
   ```typescript
   async function retryWithBackoff(fn, maxRetries = 3) {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await fn();
       } catch (error) {
         if (error.code === 'RATE_LIMIT' && i < maxRetries - 1) {
           await new Promise(resolve => 
             setTimeout(resolve, Math.pow(2, i) * 1000)
           );
         } else {
           throw error;
         }
       }
     }
   }
   ```

2. **Use Batch Operations**
   - Instead of multiple individual operations, use batch tools
   - This reduces API calls significantly

3. **Configure Rate Limiting**
   ```javascript
   // In server configuration
   {
     "rateLimit": {
       "maxRequests": 100,
       "windowMs": 60000  // 1 minute
     }
   }
   ```

## Performance Issues

### Slow Response Times

**Symptoms:**
- Operations taking longer than expected
- Timeouts on large workflows

**Solutions:**

1. **Enable Caching**
   ```bash
   # Set up Redis for caching
   export CACHE_REDIS_URL=redis://localhost:6379
   ```

2. **Optimize Queries**
   ```typescript
   // Use pagination for large datasets
   const workflows = await workflow_list({
     limit: 50,
     offset: 0
   });
   ```

3. **Use Selective Fields**
   ```typescript
   // Request only needed data
   const execution = await execution_get({
     executionId: "exec-123",
     includeData: false  // Skip large data payloads
   });
   ```

### Memory Issues

**Symptoms:**
- "JavaScript heap out of memory" errors
- Server crashes on large operations

**Solutions:**

1. **Increase Node.js Memory**
   ```bash
   # Increase heap size to 4GB
   export NODE_OPTIONS="--max-old-space-size=4096"
   ```

2. **Stream Large Data**
   - Use pagination for large result sets
   - Process data in chunks

3. **Monitor Memory Usage**
   ```typescript
   const health = await system_health();
   console.log('Memory usage:', health.memory);
   ```

## Claude Desktop Integration

### MCP Server Not Found

**Symptoms:**
- Claude doesn't recognize n8n tools
- "No MCP servers configured" message

**Solutions:**

1. **Verify Configuration Path**
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Linux: `~/.config/Claude/claude_desktop_config.json`

2. **Check JSON Syntax**
   ```json
   {
     "mcpServers": {
       "n8n": {
         "command": "n8n-mcp-server",
         "env": {
           "N8N_API_URL": "https://your-instance.com",
           "N8N_API_KEY": "your-key"
         }
       }
     }
   }
   ```

3. **Restart Claude Desktop**
   - Close Claude completely
   - Restart and check MCP status

### Tools Not Working in Claude

**Symptoms:**
- Tools appear but return errors
- "Failed to execute tool" messages

**Solutions:**

1. **Check MCP Server Logs**
   ```bash
   # Find Claude logs
   # macOS/Linux
   tail -f ~/.claude/logs/mcp-*.log
   
   # Windows
   type %USERPROFILE%\.claude\logs\mcp-*.log
   ```

2. **Test Server Independently**
   ```bash
   # Run server manually to see errors
   N8N_API_URL=https://your-instance.com \
   N8N_API_KEY=your-key \
   n8n-mcp-server
   ```

3. **Update MCP Server**
   ```bash
   npm update -g @retro/n8n-mcp-server
   ```

## Debugging Techniques

### Enable Debug Logging

```bash
# Set debug environment variable
export DEBUG=n8n-mcp:*

# Or for specific components
export DEBUG=n8n-mcp:api,n8n-mcp:tools
```

### Use Built-in Diagnostics

```typescript
// Test connection and get diagnostics
const diagnostics = await system_test_connection();
console.log(diagnostics);

// Get server health information
const health = await system_health();
console.log(health);
```

### Capture HTTP Traffic

```bash
# Use proxy to inspect API calls
export HTTP_PROXY=http://localhost:8888
# Use with tools like Charles Proxy or Fiddler
```

### Check Server Logs

```typescript
// If running from source
npm run dev -- --log-level=debug
```

## Common Error Messages

### Error Reference Table

| Error Message | Cause | Solution |
|--------------|-------|----------|
| `ECONNREFUSED` | Server not reachable | Check URL and network |
| `ETIMEDOUT` | Network timeout | Increase timeout or check connectivity |
| `401 Unauthorized` | Invalid API key | Verify API key |
| `403 Forbidden` | Insufficient permissions | Check user permissions |
| `404 Not Found` | Resource doesn't exist | Verify resource ID |
| `429 Too Many Requests` | Rate limited | Implement backoff |
| `500 Internal Server Error` | Server error | Check n8n logs |
| `VALIDATION_ERROR` | Invalid parameters | Check parameter requirements |
| `WORKFLOW_NOT_ACTIVE` | Workflow deactivated | Activate workflow first |
| `CREDENTIAL_NOT_FOUND` | Missing credential | Create required credential |

### Error Context

Most errors include additional context:

```typescript
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid workflow ID",
    "details": {
      "field": "workflowId",
      "value": "invalid-id",
      "expected": "string matching pattern ^[0-9]+$"
    }
  }
}
```

## Getting Help

### Self-Help Resources

1. **Check Documentation**
   - [Getting Started Guide](./getting-started.md)
   - [Tool Reference](./tool-reference.md)
   - [API Documentation](./api/README.md)

2. **Search Known Issues**
   - [GitHub Issues](https://github.com/DrBalls/retro-n8n-mcp/issues)
   - [Discussions](https://github.com/DrBalls/retro-n8n-mcp/discussions)

### Community Support

1. **Discord Server**
   - Join: [discord.gg/n8n-mcp](https://discord.gg/example)
   - Channels: #help, #bugs, #features

2. **GitHub Discussions**
   - Ask questions
   - Share workflows
   - Request features

### Reporting Bugs

When reporting issues, include:

1. **Environment Information**
   ```bash
   n8n-mcp-server --version
   node --version
   npm --version
   ```

2. **Configuration** (sanitized)
   ```json
   {
     "apiUrl": "https://example.com",
     "monitoring": { "protocol": "websocket" }
   }
   ```

3. **Error Messages**
   - Full error output
   - Stack traces if available

4. **Steps to Reproduce**
   - Minimal code example
   - Expected vs actual behavior

### Professional Support

For enterprise customers:
- Email: enterprise@n8n-mcp.dev
- Priority support channel
- Custom development services

---

Remember: Most issues have simple solutions. Check your configuration, verify your credentials, and ensure your n8n instance is accessible before diving into complex debugging.