export interface IRole {
    id: string;
    name: string;
    description?: string;
    permissions: string[];
    inherits?: string[];
}
export interface IUser {
    id: string;
    name: string;
    email?: string;
    roles: string[];
    permissions?: string[];
    metadata?: Record<string, unknown>;
}
export interface IAuthorizationContext {
    user?: IUser;
    apiKeyId?: string;
    apiKeyPermissions?: string[];
    resource?: {
        type: string;
        id: string;
        owner?: string;
    };
}
export declare class Authorization {
    private logger;
    private roles;
    private users;
    private resourcePermissions;
    constructor();
    /**
     * Initialize default roles
     */
    private initializeDefaultRoles;
    /**
     * Create a new role
     */
    createRole(role: IRole): void;
    /**
     * Create or update a user
     */
    upsertUser(user: IUser): void;
    /**
     * Check if a user has a specific permission
     */
    hasPermission(context: IAuthorizationContext, permission: string): boolean;
    /**
     * Grant permission to a user for a specific resource
     */
    grantResourcePermission(resourceId: string, userId: string, permissions: string[]): void;
    /**
     * Revoke permissions from a user for a resource
     */
    revokeResourcePermission(resourceId: string, userId: string, permissions?: string[]): void;
    /**
     * Get all permissions for a user from their roles
     */
    private getUserRolePermissions;
    /**
     * Get resource-specific permissions for a user
     */
    private getResourcePermissions;
    /**
     * Check if a permission is in a list (handles wildcards)
     */
    private checkPermissionList;
    /**
     * Get all roles
     */
    getRoles(): IRole[];
    /**
     * Get a specific role
     */
    getRole(id: string): IRole | undefined;
    /**
     * Update a role
     */
    updateRole(id: string, updates: Partial<IRole>): boolean;
    /**
     * Delete a role (except default roles)
     */
    deleteRole(id: string): boolean;
    /**
     * Get effective permissions for a context
     */
    getEffectivePermissions(context: IAuthorizationContext): string[];
    /**
     * List all roles
     */
    listRoles(): IRole[];
    /**
     * Get a user by ID
     */
    getUser(id: string): IUser | undefined;
    /**
     * Assign a role to a user
     */
    assignRole(userId: string, roleId: string): boolean;
    /**
     * Remove a role from a user
     */
    removeRole(userId: string, roleId: string): boolean;
    /**
     * Check if a permission matches a pattern (with wildcard support)
     */
    permissionMatches(pattern: string, permission: string): boolean;
}
//# sourceMappingURL=Authorization.d.ts.map