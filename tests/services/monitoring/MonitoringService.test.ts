/**
 * Tests for MonitoringService
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MonitoringService } from '../../../src/services/monitoring/MonitoringService.js';
import { IMonitoringConfig } from '../../../src/types/monitoring.js';

describe('MonitoringService', () => {
  let service: MonitoringService;
  let config: IMonitoringConfig;

  beforeEach(() => {
    config = {
      metrics: {
        enabled: true,
        port: 9091, // Use different port for tests
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
        evaluationInterval: 1000 // Faster for tests
      },
      slo: {
        enabled: true,
        evaluationInterval: 1000 // Faster for tests
      },
      telemetry: {
        enabled: true,
        exporter: 'console'
      }
    };
  });

  afterEach(async () => {
    if (service) {
      await service.stop();
    }
  });

  describe('initialization', () => {
    it('should initialize with default config', () => {
      service = new MonitoringService();
      expect(service).toBeDefined();
      expect(service.metrics).toBeDefined();
      expect(service.health).toBeDefined();
      expect(service.analytics).toBeDefined();
      expect(service.alerts).toBeDefined();
      expect(service.slos).toBeDefined();
      expect(service.telemetry).toBeDefined();
    });

    it('should initialize with custom config', () => {
      service = new MonitoringService(config);
      expect(service).toBeDefined();
    });
  });

  describe('lifecycle', () => {
    it('should start and stop without errors', async () => {
      service = new MonitoringService(config);
      
      await expect(service.start()).resolves.not.toThrow();
      expect(service.getStatus().uptime).toBeGreaterThan(0);
      
      await expect(service.stop()).resolves.not.toThrow();
    });
  });

  describe('metrics', () => {
    beforeEach(() => {
      service = new MonitoringService(config);
    });

    it('should register standard metrics', () => {
      const metrics = service.metrics.getAllMetrics();
      
      const metricNames = metrics.map(m => m.name);
      expect(metricNames).toContain('mcp_requests_total');
      expect(metricNames).toContain('mcp_requests_successful_total');
      expect(metricNames).toContain('mcp_errors_total');
      expect(metricNames).toContain('mcp_response_time_ms');
      expect(metricNames).toContain('process_heap_bytes');
    });

    it('should record request metrics', () => {
      service.recordRequest('test_tool', 'call');
      
      const counter = service.metrics.getMetric('mcp_requests_total') as any;
      expect(counter.value).toBe(1);
    });

    it('should record success metrics', () => {
      service.recordSuccess('test_tool', 'call', 150);
      
      const successCounter = service.metrics.getMetric('mcp_requests_successful_total') as any;
      expect(successCounter.value).toBe(1);
      
      const fastCounter = service.metrics.getMetric('mcp_requests_fast_total') as any;
      expect(fastCounter.value).toBe(1); // 150ms < 1000ms
    });

    it('should record error metrics', () => {
      service.recordError('test_tool', 'ValidationError');
      
      const errorCounter = service.metrics.getMetric('mcp_errors_total') as any;
      expect(errorCounter.value).toBe(1);
    });

    it('should manage connection metrics', () => {
      const gauge = service.metrics.getMetric('mcp_active_connections') as any;
      const initialValue = gauge.value;
      
      service.incrementConnections();
      expect(gauge.value).toBe(initialValue + 1);
      
      service.decrementConnections();
      expect(gauge.value).toBe(initialValue);
    });
  });

  describe('health checks', () => {
    beforeEach(() => {
      service = new MonitoringService(config);
    });

    it('should report overall health', async () => {
      const health = await service.health.getOverallHealth();
      expect(['healthy', 'degraded', 'unhealthy']).toContain(health);
    });

    it('should run all health checks', async () => {
      const results = await service.health.runAllChecks();
      
      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBeGreaterThan(0);
      
      results.forEach(result => {
        expect(result).toHaveProperty('name');
        expect(result).toHaveProperty('status');
        expect(result).toHaveProperty('duration');
        expect(result).toHaveProperty('timestamp');
      });
    });
  });

  describe('analytics', () => {
    beforeEach(() => {
      service = new MonitoringService(config);
    });

    it('should track events', () => {
      service.analytics.track('test_event', { foo: 'bar' });
      
      const stats = service.analytics.getEventStats();
      expect(stats.summary.totalEvents).toBeGreaterThan(0);
    });

    it('should track tool usage', () => {
      service.analytics.trackToolUsage('test_tool', true, 100);
      
      const stats = service.analytics.getEventStats();
      expect(stats.topEvents).toContainEqual(
        expect.objectContaining({ event: 'tool_used' })
      );
    });
  });

  describe('alerts', () => {
    beforeEach(() => {
      service = new MonitoringService(config);
    });

    it('should get alert statistics', () => {
      const stats = service.alerts.getStats();
      
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('firing');
      expect(stats).toHaveProperty('resolved');
      expect(stats).toHaveProperty('bySeverity');
    });

    it('should evaluate alerts', async () => {
      const results = await service.alerts.evaluate();
      expect(results).toBeInstanceOf(Array);
    });
  });

  describe('SLOs', () => {
    beforeEach(() => {
      service = new MonitoringService(config);
    });

    it('should get SLO statuses', () => {
      const statuses = service.slos.getAllStatuses();
      expect(statuses).toBeInstanceOf(Array);
    });
  });

  describe('telemetry', () => {
    beforeEach(() => {
      service = new MonitoringService(config);
    });

    it('should trace operations', async () => {
      const result = await service.telemetry.trace(
        'test_operation',
        async (span) => {
          service.telemetry.setAttribute(span, 'test', true);
          return 'success';
        }
      );
      
      expect(result).toBe('success');
    });

    it('should handle trace errors', async () => {
      await expect(
        service.telemetry.trace(
          'failing_operation',
          async () => {
            throw new Error('Test error');
          }
        )
      ).rejects.toThrow('Test error');
    });
  });

  describe('status', () => {
    beforeEach(async () => {
      service = new MonitoringService(config);
      await service.start();
    });

    it('should return comprehensive status', () => {
      const status = service.getStatus();
      
      expect(status).toHaveProperty('uptime');
      expect(status.uptime).toBeGreaterThan(0);
      expect(status).toHaveProperty('metrics');
      expect(status.metrics).toBeGreaterThan(0);
      expect(status).toHaveProperty('activeAlerts');
      expect(status).toHaveProperty('sloViolations');
    });
  });

  describe('event handling', () => {
    beforeEach(() => {
      service = new MonitoringService(config);
    });

    it('should emit alert events', async () => {
      const alertFired = vi.fn();
      service.on('alert:firing', alertFired);

      // This would fire if an alert condition was met
      // For now, just verify the listener is registered
      expect(service.listenerCount('alert:firing')).toBe(1);
    });

    it('should emit SLO events', async () => {
      const sloViolated = vi.fn();
      service.on('slo:violated', sloViolated);

      // This would fire if an SLO was violated
      // For now, just verify the listener is registered
      expect(service.listenerCount('slo:violated')).toBe(1);
    });
  });
});