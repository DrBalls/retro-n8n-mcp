import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ErrorHandler } from '../../src/utils/ErrorHandler.js';
import {
  N8nApiError,
  N8nConnectionError,
  N8nRateLimitError,
  N8nAuthenticationError,
  N8nValidationError,
  N8nTimeoutError
} from '../../src/utils/errors.js';

describe('ErrorHandler', () => {
  beforeEach(() => {
    ErrorHandler.clearErrorTracking();
    vi.clearAllMocks();
  });

  describe('handle', () => {
    it('should handle rate limit errors with retry strategy', async () => {
      const error = new N8nRateLimitError('Too many requests', 5000);
      const context = { operation: 'listWorkflows' };

      const strategy = await ErrorHandler.handle(error, context);

      expect(strategy.shouldRetry).toBe(true);
      expect(strategy.retryDelay).toBe(5000);
      expect(strategy.userMessage).toContain('Rate limit reached');
      expect(strategy.developerMessage).toContain('Retry after 5000ms');
    });

    it('should handle authentication errors without retry', async () => {
      const error = new N8nAuthenticationError('Invalid API key');
      const context = { operation: 'authenticate' };

      const strategy = await ErrorHandler.handle(error, context);

      expect(strategy.shouldRetry).toBe(false);
      expect(strategy.userMessage).toContain('Authentication failed');
      expect(strategy.alternativeAction).toBeDefined();
    });

    it('should handle connection errors with exponential backoff', async () => {
      const error = new N8nConnectionError('Connection refused');
      const context = { operation: 'connect', attempt: 2, maxAttempts: 3 };

      const strategy = await ErrorHandler.handle(error, context);

      expect(strategy.shouldRetry).toBe(true);
      expect(strategy.retryDelay).toBe(2000); // 1000 * 2^(2-1)
      expect(strategy.userMessage).toContain('Connection error');
    });

    it('should handle validation errors without retry', async () => {
      const error = new N8nValidationError('Invalid input', [
        { field: 'name', message: 'Required field' }
      ]);
      const context = { operation: 'createWorkflow' };

      const strategy = await ErrorHandler.handle(error, context);

      expect(strategy.shouldRetry).toBe(false);
      expect(strategy.userMessage).toContain('Invalid input data');
      expect(strategy.alternativeAction).toBeDefined();
    });

    it('should track error occurrences', async () => {
      const error = new N8nApiError('Server error', 500);
      const context = { operation: 'test', resourceType: 'workflow' };

      // Generate multiple errors
      for (let i = 0; i < 3; i++) {
        await ErrorHandler.handle(error, context);
      }

      const stats = ErrorHandler.getErrorStats();
      expect(stats['unknown:test:workflow']).toBeDefined();
      expect(stats['unknown:test:workflow'].count).toBe(3);
    });
  });

  describe('retry', () => {
    it('should retry operation on retryable errors', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new N8nConnectionError('Connection failed'))
        .mockRejectedValueOnce(new N8nConnectionError('Connection failed'))
        .mockResolvedValueOnce('success');

      const result = await ErrorHandler.retry(
        operation,
        { operation: 'test' },
        3
      );

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should not retry on non-retryable errors', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new N8nAuthenticationError('Invalid credentials'));

      await expect(ErrorHandler.retry(
        operation,
        { operation: 'test' },
        3
      )).rejects.toThrow('Invalid credentials');

      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should respect max attempts', async () => {
      const operation = vi.fn()
        .mockRejectedValue(new N8nConnectionError('Connection failed'));

      await expect(ErrorHandler.retry(
        operation,
        { operation: 'test' },
        2
      )).rejects.toThrow();

      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should wait with exponential backoff between retries', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new N8nTimeoutError('Timeout', 1000))
        .mockResolvedValueOnce('success');

      const startTime = Date.now();
      const result = await ErrorHandler.retry(
        operation,
        { operation: 'test' },
        2
      );
      const endTime = Date.now();

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
      expect(endTime - startTime).toBeGreaterThanOrEqual(5000); // Should wait at least 5s
    });
  });

  describe('createContextualError', () => {
    it('should add context to error messages', () => {
      const originalError = new Error('Original message');
      const context = {
        operation: 'createWorkflow',
        resourceType: 'workflow',
        resourceId: '123'
      };

      const contextualError = ErrorHandler.createContextualError(originalError, context);

      expect(contextualError.message).toContain('Original message');
      expect(contextualError.message).toContain('operation=createWorkflow');
      expect(contextualError.message).toContain('resourceType=workflow');
      expect(contextualError.message).toContain('resourceId=123');
    });

    it('should preserve error type for N8nApiError', () => {
      const originalError = new N8nApiError('API error', 404, 'NOT_FOUND');
      const context = { operation: 'getWorkflow' };

      const contextualError = ErrorHandler.createContextualError(originalError, context);

      expect(contextualError).toBeInstanceOf(N8nApiError);
      expect((contextualError as N8nApiError).statusCode).toBe(404);
      expect((contextualError as N8nApiError).code).toBe('NOT_FOUND');
    });
  });

  describe('getErrorStats', () => {
    it('should return error statistics', async () => {
      const errors = [
        new N8nApiError('Error 1', 500),
        new N8nApiError('Error 2', 404),
        new N8nConnectionError('Connection failed')
      ];

      const contexts = [
        { operation: 'test1', resourceType: 'workflow' },
        { operation: 'test2', resourceType: 'execution' },
        { operation: 'test3', resourceType: 'credential' }
      ];

      for (let i = 0; i < errors.length; i++) {
        await ErrorHandler.handle(errors[i], contexts[i]);
      }

      const stats = ErrorHandler.getErrorStats();
      expect(Object.keys(stats)).toHaveLength(3);
      expect(stats['unknown:test1:workflow'].count).toBe(1);
      expect(stats['unknown:test2:execution'].count).toBe(1);
      expect(stats['unknown:test3:credential'].count).toBe(1);
    });
  });
});