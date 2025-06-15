import { createHash, randomBytes } from 'crypto';
import { Logger } from '../utils/Logger.js';

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

export class ApiKeyManager {
  private logger = new Logger('ApiKeyManager');
  private apiKeys = new Map<string, IApiKey>();
  private hashedKeys = new Map<string, string>(); // hash -> id mapping

  /**
   * Generate a new API key
   */
  generateApiKey(
    name: string,
    permissions: string[] = [],
    expiresIn?: number // milliseconds
  ): IApiKey {
    const id = this.generateId();
    const key = this.generateSecureKey();
    const hashedKey = this.hashKey(key);
    
    const apiKey: IApiKey = {
      id,
      key,
      name,
      createdAt: new Date(),
      permissions,
      ...(expiresIn && {
        expiresAt: new Date(Date.now() + expiresIn)
      })
    };

    this.apiKeys.set(id, apiKey);
    this.hashedKeys.set(hashedKey, id);

    this.logger.info(`API key generated`, {
      id,
      name,
      permissions,
      expiresAt: apiKey.expiresAt
    });

    return apiKey;
  }

  /**
   * Validate an API key
   */
  validateApiKey(key: string): IApiKeyValidation {
    const hashedKey = this.hashKey(key);
    const id = this.hashedKeys.get(hashedKey);

    if (!id) {
      return {
        isValid: false,
        reason: 'Invalid API key'
      };
    }

    const apiKey = this.apiKeys.get(id);
    if (!apiKey) {
      return {
        isValid: false,
        reason: 'API key not found'
      };
    }

    // Check expiration
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return {
        isValid: false,
        reason: 'API key has expired'
      };
    }

    // Update last used timestamp
    apiKey.lastUsedAt = new Date();

    return {
      isValid: true,
      key: {
        ...apiKey,
        key: '[REDACTED]' // Don't expose the actual key
      }
    };
  }

  /**
   * Revoke an API key
   */
  revokeApiKey(id: string): boolean {
    const apiKey = this.apiKeys.get(id);
    if (!apiKey) {
      return false;
    }

    const hashedKey = this.hashKey(apiKey.key);
    this.hashedKeys.delete(hashedKey);
    this.apiKeys.delete(id);

    this.logger.info(`API key revoked`, { id, name: apiKey.name });
    return true;
  }

  /**
   * List all API keys (without exposing the actual keys)
   */
  listApiKeys(): Omit<IApiKey, 'key'>[] {
    return Array.from(this.apiKeys.values()).map(apiKey => ({
      id: apiKey.id,
      name: apiKey.name,
      createdAt: apiKey.createdAt,
      lastUsedAt: apiKey.lastUsedAt,
      expiresAt: apiKey.expiresAt,
      permissions: apiKey.permissions,
      metadata: apiKey.metadata
    }));
  }

  /**
   * Check if a permission is granted by an API key
   */
  hasPermission(keyId: string, permission: string): boolean {
    const apiKey = this.apiKeys.get(keyId);
    if (!apiKey) {
      return false;
    }

    // Check for wildcard permission
    if (apiKey.permissions.includes('*')) {
      return true;
    }

    // Check for exact permission
    if (apiKey.permissions.includes(permission)) {
      return true;
    }

    // Check for namespace permissions (e.g., 'workflow.*' matches 'workflow.create')
    const namespaces = permission.split('.');
    for (let i = namespaces.length - 1; i > 0; i--) {
      const namespace = namespaces.slice(0, i).join('.') + '.*';
      if (apiKey.permissions.includes(namespace)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Update API key permissions
   */
  updatePermissions(id: string, permissions: string[]): boolean {
    const apiKey = this.apiKeys.get(id);
    if (!apiKey) {
      return false;
    }

    apiKey.permissions = permissions;
    this.logger.info(`API key permissions updated`, { id, permissions });
    return true;
  }

  /**
   * Rotate an API key (generate new key, keep same permissions)
   */
  rotateApiKey(id: string): IApiKey | null {
    const oldApiKey = this.apiKeys.get(id);
    if (!oldApiKey) {
      return null;
    }

    // Remove old key hash
    const oldHashedKey = this.hashKey(oldApiKey.key);
    this.hashedKeys.delete(oldHashedKey);

    // Generate new key
    const newKey = this.generateSecureKey();
    const newHashedKey = this.hashKey(newKey);

    // Update the API key
    oldApiKey.key = newKey;
    oldApiKey.createdAt = new Date();
    delete oldApiKey.lastUsedAt;

    // Update hash mapping
    this.hashedKeys.set(newHashedKey, id);

    this.logger.info(`API key rotated`, { id, name: oldApiKey.name });
    return oldApiKey;
  }

  /**
   * Generate a secure random API key
   */
  private generateSecureKey(): string {
    // Generate 32 bytes of random data
    const buffer = randomBytes(32);
    // Convert to base64url format (URL-safe, no padding)
    return buffer.toString('base64url');
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `ak_${randomBytes(16).toString('hex')}`;
  }

  /**
   * Hash an API key using SHA-256
   */
  private hashKey(key: string): string {
    return createHash('sha256').update(key).digest('hex');
  }

  /**
   * Export API keys for persistence (excludes actual keys)
   */
  exportForPersistence(): any[] {
    return Array.from(this.apiKeys.values()).map(apiKey => ({
      ...apiKey,
      key: this.hashKey(apiKey.key), // Store only the hash
      isHashed: true
    }));
  }

  /**
   * Import API keys from persistence
   * Note: This only works with hashed keys, original keys cannot be recovered
   */
  importFromPersistence(data: any[]): void {
    for (const item of data) {
      if (item.isHashed) {
        // We can only track the metadata, not validate the actual key
        const apiKey: IApiKey = {
          ...item,
          key: '[IMPORTED_HASH]', // Placeholder
          createdAt: new Date(item.createdAt),
          lastUsedAt: item.lastUsedAt ? new Date(item.lastUsedAt) : undefined,
          expiresAt: item.expiresAt ? new Date(item.expiresAt) : undefined
        };
        
        this.apiKeys.set(apiKey.id, apiKey);
        // Note: We cannot restore the hash mapping without the original key
        
        this.logger.info(`Imported API key metadata`, { 
          id: apiKey.id, 
          name: apiKey.name 
        });
      }
    }
  }
}