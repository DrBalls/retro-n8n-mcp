import { IApiKey } from './ApiKeyManager.js';
import { IAuthorizationContext, IRole, IUser } from './Authorization.js';
import { AuditLogger, IAuditEvent } from './AuditLogger.js';
import { RateLimiter, IRateLimitConfig } from './RateLimiter.js';
export interface ISecurityContext {
    userId?: string;
    apiKey?: string;
    metadata?: {
        ip?: string;
        userAgent?: string;
        sessionId?: string;
    };
}
export interface ISecurityConfig {
    rateLimits?: {
        global?: IRateLimitConfig;
        perUser?: IRateLimitConfig;
        perApiKey?: IRateLimitConfig;
        perTool?: IRateLimitConfig;
    };
    audit?: {
        enabled: boolean;
        maxEvents?: number;
    };
    apiKeys?: {
        defaultExpiry?: number;
        maxPerUser?: number;
    };
}
export declare class SecurityManager {
    private logger;
    private apiKeyManager;
    private authorization;
    private auditLogger;
    private rateLimiter;
    private config;
    constructor(config?: ISecurityConfig);
    /**
     * Initialize default rate limits
     */
    private initializeRateLimits;
    /**
     * Authenticate a request
     */
    authenticate(context: ISecurityContext): Promise<{
        authenticated: boolean;
        user?: IUser;
        apiKeyInfo?: Omit<IApiKey, 'key'>;
        reason?: string;
    }>;
    /**
     * Authorize an action
     */
    authorize(action: string, context: IAuthorizationContext & {
        metadata?: ISecurityContext['metadata'];
    }): boolean;
    /**
     * Check rate limits
     */
    checkRateLimit(key: string, context: {
        type: 'global' | 'user' | 'apiKey' | 'tool';
        toolName?: string;
        cost?: number;
    }): {
        allowed: boolean;
        retryAfter?: number;
    };
    /**
     * Check all security requirements for a tool execution
     */
    checkToolSecurity(toolName: string, permission: string, context: ISecurityContext): Promise<{
        allowed: boolean;
        reason?: string;
        retryAfter?: number;
    }>;
    createApiKey(name: string, permissions: string[], userId?: string): IApiKey;
    revokeApiKey(id: string, userId?: string): boolean;
    createUser(user: IUser): void;
    private getUser;
    createRole(role: IRole): void;
    updateRole(id: string, updates: Partial<IRole>): boolean;
    getAuditLogs(query: Parameters<AuditLogger['queryEvents']>[0]): IAuditEvent[];
    getSecurityStatistics(startTime: Date, endTime: Date): {
        audit: ReturnType<AuditLogger['getStatistics']>;
        rateLimit: ReturnType<RateLimiter['getStatistics']>;
        suspiciousActivity: ReturnType<AuditLogger['detectSuspiciousActivity']>;
    };
    stop(): void;
}
//# sourceMappingURL=SecurityManager.d.ts.map