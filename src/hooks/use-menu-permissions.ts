import { useState, useCallback, useEffect } from 'react';
import { MenuPermission, MenuMatrix, UpdateMenuPermissionsRequest } from '../api/types/rbac.types';
import { rbacManagementService } from '../services/auth/rbac-management.service';
import { useAuth } from './use-auth';

export interface MenuPermissionsState {
  menuPermissions: MenuPermission[];
  menuMatrix: MenuMatrix;
  loading: boolean;
  error: string | null;
}

export interface MenuPermissionsActions {
  fetchMenuPermissions: () => Promise<void>;
  fetchMenuMatrix: () => Promise<void>;
  updateRoleMenuPermissions: (roleId: string, req: UpdateMenuPermissionsRequest) => Promise<void>;
  hasMenuAccess: (menuItem: string) => boolean;
}

export const useMenuPermissions = (): MenuPermissionsState & MenuPermissionsActions => {
  const { user } = useAuth();
  const [state, setState] = useState<MenuPermissionsState>({
    menuPermissions: [],
    menuMatrix: {},
    loading: false,
    error: null,
  });

  const fetchMenuPermissions = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const menuPermissions = await rbacManagementService.getMenuPermissions();
      setState(prev => ({ ...prev, menuPermissions, loading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch menu permissions',
      }));
    }
  }, []);

  const fetchMenuMatrix = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const menuMatrix = await rbacManagementService.getMenuMatrix();
      setState(prev => ({ ...prev, menuMatrix, loading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch menu matrix',
      }));
    }
  }, []);

  const updateRoleMenuPermissions = useCallback(async (roleId: string, req: UpdateMenuPermissionsRequest) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await rbacManagementService.updateRoleMenuPermissions(roleId, req);
      // Refresh the matrix after update
      await fetchMenuMatrix();
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to update role menu permissions',
      }));
    }
  }, [fetchMenuMatrix]);

  const hasMenuAccess = useCallback((menuItem: string): boolean => {
    if (!user || !user.roles) return false;

    // Admin override
    if (user.roles.some(role => role.name === 'admin')) return true;

    // Check menu matrix for user's roles
    return user.roles.some(role => {
      const rolePermissions = state.menuMatrix[role.id];
      return rolePermissions && rolePermissions[menuItem] === true;
    });
  }, [user, state.menuMatrix]);

  useEffect(() => {
    fetchMenuPermissions();
    fetchMenuMatrix();
  }, [fetchMenuPermissions, fetchMenuMatrix]);

  return {
    ...state,
    fetchMenuPermissions,
    fetchMenuMatrix,
    updateRoleMenuPermissions,
    hasMenuAccess,
  };
};