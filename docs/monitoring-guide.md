# Monitoring and Analytics Guide

This guide covers the comprehensive monitoring and analytics capabilities of the n8n MCP Server.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Configuration](#configuration)
4. [Metrics Collection](#metrics-collection)
5. [Health Checks](#health-checks)
6. [Analytics](#analytics)
7. [Alerting](#alerting)
8. [SLO Tracking](#slo-tracking)
9. [Telemetry](#telemetry)
10. [Dashboard APIs](#dashboard-apis)
11. [Examples](#examples)
12. [Best Practices](#best-practices)

## Overview

The n8n MCP Server includes a comprehensive monitoring and analytics system that provides:

- **Real-time Metrics**: Track performance, usage, and errors
- **Health Monitoring**: Check system and dependency health
- **Analytics**: Track user behavior and tool usage patterns
- **Alerting**: Get notified about issues and anomalies
- **SLO Tracking**: Monitor service level objectives
- **Distributed Tracing**: Track request flow through the system
- **Dashboard APIs**: Build custom monitoring dashboards

## Architecture

```
┌─────────────────────────────────────────┐
│          MCP Client/Dashboard           │
├─────────────────────────────────────────┤
│         Monitoring Tools API            │
├─────────────────────────────────────────┤
│        Monitoring Service               │
├─────┬─────┬─────┬─────┬─────┬─────────┤
│Metrics│Health│Analytics│Alerts│ SLOs │Trace│
├─────┴─────┴─────┴─────┴─────┴─────────┤
│         Storage & Export                │
└─────────────────────────────────────────┘
```

## Configuration

### Basic Configuration

```typescript
const server = new N8nMcpServer({
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
      evaluationInterval: 60000
    },
    slo: {
      enabled: true,
      evaluationInterval: 60000
    },
    telemetry: {
      enabled: true,
      exporter: 'console'
    }
  }
});
```

### Advanced Configuration

```typescript
const config: IMonitoringConfig = {
  metrics: {
    enabled: true,
    port: 9090,
    path: '/metrics',
    defaultLabels: {
      service: 'n8n-mcp',
      environment: 'production',
      region: 'us-east-1'
    }
  },
  health: {
    enabled: true,
    path: '/health',
    checks: [
      // Custom health checks
      {
        name: 'custom_check',
        description: 'My custom health check',
        timeout: 5000,
        check: async () => ({
          status: HealthStatus.HEALTHY,
          message: 'All good'
        })
      }
    ]
  },
  analytics: {
    enabled: true,
    provider: 'segment',
    apiKey: 'your-segment-key',
    flushInterval: 30000
  },
  alerts: {
    enabled: true,
    evaluationInterval: 60000,
    notificationChannels: [
      {
        type: 'slack',
        config: {
          webhookUrl: 'https://hooks.slack.com/...'
        }
      }
    ]
  },
  slo: {
    enabled: true,
    evaluationInterval: 300000 // 5 minutes
  },
  telemetry: {
    enabled: true,
    exporter: 'jaeger',
    endpoint: 'http://localhost:14268/api/traces',
    serviceName: 'n8n-mcp-production'
  }
};
```

## Metrics Collection

### Standard Metrics

The system automatically collects these metrics:

| Metric | Type | Description |
|--------|------|-------------|
| `mcp_requests_total` | Counter | Total number of MCP requests |
| `mcp_requests_successful_total` | Counter | Successful requests |
| `mcp_requests_fast_total` | Counter | Requests completed under 1 second |
| `mcp_errors_total` | Counter | Total errors by type |
| `mcp_response_time_ms` | Histogram | Response time distribution |
| `mcp_active_connections` | Gauge | Current active connections |
| `mcp_rate_limit_exceeded_total` | Counter | Rate limit violations |
| `process_heap_bytes` | Gauge | Process memory usage |
| `process_cpu_usage` | Gauge | Process CPU usage |

### Custom Metrics

```typescript
// Register custom metrics
const customCounter = monitoring.metrics.registerCounter({
  name: 'workflow_executions_total',
  help: 'Total workflow executions',
  labels: ['workflow_id', 'status']
});

// Use the metric
customCounter.increment({ 
  workflow_id: '123', 
  status: 'success' 
});
```

### Querying Metrics

```typescript
// Query all metrics
const metrics = await server.executeTool('metrics_query', {
  format: 'json'
});

// Query specific metrics
const response = await server.executeTool('metrics_query', {
  metricNames: ['mcp_requests_total', 'mcp_errors_total'],
  format: 'table'
});

// Get Prometheus format
const prometheus = await server.executeTool('metrics_query', {
  format: 'prometheus'
});
```

## Health Checks

### Built-in Health Checks

- **n8n API**: Checks connectivity to n8n instance
- **Memory**: Monitors heap usage
- **Database**: Checks database connectivity (if configured)
- **Redis**: Checks cache availability (if configured)

### Health Check Results

```typescript
// Get health status
const health = await server.executeTool('health_status', {
  format: 'detailed'
});

// Response format
{
  "status": "healthy",
  "timestamp": "2024-01-17T10:00:00Z",
  "checks": {
    "n8n_api": {
      "status": "healthy",
      "message": "n8n API is reachable",
      "duration": "45ms",
      "metadata": {
        "version": "1.23.0",
        "instanceId": "abc123"
      }
    },
    "memory": {
      "status": "healthy",
      "message": "Memory usage is normal",
      "duration": "1ms",
      "metadata": {
        "heapUsedMB": 125,
        "heapTotalMB": 512,
        "heapPercent": 24
      }
    }
  }
}
```

### Custom Health Checks

```typescript
monitoring.health.register({
  name: 'external_api',
  description: 'Check external API',
  timeout: 3000,
  check: async () => {
    const response = await fetch('https://api.example.com/health');
    return {
      status: response.ok ? HealthStatus.HEALTHY : HealthStatus.UNHEALTHY,
      message: `API returned ${response.status}`
    };
  }
});
```

## Analytics

### Event Tracking

```typescript
// Track custom events
monitoring.analytics.track('workflow_created', {
  workflowId: '123',
  nodeCount: 5,
  hasWebhook: true
});

// Track user actions
monitoring.analytics.identify('user123', {
  plan: 'enterprise',
  company: 'Acme Corp'
});

// Track page views
monitoring.analytics.page('dashboard', {
  section: 'workflows'
});
```

### Querying Analytics

```typescript
// Get event statistics
const stats = await server.executeTool('analytics_query', {
  query: 'stats',
  filters: {
    start: '2024-01-17T00:00:00Z',
    end: '2024-01-17T23:59:59Z'
  }
});

// Get user journey
const journey = await server.executeTool('analytics_query', {
  query: 'user_journey',
  filters: {
    userId: 'user123'
  }
});
```

## Alerting

### Default Alerts

```typescript
// Standard alerts configured automatically:
- High Error Rate (>100 errors)
- High Response Time (>1 second)
- High Memory Usage (>1GB)
- API Unavailable
- Rate Limit Exceeded
```

### Managing Alerts

```typescript
// Get alert status
const alerts = await server.executeTool('alert_status', {
  action: 'list'
});

// Acknowledge an alert
await server.executeTool('alert_status', {
  action: 'acknowledge',
  alertId: 'high_error_rate'
});

// Silence an alert
await server.executeTool('alert_status', {
  action: 'silence',
  alertId: 'high_memory_usage',
  duration: 3600000, // 1 hour
  reason: 'Known issue, working on fix'
});
```

### Custom Alerts

```typescript
monitoring.alerts.registerAlert({
  id: 'workflow_failures',
  name: 'High Workflow Failure Rate',
  condition: 'workflow_failures_total > 50',
  severity: AlertSeverity.WARNING,
  message: 'More than 50 workflow failures in the last hour',
  threshold: 50,
  duration: 3600000,
  labels: { team: 'platform' }
});
```

## SLO Tracking

### Default SLOs

```typescript
// Standard SLOs:
- API Availability: 99.9% success rate
- Response Time: 95% of requests under 1 second
- Error Rate: 99.5% successful operations
```

### SLO Status

```typescript
// Get all SLO statuses
const slos = await server.executeTool('slo_status', {
  format: 'detailed'
});

// Get specific SLO report
const report = await server.executeTool('slo_status', {
  sloId: 'api_availability',
  format: 'report',
  reportPeriod: {
    start: '2024-01-01T00:00:00Z',
    end: '2024-01-31T23:59:59Z'
  }
});
```

### Custom SLOs

```typescript
monitoring.slos.registerSLO({
  id: 'workflow_success_rate',
  name: 'Workflow Success Rate',
  description: 'Percentage of successful workflow executions',
  target: 99,
  window: 'rolling',
  windowDuration: 86400, // 24 hours
  indicator: {
    good: 'workflow_executions_successful',
    total: 'workflow_executions_total'
  }
});
```

## Telemetry

### Distributed Tracing

```typescript
// Automatic tracing for tools
const span = monitoring.telemetry.startSpan('workflow_execution');
try {
  // Do work
  monitoring.telemetry.setAttribute(span, 'workflow.id', '123');
  monitoring.telemetry.addEvent(span, 'nodes_executed', { count: 5 });
} finally {
  monitoring.telemetry.endSpan(span);
}

// Trace helper
await monitoring.telemetry.trace('database_query', async (span) => {
  monitoring.telemetry.setAttribute(span, 'db.statement', 'SELECT * FROM workflows');
  return await db.query('...');
});
```

## Dashboard APIs

### Monitoring Overview

```typescript
// Get comprehensive overview
const overview = await server.executeTool('monitoring_overview', {
  sections: ['status', 'health', 'metrics', 'alerts', 'slos', 'analytics', 'telemetry']
});
```

### Building Dashboards

```typescript
// Example: Real-time dashboard data
async function getDashboardData() {
  const [overview, metrics, health, alerts] = await Promise.all([
    server.executeTool('monitoring_overview', { sections: ['status'] }),
    server.executeTool('metrics_query', { format: 'json' }),
    server.executeTool('health_status', { format: 'summary' }),
    server.executeTool('alert_status', { action: 'stats' })
  ]);

  return {
    overview,
    metrics,
    health,
    alerts,
    timestamp: new Date()
  };
}
```

## Examples

### Example 1: Monitoring Dashboard

```typescript
// See examples/monitoring-dashboard.ts for a complete example
import { demonstrateMonitoring } from './examples/monitoring-dashboard.js';

await demonstrateMonitoring();
```

### Example 2: Custom Metrics

```typescript
// Track workflow performance
const workflowDuration = monitoring.metrics.registerHistogram({
  name: 'workflow_duration_seconds',
  help: 'Workflow execution duration',
  labels: ['workflow_id'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60]
});

// Record execution
const start = Date.now();
await executeWorkflow(workflowId);
const duration = (Date.now() - start) / 1000;

workflowDuration.observe(duration, { workflow_id: workflowId });
```

### Example 3: Performance Monitoring

```typescript
// Monitor tool performance
monitoring.telemetry.instrument(
  'workflow_create',
  createWorkflow,
  { attributes: { category: 'workflow' } }
);

// The function is now automatically traced
const workflow = await createWorkflow({ name: 'Test' });
```

## Best Practices

### 1. Metric Naming

Follow Prometheus naming conventions:
- Use lowercase letters and underscores
- Include unit suffix (e.g., `_seconds`, `_bytes`)
- Use consistent prefixes (e.g., `mcp_`)

### 2. Label Usage

- Keep cardinality low (avoid unique IDs as labels)
- Use consistent label names across metrics
- Document label meanings

### 3. Alert Design

- Set appropriate thresholds based on baselines
- Include context in alert messages
- Use severity levels appropriately
- Implement alert fatigue prevention

### 4. SLO Setting

- Start with achievable targets
- Base on actual performance data
- Consider error budget implications
- Review and adjust regularly

### 5. Performance Impact

- Monitor the monitoring overhead
- Use sampling for high-volume metrics
- Configure appropriate retention periods
- Optimize query patterns

### 6. Security

- Protect metrics endpoints
- Sanitize sensitive data in logs
- Implement access controls
- Audit metric access

## Troubleshooting

### Common Issues

1. **Metrics not appearing**
   - Check if monitoring is enabled
   - Verify metrics server is running
   - Check firewall rules for port access

2. **Health checks failing**
   - Review timeout settings
   - Check dependency connectivity
   - Verify authentication credentials

3. **Alerts not firing**
   - Check evaluation interval
   - Verify metric values
   - Review alert conditions

4. **High memory usage**
   - Reduce metric cardinality
   - Decrease retention period
   - Enable metric aggregation

## Conclusion

The monitoring and analytics system provides comprehensive observability for your n8n MCP Server. By leveraging metrics, health checks, analytics, alerts, SLOs, and telemetry, you can ensure reliable operation and optimal performance of your automation workflows.