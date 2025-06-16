/**
 * Example: Hello World Workflow
 * Description: Creates a simple webhook workflow that responds with "Hello, World!"
 * Requirements: n8n instance with API access
 */

import { N8nMcpServer } from '@retro/n8n-mcp-server';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function createHelloWorldWorkflow() {
  // Initialize the MCP server
  const server = new N8nMcpServer({
    apiConfig: {
      apiUrl: process.env.N8N_API_URL!,
      apiKey: process.env.N8N_API_KEY!
    }
  });

  // Create transport and connect
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.log('🚀 Creating Hello World workflow...\n');

  try {
    // Create the workflow
    const workflow = await server.executeTool('workflow_create', {
      name: 'Hello World Webhook',
      nodes: [
        {
          id: 'webhook',
          name: 'Webhook',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [250, 300],
          parameters: {
            path: 'hello-world',
            responseMode: 'onReceived',
            responseData: 'allEntries',
            options: {}
          }
        },
        {
          id: 'respond',
          name: 'Respond to Webhook',
          type: 'n8n-nodes-base.respondToWebhook',
          typeVersion: 1,
          position: [450, 300],
          parameters: {
            respondWith: 'json',
            responseBody: JSON.stringify({
              message: 'Hello, World!',
              timestamp: new Date().toISOString(),
              source: 'n8n MCP Server Example'
            }, null, 2),
            options: {
              responseCode: 200,
              responseHeaders: {
                entries: [
                  {
                    name: 'Content-Type',
                    value: 'application/json'
                  }
                ]
              }
            }
          }
        }
      ],
      connections: {
        'webhook': {
          'main': [
            [
              {
                'node': 'respond',
                'type': 'main',
                'index': 0
              }
            ]
          ]
        }
      },
      active: true,
      settings: {
        executionOrder: 'v1'
      }
    });

    console.log('✅ Workflow created successfully!');
    console.log(`   ID: ${workflow.id}`);
    console.log(`   Name: ${workflow.name}`);
    console.log(`   Active: ${workflow.active}`);
    console.log(`\n📡 Webhook URL: ${process.env.N8N_API_URL}/webhook/hello-world`);
    
    // Test the webhook
    console.log('\n🧪 Testing the webhook...');
    const testUrl = `${process.env.N8N_API_URL}/webhook/hello-world`;
    
    try {
      const response = await fetch(testUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          test: true,
          name: 'MCP Server Test'
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Webhook test successful!');
        console.log('   Response:', JSON.stringify(data, null, 2));
      } else {
        console.log('⚠️  Webhook returned status:', response.status);
      }
    } catch (error) {
      console.log('⚠️  Could not test webhook (this is normal if n8n is not publicly accessible)');
    }

    // Create a version for tracking
    console.log('\n📝 Creating initial version...');
    const version = await server.executeTool('version_create', {
      workflowId: workflow.id,
      message: 'Initial Hello World workflow',
      versionType: 'major',
      tags: ['example', 'hello-world']
    });

    console.log('✅ Version created:', version.version);

    // Show how to trigger the workflow
    console.log('\n🎯 How to trigger this workflow:');
    console.log(`   curl -X POST ${testUrl} \\`);
    console.log(`        -H "Content-Type: application/json" \\`);
    console.log(`        -d '{"name": "Your Name"}'`);

    return workflow;

  } catch (error) {
    console.error('❌ Error creating workflow:', error);
    throw error;
  } finally {
    await server.close();
  }
}

// Helper function to display workflow info
function displayWorkflowInfo(workflow: any) {
  console.log('\n📋 Workflow Details:');
  console.log('├── ID:', workflow.id);
  console.log('├── Name:', workflow.name);
  console.log('├── Nodes:', workflow.nodes.length);
  console.log('├── Active:', workflow.active);
  console.log('└── Created:', new Date(workflow.createdAt).toLocaleString());
}

// Main execution
if (require.main === module) {
  createHelloWorldWorkflow()
    .then(workflow => {
      displayWorkflowInfo(workflow);
      console.log('\n✨ Hello World example completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Example failed:', error.message);
      process.exit(1);
    });
}

export { createHelloWorldWorkflow };