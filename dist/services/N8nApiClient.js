import axios from 'axios';
import { RequestQueue } from '../utils/RequestQueue.js';
import { SimpleCache } from '../utils/SimpleCache.js';
import { N8nApiError, N8nConnectionError, N8nRateLimitError, N8nAuthenticationError, N8nTimeoutError, isRetryableError, } from '../utils/errors.js';
import { N8nApiConfigSchema, getN8nConfigFromEnv, } from '../types/config.types.js';
export class N8nApiClient {
    axios;
    config;
    queue;
    cache;
    baseUrl;
    constructor(config = {}) {
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
    setupInterceptors() {
        // Response interceptor for error handling
        this.axios.interceptors.response.use((response) => response, async (error) => {
            if (error.response) {
                const { status, data } = error.response;
                // Handle specific status codes
                switch (status) {
                    case 401:
                    case 403:
                        throw new N8nAuthenticationError(data?.message || 'Authentication failed');
                    case 429:
                        const retryAfterHeader = error.response.headers['retry-after'];
                        const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) : 60;
                        throw new N8nRateLimitError('Rate limit exceeded', retryAfter * 1000);
                    default:
                        throw new N8nApiError(data?.message || error.message, status, data?.code?.toString(), data?.hint, data?.description, data);
                }
            }
            else if (error.request) {
                // Request was made but no response received
                if (error.code === 'ECONNABORTED') {
                    throw new N8nTimeoutError('Request timeout', this.config.timeout);
                }
                throw new N8nConnectionError('Failed to connect to n8n API', error);
            }
            else {
                // Something else happened
                throw new N8nConnectionError(error.message || 'Unknown error occurred', error);
            }
        });
    }
    async executeWithRetry(fn, retries = this.config.retry.maxRetries, delay = this.config.retry.initialDelay) {
        try {
            return await fn();
        }
        catch (error) {
            if (retries === 0 || !isRetryableError(error)) {
                throw error;
            }
            // Calculate next delay with exponential backoff
            const nextDelay = Math.min(delay * this.config.retry.backoffMultiplier, this.config.retry.maxDelay);
            // If rate limited, use the retry-after header
            if (error instanceof N8nRateLimitError && error.retryAfter) {
                await new Promise(resolve => setTimeout(resolve, error.retryAfter));
            }
            else {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            return this.executeWithRetry(fn, retries - 1, nextDelay);
        }
    }
    getCacheKey(method, path, params) {
        return `${method}:${path}:${JSON.stringify(params || {})}`;
    }
    async request(method, path, options = {}) {
        const { data, params, requestOptions } = options;
        // Check cache for GET requests
        if (method === 'GET' && this.config.cache.enabled && !requestOptions?.skipCache) {
            const cacheKey = this.getCacheKey(method, path, params);
            const cached = this.cache.get(cacheKey);
            if (cached) {
                return cached;
            }
        }
        // Create axios config
        const axiosConfig = {
            method,
            url: path,
            data,
            params,
            ...(requestOptions?.headers && { headers: requestOptions.headers }),
            ...(requestOptions?.timeout && { timeout: requestOptions.timeout }),
            ...(requestOptions?.signal && { signal: requestOptions.signal }),
        };
        // Execute request through queue
        const response = await this.queue.add(() => this.executeWithRetry(() => this.axios.request(axiosConfig)), requestOptions?.priority);
        // Cache successful GET requests
        if (method === 'GET' && this.config.cache.enabled && response.data) {
            const cacheKey = this.getCacheKey(method, path, params);
            this.cache.set(cacheKey, response.data);
        }
        return response.data;
    }
    // Test connection to n8n instance
    async testConnection() {
        try {
            // n8n doesn't have a dedicated health endpoint in v1 API, 
            // so we'll try to list workflows with limit 1
            await this.request('GET', '/workflows', {
                params: { limit: 1 },
            });
            return { connected: true };
        }
        catch (error) {
            if (error instanceof N8nAuthenticationError) {
                throw error; // Re-throw auth errors
            }
            return { connected: false };
        }
    }
    // Workflow operations
    async getWorkflows(options = {}) {
        return this.request('GET', '/workflows', {
            params: options,
        });
    }
    async getWorkflow(id) {
        return this.request('GET', `/workflows/${id}`);
    }
    async createWorkflow(workflow) {
        return this.request('POST', '/workflows', {
            data: workflow,
        });
    }
    async updateWorkflow(id, workflow) {
        return this.request('PATCH', `/workflows/${id}`, {
            data: workflow,
        });
    }
    async deleteWorkflow(id) {
        await this.request('DELETE', `/workflows/${id}`);
    }
    async activateWorkflow(id) {
        return this.request('PATCH', `/workflows/${id}`, {
            data: { active: true },
        });
    }
    async deactivateWorkflow(id) {
        return this.request('PATCH', `/workflows/${id}`, {
            data: { active: false },
        });
    }
    // Execution operations
    async getExecutions(options = {}) {
        return this.request('GET', '/executions', {
            params: options,
        });
    }
    async getExecution(id) {
        return this.request('GET', `/executions/${id}`);
    }
    async triggerWorkflow(workflowId, data) {
        return this.request('POST', `/workflows/${workflowId}/execute`, {
            data: { data },
        });
    }
    async stopExecution(id) {
        return this.request('POST', `/executions/${id}/stop`);
    }
    async deleteExecution(id) {
        await this.request('DELETE', `/executions/${id}`);
    }
    // Credential operations
    async getCredentials(options = {}) {
        return this.request('GET', '/credentials', {
            params: options,
        });
    }
    async getCredential(id) {
        return this.request('GET', `/credentials/${id}`);
    }
    async createCredential(credential) {
        return this.request('POST', '/credentials', {
            data: credential,
        });
    }
    async updateCredential(id, credential) {
        return this.request('PATCH', `/credentials/${id}`, {
            data: credential,
        });
    }
    async deleteCredential(id) {
        await this.request('DELETE', `/credentials/${id}`);
    }
    async testCredential(id) {
        try {
            await this.request('POST', `/credentials/${id}/test`);
            return { success: true };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    // Utility methods
    clearCache() {
        this.cache.clear();
    }
    getCacheStats() {
        return this.cache.getStats();
    }
    getQueueStats() {
        return {
            pending: this.queue.pending,
            active: this.queue.active,
            paused: this.queue.isPaused,
        };
    }
    pauseQueue() {
        this.queue.pause();
    }
    resumeQueue() {
        this.queue.resume();
    }
}
//# sourceMappingURL=N8nApiClient.js.map