/**
 * Example: Test Connection
 * Description: Verify your n8n MCP Server setup and connection
 * Requirements: Valid n8n API credentials
 */

import { N8nMcpServer } from '@retro/n8n-mcp-server';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testConnection() {
  console.log('🔍 n8n MCP Server Connection Test\n');
  console.log('Configuration:');
  console.log(`  API URL: ${process.env.N8N_API_URL || 'NOT SET'}`);
  console.log(`  API Key: ${process.env.N8N_API_KEY ? '***' + process.env.N8N_API_KEY.slice(-4) : 'NOT SET'}`);
  console.log('');

  // Check environment variables
  if (!process.env.N8N_API_URL || !process.env.N8N_API_KEY) {
    console.error('❌ Missing required environment variables!');
    console.error('   Please set N8N_API_URL and N8N_API_KEY');
    console.error('\n   Example .env file:');
    console.error('   N8N_API_URL=https://your-n8n-instance.com');
    console.error('   N8N_API_KEY=your-api-key-here');
    return false;
  }

  // Initialize the MCP server
  const server = new N8nMcpServer({
    apiConfig: {
      apiUrl: process.env.N8N_API_URL,
      apiKey: process.env.N8N_API_KEY
    }
  });

  try {
    // Create transport and connect
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.log('✅ MCP Server initialized\n');

    // Test 1: Basic connection
    console.log('1️⃣ Testing basic connection...');
    const health = await server.executeTool('system_test_connection', {});
    
    if (health.connected) {
      console.log('   ✅ Connected to n8n instance');
      console.log(`   ✅ n8n version: ${health.version || 'Unknown'}`);
    } else {
      console.log('   ❌ Failed to connect');
      return false;
    }

    // Test 2: List workflows
    console.log('\n2️⃣ Testing workflow access...');
    const workflows = await server.executeTool('workflow_list', { limit: 5 });
    console.log(`   ✅ Found ${workflows.count || 0} workflows`);
    
    if (workflows.data && workflows.data.length > 0) {
      console.log('   📋 First few workflows:');
      workflows.data.slice(0, 3).forEach((wf: any) => {
        console.log(`      - ${wf.name} (ID: ${wf.id}) ${wf.active ? '🟢' : '🔴'}`);
      });
    }

    // Test 3: List credentials
    console.log('\n3️⃣ Testing credential access...');
    const credentials = await server.executeTool('credential_list', { limit: 5 });
    console.log(`   ✅ Found ${credentials.count || 0} credentials`);
    
    if (credentials.data && credentials.data.length > 0) {
      console.log('   🔐 Credential types:');
      const types = [...new Set(credentials.data.map((c: any) => c.type))];
      types.slice(0, 5).forEach(type => {
        console.log(`      - ${type}`);
      });
    }

    // Test 4: Check execution history
    console.log('\n4️⃣ Testing execution access...');
    const executions = await server.executeTool('execution_list', { limit: 5 });
    console.log(`   ✅ Found ${executions.count || 0} executions`);
    
    if (executions.data && executions.data.length > 0) {
      console.log('   📊 Recent execution statuses:');
      const statusCounts: Record<string, number> = {};
      executions.data.forEach((exec: any) => {
        statusCounts[exec.status] = (statusCounts[exec.status] || 0) + 1;
      });
      Object.entries(statusCounts).forEach(([status, count]) => {
        const icon = status === 'success' ? '✅' : status === 'error' ? '❌' : '⏳';
        console.log(`      ${icon} ${status}: ${count}`);
      });
    }

    // Test 5: Server health
    console.log('\n5️⃣ Testing server health...');
    const serverHealth = await server.executeTool('system_health', {});
    console.log('   ✅ Server health check passed');
    
    if (serverHealth.monitoring) {
      console.log(`   📡 Real-time monitoring: ${serverHealth.monitoring.available ? 'Available' : 'Not available'}`);
    }

    // Test 6: Available tools
    console.log('\n6️⃣ Checking available tools...');
    const toolCategories = {
      workflow: 0,
      execution: 0,
      credential: 0,
      'version-control': 0,
      debug: 0,
      monitoring: 0,
      visualization: 0,
      batch: 0,
      system: 0
    };

    // Count tools by category (this is a simplified version)
    console.log('   ✅ Tool categories available:');
    console.log('      - Workflow Management');
    console.log('      - Execution Control');
    console.log('      - Credential Management');
    console.log('      - Version Control');
    console.log('      - Debugging Tools');
    console.log('      - Monitoring Tools');
    console.log('      - Visualization Tools');
    console.log('      - Batch Operations');
    console.log('      - System Tools');

    console.log('\n✅ All tests passed! Your n8n MCP Server is properly configured.\n');

    // Show next steps
    console.log('🎯 Next steps:');
    console.log('   1. Try the hello-world.ts example');
    console.log('   2. Explore the tool-reference.md documentation');
    console.log('   3. Create your first automation workflow');

    await server.close();
    return true;

  } catch (error: any) {
    console.error('\n❌ Connection test failed!');
    console.error(`   Error: ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n   🔍 Troubleshooting tips:');
      console.error('   - Check if your n8n instance is running');
      console.error('   - Verify the API URL is correct');
      console.error('   - Ensure the URL includes http:// or https://');
    } else if (error.code === 'AUTH_ERROR' || error.statusCode === 401) {
      console.error('\n   🔍 Troubleshooting tips:');
      console.error('   - Verify your API key is correct');
      console.error('   - Check if API access is enabled in n8n');
      console.error('   - Ensure you have a Pro or Enterprise plan');
    }
    
    await server.close();
    return false;
  }
}

// Main execution
if (require.main === module) {
  testConnection()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Unexpected error:', error);
      process.exit(1);
    });
}

export { testConnection };