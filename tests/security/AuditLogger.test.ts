import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AuditLogger } from '../../src/security/AuditLogger.js';

describe('AuditLogger', () => {
  let auditLogger: AuditLogger;

  beforeEach(() => {
    vi.useFakeTimers();
    auditLogger = new AuditLogger();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Event Logging', () => {
    it('should log success events', () => {
      auditLogger.logSuccess('login', {
        userId: 'user1',
        metadata: { ip: '127.0.0.1' }
      });

      const events = auditLogger.queryEvents({ action: 'login' });
      expect(events).toHaveLength(1);
      const event = events[0];
      
      expect(event.id).toMatch(/^evt_/);
      expect(event.action).toBe('login');
      expect(event.result).toBe('success');
      expect(event.userId).toBe('user1');
      expect(event.metadata?.ip).toBe('127.0.0.1');
      expect(event.timestamp).toBeInstanceOf(Date);
    });

    it('should log failure events', () => {
      auditLogger.logFailure('api_call', 'Invalid API key', {
        apiKeyId: 'key1'
      });

      const events = auditLogger.queryEvents({ action: 'api_call' });
      expect(events).toHaveLength(1);
      const event = events[0];
      
      expect(event.action).toBe('api_call');
      expect(event.result).toBe('failure');
      expect(event.details?.error).toBe('Invalid API key');
      expect(event.apiKeyId).toBe('key1');
    });

    it('should log denied events', () => {
      auditLogger.logDenied('access_resource', 'Insufficient permissions', {
        userId: 'user1',
        resource: { type: 'workflow', id: 'wf1' }
      });

      const events = auditLogger.queryEvents({ action: 'access_resource' });
      expect(events).toHaveLength(1);
      const event = events[0];
      
      expect(event.action).toBe('access_resource');
      expect(event.result).toBe('denied');
      expect(event.details?.reason).toBe('Insufficient permissions');
      expect(event.userId).toBe('user1');
      expect(event.resource?.id).toBe('wf1');
    });

    it('should log custom events', () => {
      auditLogger.logEvent({
        action: 'custom_action',
        result: 'success',
        userId: 'user1',
        details: { custom: 'data' }
      });

      const events = auditLogger.queryEvents({});
      expect(events).toHaveLength(1);
      expect(events[0].action).toBe('custom_action');
    });
  });

  describe('Event Querying', () => {
    beforeEach(() => {
      // Add some test events
      auditLogger.logSuccess('login', { userId: 'user1' });
      auditLogger.logSuccess('api_call', { userId: 'user2' });
      auditLogger.logFailure('login', 'Wrong password', { userId: 'user3' });
      auditLogger.logDenied('access_resource', 'No permission', { userId: 'user1' });
      auditLogger.logSuccess('api_call', { userId: 'user1' });
    });

    it('should query events by action', () => {
      const loginEvents = auditLogger.queryEvents({ action: 'login' });
      expect(loginEvents).toHaveLength(2);
      
      const apiEvents = auditLogger.queryEvents({ action: 'api_call' });
      expect(apiEvents).toHaveLength(2);
    });

    it('should query events by status', () => {
      const successEvents = auditLogger.queryEvents({ result: 'success' });
      expect(successEvents).toHaveLength(3);
      
      const failureEvents = auditLogger.queryEvents({ result: 'failure' });
      expect(failureEvents).toHaveLength(1);
      
      const deniedEvents = auditLogger.queryEvents({ result: 'denied' });
      expect(deniedEvents).toHaveLength(1);
    });

    it('should query events by userId', () => {
      const user1Events = auditLogger.queryEvents({ userId: 'user1' });
      expect(user1Events).toHaveLength(3);
      
      const user2Events = auditLogger.queryEvents({ userId: 'user2' });
      expect(user2Events).toHaveLength(1);
    });

    it('should query events by multiple criteria', () => {
      const query = {
        userId: 'user1',
        result: 'success'
      };
      
      const events = auditLogger.queryEvents(query);
      expect(events).toHaveLength(2);
      expect(events.every(e => e.userId === 'user1' && e.result === 'success')).toBe(true);
    });

    it('should query events by time range', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      
      const events = auditLogger.queryEvents({
        startTime: oneHourAgo,
        endTime: oneHourFromNow
      });
      
      expect(events).toHaveLength(5);
    });

    it('should limit query results', () => {
      const events = auditLogger.queryEvents({ limit: 2 });
      expect(events).toHaveLength(2);
    });
  });

  describe('Event Cleanup', () => {
    it('should clean up old events when limit exceeded', () => {
      const logger = new AuditLogger(100); // Max 100 events

      // Add 150 events
      for (let i = 0; i < 150; i++) {
        logger.logSuccess('test', { details: { index: i } });
      }

      const events = logger.queryEvents({});
      expect(events.length).toBeLessThanOrEqual(100);
      
      // Should keep the most recent events
      expect(events[0].details?.index).toBeGreaterThan(40);
    });
  });

  describe('Statistics', () => {
    beforeEach(() => {
      vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
      
      // Add events with specific timestamps
      auditLogger.logSuccess('login', { 
        userId: 'user1',
        metadata: { timestamp: new Date('2024-01-15T10:00:00Z') }
      });
      auditLogger.logSuccess('api_call', { 
        userId: 'user1',
        metadata: { timestamp: new Date('2024-01-15T10:30:00Z') }
      });
      auditLogger.logFailure('login', 'Wrong password', { 
        userId: 'user2',
        metadata: { timestamp: new Date('2024-01-15T10:30:00Z') }
      });
      auditLogger.logDenied('access_resource', 'No permission', { 
        userId: 'user3',
        metadata: { timestamp: new Date('2024-01-15T10:30:00Z') }
      });
    });

    it('should calculate statistics for time range', () => {
      const stats = auditLogger.getStatistics(
        new Date('2024-01-15T10:00:00Z'),
        new Date('2024-01-15T11:00:00Z')
      );

      expect(stats.totalEvents).toBe(4);
      expect(stats.successCount).toBe(2);
      expect(stats.failureCount).toBe(1);
      expect(stats.deniedCount).toBe(1);
      expect(stats.actionBreakdown.login).toBe(2);
      expect(stats.actionBreakdown.api_call).toBe(1);
    });

    it('should identify top users', () => {
      const stats = auditLogger.getStatistics(
        new Date('2024-01-15T10:00:00Z'),
        new Date('2024-01-15T11:00:00Z')
      );

      expect(stats.topUsers[0]).toEqual({ userId: 'user1', count: 2 });
      expect(stats.topUsers).toHaveLength(3);
    });
  });

  describe('Suspicious Activity Detection', () => {
    it('should detect rapid failed login attempts', () => {
      const now = new Date();
      
      // Simulate 10 failed logins in 1 minute
      for (let i = 0; i < 10; i++) {
        vi.setSystemTime(new Date(now.getTime() + i * 5000)); // 5 seconds apart
        auditLogger.logFailure('login', 'Wrong password', { userId: 'attacker' });
      }

      const suspicious = auditLogger.detectSuspiciousActivity();
      expect(suspicious).toHaveLength(1);
      expect(suspicious[0].type).toBe('rapid_failures');
      expect(suspicious[0].userId).toBe('attacker');
    });

    it('should detect rapid permission denials', () => {
      const now = new Date();
      
      // Simulate 15 permission denials in 2 minutes
      for (let i = 0; i < 15; i++) {
        vi.setSystemTime(new Date(now.getTime() + i * 8000)); // 8 seconds apart
        auditLogger.logDenied('access_resource', 'No permission', {
          userId: 'scanner',
          resource: { type: 'workflow', id: `wf${i}` }
        });
      }

      const suspicious = auditLogger.detectSuspiciousActivity();
      expect(suspicious).toHaveLength(1);
      expect(suspicious[0].type).toBe('permission_scanning');
    });

    it('should detect unusual activity patterns', () => {
      const now = new Date();
      
      // Normal activity during day
      vi.setSystemTime(new Date('2024-01-15T14:00:00Z'));
      for (let i = 0; i < 5; i++) {
        auditLogger.logSuccess('api_call', { userId: 'normal_user' });
      }

      // Unusual activity at 3 AM
      vi.setSystemTime(new Date('2024-01-15T03:00:00Z'));
      for (let i = 0; i < 20; i++) {
        auditLogger.logSuccess('api_call', { 
          userId: 'normal_user',
          metadata: { timestamp: new Date('2024-01-15T03:00:00Z') }
        });
      }

      const suspicious = auditLogger.detectSuspiciousActivity();
      const unusualTime = suspicious.find(s => s.type === 'unusual_time_activity');
      expect(unusualTime).toBeDefined();
    });

    it('should not flag normal activity as suspicious', () => {
      const now = new Date();
      
      // Normal login and API usage
      vi.setSystemTime(now);
      auditLogger.logSuccess('login', { userId: 'user1' });
      
      vi.advanceTimersByTime(60000); // 1 minute later
      auditLogger.logSuccess('api_call', { userId: 'user1' });

      const suspicious = auditLogger.detectSuspiciousActivity();
      expect(suspicious).toHaveLength(0);
    });
  });

  describe('Event Export', () => {
    it('should export events for archival', () => {
      auditLogger.logSuccess('login', { userId: 'user1' });
      
      const exported = auditLogger.exportEvents();
      expect(exported.events).toHaveLength(1);
      expect(exported.exportedAt).toBeInstanceOf(Date);
      expect(exported.format).toBe('json');
    });
  });
});