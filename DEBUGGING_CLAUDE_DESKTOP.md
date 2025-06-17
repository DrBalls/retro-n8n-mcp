# Claude Desktop Debugging Guide

## Common Installation Issues

### 1. Check Claude Desktop Configuration

Your config file should be at:
```
%APPDATA%\Claude\claude_desktop_config.json
```

Example configuration:
```json
{
  "mcpServers": {
    "n8n": {
      "command": "npx",
      "args": ["@drballs/n8n-mcp-server"],
      "env": {
        "N8N_API_KEY": "your_actual_api_key_here",
        "N8N_BASE_URL": "https://your-n8n-instance.com"
      }
    }
  }
}
```

### 2. Common Errors and Solutions

#### Error: "Cannot find module"
**Solution**: Install globally first
```bash
npm install -g @drballs/n8n-mcp-server
```

Then update config to use global install:
```json
{
  "mcpServers": {
    "n8n": {
      "command": "n8n-mcp-server",
      "args": [],
      "env": {
        "N8N_API_KEY": "your_api_key",
        "N8N_BASE_URL": "https://your-n8n-instance.com"
      }
    }
  }
}
```

#### Error: "ES Module" issues
**Solution**: Use node with proper flags
```json
{
  "mcpServers": {
    "n8n": {
      "command": "node",
      "args": ["--experimental-specifier-resolution=node", "C:/Users/YOUR_USERNAME/AppData/Roaming/npm/node_modules/@drballs/n8n-mcp-server/dist/index.js"],
      "env": {
        "N8N_API_KEY": "your_api_key",
        "N8N_BASE_URL": "https://your-n8n-instance.com"
      }
    }
  }
}
```

### 3. Debugging Steps

1. **Test the package directly**:
   Open Command Prompt and run:
   ```bash
   npx @drballs/n8n-mcp-server --version
   ```

2. **Check Node.js version**:
   ```bash
   node --version
   ```
   Must be 20.0.0 or higher

3. **Test with environment variables**:
   ```bash
   set N8N_API_KEY=your_key
   set N8N_BASE_URL=https://your-instance.com
   npx @drballs/n8n-mcp-server
   ```

4. **Check Claude Desktop logs**:
   - Look for error messages when Claude Desktop starts
   - The MCP server output should appear in Claude's developer console

### 4. Alternative Installation Methods

#### Method A: Direct Node Execution
```json
{
  "mcpServers": {
    "n8n": {
      "command": "node",
      "args": ["C:\\Users\\YOUR_USERNAME\\AppData\\Roaming\\npm\\node_modules\\@drballs\\n8n-mcp-server\\dist\\index.js"],
      "env": {
        "N8N_API_KEY": "your_api_key",
        "N8N_BASE_URL": "https://your-n8n-instance.com"
      }
    }
  }
}
```

#### Method B: Batch Script Wrapper
Create `n8n-mcp.bat`:
```batch
@echo off
node "%APPDATA%\npm\node_modules\@drballs\n8n-mcp-server\dist\index.js" %*
```

Then use in config:
```json
{
  "mcpServers": {
    "n8n": {
      "command": "C:\\path\\to\\n8n-mcp.bat",
      "args": [],
      "env": {
        "N8N_API_KEY": "your_api_key",
        "N8N_BASE_URL": "https://your-n8n-instance.com"
      }
    }
  }
}
```

### 5. Verify Installation

Run these commands to verify:
```bash
# Check if package is installed
npm list -g @drballs/n8n-mcp-server

# Find installation path
npm root -g

# Test execution
cd %APPDATA%\npm\node_modules\@drballs\n8n-mcp-server
node dist/index.js
```

### 6. Environment Variable Issues

Make sure:
- No quotes around the API key in the JSON
- URL includes https:// prefix
- No trailing slashes in the URL
- API key has proper permissions in n8n

### Need More Help?

1. Check the full error message in Claude Desktop
2. Try running the server standalone first
3. Verify n8n API access with curl:
   ```bash
   curl -H "X-N8N-API-KEY: your_key" https://your-instance.com/api/v1/workflows
   ```