import { ApiKeyManager } from './ApiKeyManager.js';
import { Authorization } from './Authorization.js';
import { AuditLogger } from './AuditLogger.js';
import { RateLimiter } from './RateLimiter.js';
import { Logger } from '../utils/Logger.js';
export class SecurityManager {
    logger = new Logger('SecurityManager');
    apiKeyManager;
    authorization;
    auditLogger;
    rateLimiter;
    config;
    constructor(config = {}) {
        this.config = config;
        this.apiKeyManager = new ApiKeyManager();
        this.authorization = new Authorization();
        this.auditLogger = new AuditLogger();
        this.rateLimiter = new RateLimiter();
        this.initializeRateLimits();
    }
    /**
     * Initialize default rate limits
     */
    initializeRateLimits() {
        const limits = this.config.rateLimits || {};
        // Global rate limit
        if (limits.global) {
            this.rateLimiter.registerLimit('global', limits.global);
        }
        else {
            this.rateLimiter.registerLimit('global', {
                windowMs: 60 * 1000, // 1 minute
                maxRequests: 1000
            });
        }
        // Per-user rate limit
        if (limits.perUser) {
            this.rateLimiter.registerLimit('user', limits.perUser);
        }
        else {
            this.rateLimiter.registerLimit('user', {
                windowMs: 60 * 1000, // 1 minute
                maxRequests: 100
            });
        }
        // Per-API key rate limit
        if (limits.perApiKey) {
            this.rateLimiter.registerLimit('apiKey', limits.perApiKey);
        }
        else {
            this.rateLimiter.registerLimit('apiKey', {
                windowMs: 60 * 1000, // 1 minute
                maxRequests: 60
            });
        }
        // Per-tool rate limit
        if (limits.perTool) {
            this.rateLimiter.registerLimit('tool', limits.perTool);
        }
        else {
            this.rateLimiter.registerLimit('tool', {
                windowMs: 60 * 1000, // 1 minute
                maxRequests: 30,
                keyPrefix: 'tool'
            });
        }
    }
    /**
     * Authenticate a request
     */
    async authenticate(context) {
        // Check API key if provided
        if (context.apiKey) {
            const validation = this.apiKeyManager.validateApiKey(context.apiKey);
            if (!validation.isValid) {
                this.auditLogger.logDenied('authenticate', validation.reason || 'Invalid API key', {
                    metadata: context.metadata
                });
                return {
                    authenticated: false,
                    reason: validation.reason
                };
            }
            this.auditLogger.logSuccess('authenticate', {
                apiKeyId: validation.key.id,
                metadata: context.metadata
            });
            return {
                authenticated: true,
                apiKeyInfo: validation.key
            };
        }
        // Check user authentication (would integrate with actual auth system)
        if (context.userId) {
            const user = await this.getUser(context.userId);
            if (user) {
                this.auditLogger.logSuccess('authenticate', {
                    userId: context.userId,
                    metadata: context.metadata
                });
                return {
                    authenticated: true,
                    user
                };
            }
        }
        this.auditLogger.logDenied('authenticate', 'No valid credentials provided', {
            metadata: context.metadata
        });
        return {
            authenticated: false,
            reason: 'Authentication required'
        };
    }
    /**
     * Authorize an action
     */
    authorize(action, context) {
        const allowed = this.authorization.hasPermission(context, action);
        if (this.config.audit?.enabled !== false) {
            if (allowed) {
                this.auditLogger.logSuccess(`authorize:${action}`, {
                    userId: context.user?.id,
                    apiKeyId: context.apiKeyId,
                    resource: context.resource,
                    metadata: context.metadata
                });
            }
            else {
                this.auditLogger.logDenied(`authorize:${action}`, 'Insufficient permissions', {
                    userId: context.user?.id,
                    apiKeyId: context.apiKeyId,
                    resource: context.resource,
                    metadata: context.metadata
                });
            }
        }
        return allowed;
    }
    /**
     * Check rate limits
     */
    checkRateLimit(key, context) {
        const limitName = context.type;
        const limitKey = context.type === 'tool' && context.toolName
            ? `${key}:${context.toolName}`
            : key;
        const result = this.rateLimiter.checkLimit(limitName, limitKey, {
            cost: context.cost
        });
        if (!result.allowed && this.config.audit?.enabled !== false) {
            this.auditLogger.logDenied('rate_limit', `Rate limit exceeded for ${limitName}`, {
                details: {
                    limitType: context.type,
                    key: limitKey,
                    limit: result.limit,
                    retryAfter: result.retryAfter
                }
            });
        }
        return {
            allowed: result.allowed,
            retryAfter: result.retryAfter
        };
    }
    /**
     * Check all security requirements for a tool execution
     */
    async checkToolSecurity(toolName, permission, context) {
        // Authenticate
        const auth = await this.authenticate(context);
        if (!auth.authenticated) {
            return {
                allowed: false,
                reason: auth.reason || 'Authentication failed'
            };
        }
        // Build authorization context
        const authContext = {
            user: auth.user,
            apiKeyId: auth.apiKeyInfo?.id,
            apiKeyPermissions: auth.apiKeyInfo?.permissions
        };
        // Check authorization
        if (!this.authorize(permission, { ...authContext, metadata: context.metadata })) {
            return {
                allowed: false,
                reason: 'Insufficient permissions'
            };
        }
        // Check rate limits
        const rateLimitKey = auth.user?.id || auth.apiKeyInfo?.id || 'anonymous';
        // Check user/API key rate limit
        const userLimit = this.checkRateLimit(rateLimitKey, {
            type: auth.user ? 'user' : 'apiKey'
        });
        if (!userLimit.allowed) {
            return {
                allowed: false,
                reason: 'Rate limit exceeded',
                retryAfter: userLimit.retryAfter
            };
        }
        // Check tool-specific rate limit
        const toolLimit = this.checkRateLimit(rateLimitKey, {
            type: 'tool',
            toolName
        });
        if (!toolLimit.allowed) {
            return {
                allowed: false,
                reason: 'Tool rate limit exceeded',
                retryAfter: toolLimit.retryAfter
            };
        }
        return { allowed: true };
    }
    // API Key Management
    createApiKey(name, permissions, userId) {
        const expiry = this.config.apiKeys?.defaultExpiry;
        const apiKey = this.apiKeyManager.generateApiKey(name, permissions, expiry);
        if (userId) {
            // Track API key ownership (would store in database)
            apiKey.metadata = { ...apiKey.metadata, userId };
        }
        this.auditLogger.logSuccess('api_key.create', {
            userId,
            details: { keyId: apiKey.id, name, permissions }
        });
        return apiKey;
    }
    revokeApiKey(id, userId) {
        const success = this.apiKeyManager.revokeApiKey(id);
        if (success) {
            this.auditLogger.logSuccess('api_key.revoke', {
                userId,
                details: { keyId: id }
            });
        }
        else {
            this.auditLogger.logFailure('api_key.revoke', 'API key not found', {
                userId,
                details: { keyId: id }
            });
        }
        return success;
    }
    // User Management
    createUser(user) {
        this.authorization.upsertUser(user);
        this.auditLogger.logSuccess('user.create', {
            details: { userId: user.id, name: user.name, roles: user.roles }
        });
    }
    async getUser(userId) {
        // This would integrate with actual user store
        // For now, return undefined
        return undefined;
    }
    // Role Management
    createRole(role) {
        this.authorization.createRole(role);
        this.auditLogger.logSuccess('role.create', {
            details: { roleId: role.id, name: role.name, permissions: role.permissions }
        });
    }
    updateRole(id, updates) {
        const success = this.authorization.updateRole(id, updates);
        if (success) {
            this.auditLogger.logSuccess('role.update', {
                details: { roleId: id, updates: Object.keys(updates) }
            });
        }
        return success;
    }
    // Audit Access
    getAuditLogs(query) {
        return this.auditLogger.queryEvents(query);
    }
    getSecurityStatistics(startTime, endTime) {
        return {
            audit: this.auditLogger.getStatistics(startTime, endTime),
            rateLimit: this.rateLimiter.getStatistics(),
            suspiciousActivity: this.auditLogger.detectSuspiciousActivity()
        };
    }
    // Cleanup
    stop() {
        this.rateLimiter.stop();
    }
}
//# sourceMappingURL=SecurityManager.js.map