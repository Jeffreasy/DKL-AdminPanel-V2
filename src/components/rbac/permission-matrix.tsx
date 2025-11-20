import React, { useMemo } from 'react';
import { Role, Permission } from '@/api/types/rbac.types';
import { useRoles } from '@/hooks/use-roles';
import { usePermissions } from '@/hooks/use-permissions';

interface PermissionMatrixProps {
  className?: string;
}

export const PermissionMatrix: React.FC<PermissionMatrixProps> = ({ className = '' }) => {
  const { roles, loading: rolesLoading, error: rolesError, assignPermissionToRole, removePermissionFromRole } = useRoles();
  const { permissions, loading: permissionsLoading, error: permissionsError } = usePermissions();

  // Group permissions by resource
  const groupedPermissions = useMemo(() => {
    return permissions.reduce((acc, permission) => {
      if (!acc[permission.resource]) {
        acc[permission.resource] = [];
      }
      acc[permission.resource].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
  }, [permissions]);

  // Check if role has permission
  const hasPermission = (role: Role, permissionId: string): boolean => {
    return role.permissions?.some(p => p.id === permissionId) || false;
  };

  // Check if all permissions in resource are assigned to role
  const hasAllPermissionsInResource = (role: Role, resourcePermissions: Permission[]): boolean => {
    return resourcePermissions.every(permission => hasPermission(role, permission.id));
  };

  // Check if any permission in resource is assigned to role
  const hasSomePermissionsInResource = (role: Role, resourcePermissions: Permission[]): boolean => {
    return resourcePermissions.some(permission => hasPermission(role, permission.id));
  };

  // Handle individual permission toggle
  const handlePermissionToggle = async (role: Role, permission: Permission) => {
    const hasPerm = hasPermission(role, permission.id);
    if (hasPerm) {
      await removePermissionFromRole(role.id, permission.id);
    } else {
      await assignPermissionToRole({ roleId: role.id, permissionId: permission.id });
    }
  };

  // Handle bulk select all for resource
  const handleBulkSelectResource = async (resourcePermissions: Permission[], selectAll: boolean) => {
    const promises = roles.map(role => {
      const shouldAssign = selectAll && !hasAllPermissionsInResource(role, resourcePermissions);
      const shouldRemove = !selectAll && hasSomePermissionsInResource(role, resourcePermissions);

      if (shouldAssign) {
        return Promise.all(
          resourcePermissions
            .filter(permission => !hasPermission(role, permission.id))
            .map(permission => assignPermissionToRole({ roleId: role.id, permissionId: permission.id }))
        );
      } else if (shouldRemove) {
        return Promise.all(
          resourcePermissions
            .filter(permission => hasPermission(role, permission.id))
            .map(permission => removePermissionFromRole(role.id, permission.id))
        );
      }
      return Promise.resolve();
    });

    await Promise.all(promises);
  };

  if (rolesLoading || permissionsLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-gray-500">Laden...</div>
      </div>
    );
  }

  if (rolesError || permissionsError) {
    return (
      <div className={`p-4 bg-red-50 border border-red-200 rounded-md ${className}`}>
        <div className="text-red-700">
          Fout bij het laden: {rolesError || permissionsError}
        </div>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rol
            </th>
            {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => (
              <th
                key={resource}
                colSpan={resourcePermissions.length}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <span className="capitalize">{resource.replace(/_/g, ' ')}</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={roles.every(role => hasAllPermissionsInResource(role, resourcePermissions))}
                      ref={(el) => {
                        if (el) {
                          el.indeterminate = roles.some(role => hasSomePermissionsInResource(role, resourcePermissions)) &&
                                           !roles.every(role => hasAllPermissionsInResource(role, resourcePermissions));
                        }
                      }}
                      onChange={(e) => handleBulkSelectResource(resourcePermissions, e.target.checked)}
                    />
                    <span className="text-xs text-gray-400">Alles selecteren</span>
                  </div>
                </div>
              </th>
            ))}
          </tr>
          <tr>
            <th className="px-6 py-3"></th>
            {Object.values(groupedPermissions).map(resourcePermissions =>
              resourcePermissions.map(permission => (
                <th
                  key={permission.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200"
                >
                  {permission.action}
                </th>
              ))
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {roles.map((role) => (
            <tr key={role.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                <div>
                  <div className="font-medium">{role.name}</div>
                  <div className="text-gray-500 text-xs">{role.description}</div>
                  {role.is_system_role && (
                    <span className="inline-block mt-1 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                      Systeemrol
                    </span>
                  )}
                </div>
              </td>
              {Object.values(groupedPermissions).map(resourcePermissions =>
                resourcePermissions.map(permission => (
                  <td
                    key={`${role.id}-${permission.id}`}
                    className="px-6 py-4 whitespace-nowrap text-center border-l border-gray-200"
                  >
                    <input
                      type="checkbox"
                      checked={hasPermission(role, permission.id)}
                      onChange={() => handlePermissionToggle(role, permission)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                ))
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};