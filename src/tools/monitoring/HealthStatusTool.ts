/**
 * Tool for getting health check status
 */

import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse } from '../base/Tool.js';
import { MonitoringService } from '../../services/monitoring/MonitoringService.js';

export class HealthStatusTool extends BaseTool {
  name = 'health_status';
  description = 'Get current health status of the system and dependencies';

  inputSchema = z.object({
    checks: z.array(z.string()).optional().describe('Specific health checks to run'),
    format: z.enum(['json', 'summary', 'detailed']).default('summary').describe('Output format')
  });

  async execute(params: unknown, context: IToolContext): Promise<IToolResponse> {
    const input = this.validateInput<z.infer<typeof this.inputSchema>>(params);
    
    if (!context.monitoringService) {
      throw new Error('Monitoring service not configured');
    }

    const monitoring = context.monitoringService as MonitoringService;
    
    // Run health checks
    const results = input.checks 
      ? await Promise.all(input.checks.map(name => monitoring.health.runCheck(name)))
      : await monitoring.health.runAllChecks();

    const overallHealth = await monitoring.health.getOverallHealth();

    // Format output based on request
    let output: any;
    
    switch (input.format) {
      case 'detailed':
        output = {
          status: overallHealth,
          timestamp: new Date().toISOString(),
          checks: results.map(result => ({
            name: result.name,
            status: result.status,
            message: result.message,
            duration: `${result.duration}ms`,
            timestamp: result.timestamp,
            metadata: result.metadata
          }))
        };
        break;
        
      case 'json':
        output = monitoring.health.formatHttpResponse(results);
        break;
        
      case 'summary':
      default:
        output = {
          status: overallHealth,
          healthy: results.filter(r => r.status === 'healthy').length,
          degraded: results.filter(r => r.status === 'degraded').length,
          unhealthy: results.filter(r => r.status === 'unhealthy').length,
          totalChecks: results.length,
          timestamp: new Date().toISOString()
        };
        break;
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(output, null, 2),
        mimeType: 'application/json'
      }]
    };
  }

  getMetadata() {
    return {
      category: 'monitoring' as const,
      subcategory: 'health',
      isMutating: false,
      requiresAuth: false,
      rateLimit: { requests: 100, window: 60 }
    };
  }
}