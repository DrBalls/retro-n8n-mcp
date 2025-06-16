import { describe, it, expect, beforeEach } from 'vitest';
import { ErrorDiagnostics } from '../../src/utils/ErrorDiagnostics.js';
import { 
  N8nApiError, 
  N8nConnectionError, 
  N8nAuthenticationError, 
  N8nValidationError 
} from '../../src/utils/errors.js';

describe('ErrorDiagnostics', () => {
  describe('diagnose', () => {
    it('should diagnose authentication errors with invalid API key', () => {
      const error = new N8nAuthenticationError('Invalid API key provided');
      const result = ErrorDiagnostics.diagnose(error);

      expect(result.errorType).toBe('InvalidApiKey');
      expect(result.probableCause).toContain('invalid or has been revoked');
      expect(result.suggestedFixes).toHaveLength(4);
      expect(result.documentation).toBe('https://docs.n8n.io/api/authentication/');
      expect(result.confidence).toBe('high');
    });

    it('should diagnose expired credentials', () => {
      const error = new N8nAuthenticationError('Token has expired');
      const result = ErrorDiagnostics.diagnose(error);

      expect(result.errorType).toBe('ExpiredCredentials');
      expect(result.probableCause).toContain('credentials have expired');
      expect(result.confidence).toBe('high');
    });

    it('should diagnose generic authentication errors', () => {
      const error = new N8nAuthenticationError('Authentication failed');
      const result = ErrorDiagnostics.diagnose(error);

      expect(result.errorType).toBe('AuthenticationError');
      expect(result.probableCause).toContain('invalid credentials');
      expect(result.confidence).toBe('medium');
    });

    it('should diagnose connection refused errors', () => {
      const error = new N8nConnectionError('Connection failed');
      // Mock the cause property
      Object.defineProperty(error, 'cause', {
        value: { message: 'ECONNREFUSED' },
        writable: true,
        enumerable: true,
        configurable: true
      });
      const result = ErrorDiagnostics.diagnose(error);

      expect(result.errorType).toBe('ConnectionRefused');
      expect(result.probableCause).toContain('not running or not accessible');
      expect(result.relatedErrors).toContain('ECONNREFUSED');
      expect(result.confidence).toBe('high');
    });

    it('should diagnose timeout errors', () => {
      const error = new N8nConnectionError('Request timeout');
      const result = ErrorDiagnostics.diagnose(error);

      expect(result.errorType).toBe('ConnectionTimeout');
      expect(result.probableCause).toContain('timed out');
      expect(result.confidence).toBe('high');
    });

    it('should diagnose SSL certificate errors', () => {
      const error = new N8nConnectionError('SSL certificate verification failed');
      const result = ErrorDiagnostics.diagnose(error);

      expect(result.errorType).toBe('SSLError');
      expect(result.probableCause).toContain('certificate issue');
      expect(result.confidence).toBe('high');
    });

    it('should diagnose generic connection errors', () => {
      const error = new N8nConnectionError('Network error');
      const result = ErrorDiagnostics.diagnose(error);

      expect(result.errorType).toBe('ConnectionError');
      expect(result.probableCause).toContain('Unable to connect');
      expect(result.confidence).toBe('medium');
    });

    it('should diagnose validation errors with required fields', () => {
      const error = new N8nValidationError('Field "name" is required');
      const result = ErrorDiagnostics.diagnose(error);

      expect(result.errorType).toBe('ValidationError');
      expect(result.suggestedFixes).toContain('Check for missing required fields');
    });

    it('should diagnose validation errors with type mismatch', () => {
      const error = new N8nValidationError('Invalid type for field "count"');
      const result = ErrorDiagnostics.diagnose(error);

      expect(result.suggestedFixes).toContain('Verify data types match expected formats');
    });

    it('should diagnose validation errors with enum constraints', () => {
      const error = new N8nValidationError('Value must be one of allowed values: active, inactive');
      const result = ErrorDiagnostics.diagnose(error);

      expect(result.suggestedFixes).toContain('Use one of the allowed values for this field');
    });

    it('should diagnose validation errors with detailed error list', () => {
      const error = new N8nValidationError('Validation failed');
      (error as any).errors = [
        { field: 'name', message: 'Too short' },
        { field: 'email', message: 'Invalid format' }
      ];
      const result = ErrorDiagnostics.diagnose(error);

      expect(result.suggestedFixes).toContain('Fix 2 validation error(s):');
      expect(result.suggestedFixes).toContain('  - name: Too short');
      expect(result.suggestedFixes).toContain('  - email: Invalid format');
      expect(result.confidence).toBe('high');
    });

    it('should diagnose 400 Bad Request errors', () => {
      const error = new N8nApiError('Bad request', 400);
      error.hint = 'Check JSON format';
      const result = ErrorDiagnostics.diagnose(error);

      expect(result.errorType).toBe('BadRequest');
      expect(result.probableCause).toContain('request format is invalid');
      expect(result.suggestedFixes).toContain('Check JSON format');
      expect(result.confidence).toBe('high');
    });

    it('should diagnose 404 Not Found errors with resource type', () => {
      const error = new N8nApiError('Workflow not found', 404);
      const result = ErrorDiagnostics.diagnose(error);

      expect(result.errorType).toBe('ResourceNotFound');
      expect(result.probableCause).toBe('workflow does not exist');
      expect(result.suggestedFixes[0]).toContain('workflow ID is correct');
    });

    it('should diagnose 409 Conflict errors', () => {
      const error = new N8nApiError('Resource already exists', 409);
      const result = ErrorDiagnostics.diagnose(error);

      expect(result.errorType).toBe('ResourceConflict');
      expect(result.probableCause).toContain('already exists');
      expect(result.confidence).toBe('high');
    });

    it('should diagnose 429 Rate Limit errors', () => {
      const error = new N8nApiError('Too many requests', 429);
      const result = ErrorDiagnostics.diagnose(error);

      expect(result.errorType).toBe('RateLimitExceeded');
      expect(result.probableCause).toContain('Too many requests');
      expect(result.suggestedFixes).toContain('Implement request throttling');
    });

    it('should diagnose 500+ server errors', () => {
      const error = new N8nApiError('Internal server error', 500);
      const result = ErrorDiagnostics.diagnose(error);

      expect(result.errorType).toBe('ServerError');
      expect(result.probableCause).toContain('internal error');
      expect(result.confidence).toBe('medium');
    });

    it('should diagnose generic API errors', () => {
      const error = new N8nApiError('API error', 403);
      error.description = 'Access forbidden';
      error.hint = 'Check permissions';
      const result = ErrorDiagnostics.diagnose(error);

      expect(result.errorType).toBe('ApiError');
      expect(result.probableCause).toBe('Access forbidden');
      expect(result.suggestedFixes).toContain('Check permissions');
    });

    it('should diagnose pattern-based errors - JSON parse error', () => {
      const error = new Error('Unexpected token } in JSON at position 42');
      const result = ErrorDiagnostics.diagnose(error);

      expect(result.errorType).toBe('JSONParseError');
      expect(result.probableCause).toContain('Invalid JSON format');
      expect(result.confidence).toBe('high');
    });

    it('should diagnose pattern-based errors - memory error', () => {
      const error = new Error('JavaScript heap out of memory');
      const result = ErrorDiagnostics.diagnose(error);

      expect(result.errorType).toBe('MemoryError');
      expect(result.probableCause).toContain('exceeded available memory');
      expect(result.suggestedFixes).toContain('Process data in smaller batches');
    });

    it('should diagnose pattern-based errors - permission error', () => {
      const error = new Error('Permission denied: cannot access resource');
      const result = ErrorDiagnostics.diagnose(error);

      expect(result.errorType).toBe('PermissionError');
      expect(result.probableCause).toContain('Insufficient permissions');
      expect(result.confidence).toBe('high');
    });

    it('should diagnose pattern-based errors - workflow error', () => {
      const error = new Error('Workflow XYZ not found in database');
      const result = ErrorDiagnostics.diagnose(error);

      expect(result.errorType).toBe('WorkflowError');
      expect(result.probableCause).toContain('Workflow-related issue');
      expect(result.confidence).toBe('medium');
    });

    it('should handle unknown error types', () => {
      const error = { not: 'an error' };
      const result = ErrorDiagnostics.diagnose(error);

      expect(result.errorType).toBe('UnknownError');
      expect(result.probableCause).toContain('unexpected error occurred');
      expect(result.confidence).toBe('low');
    });

    it('should handle generic errors with no pattern match', () => {
      const error = new Error('Some random error message');
      error.name = 'CustomError';
      const result = ErrorDiagnostics.diagnose(error);

      expect(result.errorType).toBe('CustomError');
      expect(result.probableCause).toContain('error occurred during operation');
      expect(result.confidence).toBe('low');
    });
  });

  describe('prioritizeFixes', () => {
    it('should prioritize fixes for frequent errors', () => {
      const diagnosis = {
        errorType: 'TestError',
        probableCause: 'Test cause',
        suggestedFixes: ['Fix 1', 'Fix 2'],
        confidence: 'high' as const
      };

      const prioritized = ErrorDiagnostics.prioritizeFixes(diagnosis, 15);

      expect(prioritized).toHaveLength(4);
      expect(prioritized[0]).toContain('systematic issues');
      expect(prioritized[1]).toContain('automated error handling');
      expect(prioritized[2]).toBe('Fix 1');
      expect(prioritized[3]).toBe('Fix 2');
    });

    it('should not modify fixes for infrequent errors', () => {
      const diagnosis = {
        errorType: 'TestError',
        probableCause: 'Test cause',
        suggestedFixes: ['Fix 1', 'Fix 2'],
        confidence: 'high' as const
      };

      const prioritized = ErrorDiagnostics.prioritizeFixes(diagnosis, 5);

      expect(prioritized).toHaveLength(2);
      expect(prioritized).toEqual(['Fix 1', 'Fix 2']);
    });
  });
});