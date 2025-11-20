import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/users/user.service';
import { rbacManagementService } from '@/services/auth/rbac-management.service';
import { User, CreateUserRequest, UpdateUserRequest } from '@/api/types/user.types';
import { Modal } from '@/components/ui/modal';
import { PermissionGuard } from '@/components/auth/permission-guard';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

// Helper for form state
const initialForm: CreateUserRequest = {
  naam: '',
  email: '',
  wachtwoord: '',
  is_actief: true
};

export const UsersPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<CreateUserRequest>(initialForm);

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleModalUser, setRoleModalUser] = useState<User | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [roleExpirations, setRoleExpirations] = useState<{ [roleId: string]: string }>({});
  
  // --- QUERIES ---
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAll()
  });

  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: userService.getAllRoles
  });

  // --- MUTATIONS ---
  const createMutation = useMutation({
    mutationFn: userService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      handleClose();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: UpdateUserRequest }) => userService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      handleClose();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: userService.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] })
  });

  const assignRoleMutation = useMutation({
    mutationFn: ({ userId, roleId, expires_at }: { userId: string, roleId: string, expires_at?: string }) =>
      rbacManagementService.assignRoleToUser(userId, roleId, expires_at),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] })
  });

  const removeRoleMutation = useMutation({
    mutationFn: ({ userId, roleId }: { userId: string, roleId: string }) =>
      rbacManagementService.removeRoleFromUser(userId, roleId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] })
  });

  // --- HANDLERS ---
  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      naam: user.naam,
      email: user.email,
      wachtwoord: '', // Keep empty unless changing
      is_actief: user.is_actief
    });
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleOpenRoleModal = (user: User) => {
    setRoleModalUser(user);
    setSelectedRoles(user.user_roles?.map(ur => ur.role_id) || user.roles?.map(r => r.id) || []);
    setRoleExpirations({});
    setIsRoleModalOpen(true);
  };

  const handleCloseRoleModal = () => {
    setIsRoleModalOpen(false);
    setRoleModalUser(null);
    setSelectedRoles([]);
    setRoleExpirations({});
  };

  const handleSaveRoles = () => {
    if (!roleModalUser) return;

    const currentRoleIds = roleModalUser.user_roles?.map(ur => ur.role_id) || roleModalUser.roles?.map(r => r.id) || [];
    const toAdd = selectedRoles.filter(id => !currentRoleIds.includes(id));
    const toRemove = currentRoleIds.filter(id => !selectedRoles.includes(id));

    // Remove roles
    toRemove.forEach(roleId => {
      removeRoleMutation.mutate({ userId: roleModalUser.id, roleId });
    });

    // Add roles with expiration
    toAdd.forEach(roleId => {
      assignRoleMutation.mutate({
        userId: roleModalUser.id,
        roleId,
        expires_at: roleExpirations[roleId] || undefined
      });
    });

    handleCloseRoleModal();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      // Only send password if filled
      const payload: UpdateUserRequest = {
        naam: formData.naam,
        email: formData.email,
        is_actief: formData.is_actief,
        ...(formData.wachtwoord && { wachtwoord: formData.wachtwoord })
      };
      updateMutation.mutate({ id: editingUser.id, data: payload });
    } else {
      createMutation.mutate(formData);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gebruikersbeheer</h1>
          <p className="text-sm text-gray-500">Beheer beheerders en hun rechten.</p>
        </div>
        <button onClick={handleOpenCreate} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <PlusIcon className="w-5 h-5 mr-2" /> Nieuwe Gebruiker
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {isLoading ? <div className="p-8 text-center">Laden...</div> : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gebruiker</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rollen</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users?.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
                        {user.naam.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{user.naam}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     {user.is_actief ? (
                       <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 gap-1">
                         <CheckCircleIcon className="w-3 h-3" /> Actief
                       </span>
                     ) : (
                       <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 gap-1">
                         <XCircleIcon className="w-3 h-3" /> Inactief
                       </span>
                     )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.user_roles?.map(userRole => (
                        <span key={userRole.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600">
                          {userRole.role?.name || 'Unknown'}
                          {userRole.expires_at && (
                            <span className="ml-1 text-xs text-red-600">
                              (exp: {new Date(userRole.expires_at).toLocaleDateString()})
                            </span>
                          )}
                        </span>
                      ))}
                      {(!user.user_roles || user.user_roles.length === 0) && <span className="text-xs text-gray-400">-</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium flex justify-end gap-2">
                    <button onClick={() => handleOpenEdit(user)} className="text-blue-600 hover:text-blue-900 p-1"><PencilIcon className="w-5 h-5"/></button>
                    <PermissionGuard resource="user" action="manage_roles">
                      <button onClick={() => handleOpenRoleModal(user)} className="text-purple-600 hover:text-purple-900 p-1"><UserGroupIcon className="w-5 h-5"/></button>
                    </PermissionGuard>
                    <button onClick={() => { if(confirm('Verwijderen?')) deleteMutation.mutate(user.id) }} className="text-red-600 hover:text-red-900 p-1"><TrashIcon className="w-5 h-5"/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleClose} title={editingUser ? "Gebruiker Bewerken" : "Nieuwe Gebruiker"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Fields */}
          <div>
            <label className="block text-sm font-medium mb-1">Naam</label>
            <input className="w-full border rounded p-2 dark:bg-gray-800" required value={formData.naam} onChange={e => setFormData({...formData, naam: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" className="w-full border rounded p-2 dark:bg-gray-800" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Wachtwoord {editingUser && '(Laat leeg om te behouden)'}</label>
            <input type="password" className="w-full border rounded p-2 dark:bg-gray-800" value={formData.wachtwoord} onChange={e => setFormData({...formData, wachtwoord: e.target.value})} required={!editingUser} />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" checked={formData.is_actief} onChange={e => setFormData({...formData, is_actief: e.target.checked})} />
            <span className="text-sm">Account is actief</span>
          </div>


          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={handleClose} className="px-4 py-2 text-gray-600">Annuleren</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Opslaan</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isRoleModalOpen} onClose={handleCloseRoleModal} title={`Rollen beheren voor ${roleModalUser?.naam}`}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Selecteer rollen</label>
            <select
              multiple
              value={selectedRoles}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => option.value);
                setSelectedRoles(values);
              }}
              className="w-full border rounded p-2 dark:bg-gray-800 h-32"
            >
              {roles?.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </div>

          {selectedRoles.map(roleId => {
            const role = roles?.find(r => r.id === roleId);
            return (
              <div key={roleId} className="border-t pt-2">
                <label className="block text-sm font-medium mb-1">
                  Vervaldatum voor {role?.name} (optioneel)
                </label>
                <input
                  type="datetime-local"
                  value={roleExpirations[roleId] || ''}
                  onChange={(e) => setRoleExpirations(prev => ({ ...prev, [roleId]: e.target.value }))}
                  className="w-full border rounded p-2 dark:bg-gray-800"
                />
              </div>
            );
          })}

          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={handleCloseRoleModal} className="px-4 py-2 text-gray-600">Annuleren</button>
            <button type="button" onClick={handleSaveRoles} className="px-4 py-2 bg-blue-600 text-white rounded">Opslaan</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};