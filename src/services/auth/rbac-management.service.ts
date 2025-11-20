import apiClient from '../../api/axios.client';
import { Permission, Role, CreateRoleRequest, CreatePermissionRequest, AssignPermissionRequest, MenuPermission, MenuMatrix, UpdateMenuPermissionsRequest } from '../../api/types/rbac.types';

export const rbacManagementService = {
  // Roles
  createRole: async (req: CreateRoleRequest): Promise<Role> => {
    const response = await apiClient.post<Role>('/rbac/roles', req);
    return response.data;
  },

  getRoleById: async (id: string): Promise<Role> => {
    const response = await apiClient.get<Role>(`/rbac/roles/${id}`);
    return response.data;
  },

  getRoles: async (limit = 50, offset = 0): Promise<Role[]> => {
    const response = await apiClient.get<Role[]>('/rbac/roles', { params: { limit, offset } });
    return response.data;
  },

  updateRole: async (id: string, role: Partial<Role>): Promise<Role> => {
    const response = await apiClient.put<Role>(`/rbac/roles/${id}`, role);
    return response.data;
  },

  deleteRole: async (id: string): Promise<void> => {
    await apiClient.delete(`/rbac/roles/${id}`);
  },

  // Permissions
  createPermission: async (req: CreatePermissionRequest): Promise<Permission> => {
    const response = await apiClient.post<Permission>('/rbac/permissions', req);
    return response.data;
  },

  getPermissionById: async (id: string): Promise<Permission> => {
    const response = await apiClient.get<Permission>(`/rbac/permissions/${id}`);
    return response.data;
  },

  getPermissions: async (limit = 50, offset = 0): Promise<Permission[]> => {
      const response = await apiClient.get<{ data: Permission[] }>('/rbac/permissions', { params: { group_by_resource: true, limit, offset } });
      return response.data.data || [];
  },

  updatePermission: async (id: string, permission: Partial<Permission>): Promise<Permission> => {
    const response = await apiClient.put<Permission>(`/rbac/permissions/${id}`, permission);
    return response.data;
  },

  deletePermission: async (id: string): Promise<void> => {
    await apiClient.delete(`/rbac/permissions/${id}`);
  },

  // Role-Permission
  assignPermission: async (req: AssignPermissionRequest): Promise<void> => {
    await apiClient.post(`/rbac/roles/${req.roleId}/permissions/${req.permissionId}`);
  },

  removePermissionFromRole: async (roleId: string, permissionId: string): Promise<void> => {
    await apiClient.delete(`/rbac/roles/${roleId}/permissions/${permissionId}`);
  },

  getPermissionsByRole: async (roleId: string): Promise<Permission[]> => {
    const response = await apiClient.get<Permission[]>(`/rbac/roles/${roleId}/permissions`);
    return response.data;
  },

  // Menu Permissions
  getMenuPermissions: async (): Promise<MenuPermission[]> => {
    const response = await apiClient.get<MenuPermission[]>('/rbac/menu/permissions');
    return response.data;
  },

  getMenuMatrix: async (): Promise<MenuMatrix> => {
    const response = await apiClient.get<MenuMatrix>('/rbac/menu/matrix');
    return response.data;
  },

  updateRoleMenuPermissions: async (roleId: string, req: UpdateMenuPermissionsRequest): Promise<void> => {
    await apiClient.put(`/rbac/roles/${roleId}/menu-permissions`, req);
  },

  // User-Role
  assignRoleToUser: async (userId: string, roleId: string, expires_at?: string): Promise<void> => {
    await apiClient.post(`/users/${userId}/roles`, { role_id: roleId, expires_at });
  },

  removeRoleFromUser: async (userId: string, roleId: string): Promise<void> => {
    await apiClient.delete(`/users/${userId}/roles/${roleId}`);
  },

  getRolesByUser: async (userId: string): Promise<Role[]> => {
    const response = await apiClient.get<Role[]>(`/users/${userId}/roles`);
    return response.data;
  },
};