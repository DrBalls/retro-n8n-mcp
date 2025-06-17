# n8n MCP Server Configuration Guide

## Where to Configure Your n8n API Credentials

When you see an authentication error, it means the MCP server is running but needs your actual n8n credentials.

### 1. Find Your Claude Desktop Configuration File

The configuration file location depends on your operating system:

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```
(Usually: `C:\Users\YourUsername\AppData\Roaming\Claude\claude_desktop_config.json`)

**macOS:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Linux:**
```
~/.config/Claude/claude_desktop_config.json
```

### 2. Get Your n8n API Key

1. Log into your n8n instance
2. Click on your user icon (top right)
3. Go to "Settings" → "API"
4. Create a new API key or copy an existing one

**Note:** API access might require a paid n8n plan. Check your plan details.

### 3. Update the Configuration

Open the `claude_desktop_config.json` file and update it with your actual credentials:

```json
{
  "mcpServers": {
    "n8n-mcp-server": {
      "command": "npx",
      "args": ["@drballs/n8n-mcp-server@0.1.6"],
      "env": {
        "N8N_API_KEY": "n8n_api_1234567890abcdef",
        "N8N_BASE_URL": "https://your-instance.n8n.cloud"
      }
    }
  }
}
```

Replace:
- `n8n_api_1234567890abcdef` with your actual API key
- `https://your-instance.n8n.cloud` with your n8n instance URL

### 4. Common n8n Instance URLs

- **n8n Cloud:** `https://your-subdomain.n8n.cloud`
- **Self-hosted:** `https://n8n.yourdomain.com` or `http://localhost:5678`
- **Docker:** Usually `http://localhost:5678`

### 5. Restart Claude Desktop

After updating the configuration:
1. Completely quit Claude Desktop (not just close the window)
2. Start Claude Desktop again
3. The n8n tools should now work with your credentials

### 6. Troubleshooting Authentication Errors

If you still see authentication errors:

**Check API Key Format:**
- n8n Cloud keys look like: `n8n_api_1234567890abcdef`
- Self-hosted keys might be different

**Verify Base URL:**
- Don't include trailing slashes: ✅ `https://n8n.example.com`
- Include the protocol: ❌ `n8n.example.com` → ✅ `https://n8n.example.com`
- For local instances, use full URL: ✅ `http://localhost:5678`

**Test Your Credentials:**
```bash
# Test with curl
curl -X GET "YOUR_BASE_URL/api/v1/workflows" \
  -H "X-N8N-API-KEY: YOUR_API_KEY"
```

**Check n8n API Access:**
- Ensure API is enabled in your n8n settings
- Verify your plan includes API access
- Check if there are IP restrictions

### Example: Complete Configuration

Here's a full example with multiple MCP servers:

```json
{
  "mcpServers": {
    "n8n-mcp-server": {
      "command": "npx",
      "args": ["@drballs/n8n-mcp-server@0.1.6"],
      "env": {
        "N8N_API_KEY": "n8n_api_abc123def456ghi789",
        "N8N_BASE_URL": "https://mycompany.n8n.cloud"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/me/projects"]
    }
  }
}
```

### Quick Test: Verify Your Setup

Run this command to test your credentials before using Claude Desktop:

```bash
# Replace with your actual values
curl -X GET "https://your-instance.n8n.cloud/api/v1/workflows" \
  -H "X-N8N-API-KEY: your-api-key"
```

**Expected response:** JSON list of workflows  
**If this fails:** Your credentials are incorrect or API access isn't enabled

### Still Having Issues?

If authentication still fails:
1. **Check Claude Desktop logs** for detailed error messages
2. **Ensure your n8n instance is accessible** from your network
3. **Try the API key in a REST client** first to verify it works
4. **Check your n8n plan** - API access often requires a paid subscription
5. **Report issues at:** https://github.com/DrBalls/retro-n8n-mcp/issues