import { useState, useCallback, useEffect } from 'react';
import { Role, Permission, CreateRoleRequest, AssignPermissionRequest } from '../api/types/rbac.types';
import { rbacManagementService } from '../services/auth/rbac-management.service';

export interface RoleState {
  roles: Role[];
  loading: boolean;
  error: string | null;
}

export interface RoleActions {
  fetchRoles: () => Promise<void>;
  createRole: (req: CreateRoleRequest) => Promise<void>;
  updateRole: (id: string, role: Partial<Role>) => Promise<void>;
  deleteRole: (id: string) => Promise<void>;
  assignPermissionToRole: (req: AssignPermissionRequest) => Promise<void>;
  removePermissionFromRole: (roleId: string, permissionId: string) => Promise<void>;
  getRoleById: (id: string) => Promise<Role | null>;
}

export const useRoles = (): RoleState & RoleActions => {
  const [state, setState] = useState<RoleState>({
    roles: [],
    loading: false,
    error: null,
  });

  const fetchRoles = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const roles = await rbacManagementService.getRoles();
      setState(prev => ({ ...prev, roles, loading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch roles',
      }));
    }
  }, []);

  const createRole = useCallback(async (req: CreateRoleRequest) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const newRole = await rbacManagementService.createRole(req);
      setState(prev => ({
        ...prev,
        roles: [...prev.roles, newRole],
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to create role',
      }));
    }
  }, []);

  const updateRole = useCallback(async (id: string, role: Partial<Role>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const updatedRole = await rbacManagementService.updateRole(id, role);
      setState(prev => ({
        ...prev,
        roles: prev.roles.map(r => r.id === id ? updatedRole : r),
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to update role',
      }));
    }
  }, []);

  const deleteRole = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await rbacManagementService.deleteRole(id);
      setState(prev => ({
        ...prev,
        roles: prev.roles.filter(r => r.id !== id),
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to delete role',
      }));
    }
  }, []);

  const assignPermissionToRole = useCallback(async (req: AssignPermissionRequest) => {
    // Fetch permission for optimistic update
    let permission: Permission;
    try {
      permission = await rbacManagementService.getPermissionById(req.permissionId);
    } catch {
      // If can't fetch, skip optimistic update
      try {
        await rbacManagementService.assignPermission(req);
        // Refetch roles to get updated permissions
        await fetchRoles();
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to assign permission',
        }));
      }
      return;
    }

    // Optimistic update
    setState(prev => ({
      ...prev,
      roles: prev.roles.map(role =>
        role.id === req.roleId
          ? { ...role, permissions: [...(role.permissions || []), permission] }
          : role
      ),
    }));

    try {
      await rbacManagementService.assignPermission(req);
    } catch (error) {
      // Revert optimistic update
      setState(prev => ({
        ...prev,
        roles: prev.roles.map(role =>
          role.id === req.roleId
            ? { ...role, permissions: (role.permissions || []).filter(p => p.id !== req.permissionId) }
            : role
        ),
        error: error instanceof Error ? error.message : 'Failed to assign permission',
      }));
    }
  }, [fetchRoles]);

  const removePermissionFromRole = useCallback(async (roleId: string, permissionId: string) => {
    // Find the permission to remove for revert
    const role = state.roles.find(r => r.id === roleId);
    const permissionToRemove = role?.permissions?.find(p => p.id === permissionId);

    // Optimistic update
    setState(prev => ({
      ...prev,
      roles: prev.roles.map(role =>
        role.id === roleId
          ? { ...role, permissions: (role.permissions || []).filter(p => p.id !== permissionId) }
          : role
      ),
    }));

    try {
      await rbacManagementService.removePermissionFromRole(roleId, permissionId);
    } catch (error) {
      // Revert optimistic update
      if (permissionToRemove) {
        setState(prev => ({
          ...prev,
          roles: prev.roles.map(role =>
            role.id === roleId
              ? { ...role, permissions: [...(role.permissions || []), permissionToRemove] }
              : role
          ),
          error: error instanceof Error ? error.message : 'Failed to remove permission',
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to remove permission',
        }));
      }
    }
  }, [state.roles]);

  const getRoleById = useCallback(async (id: string): Promise<Role | null> => {
    try {
      return await rbacManagementService.getRoleById(id);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch role',
      }));
      return null;
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return {
    ...state,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
    assignPermissionToRole,
    removePermissionFromRole,
    getRoleById,
  };
};