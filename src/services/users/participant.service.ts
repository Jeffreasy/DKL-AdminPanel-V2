import apiClient from '../../api/axios.client';
import { Participant, ParticipantQueryParams } from '../../api/types/participant.types';

export const participantService = {
  // Haal alle deelnemers op
  getAll: async (params?: ParticipantQueryParams) => {
    const { data } = await apiClient.get<Participant[]>('/participants', { params });
    return data;
  },

  // Detail ophalen
  getById: async (id: string) => {
    const { data } = await apiClient.get<Participant>(`/participants/${id}`);
    return data;
  },

  // Registraties ophalen
  getRegistrations: async (id: string) => {
    const { data } = await apiClient.get(`/participants/${id}/registrations`);
    return data;
  },

  // Create (Admin only)
  create: async (participant: Partial<Participant>) => {
    const { data } = await apiClient.post<Participant>('/participants', participant);
    return data;
  },

  // Update
  update: async (id: string, participant: Partial<Participant>) => {
    const { data } = await apiClient.put<Participant>(`/participants/${id}`, participant);
    return data;
  },

  // Delete
  delete: async (id: string) => {
    return apiClient.delete(`/participants/${id}`);
  }
};