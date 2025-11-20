import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rbacManagementService } from '@/services/auth/rbac-management.service';
import { Role, CreateRoleRequest } from '@/api/types/rbac.types';
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Modal } from '@/components/ui/modal';
import { PermissionMatrix } from '@/components/rbac/permission-matrix';
import { PermissionGuard } from '@/components/auth/permission-guard';

interface RoleFormData {
  name: string;
  description: string;
}

const RoleForm = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading
}: {
  initialData?: Role;
  onSubmit: (data: RoleFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}) => {
  const [formData, setFormData] = useState<RoleFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Naam
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Beschrijving
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
          Annuleren
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Opslaan...' : 'Opslaan'}
        </button>
      </div>
    </form>
  );
};

export const RolesPage = () => {
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'create' | 'edit' | 'delete' | null;
  }>({ isOpen: false, type: null });

  // Data fetching
  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => rbacManagementService.getRoles(),
  });

  // Mutations
  const createRoleMutation = useMutation({
    mutationFn: (data: CreateRoleRequest) => rbacManagementService.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setModalState({ isOpen: false, type: null });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Role> }) => rbacManagementService.updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setModalState({ isOpen: false, type: null });
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (id: string) => rbacManagementService.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setSelectedRole(null);
      setModalState({ isOpen: false, type: null });
    },
  });


  // Handlers
  const handleSelectRole = (role: Role) => {
    setSelectedRole(role);
  };

  const handleOpenCreate = () => {
    setModalState({ isOpen: true, type: 'create' });
  };

  const handleCreateRole = (data: RoleFormData) => {
    createRoleMutation.mutate({ name: data.name, description: data.description, permissions: [] });
  };

  const handleUpdateRole = (data: RoleFormData) => {
    if (selectedRole) {
      updateRoleMutation.mutate({ id: selectedRole.id, data: { name: data.name, description: data.description } });
    }
  };

  const handleDeleteRole = () => {
    if (selectedRole) {
      deleteRoleMutation.mutate(selectedRole.id);
    }
  };

  const handleOpenEdit = (role: Role) => {
    setSelectedRole(role);
    setModalState({ isOpen: true, type: 'edit' });
  };

  const handleOpenDelete = (role: Role) => {
    setSelectedRole(role);
    setModalState({ isOpen: true, type: 'delete' });
  };

  if (rolesLoading) return <div className="p-8 text-center">Laden...</div>;

  const filteredRoles = roles?.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PermissionGuard resource="role" action="read">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Rollen</h1>
          <p className="text-gray-600">Beheer rollen en permissies</p>
          <div className="mt-4 flex gap-2">
            <PermissionGuard resource="role" action="write">
              <button
                onClick={handleOpenCreate}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4" />
                [+ Create Role]
              </button>
            </PermissionGuard>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 rounded"
            />
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Users</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perms</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRoles?.map((role) => (
                <tr key={role.id} onClick={() => handleSelectRole(role)} className={`cursor-pointer hover:bg-gray-50 ${selectedRole?.id === role.id ? 'bg-blue-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{role.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.permissions?.length || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); handleOpenEdit(role); }} className="text-blue-600 hover:text-blue-900">
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleOpenDelete(role); }} className="text-red-600 hover:text-red-900">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Permission Matrix</h2>
          <p className="text-gray-600">Assign permissions to roles</p>
        </div>
        <PermissionMatrix />

        {/* Modals */}
        <Modal
          isOpen={modalState.isOpen && modalState.type === 'create'}
          onClose={() => setModalState({ isOpen: false, type: null })}
          title="Nieuwe Rol Aanmaken"
        >
          <RoleForm
            onSubmit={handleCreateRole}
            onCancel={() => setModalState({ isOpen: false, type: null })}
            isLoading={createRoleMutation.isPending}
          />
        </Modal>

        <Modal
          isOpen={modalState.isOpen && modalState.type === 'edit'}
          onClose={() => setModalState({ isOpen: false, type: null })}
          title="Rol Bewerken"
        >
          <RoleForm
            initialData={selectedRole || undefined}
            onSubmit={handleUpdateRole}
            onCancel={() => setModalState({ isOpen: false, type: null })}
            isLoading={updateRoleMutation.isPending}
          />
        </Modal>

        <Modal
          isOpen={modalState.isOpen && modalState.type === 'delete'}
          onClose={() => setModalState({ isOpen: false, type: null })}
          title="Rol Verwijderen"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              Weet je zeker dat je de rol "{selectedRole?.name}" wilt verwijderen? Dit kan niet ongedaan worden gemaakt.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalState({ isOpen: false, type: null })}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annuleren
              </button>
              <button
                onClick={handleDeleteRole}
                disabled={deleteRoleMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {deleteRoleMutation.isPending ? 'Verwijderen...' : 'Verwijderen'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </PermissionGuard>
  );
};