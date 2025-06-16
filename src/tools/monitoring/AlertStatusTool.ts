/**
 * Tool for managing alerts
 */

import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse } from '../base/Tool.js';
import { MonitoringService } from '../../services/monitoring/MonitoringService.js';

export class AlertStatusTool extends BaseTool {
  name = 'alert_status';
  description = 'Get current alert status and manage alerts';

  inputSchema = z.object({
    action: z.enum(['list', 'acknowledge', 'silence', 'stats']).describe('Action to perform'),
    alertId: z.string().optional().describe('Alert ID for acknowledge/silence actions'),
    duration: z.number().optional().describe('Silence duration in milliseconds'),
    reason: z.string().optional().describe('Reason for silence')
  });

  async execute(params: unknown, context: IToolContext): Promise<IToolResponse> {
    const input = this.validateInput<z.infer<typeof this.inputSchema>>(params);
    
    if (!context.monitoringService) {
      throw new Error('Monitoring service not configured');
    }

    const monitoring = context.monitoringService as MonitoringService;
    let output: any;
    
    switch (input.action) {
      case 'list':
        const activeAlerts = monitoring.alerts.getActiveAlerts();
        output = {
          activeAlerts: activeAlerts.map(instance => ({
            alertId: instance.alert.id,
            name: instance.alert.name,
            severity: instance.alert.severity,
            status: instance.status,
            firedAt: instance.firedAt,
            value: instance.value,
            message: instance.alert.message,
            labels: instance.labels
          })),
          total: activeAlerts.length
        };
        break;
        
      case 'acknowledge':
        if (!input.alertId) {
          throw new Error('alertId required for acknowledge action');
        }
        monitoring.alerts.acknowledge(input.alertId);
        output = {
          action: 'acknowledged',
          alertId: input.alertId,
          timestamp: new Date().toISOString()
        };
        break;
        
      case 'silence':
        if (!input.alertId) {
          throw new Error('alertId required for silence action');
        }
        if (!input.duration) {
          throw new Error('duration required for silence action');
        }
        monitoring.alerts.silence(input.alertId, input.duration, input.reason);
        output = {
          action: 'silenced',
          alertId: input.alertId,
          duration: input.duration,
          until: new Date(Date.now() + input.duration).toISOString(),
          reason: input.reason
        };
        break;
        
      case 'stats':
        output = monitoring.alerts.getStats();
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
      subcategory: 'alerts',
      isMutating: true,
      requiresAuth: true,
      rateLimit: { maxCalls: 50, windowMs: 60000 }
    };
  }
}