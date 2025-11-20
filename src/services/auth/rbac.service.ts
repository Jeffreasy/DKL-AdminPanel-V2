import axiosClient from '../../api/axios.client';
import { RBACRole, Permission, User } from '../../api/types/auth.types';

export const RBACService = {
  // --- ROLES ---

  // Docs: GET /api/roles
  async getRoles(): Promise<RBACRole[]> {
    const response = await axiosClient.get<RBACRole[]>('/api/roles');
    return response.data;
  },

  // Docs: POST /api/rbac/roles
  async createRole(role: Partial<RBACRole>): Promise<RBACRole> {
    const response = await axiosClient.post<RBACRole>('/api/rbac/roles', role);
    return response.data;
  },

  // Docs: PUT /api/rbac/roles/{id}
  async updateRole(roleId: string, role: Partial<RBACRole>): Promise<RBACRole> {
    const response = await axiosClient.put<RBACRole>(`/api/rbac/roles/${roleId}`, role);
    return response.data;
  },

  // Docs: DELETE /api/rbac/roles/{id}
  async deleteRole(roleId: string): Promise<void> {
    await axiosClient.delete(`/api/rbac/roles/${roleId}`);
  },

  // --- PERMISSIONS ---

  // Docs: GET /api/permissions
  async getPermissions(): Promise<Permission[]> {
    const response = await axiosClient.get<Permission[]>('/api/permissions');
    return response.data;
  },

  // Assign Permission to Role
  // Docs: POST /api/rbac/roles/{id}/permissions
  async assignPermissionToRole(roleId: string, permissionId: string): Promise<void> {
    await axiosClient.post(`/api/rbac/roles/${roleId}/permissions`, { permission_id: permissionId });
  },

  // Remove Permission from Role
  // Docs: DELETE /api/rbac/roles/{id}/permissions/{permissionId}
  async removePermissionFromRole(roleId: string, permissionId: string): Promise<void> {
    await axiosClient.delete(`/api/rbac/roles/${roleId}/permissions/${permissionId}`);
  },

  // --- USER ROLES ---

  // Get roles for a specific user
  // Docs: GET /api/rbac/roles/{id}/users (dit is omgekeerd) of vaak via User object.
  // Maar in jouw docs staat: GET /api/users geeft users MET roles
  // Er is geen direct endpoint in de docs om ALLEEN roles van een user te getten behalve via het user object zelf.
  
  // Assign Role to User
  // Docs: POST /api/users/{id}/roles
  async assignRoleToUser(userId: string, roleId: string): Promise<void> {
    await axiosClient.post(`/api/users/${userId}/roles`, { roleId });
  },

  // Revoke Role from User
  // Docs: DELETE /api/users/{id}/roles/{roleId}
  async revokeRoleFromUser(userId: string, roleId: string): Promise<void> {
    await axiosClient.delete(`/api/users/${userId}/roles/${roleId}`);
  }
};

export const rbacService = {
  hasPermission: (user: User, permission: Permission): boolean => {
    // Admin override
    if (user.roles?.some(role => role.name === 'admin')) return true;

    // Check permissions with wildcards
    return user.permissions?.some(p => {
      // Exact match
      if (p.resource === permission.resource && p.action === permission.action) return true;
      // Wildcard action
      if (p.resource === permission.resource && p.action === '*') return true;
      // Wildcard resource
      if (p.resource === '*' && p.action === permission.action) return true;
      // Wildcard both
      if (p.resource === '*' && p.action === '*') return true;
      return false;
    }) || false;
  },

  hasRole: (user: User, roleName: string): boolean => {
    return user.roles?.some(role => role.name === roleName) || false;
  }
};