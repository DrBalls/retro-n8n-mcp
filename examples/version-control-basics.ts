/**
 * Example: Version Control Basics
 * Description: Learn the fundamentals of Git-like version control for n8n workflows
 * Requirements: Existing workflow in n8n
 */

import { N8nMcpServer } from '@retro/n8n-mcp-server';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function demonstrateVersionControl() {
  const server = new N8nMcpServer({
    apiConfig: {
      apiUrl: process.env.N8N_API_URL!,
      apiKey: process.env.N8N_API_KEY!
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.log('📚 Version Control Basics Example\n');

  try {
    // Step 1: Create a sample workflow
    console.log('1️⃣ Creating a sample workflow...');
    const workflow = await server.executeTool('workflow_create', {
      name: 'Version Control Demo',
      nodes: [
        {
          id: 'start',
          name: 'Start',
          type: 'n8n-nodes-base.start',
          typeVersion: 1,
          position: [250, 300]
        },
        {
          id: 'code',
          name: 'Code',
          type: 'n8n-nodes-base.code',
          typeVersion: 1,
          position: [450, 300],
          parameters: {
            jsCode: 'return { message: "Version 1.0" };'
          }
        }
      ],
      connections: {
        'start': {
          'main': [[{ 'node': 'code', 'type': 'main', 'index': 0 }]]
        }
      },
      active: false
    });

    console.log(`   ✅ Created workflow: ${workflow.name} (ID: ${workflow.id})\n`);

    // Step 2: Create initial version
    console.log('2️⃣ Creating initial version...');
    const v1 = await server.executeTool('version_create', {
      workflowId: workflow.id,
      message: 'Initial version with basic code node',
      versionType: 'major',
      tags: ['stable', 'v1.0.0']
    });
    console.log(`   ✅ Created version: ${v1.version}`);
    console.log(`   📝 Message: ${v1.message}\n`);

    // Step 3: Make changes to the workflow
    console.log('3️⃣ Updating workflow (simulating development)...');
    await server.executeTool('workflow_update', {
      id: workflow.id,
      nodes: [
        {
          id: 'start',
          name: 'Start',
          type: 'n8n-nodes-base.start',
          typeVersion: 1,
          position: [250, 300]
        },
        {
          id: 'code',
          name: 'Code',
          type: 'n8n-nodes-base.code',
          typeVersion: 1,
          position: [450, 300],
          parameters: {
            jsCode: 'return { message: "Version 1.1 - With improvements!", timestamp: new Date() };'
          }
        },
        {
          id: 'webhook',
          name: 'Webhook Response',
          type: 'n8n-nodes-base.respondToWebhook',
          typeVersion: 1,
          position: [650, 300],
          parameters: {
            respondWith: 'json',
            responseBody: '={{ $json }}'
          }
        }
      ],
      connections: {
        'start': {
          'main': [[{ 'node': 'code', 'type': 'main', 'index': 0 }]]
        },
        'code': {
          'main': [[{ 'node': 'webhook', 'type': 'main', 'index': 0 }]]
        }
      }
    });
    console.log('   ✅ Added webhook response node\n');

    // Step 4: Create a new version
    console.log('4️⃣ Creating version after changes...');
    const v2 = await server.executeTool('version_create', {
      workflowId: workflow.id,
      message: 'Add webhook response and improve code output',
      versionType: 'minor'
    });
    console.log(`   ✅ Created version: ${v2.version}\n`);

    // Step 5: View version history
    console.log('5️⃣ Viewing version history...');
    const history = await server.executeTool('version_history', {
      workflowId: workflow.id,
      format: 'summary'
    });
    
    console.log('   📜 Version History:');
    history.versions.forEach((ver: any) => {
      console.log(`   ├── ${ver.version} - ${ver.message}`);
      console.log(`   │   Created: ${new Date(ver.createdAt).toLocaleString()}`);
      console.log(`   │   Author: ${ver.author}`);
      if (ver.tags.length > 0) {
        console.log(`   │   Tags: ${ver.tags.join(', ')}`);
      }
      console.log('   │');
    });

    // Step 6: Compare versions
    console.log('\n6️⃣ Comparing versions...');
    const diff = await server.executeTool('version_diff', {
      workflowId: workflow.id,
      fromVersionId: v1.id,
      toVersionId: v2.id,
      format: 'detailed'
    });

    console.log('   📊 Changes from v1.0.0 to v1.1.0:');
    console.log(`   ├── Nodes added: ${diff.summary.nodesAdded}`);
    console.log(`   ├── Nodes modified: ${diff.summary.nodesModified}`);
    console.log(`   ├── Connections changed: ${diff.summary.connectionsChanged}`);
    console.log(`   └── Total changes: ${diff.operations.length}\n`);

    // Step 7: Create a feature branch
    console.log('7️⃣ Creating a feature branch...');
    const branch = await server.executeTool('branch_create', {
      workflowId: workflow.id,
      branchName: 'feature/add-error-handling',
      fromBranch: 'main',
      description: 'Add error handling to the workflow'
    });
    console.log(`   ✅ Created branch: ${branch.name}\n`);

    // Step 8: Make changes on the branch
    console.log('8️⃣ Making changes on feature branch...');
    await server.executeTool('workflow_update', {
      id: workflow.id,
      nodes: [
        {
          id: 'start',
          name: 'Start',
          type: 'n8n-nodes-base.start',
          typeVersion: 1,
          position: [250, 300]
        },
        {
          id: 'code',
          name: 'Code',
          type: 'n8n-nodes-base.code',
          typeVersion: 1,
          position: [450, 300],
          parameters: {
            jsCode: `
try {
  // Simulate potential error
  if (Math.random() < 0.3) {
    throw new Error('Random error for demo');
  }
  return { 
    message: "Version 1.2 - With error handling!", 
    timestamp: new Date(),
    status: 'success'
  };
} catch (error) {
  return {
    error: error.message,
    status: 'error',
    timestamp: new Date()
  };
}`
          }
        },
        {
          id: 'webhook',
          name: 'Webhook Response',
          type: 'n8n-nodes-base.respondToWebhook',
          typeVersion: 1,
          position: [650, 300],
          parameters: {
            respondWith: 'json',
            responseBody: '={{ $json }}'
          }
        }
      ],
      connections: {
        'start': {
          'main': [[{ 'node': 'code', 'type': 'main', 'index': 0 }]]
        },
        'code': {
          'main': [[{ 'node': 'webhook', 'type': 'main', 'index': 0 }]]
        }
      }
    });

    // Create version on branch
    const v3 = await server.executeTool('version_create', {
      workflowId: workflow.id,
      branch: 'feature/add-error-handling',
      message: 'Implement error handling in code node',
      versionType: 'minor'
    });
    console.log(`   ✅ Created version ${v3.version} on feature branch\n`);

    // Step 9: Demonstrate rollback
    console.log('9️⃣ Demonstrating rollback capability...');
    console.log('   ⚠️  Simulating issue with latest version...');
    console.log('   🔄 Rolling back to stable v1.0.0...');
    
    const rollback = await server.executeTool('version_rollback', {
      workflowId: workflow.id,
      targetVersionId: v1.id,
      reason: 'Demo: Rolling back due to simulated production issue',
      createBackup: true
    });
    console.log(`   ✅ Rolled back to version: ${rollback.version}`);
    console.log(`   📸 Backup created: ${rollback.backupVersion}\n`);

    // Step 10: Show best practices
    console.log('📚 Version Control Best Practices:');
    console.log('   1. Create versions before major changes');
    console.log('   2. Use descriptive commit messages');
    console.log('   3. Tag stable versions for easy rollback');
    console.log('   4. Use branches for feature development');
    console.log('   5. Test on branches before merging to main');
    console.log('   6. Document rollback reasons');
    console.log('   7. Regular backups of critical workflows\n');

    // Cleanup
    console.log('🧹 Cleaning up demo workflow...');
    await server.executeTool('workflow_delete', { id: workflow.id });
    console.log('   ✅ Demo workflow deleted');

    await server.close();
    return true;

  } catch (error) {
    console.error('❌ Error in version control demo:', error);
    await server.close();
    return false;
  }
}

// Main execution
if (require.main === module) {
  demonstrateVersionControl()
    .then(success => {
      console.log(success ? '\n✨ Version control demo completed!' : '\n❌ Demo failed');
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Unexpected error:', error);
      process.exit(1);
    });
}

export { demonstrateVersionControl };