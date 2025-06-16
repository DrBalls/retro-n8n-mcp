import { SemanticVersion } from '../../types/version-control.types.js';
/**
 * Utility class for semantic versioning operations
 * Implements semantic versioning (semver) specification for workflow versions
 */
export declare class SemanticVersioning {
    /**
     * Parse a version string into semantic version components
     */
    static parse(versionString: string): SemanticVersion;
    /**
     * Convert semantic version to string representation
     */
    static toString(version: SemanticVersion): string;
    /**
     * Increment version based on type
     */
    static increment(version: SemanticVersion, type: 'major' | 'minor' | 'patch' | 'prerelease', prereleaseIdentifier?: string): SemanticVersion;
    /**
     * Compare two semantic versions
     * Returns: -1 if a < b, 0 if a === b, 1 if a > b
     */
    static compare(a: SemanticVersion, b: SemanticVersion): number;
    /**
     * Check if version a is greater than version b
     */
    static isGreater(a: SemanticVersion, b: SemanticVersion): boolean;
    /**
     * Check if version a is less than version b
     */
    static isLess(a: SemanticVersion, b: SemanticVersion): boolean;
    /**
     * Check if version a equals version b
     */
    static isEqual(a: SemanticVersion, b: SemanticVersion): boolean;
    /**
     * Check if version satisfies a range (simplified implementation)
     */
    static satisfiesRange(version: SemanticVersion, range: string): boolean;
    /**
     * Get the next version based on current version and change type
     */
    static getNextVersion(currentVersion: SemanticVersion, changeType: 'auto' | 'major' | 'minor' | 'patch' | 'prerelease', changes?: {
        breaking: boolean;
        features: number;
        fixes: number;
    }): SemanticVersion;
    /**
     * Create initial version
     */
    static createInitialVersion(): SemanticVersion;
    /**
     * Validate version string format
     */
    static isValidVersionString(versionString: string): boolean;
    /**
     * Get stable version (remove prerelease and build metadata)
     */
    static getStableVersion(version: SemanticVersion): SemanticVersion;
    /**
     * Check if version is prerelease
     */
    static isPrerelease(version: SemanticVersion): boolean;
    /**
     * Check if version is stable (not prerelease)
     */
    static isStable(version: SemanticVersion): boolean;
    /**
     * Sort versions in ascending order
     */
    static sort(versions: SemanticVersion[]): SemanticVersion[];
    /**
     * Get latest version from array
     */
    static getLatest(versions: SemanticVersion[]): SemanticVersion | null;
    /**
     * Get latest stable version from array
     */
    static getLatestStable(versions: SemanticVersion[]): SemanticVersion | null;
    private static comparePrereleaseVersions;
}
//# sourceMappingURL=SemanticVersioning.d.ts.map