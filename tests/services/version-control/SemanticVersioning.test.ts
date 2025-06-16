import { describe, it, expect } from 'vitest';
import { SemanticVersioning } from '../../../src/services/version-control/SemanticVersioning.js';
import { SemanticVersion } from '../../../src/types/version-control.types.js';

describe('SemanticVersioning', () => {
  describe('parse', () => {
    it('should parse valid semantic versions', () => {
      const testCases = [
        { input: '1.0.0', expected: { major: 1, minor: 0, patch: 0 } },
        { input: '2.1.3', expected: { major: 2, minor: 1, patch: 3 } },
        { input: '10.20.30', expected: { major: 10, minor: 20, patch: 30 } },
        { input: '1.1.2-prerelease+meta', expected: { major: 1, minor: 1, patch: 2, prerelease: 'prerelease', build: 'meta' } },
        { input: '1.0.0-alpha', expected: { major: 1, minor: 0, patch: 0, prerelease: 'alpha' } },
        { input: '1.0.0+20130313144700', expected: { major: 1, minor: 0, patch: 0, build: '20130313144700' } },
        { input: '1.0.0-beta+exp.sha.5114f85', expected: { major: 1, minor: 0, patch: 0, prerelease: 'beta', build: 'exp.sha.5114f85' } },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = SemanticVersioning.parse(input);
        expect(result).toEqual(expected);
      });
    });

    it('should throw error for invalid semantic versions', () => {
      const invalidVersions = [
        '1',
        '1.2',
        '1.2.3-',
        '1.2.3+',
        'a.b.c',
        '1.2.3.4',
        '',
        'v1.2.3',
      ];

      invalidVersions.forEach(version => {
        expect(() => SemanticVersioning.parse(version)).toThrow();
      });
    });
  });

  describe('toString', () => {
    it('should convert version object to string', () => {
      const testCases = [
        { input: { major: 1, minor: 0, patch: 0 }, expected: '1.0.0' },
        { input: { major: 2, minor: 1, patch: 3 }, expected: '2.1.3' },
        { input: { major: 1, minor: 0, patch: 0, prerelease: 'alpha' }, expected: '1.0.0-alpha' },
        { input: { major: 1, minor: 0, patch: 0, build: 'meta' }, expected: '1.0.0+meta' },
        { input: { major: 1, minor: 0, patch: 0, prerelease: 'beta', build: 'exp.sha.5114f85' }, expected: '1.0.0-beta+exp.sha.5114f85' },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = SemanticVersioning.toString(input as SemanticVersion);
        expect(result).toBe(expected);
      });
    });
  });

  describe('compare', () => {
    it('should compare versions correctly', () => {
      const testCases = [
        { v1: '1.0.0', v2: '2.0.0', expected: -1 },
        { v1: '2.0.0', v2: '1.0.0', expected: 1 },
        { v1: '1.0.0', v2: '1.0.0', expected: 0 },
        { v1: '1.0.0', v2: '1.1.0', expected: -1 },
        { v1: '1.1.0', v2: '1.0.0', expected: 1 },
        { v1: '1.0.0', v2: '1.0.1', expected: -1 },
        { v1: '1.0.1', v2: '1.0.0', expected: 1 },
        { v1: '1.0.0-alpha', v2: '1.0.0', expected: -1 },
        { v1: '1.0.0', v2: '1.0.0-alpha', expected: 1 },
        { v1: '1.0.0-alpha', v2: '1.0.0-beta', expected: -1 },
        { v1: '1.0.0-beta', v2: '1.0.0-alpha', expected: 1 },
        { v1: '1.0.0-rc.1', v2: '1.0.0', expected: -1 },
      ];

      testCases.forEach(({ v1, v2, expected }) => {
        const version1 = SemanticVersioning.parse(v1);
        const version2 = SemanticVersioning.parse(v2);
        const result = SemanticVersioning.compare(version1, version2);
        // Normalize result to -1, 0, 1
        const normalizedResult = result < 0 ? -1 : result > 0 ? 1 : 0;
        expect(normalizedResult).toBe(expected);
      });
    });
  });

  describe('increment', () => {
    it('should increment major version correctly', () => {
      const version = SemanticVersioning.parse('1.2.3');
      const result = SemanticVersioning.increment(version, 'major');
      expect(result).toEqual({ major: 2, minor: 0, patch: 0 });
    });

    it('should increment minor version correctly', () => {
      const version = SemanticVersioning.parse('1.2.3');
      const result = SemanticVersioning.increment(version, 'minor');
      expect(result).toEqual({ major: 1, minor: 3, patch: 0 });
    });

    it('should increment patch version correctly', () => {
      const version = SemanticVersioning.parse('1.2.3');
      const result = SemanticVersioning.increment(version, 'patch');
      expect(result).toEqual({ major: 1, minor: 2, patch: 4 });
    });

    it('should increment prerelease version correctly', () => {
      const version = SemanticVersioning.parse('1.2.3-alpha.1');
      const result = SemanticVersioning.increment(version, 'prerelease');
      expect(result).toEqual({ major: 1, minor: 2, patch: 3, prerelease: 'alpha.2' });
    });

    it('should add prerelease with identifier', () => {
      const version = SemanticVersioning.parse('1.2.3');
      const result = SemanticVersioning.increment(version, 'prerelease', 'beta');
      expect(result).toEqual({ major: 1, minor: 2, patch: 3, prerelease: 'beta.1' });
    });

    it('should clear prerelease and build on major increment', () => {
      const version = SemanticVersioning.parse('1.2.3-alpha.1+build.1');
      const result = SemanticVersioning.increment(version, 'major');
      expect(result).toEqual({ major: 2, minor: 0, patch: 0 });
    });

    it('should clear prerelease and build on minor increment', () => {
      const version = SemanticVersioning.parse('1.2.3-alpha.1+build.1');
      const result = SemanticVersioning.increment(version, 'minor');
      expect(result).toEqual({ major: 1, minor: 3, patch: 0 });
    });

    it('should clear prerelease and build on patch increment', () => {
      const version = SemanticVersioning.parse('1.2.3-alpha.1+build.1');
      const result = SemanticVersioning.increment(version, 'patch');
      expect(result).toEqual({ major: 1, minor: 2, patch: 4 });
    });
  });

  describe('isValidVersionString', () => {
    it('should validate version strings', () => {
      const validVersions = [
        '1.0.0',
        '2.1.3',
        '1.0.0-alpha',
        '1.0.0+meta',
        '1.0.0-beta+exp.sha.5114f85',
      ];

      validVersions.forEach(version => {
        expect(SemanticVersioning.isValidVersionString(version)).toBe(true);
      });
    });

    it('should reject invalid version strings', () => {
      const invalidVersions = [
        '1',
        '1.2',
        'a.b.c',
        '1.2.3.4',
        '',
        'v1.2.3',
      ];

      invalidVersions.forEach(version => {
        expect(SemanticVersioning.isValidVersionString(version)).toBe(false);
      });
    });
  });

  describe('getNextVersion', () => {
    it('should determine next version from changes', () => {
      const currentVersion = SemanticVersioning.parse('1.0.0');
      
      const testCases = [
        { 
          changeType: 'auto' as const,
          changes: { breaking: true, features: 0, fixes: 0 },
          expected: '2.0.0',
          description: 'breaking changes should trigger major increment'
        },
        { 
          changeType: 'auto' as const,
          changes: { breaking: false, features: 1, fixes: 0 },
          expected: '1.1.0',
          description: 'new features should trigger minor increment'
        },
        { 
          changeType: 'auto' as const,
          changes: { breaking: false, features: 0, fixes: 1 },
          expected: '1.0.1',
          description: 'bug fixes should trigger patch increment'
        },
        { 
          changeType: 'auto' as const,
          changes: { breaking: false, features: 0, fixes: 0 },
          expected: '1.0.1',
          description: 'no significant changes should default to patch'
        },
        { 
          changeType: 'major' as const,
          expected: '2.0.0',
          description: 'explicit major increment'
        },
        { 
          changeType: 'minor' as const,
          expected: '1.1.0',
          description: 'explicit minor increment'
        },
        { 
          changeType: 'patch' as const,
          expected: '1.0.1',
          description: 'explicit patch increment'
        }
      ];

      testCases.forEach(({ changeType, changes, expected, description }) => {
        const result = SemanticVersioning.getNextVersion(currentVersion, changeType, changes);
        expect(SemanticVersioning.toString(result)).toBe(expected);
      });
    });
  });
});