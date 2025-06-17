/**
 * Tool for querying analytics data
 */

import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse } from '../base/Tool.js';
import { MonitoringService, AnalyticsTracker } from '../../services/monitoring/index.js';

export class AnalyticsQueryTool extends BaseTool {
  name = 'analytics_query';
  description = 'Query analytics events and generate insights';

  inputSchema = z.object({
    query: z.enum(['stats', 'events', 'user_journey', 'session_journey']).describe('Type of analytics query'),
    filters: z.object({
      event: z.string().optional().describe('Filter by event name'),
      userId: z.string().optional().describe('Filter by user ID'),
      sessionId: z.string().optional().describe('Filter by session ID'),
      start: z.string().optional().describe('Start time in ISO format'),
      end: z.string().optional().describe('End time in ISO format')
    }).optional().describe('Query filters'),
    limit: z.number().min(1).max(1000).default(100).describe('Maximum results to return')
  });

  async execute(params: unknown, context: IToolContext): Promise<IToolResponse> {
    const input = this.validateInput<z.infer<typeof this.inputSchema>>(params);
    
    if (!context.monitoringService) {
      throw new Error('Monitoring service not configured');
    }

    const monitoring = context.monitoringService as MonitoringService;
    const analytics = monitoring.analytics as AnalyticsTracker;
    
    let output: any;
    
    switch (input.query) {
      case 'stats':
        const timeRange = input.filters?.start && input.filters?.end ? {
          start: new Date(input.filters.start),
          end: new Date(input.filters.end)
        } : undefined;
        
        output = analytics.getEventStats(timeRange);
        break;
        
      case 'events':
        // This would need access to the internal store, which we'd expose via a method
        output = {
          message: 'Event query not yet implemented',
          filters: input.filters
        };
        break;
        
      case 'user_journey':
        if (!input.filters?.userId) {
          throw new Error('userId filter required for user_journey query');
        }
        const userEvents = analytics.getUserJourney(input.filters.userId);
        output = {
          userId: input.filters.userId,
          events: userEvents.slice(0, input.limit).map(e => ({
            event: e.event,
            timestamp: e.timestamp,
            properties: e.properties,
            sessionId: e.sessionId
          }))
        };
        break;
        
      case 'session_journey':
        if (!input.filters?.sessionId) {
          throw new Error('sessionId filter required for session_journey query');
        }
        const sessionEvents = analytics.getSessionJourney(input.filters.sessionId);
        output = {
          sessionId: input.filters.sessionId,
          events: sessionEvents.slice(0, input.limit).map(e => ({
            event: e.event,
            timestamp: e.timestamp,
            properties: e.properties,
            userId: e.userId
          }))
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
      subcategory: 'analytics',
      isMutating: false,
      requiresAuth: false,
      rateLimit: { requests: 100, window: 60 }
    };
  }
}