import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuditLogger } from '../../src/security/AuditLogger.js';

describe('AuditLogger', () => {
  let auditLogger: AuditLogger;

  beforeEach(() => {
    auditLogger = new AuditLogger();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Event Logging', () => {
    it('should log success events', () => {
      const event = auditLogger.logSuccess('login', {
        userId: 'user1',
        metadata: { ip: '127.0.0.1' }
      });

      expect(event.id).toMatch(/^evt_/);
      expect(event.action).toBe('login');
      expect(event.status).toBe('success');
      expect(event.details.userId).toBe('user1');
      expect(event.details.metadata.ip).toBe('127.0.0.1');
      expect(event.timestamp).toBeInstanceOf(Date);
    });

    it('should log failure events', () => {
      const event = auditLogger.logFailure('api_call', 'Invalid API key', {
        apiKeyId: 'key1',
        endpoint: '/api/workflows'
      });

      expect(event.status).toBe('failure');
      expect(event.reason).toBe('Invalid API key');
      expect(event.details.apiKeyId).toBe('key1');
    });

    it('should log denied events', () => {
      const event = auditLogger.logDenied('access_resource', 'Insufficient permissions', {
        resourceId: 'wf1',
        requiredPermission: 'workflow.delete'
      });

      expect(event.status).toBe('denied');
      expect(event.reason).toBe('Insufficient permissions');
    });

    it('should log custom events', () => {
      const event = auditLogger.log({
        action: 'custom_action',
        status: 'success',
        userId: 'user1',
        apiKeyId: 'key1',
        details: { custom: 'data' }
      });

      expect(event.action).toBe('custom_action');
      expect(event.userId).toBe('user1');
      expect(event.apiKeyId).toBe('key1');
    });
  });

  describe('Event Querying', () => {
    beforeEach(() => {
      // Add test events
      auditLogger.logSuccess('login', { userId: 'user1' });
      auditLogger.logSuccess('login', { userId: 'user2' });
      auditLogger.logFailure('login', 'Invalid password', { userId: 'user3' });
      auditLogger.logSuccess('api_call', { apiKeyId: 'key1' });
      auditLogger.logDenied('access_resource', 'No permission', { userId: 'user1' });
    });

    it('should query events by action', () => {
      const events = auditLogger.queryEvents({ action: 'login' });
      expect(events).toHaveLength(3);
      expect(events.every(e => e.action === 'login')).toBe(true);
    });

    it('should query events by status', () => {
      const successEvents = auditLogger.queryEvents({ status: 'success' });
      expect(successEvents).toHaveLength(3);

      const failureEvents = auditLogger.queryEvents({ status: 'failure' });
      expect(failureEvents).toHaveLength(1);
    });

    it('should query events by userId', () => {
      const events = auditLogger.queryEvents({ userId: 'user1' });
      expect(events).toHaveLength(2);
      expect(events.every(e => e.userId === 'user1')).toBe(true);
    });

    it('should query events by multiple criteria', () => {
      const events = auditLogger.queryEvents({
        action: 'login',
        status: 'success'
      });
      expect(events).toHaveLength(2);
    });

    it('should query events by time range', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

      const events = auditLogger.queryEvents({
        startTime: twoHoursAgo,
        endTime: now
      });
      expect(events).toHaveLength(5);

      const noEvents = auditLogger.queryEvents({
        startTime: new Date(now.getTime() + 60000),
        endTime: new Date(now.getTime() + 120000)
      });
      expect(noEvents).toHaveLength(0);
    });

    it('should limit query results', () => {
      const events = auditLogger.queryEvents({ limit: 3 });
      expect(events).toHaveLength(3);
    });
  });

  describe('Event Cleanup', () => {
    it('should clean up old events when limit exceeded', () => {
      const logger = new AuditLogger(100); // Max 100 events

      // Add 150 events
      for (let i = 0; i < 150; i++) {
        logger.logSuccess('test', { index: i });
      }

      const events = logger.queryEvents({});
      expect(events.length).toBeLessThanOrEqual(100);
      
      // Should keep the most recent events
      expect(events[0].details.index).toBeGreaterThan(40);
    });
  });

  describe('Statistics', () => {
    beforeEach(() => {
      // Add events with different timestamps
      const baseTime = new Date('2024-01-15T10:00:00Z');
      vi.setSystemTime(baseTime);
      
      auditLogger.logSuccess('login', { userId: 'user1' });
      auditLogger.logSuccess('api_call', { userId: 'user1' });
      
      vi.setSystemTime(new Date(baseTime.getTime() + 30 * 60 * 1000)); // 30 minutes later
      auditLogger.logFailure('login', 'Invalid password', { userId: 'user2' });
      auditLogger.logDenied('access_resource', 'No permission', { userId: 'user3' });
    });

    it('should calculate statistics for time range', () => {
      const startTime = new Date('2024-01-15T09:00:00Z');
      const endTime = new Date('2024-01-15T11:00:00Z');
      
      const stats = auditLogger.getStatistics(startTime, endTime);
      
      expect(stats.totalEvents).toBe(4);
      expect(stats.byAction.login).toBe(2);
      expect(stats.byAction.api_call).toBe(1);
      expect(stats.byAction.access_resource).toBe(1);
      expect(stats.byResult.success).toBe(2);
      expect(stats.byResult.failure).toBe(1);
      expect(stats.byResult.denied).toBe(1);
      expect(Object.keys(stats.byUser).length).toBe(3);
    });

    it('should identify top users', () => {
      // Add more events for user1
      auditLogger.logSuccess('api_call', { userId: 'user1' });
      auditLogger.logSuccess('workflow_create', { userId: 'user1' });

      const stats = auditLogger.getStatistics(
        new Date('2024-01-15T09:00:00Z'),
        new Date('2024-01-15T11:00:00Z')
      );

      expect(stats.byUser['user1']).toBe(4);
    });
  });

  describe('Suspicious Activity Detection', () => {
    it('should detect rapid failed login attempts', () => {
      const baseTime = new Date();
      vi.setSystemTime(baseTime);

      // Add multiple failed login attempts for same user
      for (let i = 0; i < 15; i++) {
        auditLogger.logFailure('login', 'Invalid password', { 
          userId: 'attacker',
          metadata: { ip: '10.0.0.1' }
        });
        vi.setSystemTime(new Date(baseTime.getTime() + i * 1000)); // 1 second apart
      }

      const suspicious = auditLogger.detectSuspiciousActivity();
      
      expect(suspicious.failureSpikes).toHaveLength(1);
      expect(suspicious.failureSpikes[0].userId).toBe('attacker');
      expect(suspicious.failureSpikes[0].failures).toBe(15);
    });

    it('should detect rapid permission denials', () => {
      const baseTime = new Date();
      vi.setSystemTime(baseTime);

      // Add multiple permission denials
      for (let i = 0; i < 11; i++) {
        auditLogger.logDenied('access_resource', 'No permission', {
          userId: 'scanner',
          resourceId: `resource${i}`
        });
        vi.setSystemTime(new Date(baseTime.getTime() + i * 500)); // 500ms apart
      }

      const suspicious = auditLogger.detectSuspiciousActivity();
      
      expect(suspicious.denialSpikes).toHaveLength(1);
      expect(suspicious.denialSpikes[0].userId).toBe('scanner');
      expect(suspicious.denialSpikes[0].denials).toBe(11);
    });

    it('should detect unusual activity patterns', () => {
      const baseTime = new Date();
      vi.setSystemTime(baseTime);

      // Normal activity for user
      for (let i = 0; i < 5; i++) {
        auditLogger.logSuccess('api_call', { userId: 'normal_user' });
        vi.setSystemTime(new Date(baseTime.getTime() + i * 60000)); // 1 minute apart
      }

      // Sudden burst of activity
      vi.setSystemTime(new Date(baseTime.getTime() + 6 * 60000));
      for (let i = 0; i < 50; i++) {
        auditLogger.logSuccess('api_call', { userId: 'normal_user' });
        vi.setSystemTime(new Date(baseTime.getTime() + 6 * 60000 + i * 100)); // 100ms apart
      }

      const suspicious = auditLogger.detectSuspiciousActivity();
      
      // The unusualActions tracks actions, not users
      expect(suspicious.unusualActions).toHaveLength(1);
      expect(suspicious.unusualActions[0].action).toBe('api_call');
      expect(suspicious.unusualActions[0].count).toBe(55); // 5 + 50
    });

    it('should not flag normal activity as suspicious', () => {
      const baseTime = new Date();
      vi.setSystemTime(baseTime);

      // Normal activity patterns
      auditLogger.logSuccess('login', { userId: 'user1' });
      vi.setSystemTime(new Date(baseTime.getTime() + 60000));
      auditLogger.logSuccess('api_call', { userId: 'user1' });
      vi.setSystemTime(new Date(baseTime.getTime() + 120000));
      auditLogger.logFailure('login', 'Wrong password', { userId: 'user2' });

      const suspicious = auditLogger.detectSuspiciousActivity();
      
      expect(suspicious.failureSpikes).toHaveLength(0);
      expect(suspicious.denialSpikes).toHaveLength(0);
      expect(suspicious.unusualActions).toHaveLength(0);
    });
  });

  describe('Event Export', () => {
    it('should export events for archival', () => {
      auditLogger.logSuccess('login', { userId: 'user1' });
      auditLogger.logFailure('api_call', 'Error', { userId: 'user2' });

      const events = auditLogger.queryEvents({});
      
      expect(events).toHaveLength(2);
      expect(events[0]).toHaveProperty('id');
      expect(events[0]).toHaveProperty('timestamp');
      expect(events[0]).toHaveProperty('action');
      expect(events[0]).toHaveProperty('status');
    });
  });
});