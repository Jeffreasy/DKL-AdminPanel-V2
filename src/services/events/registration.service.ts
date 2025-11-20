import apiClient from '../../api/axios.client';
import { EventRegistration } from '../../api/types/event.types';

export const RegistrationService = {
  // Haal alle registraties op (mogelijk met filters voor event_id)
  // Docs: GET /api/event-registrations (Admin endpoint)
  getAll: async (params?: { event_id?: string; limit?: number; offset?: number }): Promise<EventRegistration[]> => {
    const response = await apiClient.get<EventRegistration[]>('/api/event-registrations', { params });
    return response.data;
  },

  getById: async (id: string): Promise<EventRegistration> => {
    const response = await apiClient.get<EventRegistration>(`/api/event-registrations/${id}`);
    return response.data;
  },

  // Handmatige registratie toevoegen (Admin override)
  // Docs: POST /api/event-registrations
  create: async (registration: Partial<EventRegistration>): Promise<EventRegistration> => {
    const response = await apiClient.post<EventRegistration>('/api/event-registrations', registration);
    return response.data;
  },

  // Update registratie (bijv. afstand wijzigen)
  // Docs: PUT /api/event-registrations/{id}
  update: async (id: string, registration: Partial<EventRegistration>): Promise<EventRegistration> => {
    const response = await apiClient.put<EventRegistration>(`/api/event-registrations/${id}`, registration);
    return response.data;
  },

  // Verwijder registratie
  // Docs: DELETE /api/event-registrations/{id}
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/event-registrations/${id}`);
  }
};