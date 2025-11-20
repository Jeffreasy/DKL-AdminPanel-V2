import apiClient from '../../api/axios.client';
import { User, Role, CreateUserRequest, UpdateUserRequest } from '../../api/types/user.types';

export const userService = {
  // --- USERS ---
  getAll: async (limit = 50, offset = 0) => {
    const { data } = await apiClient.get<User[]>('/users', { params: { limit, offset } });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<User>(`/users/${id}`);
    return data;
  },

  create: async (req: CreateUserRequest) => {
    const { data } = await apiClient.post<User>('/users', req);
    return data;
  },

  update: async (id: string, req: UpdateUserRequest) => {
    const { data } = await apiClient.put<User>(`/users/${id}`, req);
    return data;
  },

  delete: async (id: string) => {
    return apiClient.delete(`/users/${id}`);
  },

  // --- ROLES (RBAC) ---
  getAllRoles: async () => {
    const { data } = await apiClient.get<Role[]>('/rbac/roles');
    return data;
  },

  assignRole: async (userId: string, roleId: string) => {
    return apiClient.post(`/users/${userId}/roles`, { role_id: roleId });
  },

  removeRole: async (userId: string, roleId: string) => {
    return apiClient.delete(`/users/${userId}/roles/${roleId}`);
  }
};