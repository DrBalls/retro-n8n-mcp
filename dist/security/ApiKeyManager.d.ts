export interface IApiKey {
    id: string;
    key: string;
    name: string;
    createdAt: Date;
    lastUsedAt?: Date;
    expiresAt?: Date;
    permissions: string[];
    metadata?: Record<string, unknown>;
}
export interface IApiKeyValidation {
    isValid: boolean;
    key?: IApiKey;
    reason?: string;
}
export declare class ApiKeyManager {
    private logger;
    private apiKeys;
    private hashedKeys;
    /**
     * Generate a new API key
     */
    generateApiKey(name: string, permissions?: string[], expiresIn?: number): IApiKey;
    /**
     * Validate an API key
     */
    validateApiKey(key: string): IApiKeyValidation;
    /**
     * Revoke an API key
     */
    revokeApiKey(id: string): boolean;
    /**
     * List all API keys (without exposing the actual keys)
     */
    listApiKeys(): Omit<IApiKey, 'key'>[];
    /**
     * Check if a permission is granted by an API key
     */
    hasPermission(keyId: string, permission: string): boolean;
    /**
     * Update API key permissions
     */
    updatePermissions(id: string, permissions: string[]): boolean;
    /**
     * Rotate an API key (generate new key, keep same permissions)
     */
    rotateApiKey(id: string): IApiKey | null;
    /**
     * Generate a secure random API key
     */
    private generateSecureKey;
    /**
     * Generate a unique ID
     */
    private generateId;
    /**
     * Hash an API key using SHA-256
     */
    private hashKey;
    /**
     * Export API keys for persistence (excludes actual keys)
     */
    exportForPersistence(): any[];
    /**
     * Import API keys from persistence
     * Note: This only works with hashed keys, original keys cannot be recovered
     */
    importFromPersistence(data: any[]): void;
}
//# sourceMappingURL=ApiKeyManager.d.ts.map