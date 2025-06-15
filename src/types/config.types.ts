import { z } from 'zod';

// API Configuration Schema
export const N8nApiConfigSchema = z.object({
  // Base URL for n8n instance (e.g., https://n8n.example.com)
  baseUrl: z.string().url(),
  
  // API Key for authentication
  apiKey: z.string().min(1),
  
  // Optional custom headers
  headers: z.record(z.string()).optional(),
  
  // Request timeout in milliseconds
  timeout: z.number().positive().default(30000),
  
  // Retry configuration
  retry: z.object({
    maxRetries: z.number().min(0).max(10).default(3),
    initialDelay: z.number().positive().default(1000),
    maxDelay: z.number().positive().default(30000),
    backoffMultiplier: z.number().min(1).default(2),
  }).default({
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
  }),
  
  // Rate limiting configuration
  rateLimit: z.object({
    maxRequestsPerSecond: z.number().positive().default(10),
    maxConcurrentRequests: z.number().positive().default(5),
  }).default({
    maxRequestsPerSecond: 10,
    maxConcurrentRequests: 5,
  }),
  
  // Cache configuration
  cache: z.object({
    enabled: z.boolean().default(true),
    ttl: z.number().positive().default(60000), // 1 minute default
    maxSize: z.number().positive().default(100),
  }).default({
    enabled: true,
    ttl: 60000,
    maxSize: 100,
  }),
});

// Queue configuration for request management
export const QueueConfigSchema = z.object({
  concurrency: z.number().positive().default(5),
  interval: z.number().positive().default(100),
  intervalCap: z.number().positive().default(10),
  highWater: z.number().positive().default(100),
  strategy: z.enum(['fifo', 'lifo', 'priority']).default('fifo'),
});

// Error response schema
export const N8nErrorResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
  hint: z.string().optional(),
  description: z.string().optional(),
  httpStatusCode: z.number().optional(),
});

// API Request options
export const ApiRequestOptionsSchema = z.object({
  // Skip cache for this request
  skipCache: z.boolean().optional(),
  
  // Custom timeout for this request
  timeout: z.number().positive().optional(),
  
  // Priority for queue (higher = more priority)
  priority: z.number().optional(),
  
  // Custom headers for this request
  headers: z.record(z.string()).optional(),
  
  // Abort signal for request cancellation
  signal: z.instanceof(AbortSignal).optional(),
});

// Type exports
export type N8nApiConfig = z.infer<typeof N8nApiConfigSchema>;
export type QueueConfig = z.infer<typeof QueueConfigSchema>;
export type N8nErrorResponse = z.infer<typeof N8nErrorResponseSchema>;
export type ApiRequestOptions = z.infer<typeof ApiRequestOptionsSchema>;

// Environment variable helper
export function getN8nConfigFromEnv(): Partial<N8nApiConfig> {
  const config: Partial<N8nApiConfig> = {};
  
  if (process.env['N8N_API_URL']) {
    config.baseUrl = process.env['N8N_API_URL'];
  }
  
  if (process.env['N8N_API_KEY']) {
    config.apiKey = process.env['N8N_API_KEY'];
  }
  
  if (process.env['N8N_API_TIMEOUT']) {
    config.timeout = parseInt(process.env['N8N_API_TIMEOUT'], 10);
  }
  
  return config;
}