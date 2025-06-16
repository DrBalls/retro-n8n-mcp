/**
 * Example: Monitoring Dashboard Demo
 * Description: Demonstrates the monitoring and analytics dashboard API
 * Requirements: Configured n8n instance
 */

import { N8nMcpServer } from '../src/server/N8nMcpServer.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function demonstrateMonitoring() {
  // Initialize server with comprehensive monitoring
  const server = new N8nMcpServer({
    apiConfig: {
      apiUrl: process.env.N8N_API_URL!,
      apiKey: process.env.N8N_API_KEY!
    },
    comprehensiveMonitoring: {
      metrics: {
        enabled: true,
        port: 9090,
        path: '/metrics'
      },
      health: {
        enabled: true,
        path: '/health'
      },
      analytics: {
        enabled: true,
        provider: 'internal'
      },
      alerts: {
        enabled: true,
        evaluationInterval: 5000 // 5 seconds for demo
      },
      slo: {
        enabled: true,
        evaluationInterval: 10000 // 10 seconds for demo
      },
      telemetry: {
        enabled: true,
        exporter: 'console'
      }
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.log('🎯 Monitoring Dashboard Demo\n');
  console.log('📊 Metrics server available at: http://localhost:9090/metrics');
  console.log('🏥 Health endpoint available at: http://localhost:9090/health\n');

  try {
    // 1. Get monitoring overview
    console.log('1️⃣ Getting monitoring overview...');
    const overview = await server.executeTool('monitoring_overview', {
      sections: ['status', 'health', 'metrics', 'alerts', 'slos']
    });
    console.log('Overview:', JSON.stringify(overview, null, 2), '\n');

    // 2. Query specific metrics
    console.log('2️⃣ Querying metrics...');
    const metrics = await server.executeTool('metrics_query', {
      format: 'table'
    });
    console.log('Metrics:', metrics, '\n');

    // 3. Check health status
    console.log('3️⃣ Checking health status...');
    const health = await server.executeTool('health_status', {
      format: 'summary'
    });
    console.log('Health:', health, '\n');

    // 4. Simulate some tool usage to generate analytics
    console.log('4️⃣ Simulating tool usage...');
    for (let i = 0; i < 5; i++) {
      try {
        await server.executeTool('server_health', {});
        console.log(`   ✅ Tool call ${i + 1} succeeded`);
      } catch (error) {
        console.log(`   ❌ Tool call ${i + 1} failed`);
      }
    }

    // 5. Query analytics
    console.log('\n5️⃣ Querying analytics...');
    const analytics = await server.executeTool('analytics_query', {
      query: 'stats'
    });
    console.log('Analytics:', analytics, '\n');

    // 6. Check alert status
    console.log('6️⃣ Checking alert status...');
    const alerts = await server.executeTool('alert_status', {
      action: 'stats'
    });
    console.log('Alerts:', alerts, '\n');

    // 7. Check SLO status
    console.log('7️⃣ Checking SLO status...');
    const slos = await server.executeTool('slo_status', {
      format: 'summary'
    });
    console.log('SLOs:', slos, '\n');

    // 8. Demonstrate real-time monitoring
    console.log('8️⃣ Real-time monitoring demo...');
    console.log('   📈 Metrics are being collected in real-time');
    console.log('   🚨 Alerts are being evaluated every 5 seconds');
    console.log('   📊 SLOs are being tracked every 10 seconds');
    console.log('   🔍 Telemetry spans are being traced\n');

    // Keep running for 30 seconds to collect metrics
    console.log('⏱️  Running for 30 seconds to collect metrics...');
    await new Promise(resolve => setTimeout(resolve, 30000));

    // Final overview
    console.log('\n9️⃣ Final monitoring overview...');
    const finalOverview = await server.executeTool('monitoring_overview', {
      sections: ['status', 'analytics', 'telemetry']
    });
    console.log('Final Overview:', JSON.stringify(finalOverview, null, 2));

  } catch (error) {
    console.error('❌ Error in monitoring demo:', error);
  } finally {
    await server.close();
  }
}

// Main execution
if (require.main === module) {
  demonstrateMonitoring()
    .then(() => {
      console.log('\n✨ Monitoring dashboard demo completed!');
      console.log('📊 Check http://localhost:9090/metrics for Prometheus metrics');
      console.log('🏥 Check http://localhost:9090/health for health status');
      process.exit(0);
    })
    .catch(error => {
      console.error('Unexpected error:', error);
      process.exit(1);
    });
}

export { demonstrateMonitoring };