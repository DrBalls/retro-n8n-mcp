import { describe, it, expect, beforeEach } from 'vitest';
import { ApiKeyManager } from '../../src/security/ApiKeyManager.js';

describe('ApiKeyManager', () => {
  let apiKeyManager: ApiKeyManager;

  beforeEach(() => {
    apiKeyManager = new ApiKeyManager();
  });

  describe('generateApiKey', () => {
    it('should generate a new API key', () => {
      const apiKey = apiKeyManager.generateApiKey('test-key', ['read', 'write']);

      expect(apiKey.id).toMatch(/^ak_[a-f0-9]{32}$/);
      expect(apiKey.key).toHaveLength(43); // base64url of 32 bytes
      expect(apiKey.name).toBe('test-key');
      expect(apiKey.permissions).toEqual(['read', 'write']);
      expect(apiKey.createdAt).toBeInstanceOf(Date);
      expect(apiKey.expiresAt).toBeUndefined();
    });

    it('should generate API key with expiration', () => {
      const expiresIn = 60 * 60 * 1000; // 1 hour
      const apiKey = apiKeyManager.generateApiKey('expiring-key', ['read'], expiresIn);

      expect(apiKey.expiresAt).toBeInstanceOf(Date);
      expect(apiKey.expiresAt!.getTime()).toBeGreaterThan(Date.now());
      expect(apiKey.expiresAt!.getTime()).toBeLessThanOrEqual(Date.now() + expiresIn);
    });
  });

  describe('validateApiKey', () => {
    it('should validate a valid API key', () => {
      const apiKey = apiKeyManager.generateApiKey('test-key', ['read']);
      const validation = apiKeyManager.validateApiKey(apiKey.key);

      expect(validation.isValid).toBe(true);
      expect(validation.key).toBeDefined();
      expect(validation.key!.id).toBe(apiKey.id);
      expect(validation.key!.key).toBe('[REDACTED]');
      expect(validation.key!.lastUsedAt).toBeInstanceOf(Date);
    });

    it('should reject invalid API key', () => {
      const validation = apiKeyManager.validateApiKey('invalid-key');

      expect(validation.isValid).toBe(false);
      expect(validation.reason).toBe('Invalid API key');
      expect(validation.key).toBeUndefined();
    });

    it('should reject expired API key', () => {
      const apiKey = apiKeyManager.generateApiKey('expired-key', ['read'], -1000); // Expired 1 second ago
      const validation = apiKeyManager.validateApiKey(apiKey.key);

      expect(validation.isValid).toBe(false);
      expect(validation.reason).toBe('API key has expired');
    });
  });

  describe('hasPermission', () => {
    it('should check exact permission', () => {
      const apiKey = apiKeyManager.generateApiKey('test-key', ['workflow.create', 'workflow.read']);
      
      expect(apiKeyManager.hasPermission(apiKey.id, 'workflow.create')).toBe(true);
      expect(apiKeyManager.hasPermission(apiKey.id, 'workflow.read')).toBe(true);
      expect(apiKeyManager.hasPermission(apiKey.id, 'workflow.delete')).toBe(false);
    });

    it('should handle wildcard permissions', () => {
      const apiKey = apiKeyManager.generateApiKey('wildcard-key', ['workflow.*']);
      
      expect(apiKeyManager.hasPermission(apiKey.id, 'workflow.create')).toBe(true);
      expect(apiKeyManager.hasPermission(apiKey.id, 'workflow.read')).toBe(true);
      expect(apiKeyManager.hasPermission(apiKey.id, 'workflow.delete')).toBe(true);
      expect(apiKeyManager.hasPermission(apiKey.id, 'execution.trigger')).toBe(false);
    });

    it('should handle superuser permission', () => {
      const apiKey = apiKeyManager.generateApiKey('admin-key', ['*']);
      
      expect(apiKeyManager.hasPermission(apiKey.id, 'workflow.create')).toBe(true);
      expect(apiKeyManager.hasPermission(apiKey.id, 'execution.trigger')).toBe(true);
      expect(apiKeyManager.hasPermission(apiKey.id, 'anything.else')).toBe(true);
    });
  });

  describe('revokeApiKey', () => {
    it('should revoke an API key', () => {
      const apiKey = apiKeyManager.generateApiKey('test-key', ['read']);
      
      const revoked = apiKeyManager.revokeApiKey(apiKey.id);
      expect(revoked).toBe(true);

      const validation = apiKeyManager.validateApiKey(apiKey.key);
      expect(validation.isValid).toBe(false);
    });

    it('should return false for non-existent key', () => {
      const revoked = apiKeyManager.revokeApiKey('non-existent');
      expect(revoked).toBe(false);
    });
  });

  describe('rotateApiKey', () => {
    it('should rotate an API key', () => {
      const originalKey = apiKeyManager.generateApiKey('test-key', ['read', 'write']);
      const originalKeyValue = originalKey.key;
      
      const rotatedKey = apiKeyManager.rotateApiKey(originalKey.id);
      
      expect(rotatedKey).toBeDefined();
      expect(rotatedKey!.id).toBe(originalKey.id);
      expect(rotatedKey!.key).not.toBe(originalKeyValue);
      expect(rotatedKey!.permissions).toEqual(['read', 'write']);
      
      // Old key should not work
      const oldValidation = apiKeyManager.validateApiKey(originalKeyValue);
      expect(oldValidation.isValid).toBe(false);
      
      // New key should work
      const newValidation = apiKeyManager.validateApiKey(rotatedKey!.key);
      expect(newValidation.isValid).toBe(true);
    });
  });

  describe('listApiKeys', () => {
    it('should list API keys without exposing actual keys', () => {
      apiKeyManager.generateApiKey('key1', ['read']);
      apiKeyManager.generateApiKey('key2', ['write'], 3600000);
      
      const keys = apiKeyManager.listApiKeys();
      
      expect(keys).toHaveLength(2);
      expect(keys[0].name).toBe('key1');
      expect(keys[1].name).toBe('key2');
      expect(keys[0]).not.toHaveProperty('key');
      expect(keys[1]).not.toHaveProperty('key');
    });
  });
});