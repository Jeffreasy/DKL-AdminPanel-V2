// src/services/users/staff.service.ts
import apiClient from '../../api/axios.client';
import { Gebruiker } from '../../api/types/auth.types';

export const StaffService = {
  // 1. Haal alle staff users op (Admin only)
  // Docs: GET /api/users
  getAll: async (): Promise<Gebruiker[]> => {
    const response = await apiClient.get<Gebruiker[]>('/api/users');
    return response.data;
  },

  // 2. Haal specifiek staff lid op
  getById: async (id: string): Promise<Gebruiker> => {
    const response = await apiClient.get<Gebruiker>(`/api/users/${id}`);
    return response.data;
  },

  // 3. Create Staff (Let op: vaak is dit een registratie flow, 
  // maar als admins users kunnen aanmaken, is dit het endpoint)
  create: async (staff: Partial<Gebruiker>): Promise<Gebruiker> => {
    // Check even of je backend POST /api/users ondersteunt voor staff creation,
    // anders moet dit via de auth/register endpoint.
    const response = await apiClient.post<Gebruiker>('/api/users', staff);
    return response.data;
  },

  // 4. Update Staff details
  update: async (id: string, staff: Partial<Gebruiker>): Promise<Gebruiker> => {
    const response = await apiClient.put<Gebruiker>(`/api/users/${id}`, staff);
    return response.data;
  },

  // 5. Verwijder Staff lid
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/users/${id}`);
  },

  // --- RBAC / ROL MANAGEMENT (Cruciaal voor Staff) ---

  // 6. Ken een rol toe aan een gebruiker (bijv. 'admin')
  // Docs: POST /api/users/{id}/roles
  assignRole: async (userId: string, roleId: string): Promise<void> => {
    await apiClient.post(`/api/users/${userId}/roles`, { roleId });
  },

  // 7. Verwijder een rol van een gebruiker
  // Docs: DELETE /api/users/{id}/roles/{roleId}
  removeRole: async (userId: string, roleId: string): Promise<void> => {
    await apiClient.delete(`/api/users/${userId}/roles/${roleId}`);
  }
};