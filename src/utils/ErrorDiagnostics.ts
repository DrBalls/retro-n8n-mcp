import { N8nApiError, N8nConnectionError, N8nAuthenticationError, N8nValidationError } from './errors.js';

export interface IDiagnosticResult {
  errorType: string;
  probableCause: string;
  suggestedFixes: string[];
  relatedErrors?: string[];
  documentation?: string;
  confidence: 'high' | 'medium' | 'low';
}

export class ErrorDiagnostics {
  private static errorPatterns = new Map<RegExp, IDiagnosticResult>();

  static {
    // Initialize common error patterns
    this.initializePatterns();
  }

  /**
   * Diagnose an error and provide actionable suggestions
   */
  static diagnose(error: unknown): IDiagnosticResult {
    // Type-specific diagnosis
    if (error instanceof N8nAuthenticationError) {
      return this.diagnoseAuthError(error);
    }

    if (error instanceof N8nConnectionError) {
      return this.diagnoseConnectionError(error);
    }

    if (error instanceof N8nValidationError) {
      return this.diagnoseValidationError(error);
    }

    if (error instanceof N8nApiError) {
      return this.diagnoseApiError(error);
    }

    // Pattern-based diagnosis for generic errors
    if (error instanceof Error) {
      return this.diagnoseByPattern(error);
    }

    // Fallback diagnosis
    return {
      errorType: 'UnknownError',
      probableCause: 'An unexpected error occurred',
      suggestedFixes: [
        'Check the error message for more details',
        'Verify your input parameters',
        'Check n8n service status'
      ],
      confidence: 'low'
    };
  }

  /**
   * Diagnose authentication errors
   */
  private static diagnoseAuthError(error: N8nAuthenticationError): IDiagnosticResult {
    const message = error.message.toLowerCase();

    if (message.includes('invalid api key')) {
      return {
        errorType: 'InvalidApiKey',
        probableCause: 'The provided API key is invalid or has been revoked',
        suggestedFixes: [
          'Verify the API key in your n8n settings',
          'Generate a new API key from n8n admin panel',
          'Check if the API key has the correct permissions',
          'Ensure no extra spaces in the API key'
        ],
        documentation: 'https://docs.n8n.io/api/authentication/',
        confidence: 'high'
      };
    }

    if (message.includes('expired')) {
      return {
        errorType: 'ExpiredCredentials',
        probableCause: 'Your authentication credentials have expired',
        suggestedFixes: [
          'Refresh your authentication token',
          'Re-authenticate with n8n',
          'Check token expiration settings'
        ],
        confidence: 'high'
      };
    }

    return {
      errorType: 'AuthenticationError',
      probableCause: 'Authentication failed due to invalid credentials',
      suggestedFixes: [
        'Verify your API key is correct',
        'Check if API access is enabled in n8n',
        'Ensure your n8n instance supports API access',
        'Verify the API endpoint URL'
      ],
      documentation: 'https://docs.n8n.io/api/',
      confidence: 'medium'
    };
  }

  /**
   * Diagnose connection errors
   */
  private static diagnoseConnectionError(error: N8nConnectionError): IDiagnosticResult {
    const message = error.message.toLowerCase();
    const cause = error.cause?.message?.toLowerCase();

    if (message.includes('econnrefused') || cause?.includes('econnrefused')) {
      return {
        errorType: 'ConnectionRefused',
        probableCause: 'n8n server is not running or not accessible',
        suggestedFixes: [
          'Verify n8n is running on the specified host and port',
          'Check if the URL is correct (http vs https)',
          'Ensure no firewall is blocking the connection',
          'Try accessing n8n through a web browser'
        ],
        relatedErrors: ['ECONNREFUSED', 'ETIMEDOUT'],
        confidence: 'high'
      };
    }

    if (message.includes('timeout') || cause?.includes('timeout')) {
      return {
        errorType: 'ConnectionTimeout',
        probableCause: 'Request timed out - server may be slow or unreachable',
        suggestedFixes: [
          'Check your network connection',
          'Increase the timeout duration',
          'Verify the n8n server is responsive',
          'Check for high server load'
        ],
        confidence: 'high'
      };
    }

    if (message.includes('ssl') || message.includes('certificate')) {
      return {
        errorType: 'SSLError',
        probableCause: 'SSL/TLS certificate issue',
        suggestedFixes: [
          'Verify the SSL certificate is valid',
          'Check if using self-signed certificates',
          'Try using http instead of https for local instances',
          'Update certificate trust settings'
        ],
        confidence: 'high'
      };
    }

    return {
      errorType: 'ConnectionError',
      probableCause: 'Unable to connect to n8n server',
      suggestedFixes: [
        'Verify the server URL is correct',
        'Check network connectivity',
        'Ensure n8n server is running',
        'Check proxy settings if applicable'
      ],
      confidence: 'medium'
    };
  }

  /**
   * Diagnose validation errors
   */
  private static diagnoseValidationError(error: N8nValidationError): IDiagnosticResult {
    const message = error.message.toLowerCase();
    const fixes: string[] = [];

    if (message.includes('required')) {
      fixes.push('Check for missing required fields');
      fixes.push('Review the API documentation for required parameters');
    }

    if (message.includes('invalid type')) {
      fixes.push('Verify data types match expected formats');
      fixes.push('Check if numbers are being sent as strings or vice versa');
    }

    if (message.includes('enum') || message.includes('allowed values')) {
      fixes.push('Use one of the allowed values for this field');
      fixes.push('Check the API documentation for valid options');
    }

    if (error.errors && Array.isArray(error.errors)) {
      fixes.push(`Fix ${error.errors.length} validation error(s):`);
      error.errors.forEach((err: any) => {
        if (err.field && err.message) {
          fixes.push(`  - ${err.field}: ${err.message}`);
        }
      });
    }

    return {
      errorType: 'ValidationError',
      probableCause: 'Input data does not match expected format',
      suggestedFixes: fixes.length > 0 ? fixes : [
        'Review input parameters',
        'Check data types and formats',
        'Ensure all required fields are provided',
        'Validate against API schema'
      ],
      confidence: fixes.length > 2 ? 'high' : 'medium'
    };
  }

  /**
   * Diagnose API errors
   */
  private static diagnoseApiError(error: N8nApiError): IDiagnosticResult {
    const statusCode = error.statusCode;
    const message = error.message.toLowerCase();

    // 400 Bad Request
    if (statusCode === 400) {
      return {
        errorType: 'BadRequest',
        probableCause: 'The request format is invalid',
        suggestedFixes: [
          'Check the request body format',
          'Verify all required fields are included',
          'Ensure JSON is properly formatted',
          error.hint || 'Review API documentation'
        ],
        confidence: 'high'
      };
    }

    // 404 Not Found
    if (statusCode === 404) {
      const resourceMatch = message.match(/(\w+) not found/i);
      const resourceType = resourceMatch ? resourceMatch[1] : 'Resource';

      return {
        errorType: 'ResourceNotFound',
        probableCause: `${resourceType} does not exist`,
        suggestedFixes: [
          `Verify the ${resourceType.toLowerCase()} ID is correct`,
          `Check if the ${resourceType.toLowerCase()} was deleted`,
          'List available resources to find the correct ID',
          'Ensure you have permission to access this resource'
        ],
        confidence: 'high'
      };
    }

    // 409 Conflict
    if (statusCode === 409) {
      return {
        errorType: 'ResourceConflict',
        probableCause: 'Resource already exists or conflicts with existing data',
        suggestedFixes: [
          'Use a different name or identifier',
          'Update the existing resource instead',
          'Check for duplicate entries',
          'Resolve any dependency conflicts'
        ],
        confidence: 'high'
      };
    }

    // 429 Rate Limit
    if (statusCode === 429) {
      return {
        errorType: 'RateLimitExceeded',
        probableCause: 'Too many requests sent in a short time',
        suggestedFixes: [
          'Wait before sending more requests',
          'Implement request throttling',
          'Use batch operations where possible',
          'Check rate limit headers for retry timing'
        ],
        confidence: 'high'
      };
    }

    // 500+ Server Errors
    if (statusCode && statusCode >= 500) {
      return {
        errorType: 'ServerError',
        probableCause: 'n8n server encountered an internal error',
        suggestedFixes: [
          'Wait and retry the request',
          'Check n8n server logs for details',
          'Verify server health and resources',
          'Contact n8n support if issue persists'
        ],
        confidence: 'medium'
      };
    }

    return {
      errorType: 'ApiError',
      probableCause: error.description || 'API request failed',
      suggestedFixes: [
        error.hint || 'Check the error message for details',
        'Review API documentation',
        'Verify request parameters',
        'Check server status'
      ],
      confidence: 'medium'
    };
  }

  /**
   * Diagnose errors by pattern matching
   */
  private static diagnoseByPattern(error: Error): IDiagnosticResult {
    const message = error.message;

    for (const [pattern, diagnosis] of this.errorPatterns) {
      if (pattern.test(message)) {
        return diagnosis;
      }
    }

    // No pattern matched
    return {
      errorType: error.name || 'Error',
      probableCause: 'An error occurred during operation',
      suggestedFixes: [
        'Check the error message for clues',
        'Review recent changes',
        'Verify system configuration',
        'Check logs for more details'
      ],
      confidence: 'low'
    };
  }

  /**
   * Initialize common error patterns
   */
  private static initializePatterns(): void {
    // JSON parsing errors
    this.errorPatterns.set(
      /unexpected (token|end of json)/i,
      {
        errorType: 'JSONParseError',
        probableCause: 'Invalid JSON format in request or response',
        suggestedFixes: [
          'Validate JSON syntax',
          'Check for trailing commas',
          'Ensure proper quote usage',
          'Use a JSON validator tool'
        ],
        confidence: 'high'
      }
    );

    // Memory errors
    this.errorPatterns.set(
      /out of memory|heap out of memory/i,
      {
        errorType: 'MemoryError',
        probableCause: 'Operation exceeded available memory',
        suggestedFixes: [
          'Process data in smaller batches',
          'Increase Node.js memory limit',
          'Optimize data structures',
          'Check for memory leaks'
        ],
        confidence: 'high'
      }
    );

    // Permission errors
    this.errorPatterns.set(
      /permission denied|access denied|forbidden/i,
      {
        errorType: 'PermissionError',
        probableCause: 'Insufficient permissions for this operation',
        suggestedFixes: [
          'Check user permissions in n8n',
          'Verify API key has required scopes',
          'Ensure resource access is allowed',
          'Contact administrator for access'
        ],
        confidence: 'high'
      }
    );

    // Workflow errors
    this.errorPatterns.set(
      /workflow.*(not found|does not exist|invalid)/i,
      {
        errorType: 'WorkflowError',
        probableCause: 'Workflow-related issue',
        suggestedFixes: [
          'Verify workflow ID is correct',
          'Check if workflow exists',
          'Ensure workflow is not corrupted',
          'Validate workflow JSON structure'
        ],
        confidence: 'medium'
      }
    );
  }

  /**
   * Get suggested fix priority based on error frequency
   */
  static prioritizeFixes(
    diagnosis: IDiagnosticResult,
    errorFrequency: number
  ): string[] {
    const fixes = [...diagnosis.suggestedFixes];

    // Prioritize fixes based on error frequency
    if (errorFrequency > 10) {
      // Frequent errors likely need systematic fixes
      fixes.unshift('Consider implementing automated error handling');
      fixes.unshift('Review system configuration for systematic issues');
    }

    return fixes;
  }
}