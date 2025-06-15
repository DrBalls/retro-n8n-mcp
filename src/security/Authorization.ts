import { Logger } from '../utils/Logger.js';

export interface IRole {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  inherits?: string[]; // Role IDs to inherit from
}

export interface IUser {
  id: string;
  name: string;
  email?: string;
  roles: string[];
  permissions?: string[]; // Direct permissions
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

export class Authorization {
  private logger = new Logger('Authorization');
  private roles = new Map<string, IRole>();
  private users = new Map<string, IUser>();
  private resourcePermissions = new Map<string, Map<string, string[]>>(); // resourceId -> userId -> permissions

  constructor() {
    this.initializeDefaultRoles();
  }

  /**
   * Initialize default roles
   */
  private initializeDefaultRoles(): void {
    this.createRole({
      id: 'admin',
      name: 'Administrator',
      description: 'Full system access',
      permissions: ['*']
    });

    this.createRole({
      id: 'editor',
      name: 'Editor',
      description: 'Can create and edit workflows',
      permissions: [
        'workflow.*',
        'execution.trigger',
        'execution.list',
        'execution.get',
        'credential.list',
        'credential.get'
      ]
    });

    this.createRole({
      id: 'viewer',
      name: 'Viewer',
      description: 'Read-only access',
      permissions: [
        'workflow.list',
        'workflow.get',
        'execution.list',
        'execution.get',
        'credential.list'
      ]
    });

    this.createRole({
      id: 'executor',
      name: 'Executor',
      description: 'Can trigger and monitor executions',
      permissions: [
        'workflow.list',
        'workflow.get',
        'execution.*'
      ]
    });
  }

  /**
   * Create a new role
   */
  createRole(role: IRole): void {
    this.roles.set(role.id, role);
    this.logger.info(`Role created`, { 
      id: role.id, 
      name: role.name,
      permissions: role.permissions.length 
    });
  }

  /**
   * Create or update a user
   */
  upsertUser(user: IUser): void {
    this.users.set(user.id, user);
    this.logger.info(`User upserted`, { 
      id: user.id, 
      name: user.name,
      roles: user.roles 
    });
  }

  /**
   * Check if a user has a specific permission
   */
  hasPermission(
    context: IAuthorizationContext,
    permission: string
  ): boolean {
    // Check API key permissions first
    if (context.apiKeyId && context.apiKeyPermissions) {
      if (this.checkPermissionList(context.apiKeyPermissions, permission)) {
        return true;
      }
    }

    // Check user permissions
    if (context.user) {
      // Check direct user permissions
      if (context.user.permissions) {
        if (this.checkPermissionList(context.user.permissions, permission)) {
          return true;
        }
      }

      // Check role permissions
      const rolePermissions = this.getUserRolePermissions(context.user);
      if (this.checkPermissionList(rolePermissions, permission)) {
        return true;
      }

      // Check resource-specific permissions
      if (context.resource) {
        const resourcePerms = this.getResourcePermissions(
          context.resource.id,
          context.user.id
        );
        if (this.checkPermissionList(resourcePerms, permission)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Check if a user can access a resource
   */
  canAccessResource(
    context: IAuthorizationContext,
    action: string
  ): boolean {
    if (!context.resource) {
      return false;
    }

    // Build permission string
    const permission = `${context.resource.type}.${action}`;

    // Check general permission
    if (this.hasPermission(context, permission)) {
      return true;
    }

    // Check ownership
    if (context.user && 
        context.resource.owner === context.user.id &&
        this.hasPermission(context, `${context.resource.type}.${action}.own`)) {
      return true;
    }

    return false;
  }

  /**
   * Grant permission to a user for a specific resource
   */
  grantResourcePermission(
    resourceId: string,
    userId: string,
    permissions: string[]
  ): void {
    if (!this.resourcePermissions.has(resourceId)) {
      this.resourcePermissions.set(resourceId, new Map());
    }

    const resourcePerms = this.resourcePermissions.get(resourceId)!;
    const existingPerms = resourcePerms.get(userId) || [];
    const newPerms = Array.from(new Set([...existingPerms, ...permissions]));
    
    resourcePerms.set(userId, newPerms);

    this.logger.info(`Resource permissions granted`, {
      resourceId,
      userId,
      permissions
    });
  }

  /**
   * Revoke permissions from a user for a resource
   */
  revokeResourcePermission(
    resourceId: string,
    userId: string,
    permissions?: string[]
  ): void {
    const resourcePerms = this.resourcePermissions.get(resourceId);
    if (!resourcePerms) {
      return;
    }

    if (!permissions) {
      // Revoke all permissions
      resourcePerms.delete(userId);
    } else {
      // Revoke specific permissions
      const existingPerms = resourcePerms.get(userId) || [];
      const newPerms = existingPerms.filter(p => !permissions.includes(p));
      
      if (newPerms.length > 0) {
        resourcePerms.set(userId, newPerms);
      } else {
        resourcePerms.delete(userId);
      }
    }

    this.logger.info(`Resource permissions revoked`, {
      resourceId,
      userId,
      permissions
    });
  }

  /**
   * Get all permissions for a user from their roles
   */
  private getUserRolePermissions(user: IUser): string[] {
    const permissions = new Set<string>();
    const processedRoles = new Set<string>();

    const processRole = (roleId: string) => {
      if (processedRoles.has(roleId)) {
        return;
      }
      processedRoles.add(roleId);

      const role = this.roles.get(roleId);
      if (!role) {
        return;
      }

      // Add role permissions
      role.permissions.forEach(p => permissions.add(p));

      // Process inherited roles
      if (role.inherits) {
        role.inherits.forEach(processRole);
      }
    };

    user.roles.forEach(processRole);
    return Array.from(permissions);
  }

  /**
   * Get resource-specific permissions for a user
   */
  private getResourcePermissions(resourceId: string, userId: string): string[] {
    const resourcePerms = this.resourcePermissions.get(resourceId);
    if (!resourcePerms) {
      return [];
    }

    return resourcePerms.get(userId) || [];
  }

  /**
   * Check if a permission is in a list (handles wildcards)
   */
  private checkPermissionList(permissions: string[], permission: string): boolean {
    // Check for superuser
    if (permissions.includes('*')) {
      return true;
    }

    // Check exact match
    if (permissions.includes(permission)) {
      return true;
    }

    // Check wildcards
    const parts = permission.split('.');
    for (let i = parts.length - 1; i > 0; i--) {
      const wildcard = parts.slice(0, i).join('.') + '.*';
      if (permissions.includes(wildcard)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get all roles
   */
  getRoles(): IRole[] {
    return Array.from(this.roles.values());
  }

  /**
   * Get a specific role
   */
  getRole(id: string): IRole | undefined {
    return this.roles.get(id);
  }

  /**
   * Update a role
   */
  updateRole(id: string, updates: Partial<IRole>): boolean {
    const role = this.roles.get(id);
    if (!role) {
      return false;
    }

    Object.assign(role, updates);
    this.logger.info(`Role updated`, { id, updates: Object.keys(updates) });
    return true;
  }

  /**
   * Delete a role (except default roles)
   */
  deleteRole(id: string): boolean {
    if (['admin', 'editor', 'viewer', 'executor'].includes(id)) {
      this.logger.warn(`Cannot delete default role`, { id });
      return false;
    }

    const deleted = this.roles.delete(id);
    if (deleted) {
      this.logger.info(`Role deleted`, { id });
    }
    return deleted;
  }

  /**
   * Get effective permissions for a context
   */
  getEffectivePermissions(context: IAuthorizationContext): string[] {
    const permissions = new Set<string>();

    // Add API key permissions
    if (context.apiKeyPermissions) {
      context.apiKeyPermissions.forEach(p => permissions.add(p));
    }

    // Add user permissions
    if (context.user) {
      // Direct permissions
      if (context.user.permissions) {
        context.user.permissions.forEach(p => permissions.add(p));
      }

      // Role permissions
      const rolePerms = this.getUserRolePermissions(context.user);
      rolePerms.forEach(p => permissions.add(p));

      // Resource permissions
      if (context.resource) {
        const resourcePerms = this.getResourcePermissions(
          context.resource.id,
          context.user.id
        );
        resourcePerms.forEach(p => permissions.add(p));
      }
    }

    return Array.from(permissions);
  }

  /**
   * List all roles
   */
  listRoles(): IRole[] {
    return Array.from(this.roles.values());
  }

  /**
   * Get a user by ID
   */
  getUser(id: string): IUser | undefined {
    return this.users.get(id);
  }

  /**
   * Assign a role to a user
   */
  assignRole(userId: string, roleId: string): boolean {
    const user = this.users.get(userId);
    if (!user) {
      return false;
    }

    if (!this.roles.has(roleId)) {
      return false;
    }

    if (!user.roles.includes(roleId)) {
      user.roles.push(roleId);
      this.logger.info(`Role assigned to user`, { userId, roleId });
    }

    return true;
  }

  /**
   * Remove a role from a user
   */
  removeRole(userId: string, roleId: string): boolean {
    const user = this.users.get(userId);
    if (!user) {
      return false;
    }

    const index = user.roles.indexOf(roleId);
    if (index > -1) {
      user.roles.splice(index, 1);
      this.logger.info(`Role removed from user`, { userId, roleId });
      return true;
    }

    return false;
  }

  /**
   * Check if a permission matches a pattern (with wildcard support)
   */
  permissionMatches(pattern: string, permission: string): boolean {
    // Exact match
    if (pattern === permission) {
      return true;
    }

    // Superuser wildcard
    if (pattern === '*') {
      return true;
    }

    // Check wildcard patterns
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      return regex.test(permission);
    }

    return false;
  }

  /**
   * Can access resource with advanced checks
   */
  canAccessResource(
    context: {
      user?: IUser;
      resource?: {
        type: string;
        id: string;
        ownerId?: string;
        sharedWith?: string[];
        isPublic?: boolean;
      };
    },
    action: string
  ): boolean {
    if (!context.resource || !context.user) {
      return false;
    }

    const resource = context.resource;
    const user = context.user;

    // Check if user is owner
    if (resource.ownerId === user.id) {
      // Owner has full access to their resources if they have ownership permission
      const ownerPermission = `${resource.type}.*:owned`;
      const rolePerms = this.getUserRolePermissions(user);
      if (this.checkPermissionList(rolePerms, ownerPermission)) {
        return true;
      }
    }

    // Check if resource is shared with user
    if (resource.sharedWith?.includes(user.id)) {
      // Shared resources typically allow read access
      if (action === 'read') {
        return true;
      }
    }

    // Check if resource is public
    if (resource.isPublic && action === 'read') {
      return true;
    }

    // Fall back to general permission check
    const permission = `${resource.type}.${action}`;
    return this.hasPermission({ user }, permission);
  }
}