import { describe, it, expect, beforeEach } from 'vitest';
import { Authorization } from '../../src/security/Authorization.js';

describe('Authorization', () => {
  let authorization: Authorization;

  beforeEach(() => {
    authorization = new Authorization();
  });

  describe('Role Management', () => {
    it('should create a new role', () => {
      const role = {
        id: 'admin',
        name: 'Administrator',
        permissions: ['*'],
        description: 'Full system access'
      };

      authorization.createRole(role);
      const retrieved = authorization.getRole('admin');

      expect(retrieved).toEqual(role);
    });

    it('should update an existing role', () => {
      authorization.createRole({
        id: 'editor',
        name: 'Editor',
        permissions: ['workflow.read', 'workflow.update']
      });

      const updated = authorization.updateRole('editor', {
        permissions: ['workflow.*', 'execution.read']
      });

      expect(updated).toBe(true);
      
      const role = authorization.getRole('editor');
      expect(role?.permissions).toEqual(['workflow.*', 'execution.read']);
    });

    it('should delete a role', () => {
      authorization.createRole({
        id: 'custom-role',
        name: 'Custom Role',
        permissions: ['*.read']
      });

      const deleted = authorization.deleteRole('custom-role');
      expect(deleted).toBe(true);
      expect(authorization.getRole('custom-role')).toBeUndefined();
    });

    it('should not delete default roles', () => {
      const deleted = authorization.deleteRole('viewer');
      expect(deleted).toBe(false);
      expect(authorization.getRole('viewer')).toBeDefined();
    });

    it('should list all roles', () => {
      authorization.createRole({ id: 'role1', name: 'Role 1', permissions: ['a'] });
      authorization.createRole({ id: 'role2', name: 'Role 2', permissions: ['b'] });

      const roles = authorization.listRoles();
      // Should have 4 default roles + 2 new roles = 6 total
      expect(roles).toHaveLength(6);
      const roleIds = roles.map(r => r.id);
      expect(roleIds).toContain('role1');
      expect(roleIds).toContain('role2');
      expect(roleIds).toContain('admin');
      expect(roleIds).toContain('editor');
      expect(roleIds).toContain('viewer');
      expect(roleIds).toContain('executor');
    });
  });

  describe('User Management', () => {
    beforeEach(() => {
      // The default roles are already created in constructor
      // Update the editor role to match test expectations
      authorization.updateRole('editor', {
        permissions: ['workflow.*', 'execution.read']
      });
    });

    it('should create a new user', () => {
      const user = {
        id: 'user1',
        name: 'Test User',
        email: 'test@example.com',
        roles: ['editor']
      };

      authorization.upsertUser(user);
      const retrieved = authorization.getUser('user1');

      expect(retrieved).toEqual(user);
    });

    it('should update an existing user', () => {
      authorization.upsertUser({
        id: 'user1',
        name: 'Test User',
        email: 'test@example.com',
        roles: ['editor']
      });

      authorization.upsertUser({
        id: 'user1',
        name: 'Updated User',
        email: 'updated@example.com',
        roles: ['admin', 'editor']
      });

      const user = authorization.getUser('user1');
      expect(user?.name).toBe('Updated User');
      expect(user?.roles).toEqual(['admin', 'editor']);
    });

    it('should assign role to user', () => {
      authorization.upsertUser({
        id: 'user1',
        name: 'Test User',
        email: 'test@example.com',
        roles: []
      });

      const assigned = authorization.assignRole('user1', 'editor');
      expect(assigned).toBe(true);

      const user = authorization.getUser('user1');
      expect(user?.roles).toContain('editor');
    });

    it('should remove role from user', () => {
      authorization.upsertUser({
        id: 'user1',
        name: 'Test User',
        email: 'test@example.com',
        roles: ['admin', 'editor']
      });

      const removed = authorization.removeRole('user1', 'editor');
      expect(removed).toBe(true);

      const user = authorization.getUser('user1');
      expect(user?.roles).toEqual(['admin']);
    });
  });

  describe('Permission Checking', () => {
    beforeEach(() => {
      // The default roles are already created in constructor
      // Update the editor role to match test expectations
      authorization.updateRole('editor', {
        permissions: ['workflow.*', 'execution.read']
      });
      
      // Update viewer role to match test expectations
      authorization.updateRole('viewer', {
        permissions: ['*.read']
      });

      // Create test user
      authorization.upsertUser({
        id: 'testUser',
        name: 'Test User',
        email: 'test@example.com',
        roles: ['editor']
      });
    });

    it('should check user permissions based on roles', () => {
      const user = authorization.getUser('testUser')!;
      const context = { user };

      expect(authorization.hasPermission(context, 'workflow.create')).toBe(true);
      expect(authorization.hasPermission(context, 'workflow.delete')).toBe(true);
      expect(authorization.hasPermission(context, 'execution.read')).toBe(true);
      expect(authorization.hasPermission(context, 'execution.trigger')).toBe(false);
      expect(authorization.hasPermission(context, 'credential.create')).toBe(false);
    });

    it('should handle wildcard permissions', () => {
      const adminUser = authorization.getUser('testUser')!;
      adminUser.roles = ['admin'];
      
      const context = { user: adminUser };
      
      expect(authorization.hasPermission(context, 'anything.at.all')).toBe(true);
    });

    it('should check API key permissions', () => {
      const context = {
        apiKeyId: 'key1',
        apiKeyPermissions: ['workflow.read', 'workflow.list']
      };

      expect(authorization.hasPermission(context, 'workflow.read')).toBe(true);
      expect(authorization.hasPermission(context, 'workflow.list')).toBe(true);
      expect(authorization.hasPermission(context, 'workflow.create')).toBe(false);
    });

    it('should combine user and API key permissions', () => {
      const user = authorization.getUser('testUser')!;
      const context = {
        user,
        apiKeyId: 'key1',
        apiKeyPermissions: ['credential.read']
      };

      // User has workflow.* and execution.read from editor role
      // API key adds credential.read
      expect(authorization.hasPermission(context, 'workflow.create')).toBe(true);
      expect(authorization.hasPermission(context, 'execution.read')).toBe(true);
      expect(authorization.hasPermission(context, 'credential.read')).toBe(true);
      expect(authorization.hasPermission(context, 'credential.create')).toBe(false);
    });
  });

  describe('Resource Access Control', () => {
    beforeEach(() => {
      authorization.createRole({
        id: 'workflowOwner',
        name: 'Workflow Owner',
        permissions: ['workflow.*:owned']
      });

      authorization.upsertUser({
        id: 'user1',
        name: 'User 1',
        email: 'user1@example.com',
        roles: ['workflowOwner']
      });
    });

    it('should check resource-level access', () => {
      const user = authorization.getUser('user1')!;
      
      // User owns this resource
      const ownedContext = {
        user,
        resource: {
          type: 'workflow',
          id: 'wf1',
          ownerId: 'user1'
        }
      };
      
      expect(authorization.canAccessResource(ownedContext, 'update')).toBe(true);
      
      // User doesn't own this resource
      const notOwnedContext = {
        user,
        resource: {
          type: 'workflow',
          id: 'wf2',
          ownerId: 'user2'
        }
      };
      
      expect(authorization.canAccessResource(notOwnedContext, 'update')).toBe(false);
    });

    it('should allow shared resource access', () => {
      const user = authorization.getUser('user1')!;
      
      const sharedContext = {
        user,
        resource: {
          type: 'workflow',
          id: 'wf3',
          ownerId: 'user2',
          sharedWith: ['user1']
        }
      };
      
      expect(authorization.canAccessResource(sharedContext, 'read')).toBe(true);
    });

    it('should respect public resource access', () => {
      const user = authorization.getUser('user1')!;
      
      const publicContext = {
        user,
        resource: {
          type: 'workflow',
          id: 'wf4',
          ownerId: 'user2',
          isPublic: true
        }
      };
      
      expect(authorization.canAccessResource(publicContext, 'read')).toBe(true);
      expect(authorization.canAccessResource(publicContext, 'update')).toBe(false);
    });
  });

  describe('Permission Utilities', () => {
    it('should match exact permissions', () => {
      expect(authorization.permissionMatches('workflow.create', 'workflow.create')).toBe(true);
      expect(authorization.permissionMatches('workflow.create', 'workflow.update')).toBe(false);
    });

    it('should match wildcard permissions', () => {
      expect(authorization.permissionMatches('workflow.*', 'workflow.create')).toBe(true);
      expect(authorization.permissionMatches('workflow.*', 'workflow.delete')).toBe(true);
      expect(authorization.permissionMatches('workflow.*', 'execution.trigger')).toBe(false);
    });

    it('should match superuser permission', () => {
      expect(authorization.permissionMatches('*', 'workflow.create')).toBe(true);
      expect(authorization.permissionMatches('*', 'anything.at.all')).toBe(true);
    });

    it('should match read-all permission', () => {
      expect(authorization.permissionMatches('*.read', 'workflow.read')).toBe(true);
      expect(authorization.permissionMatches('*.read', 'execution.read')).toBe(true);
      expect(authorization.permissionMatches('*.read', 'workflow.create')).toBe(false);
    });
  });
});