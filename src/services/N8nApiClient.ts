import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { RequestQueue } from '../utils/RequestQueue.js';
import { SimpleCache } from '../utils/SimpleCache.js';
import {
  N8nApiError,
  N8nConnectionError,
  N8nRateLimitError,
  N8nAuthenticationError,
  N8nTimeoutError,
  isRetryableError,
} from '../utils/errors.js';
import {
  N8nApiConfig,
  N8nApiConfigSchema,
  ApiRequestOptions,
  N8nErrorResponse,
  getN8nConfigFromEnv,
} from '../types/config.types.js';
import {
  Workflow,
  WorkflowListResponse,
  Execution,
  ExecutionListResponse,
  Credential,
  CredentialListResponse,
} from '../types/n8n.types.js';

export class N8nApiClient {
  private axios: AxiosInstance;
  private config: N8nApiConfig;
  private queue: RequestQueue;
  private cache: SimpleCache<unknown>;
  private baseUrl: string;

  constructor(config: Partial<N8nApiConfig> = {}) {
    // Merge with environment config
    const envConfig = getN8nConfigFromEnv();
    const mergedConfig = { ...envConfig, ...config };
    
    // Validate configuration
    this.config = N8nApiConfigSchema.parse(mergedConfig);
    
    // Ensure baseUrl ends without trailing slash
    this.baseUrl = this.config.baseUrl.replace(/\/$/, '');
    
    // Initialize axios instance
    this.axios = axios.create({
      baseURL: `${this.baseUrl}/api/v1`,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': this.config.apiKey,
        ...this.config.headers,
      },
    });
    
    // Initialize queue
    this.queue = new RequestQueue({
      concurrency: this.config.rateLimit.maxConcurrentRequests,
      interval: 1000 / this.config.rateLimit.maxRequestsPerSecond,
      intervalCap: this.config.rateLimit.maxRequestsPerSecond,
    });
    
    // Initialize cache
    this.cache = new SimpleCache({
      maxSize: this.config.cache.maxSize,
      defaultTtl: this.config.cache.ttl,
    });
    
    // Set up response interceptors
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Response interceptor for error handling
    this.axios.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<N8nErrorResponse>) => {
        if (error.response) {
          const { status, data } = error.response;
          
          // Handle specific status codes
          switch (status) {
            case 401:
            case 403:
              throw new N8nAuthenticationError(
                data?.message || 'Authentication failed',
              );
            case 429:
              const retryAfterHeader = error.response.headers['retry-after'];
              const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) : 60;
              throw new N8nRateLimitError(
                'Rate limit exceeded',
                retryAfter * 1000,
              );
            default:
              throw new N8nApiError(
                data?.message || error.message,
                status,
                data?.code?.toString(),
                data?.hint,
                data?.description,
                data,
              );
          }
        } else if (error.request) {
          // Request was made but no response received
          if (error.code === 'ECONNABORTED') {
            throw new N8nTimeoutError(
              'Request timeout',
              this.config.timeout,
            );
          }
          throw new N8nConnectionError(
            'Failed to connect to n8n API',
            error,
          );
        } else {
          // Something else happened
          throw new N8nConnectionError(
            error.message || 'Unknown error occurred',
            error,
          );
        }
      },
    );
  }

  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    retries = this.config.retry.maxRetries,
    delay = this.config.retry.initialDelay,
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries === 0 || !isRetryableError(error)) {
        throw error;
      }
      
      // Calculate next delay with exponential backoff
      const nextDelay = Math.min(
        delay * this.config.retry.backoffMultiplier,
        this.config.retry.maxDelay,
      );
      
      // If rate limited, use the retry-after header
      if (error instanceof N8nRateLimitError && error.retryAfter) {
        await new Promise(resolve => setTimeout(resolve, error.retryAfter));
      } else {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      return this.executeWithRetry(fn, retries - 1, nextDelay);
    }
  }

  private getCacheKey(method: string, path: string, params?: unknown): string {
    return `${method}:${path}:${JSON.stringify(params || {})}`;
  }

  private async request<T>(
    method: string,
    path: string,
    options: {
      data?: unknown;
      params?: unknown;
      requestOptions?: ApiRequestOptions;
    } = {},
  ): Promise<T> {
    const { data, params, requestOptions } = options;
    
    // Check cache for GET requests
    if (method === 'GET' && this.config.cache.enabled && !requestOptions?.skipCache) {
      const cacheKey = this.getCacheKey(method, path, params);
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached as T;
      }
    }
    
    // Create axios config
    const axiosConfig: AxiosRequestConfig = {
      method,
      url: path,
      data,
      params,
      ...(requestOptions?.headers && { headers: requestOptions.headers }),
      ...(requestOptions?.timeout && { timeout: requestOptions.timeout }),
      ...(requestOptions?.signal && { signal: requestOptions.signal }),
    };
    
    // Execute request through queue
    const response = await this.queue.add(
      () => this.executeWithRetry(() => this.axios.request<T>(axiosConfig)),
      requestOptions?.priority,
    );
    
    // Cache successful GET requests
    if (method === 'GET' && this.config.cache.enabled && response.data) {
      const cacheKey = this.getCacheKey(method, path, params);
      this.cache.set(cacheKey, response.data);
    }
    
    return response.data;
  }

  // Test connection to n8n instance
  async testConnection(): Promise<{ connected: boolean; version?: string }> {
    try {
      // n8n doesn't have a dedicated health endpoint in v1 API, 
      // so we'll try to list workflows with limit 1
      await this.request<WorkflowListResponse>('GET', '/workflows', {
        params: { limit: 1 },
      });
      return { connected: true };
    } catch (error) {
      if (error instanceof N8nAuthenticationError) {
        throw error; // Re-throw auth errors
      }
      return { connected: false };
    }
  }

  // Workflow operations
  async getWorkflows(options: {
    active?: boolean;
    limit?: number;
    cursor?: string;
    tags?: string[];
  } = {}): Promise<WorkflowListResponse> {
    return this.request<WorkflowListResponse>('GET', '/workflows', {
      params: options,
    });
  }

  async getWorkflow(id: string): Promise<Workflow> {
    return this.request<Workflow>('GET', `/workflows/${id}`);
  }

  async createWorkflow(workflow: Partial<Workflow>): Promise<Workflow> {
    return this.request<Workflow>('POST', '/workflows', {
      data: workflow,
    });
  }

  async updateWorkflow(id: string, workflow: Partial<Workflow>): Promise<Workflow> {
    return this.request<Workflow>('PATCH', `/workflows/${id}`, {
      data: workflow,
    });
  }

  async deleteWorkflow(id: string): Promise<void> {
    await this.request('DELETE', `/workflows/${id}`);
  }

  async activateWorkflow(id: string): Promise<Workflow> {
    return this.request<Workflow>('PATCH', `/workflows/${id}`, {
      data: { active: true },
    });
  }

  async deactivateWorkflow(id: string): Promise<Workflow> {
    return this.request<Workflow>('PATCH', `/workflows/${id}`, {
      data: { active: false },
    });
  }

  // Execution operations
  async getExecutions(options: {
    workflowId?: string;
    status?: string;
    limit?: number;
    cursor?: string;
  } = {}): Promise<ExecutionListResponse> {
    return this.request<ExecutionListResponse>('GET', '/executions', {
      params: options,
    });
  }

  async getExecution(id: string): Promise<Execution> {
    return this.request<Execution>('GET', `/executions/${id}`);
  }

  async triggerWorkflow(
    workflowId: string,
    data?: Record<string, unknown>,
  ): Promise<Execution> {
    return this.request<Execution>('POST', `/workflows/${workflowId}/execute`, {
      data: { data },
    });
  }

  async stopExecution(id: string): Promise<Execution> {
    return this.request<Execution>('POST', `/executions/${id}/stop`);
  }

  async deleteExecution(id: string): Promise<void> {
    await this.request('DELETE', `/executions/${id}`);
  }

  // Credential operations
  async getCredentials(options: {
    limit?: number;
    cursor?: string;
  } = {}): Promise<CredentialListResponse> {
    return this.request<CredentialListResponse>('GET', '/credentials', {
      params: options,
    });
  }

  async getCredential(id: string): Promise<Credential> {
    return this.request<Credential>('GET', `/credentials/${id}`);
  }

  async createCredential(credential: Partial<Credential>): Promise<Credential> {
    return this.request<Credential>('POST', '/credentials', {
      data: credential,
    });
  }

  async updateCredential(
    id: string,
    credential: Partial<Credential>,
  ): Promise<Credential> {
    return this.request<Credential>('PATCH', `/credentials/${id}`, {
      data: credential,
    });
  }

  async deleteCredential(id: string): Promise<void> {
    await this.request('DELETE', `/credentials/${id}`);
  }

  async testCredential(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.request('POST', `/credentials/${id}/test`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Utility methods
  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): ReturnType<SimpleCache['getStats']> {
    return this.cache.getStats();
  }

  getQueueStats(): {
    pending: number;
    active: number;
    paused: boolean;
  } {
    return {
      pending: this.queue.pending,
      active: this.queue.active,
      paused: this.queue.isPaused,
    };
  }

  pauseQueue(): void {
    this.queue.pause();
  }

  resumeQueue(): void {
    this.queue.resume();
  }
}