import apiClient from '../../api/axios.client';
import {
  Newsletter,
  CreateNewsletterRequest
} from '../../types';

export const newsletterService = {
  getAll: async (limit = 10, offset = 0) => {
    // Backend: GET /api/newsletter (Enkelvoud!)
    const { data } = await apiClient.get<Newsletter[]>('/newsletter', {
      params: { limit, offset }
    });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<Newsletter>(`/newsletter/${id}`);
    return data;
  },

  create: async (newsletter: CreateNewsletterRequest) => {
    const { data } = await apiClient.post<Newsletter>('/newsletter', newsletter);
    return data;
  },

  update: async (id: string, newsletter: Partial<CreateNewsletterRequest>) => {
    const { data } = await apiClient.put<Newsletter>(`/newsletter/${id}`, newsletter);
    return data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/newsletter/${id}`);
  },

  // Het backend endpoint om direct te verzenden
  sendNow: async (id: string) => {
    await apiClient.post(`/newsletter/${id}/send`);
  }
};