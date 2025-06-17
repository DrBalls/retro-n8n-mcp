import { SemanticVersionSchema } from '../../types/version-control.types.js';
/**
 * Utility class for semantic versioning operations
 * Implements semantic versioning (semver) specification for workflow versions
 */
export class SemanticVersioning {
    /**
     * Parse a version string into semantic version components
     */
    static parse(versionString) {
        const versionRegex = /^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9.-]+))?(?:\+([a-zA-Z0-9.-]+))?$/;
        const match = versionString.match(versionRegex);
        if (!match) {
            throw new Error(`Invalid version string: ${versionString}`);
        }
        const [, major, minor, patch, prerelease, build] = match;
        const version = {
            major: parseInt(major, 10),
            minor: parseInt(minor, 10),
            patch: parseInt(patch, 10),
        };
        if (prerelease) {
            version.prerelease = prerelease;
        }
        if (build) {
            version.build = build;
        }
        return SemanticVersionSchema.parse(version);
    }
    /**
     * Convert semantic version to string representation
     */
    static toString(version) {
        let versionString = `${version.major}.${version.minor}.${version.patch}`;
        if (version.prerelease) {
            versionString += `-${version.prerelease}`;
        }
        if (version.build) {
            versionString += `+${version.build}`;
        }
        return versionString;
    }
    /**
     * Increment version based on type
     */
    static increment(version, type, prereleaseIdentifier) {
        const newVersion = { ...version };
        switch (type) {
            case 'major':
                newVersion.major++;
                newVersion.minor = 0;
                newVersion.patch = 0;
                delete newVersion.prerelease;
                delete newVersion.build;
                break;
            case 'minor':
                newVersion.minor++;
                newVersion.patch = 0;
                delete newVersion.prerelease;
                delete newVersion.build;
                break;
            case 'patch':
                newVersion.patch++;
                delete newVersion.prerelease;
                delete newVersion.build;
                break;
            case 'prerelease':
                if (!version.prerelease) {
                    // First prerelease version
                    newVersion.prerelease = `${prereleaseIdentifier || 'alpha'}.1`;
                }
                else {
                    // Increment existing prerelease
                    const prereleaseMatch = version.prerelease.match(/^(.+)\.(\d+)$/);
                    if (prereleaseMatch) {
                        const [, identifier, number] = prereleaseMatch;
                        newVersion.prerelease = `${identifier}.${parseInt(number, 10) + 1}`;
                    }
                    else {
                        newVersion.prerelease = `${version.prerelease}.1`;
                    }
                }
                break;
        }
        return SemanticVersionSchema.parse(newVersion);
    }
    /**
     * Compare two semantic versions
     * Returns: -1 if a < b, 0 if a === b, 1 if a > b
     */
    static compare(a, b) {
        // Compare major.minor.patch
        if (a.major !== b.major) {
            return a.major - b.major;
        }
        if (a.minor !== b.minor) {
            return a.minor - b.minor;
        }
        if (a.patch !== b.patch) {
            return a.patch - b.patch;
        }
        // Handle prerelease versions
        if (!a.prerelease && !b.prerelease) {
            return 0;
        }
        if (!a.prerelease && b.prerelease) {
            return 1; // Release > prerelease
        }
        if (a.prerelease && !b.prerelease) {
            return -1; // Prerelease < release
        }
        // Both have prerelease, compare them
        if (a.prerelease && b.prerelease) {
            return this.comparePrereleaseVersions(a.prerelease, b.prerelease);
        }
        return 0;
    }
    /**
     * Check if version a is greater than version b
     */
    static isGreater(a, b) {
        return this.compare(a, b) > 0;
    }
    /**
     * Check if version a is less than version b
     */
    static isLess(a, b) {
        return this.compare(a, b) < 0;
    }
    /**
     * Check if version a equals version b
     */
    static isEqual(a, b) {
        return this.compare(a, b) === 0;
    }
    /**
     * Check if version satisfies a range (simplified implementation)
     */
    static satisfiesRange(version, range) {
        // Simplified range checking - supports ^1.2.3, ~1.2.3, >=1.2.3, etc.
        if (range.startsWith('^')) {
            const baseVersion = this.parse(range.slice(1));
            return version.major === baseVersion.major &&
                this.compare(version, baseVersion) >= 0;
        }
        if (range.startsWith('~')) {
            const baseVersion = this.parse(range.slice(1));
            return version.major === baseVersion.major &&
                version.minor === baseVersion.minor &&
                this.compare(version, baseVersion) >= 0;
        }
        if (range.startsWith('>=')) {
            const baseVersion = this.parse(range.slice(2));
            return this.compare(version, baseVersion) >= 0;
        }
        if (range.startsWith('>')) {
            const baseVersion = this.parse(range.slice(1));
            return this.compare(version, baseVersion) > 0;
        }
        if (range.startsWith('<=')) {
            const baseVersion = this.parse(range.slice(2));
            return this.compare(version, baseVersion) <= 0;
        }
        if (range.startsWith('<')) {
            const baseVersion = this.parse(range.slice(1));
            return this.compare(version, baseVersion) < 0;
        }
        // Exact match
        const exactVersion = this.parse(range);
        return this.isEqual(version, exactVersion);
    }
    /**
     * Get the next version based on current version and change type
     */
    static getNextVersion(currentVersion, changeType, changes) {
        if (changeType === 'auto' && changes) {
            // Auto-determine version increment based on changes
            if (changes.breaking) {
                return this.increment(currentVersion, 'major');
            }
            else if (changes.features > 0) {
                return this.increment(currentVersion, 'minor');
            }
            else if (changes.fixes > 0) {
                return this.increment(currentVersion, 'patch');
            }
            else {
                // No significant changes, increment patch
                return this.increment(currentVersion, 'patch');
            }
        }
        if (changeType === 'auto') {
            // Default to patch increment if no change analysis
            return this.increment(currentVersion, 'patch');
        }
        return this.increment(currentVersion, changeType);
    }
    /**
     * Create initial version
     */
    static createInitialVersion() {
        return {
            major: 1,
            minor: 0,
            patch: 0,
        };
    }
    /**
     * Validate version string format
     */
    static isValidVersionString(versionString) {
        try {
            this.parse(versionString);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Get stable version (remove prerelease and build metadata)
     */
    static getStableVersion(version) {
        return {
            major: version.major,
            minor: version.minor,
            patch: version.patch,
        };
    }
    /**
     * Check if version is prerelease
     */
    static isPrerelease(version) {
        return !!version.prerelease;
    }
    /**
     * Check if version is stable (not prerelease)
     */
    static isStable(version) {
        return !this.isPrerelease(version);
    }
    /**
     * Sort versions in ascending order
     */
    static sort(versions) {
        return versions.slice().sort(this.compare);
    }
    /**
     * Get latest version from array
     */
    static getLatest(versions) {
        if (versions.length === 0) {
            return null;
        }
        return this.sort(versions)[versions.length - 1];
    }
    /**
     * Get latest stable version from array
     */
    static getLatestStable(versions) {
        const stableVersions = versions.filter(v => this.isStable(v));
        return this.getLatest(stableVersions);
    }
    // Private helper methods
    static comparePrereleaseVersions(a, b) {
        const aParts = a.split('.');
        const bParts = b.split('.');
        const maxLength = Math.max(aParts.length, bParts.length);
        for (let i = 0; i < maxLength; i++) {
            const aPart = aParts[i] || '0';
            const bPart = bParts[i] || '0';
            // Try to parse as numbers
            const aNum = parseInt(aPart, 10);
            const bNum = parseInt(bPart, 10);
            if (!isNaN(aNum) && !isNaN(bNum)) {
                if (aNum !== bNum) {
                    return aNum - bNum;
                }
            }
            else {
                // String comparison
                if (aPart !== bPart) {
                    return aPart.localeCompare(bPart);
                }
            }
        }
        return 0;
    }
}
//# sourceMappingURL=SemanticVersioning.js.map