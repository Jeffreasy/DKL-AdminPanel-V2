import { useState, useCallback, useEffect } from 'react';
import { Permission, CreatePermissionRequest } from '../api/types/rbac.types';
import { rbacManagementService } from '../services/auth/rbac-management.service';

export interface PermissionState {
  permissions: Permission[];
  loading: boolean;
  error: string | null;
}

export interface PermissionActions {
  fetchPermissions: () => Promise<void>;
  createPermission: (req: CreatePermissionRequest) => Promise<void>;
  updatePermission: (id: string, permission: Partial<Permission>) => Promise<void>;
  deletePermission: (id: string) => Promise<void>;
  getPermissionById: (id: string) => Promise<Permission | null>;
}

export const usePermissions = (): PermissionState & PermissionActions => {
  const [state, setState] = useState<PermissionState>({
    permissions: [],
    loading: false,
    error: null,
  });

  const fetchPermissions = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const permissions = await rbacManagementService.getPermissions();
      setState(prev => ({ ...prev, permissions, loading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch permissions',
      }));
    }
  }, []);

  const createPermission = useCallback(async (req: CreatePermissionRequest) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const newPermission = await rbacManagementService.createPermission(req);
      setState(prev => ({
        ...prev,
        permissions: [...prev.permissions, newPermission],
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to create permission',
      }));
    }
  }, []);

  const updatePermission = useCallback(async (id: string, permission: Partial<Permission>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const updatedPermission = await rbacManagementService.updatePermission(id, permission);
      setState(prev => ({
        ...prev,
        permissions: prev.permissions.map(p => p.id === id ? updatedPermission : p),
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to update permission',
      }));
    }
  }, []);

  const deletePermission = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await rbacManagementService.deletePermission(id);
      setState(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => p.id !== id),
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to delete permission',
      }));
    }
  }, []);

  const getPermissionById = useCallback(async (id: string): Promise<Permission | null> => {
    try {
      return await rbacManagementService.getPermissionById(id);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch permission',
      }));
      return null;
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return {
    ...state,
    fetchPermissions,
    createPermission,
    updatePermission,
    deletePermission,
    getPermissionById,
  };
};