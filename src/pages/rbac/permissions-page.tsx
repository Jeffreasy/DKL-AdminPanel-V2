import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rbacManagementService } from '@/services/auth/rbac-management.service';
import { Permission, CreatePermissionRequest } from '@/api/types/rbac.types';
import { PlusIcon, LockClosedIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Modal } from '@/components/ui/modal';
import { PermissionGuard } from '@/components/auth/permission-guard';

interface PermissionWithSystemFlag extends Permission {
  is_system_permission?: boolean;
}

interface PermissionFormData {
  resource: string;
  action: string;
  description: string;
}

const PermissionForm = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading
}: {
  initialData?: Permission;
  onSubmit: (data: PermissionFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}) => {
  const [formData, setFormData] = useState<PermissionFormData>({
    resource: initialData?.resource || '',
    action: initialData?.action || '',
    description: initialData?.description || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="resource" className="block text-sm font-medium text-gray-700">
          Resource
        </label>
        <input
          type="text"
          id="resource"
          value={formData.resource}
          onChange={(e) => setFormData({ ...formData, resource: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label htmlFor="action" className="block text-sm font-medium text-gray-700">
          Action
        </label>
        <input
          type="text"
          id="action"
          value={formData.action}
          onChange={(e) => setFormData({ ...formData, action: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
};

export const PermissionsPage = () => {
  const queryClient = useQueryClient();
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [filterTerm, setFilterTerm] = useState('');
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'create' | 'edit' | 'delete' | null;
  }>({ isOpen: false, type: null });

  // Data fetching
  const { data: permissions, isLoading } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => rbacManagementService.getPermissions(),
  });

  // Mutations
  const createPermissionMutation = useMutation({
    mutationFn: (data: CreatePermissionRequest) => rbacManagementService.createPermission(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      setModalState({ isOpen: false, type: null });
    },
  });

  const updatePermissionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Permission> }) => rbacManagementService.updatePermission(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      setModalState({ isOpen: false, type: null });
    },
  });

  const deletePermissionMutation = useMutation({
    mutationFn: (id: string) => rbacManagementService.deletePermission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      setSelectedPermission(null);
      setModalState({ isOpen: false, type: null });
    },
  });

  // Handlers
  const handleOpenCreate = () => {
    setModalState({ isOpen: true, type: 'create' });
  };

  const handleCreatePermission = (data: PermissionFormData) => {
    createPermissionMutation.mutate(data);
  };

  const handleUpdatePermission = (data: PermissionFormData) => {
    if (selectedPermission) {
      updatePermissionMutation.mutate({ id: selectedPermission.id, data });
    }
  };

  const handleDeletePermission = () => {
    if (selectedPermission) {
      deletePermissionMutation.mutate(selectedPermission.id);
    }
  };

  const handleOpenEdit = (permission: Permission) => {
    setSelectedPermission(permission);
    setModalState({ isOpen: true, type: 'edit' });
  };

  const handleOpenDelete = (permission: Permission) => {
    setSelectedPermission(permission);
    setModalState({ isOpen: true, type: 'delete' });
  };

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;

  const filteredPermissions = permissions?.filter(perm =>
    perm.resource.toLowerCase().includes(filterTerm.toLowerCase()) ||
    perm.action.toLowerCase().includes(filterTerm.toLowerCase()) ||
    perm.description.toLowerCase().includes(filterTerm.toLowerCase())
  ) || [];

  return (
    <PermissionGuard resource="permission" action="read">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Permissions</h1>
          <div className="mt-4 flex gap-2">
            <PermissionGuard resource="permission" action="write">
              <button
                onClick={handleOpenCreate}
                className="flex items-center gap-1 px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4" />
                [+ Create Permission]
              </button>
            </PermissionGuard>
            <input
              type="text"
              placeholder="Filter permissions..."
              value={filterTerm}
              onChange={(e) => setFilterTerm(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded"
            />
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPermissions.map((permission) => (
                <tr key={permission.id} className={`hover:bg-gray-50 ${selectedPermission?.id === permission.id ? 'bg-blue-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{permission.resource}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{permission.action}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{permission.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(permission as PermissionWithSystemFlag).is_system_permission && (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        <LockClosedIcon className="h-3 w-3 mr-1" />
                        System
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); handleOpenEdit(permission); }} className="text-blue-600 hover:text-blue-900">
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenDelete(permission); }}
                        disabled={(permission as PermissionWithSystemFlag).is_system_permission}
                        className={`text-red-600 hover:text-red-900 ${(permission as PermissionWithSystemFlag).is_system_permission ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      {/* Modals */}
      <Modal
        isOpen={modalState.isOpen && modalState.type === 'create'}
        onClose={() => setModalState({ isOpen: false, type: null })}
        title="Create Permission"
      >
        <PermissionForm
          onSubmit={handleCreatePermission}
          onCancel={() => setModalState({ isOpen: false, type: null })}
          isLoading={createPermissionMutation.isPending}
        />
      </Modal>

      <Modal
        isOpen={modalState.isOpen && modalState.type === 'edit'}
        onClose={() => setModalState({ isOpen: false, type: null })}
        title="Edit Permission"
      >
        <PermissionForm
          initialData={selectedPermission || undefined}
          onSubmit={handleUpdatePermission}
          onCancel={() => setModalState({ isOpen: false, type: null })}
          isLoading={updatePermissionMutation.isPending}
        />
      </Modal>

      <Modal
        isOpen={modalState.isOpen && modalState.type === 'delete'}
        onClose={() => setModalState({ isOpen: false, type: null })}
        title="Delete Permission"
      >
        <div className="space-y-4">
          {(selectedPermission as PermissionWithSystemFlag)?.is_system_permission ? (
            <p className="text-gray-700">
              System permissions cannot be deleted.
            </p>
          ) : (
            <p className="text-gray-700">
              Are you sure you want to delete the permission "{selectedPermission?.action}" for resource "{selectedPermission?.resource}"? This action cannot be undone.
            </p>
          )}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setModalState({ isOpen: false, type: null })}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeletePermission}
              disabled={deletePermissionMutation.isPending || (selectedPermission as PermissionWithSystemFlag)?.is_system_permission}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {deletePermissionMutation.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  </PermissionGuard>
  );
};