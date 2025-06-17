import { z } from 'zod';
export declare const N8nApiConfigSchema: z.ZodObject<{
    baseUrl: z.ZodString;
    apiKey: z.ZodString;
    headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    timeout: z.ZodDefault<z.ZodNumber>;
    retry: z.ZodDefault<z.ZodObject<{
        maxRetries: z.ZodDefault<z.ZodNumber>;
        initialDelay: z.ZodDefault<z.ZodNumber>;
        maxDelay: z.ZodDefault<z.ZodNumber>;
        backoffMultiplier: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        maxRetries: number;
        initialDelay: number;
        maxDelay: number;
        backoffMultiplier: number;
    }, {
        maxRetries?: number | undefined;
        initialDelay?: number | undefined;
        maxDelay?: number | undefined;
        backoffMultiplier?: number | undefined;
    }>>;
    rateLimit: z.ZodDefault<z.ZodObject<{
        maxRequestsPerSecond: z.ZodDefault<z.ZodNumber>;
        maxConcurrentRequests: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        maxRequestsPerSecond: number;
        maxConcurrentRequests: number;
    }, {
        maxRequestsPerSecond?: number | undefined;
        maxConcurrentRequests?: number | undefined;
    }>>;
    cache: z.ZodDefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        ttl: z.ZodDefault<z.ZodNumber>;
        maxSize: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        maxSize: number;
        enabled: boolean;
        ttl: number;
    }, {
        maxSize?: number | undefined;
        enabled?: boolean | undefined;
        ttl?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    baseUrl: string;
    apiKey: string;
    timeout: number;
    retry: {
        maxRetries: number;
        initialDelay: number;
        maxDelay: number;
        backoffMultiplier: number;
    };
    rateLimit: {
        maxRequestsPerSecond: number;
        maxConcurrentRequests: number;
    };
    cache: {
        maxSize: number;
        enabled: boolean;
        ttl: number;
    };
    headers?: Record<string, string> | undefined;
}, {
    baseUrl: string;
    apiKey: string;
    headers?: Record<string, string> | undefined;
    timeout?: number | undefined;
    retry?: {
        maxRetries?: number | undefined;
        initialDelay?: number | undefined;
        maxDelay?: number | undefined;
        backoffMultiplier?: number | undefined;
    } | undefined;
    rateLimit?: {
        maxRequestsPerSecond?: number | undefined;
        maxConcurrentRequests?: number | undefined;
    } | undefined;
    cache?: {
        maxSize?: number | undefined;
        enabled?: boolean | undefined;
        ttl?: number | undefined;
    } | undefined;
}>;
export declare const QueueConfigSchema: z.ZodObject<{
    concurrency: z.ZodDefault<z.ZodNumber>;
    interval: z.ZodDefault<z.ZodNumber>;
    intervalCap: z.ZodDefault<z.ZodNumber>;
    highWater: z.ZodDefault<z.ZodNumber>;
    strategy: z.ZodDefault<z.ZodEnum<["fifo", "lifo", "priority"]>>;
}, "strip", z.ZodTypeAny, {
    strategy: "priority" | "fifo" | "lifo";
    concurrency: number;
    interval: number;
    intervalCap: number;
    highWater: number;
}, {
    strategy?: "priority" | "fifo" | "lifo" | undefined;
    concurrency?: number | undefined;
    interval?: number | undefined;
    intervalCap?: number | undefined;
    highWater?: number | undefined;
}>;
export declare const N8nErrorResponseSchema: z.ZodObject<{
    code: z.ZodNumber;
    message: z.ZodString;
    hint: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    httpStatusCode: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    code: number;
    message: string;
    hint?: string | undefined;
    description?: string | undefined;
    httpStatusCode?: number | undefined;
}, {
    code: number;
    message: string;
    hint?: string | undefined;
    description?: string | undefined;
    httpStatusCode?: number | undefined;
}>;
export declare const ApiRequestOptionsSchema: z.ZodObject<{
    skipCache: z.ZodOptional<z.ZodBoolean>;
    timeout: z.ZodOptional<z.ZodNumber>;
    priority: z.ZodOptional<z.ZodNumber>;
    headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    signal: z.ZodOptional<z.ZodType<AbortSignal, z.ZodTypeDef, AbortSignal>>;
}, "strip", z.ZodTypeAny, {
    priority?: number | undefined;
    headers?: Record<string, string> | undefined;
    timeout?: number | undefined;
    skipCache?: boolean | undefined;
    signal?: AbortSignal | undefined;
}, {
    priority?: number | undefined;
    headers?: Record<string, string> | undefined;
    timeout?: number | undefined;
    skipCache?: boolean | undefined;
    signal?: AbortSignal | undefined;
}>;
export type N8nApiConfig = z.infer<typeof N8nApiConfigSchema>;
export type QueueConfig = z.infer<typeof QueueConfigSchema>;
export type N8nErrorResponse = z.infer<typeof N8nErrorResponseSchema>;
export type ApiRequestOptions = z.infer<typeof ApiRequestOptionsSchema>;
export declare function getN8nConfigFromEnv(): Partial<N8nApiConfig>;
//# sourceMappingURL=config.types.d.ts.map