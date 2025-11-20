import apiClient from '../../api/axios.client';
import { Notulen, CreateNotulenRequest, NotulenSearchFilters, NotulenListResponse } from '../../api/types/notulen.types';

export const notulenService = {
  getAll: async (filters?: NotulenSearchFilters): Promise<NotulenListResponse> => {
    const { data } = await apiClient.get<NotulenListResponse>('/notulen', { params: filters });
    return data;
  },

  getById: async (id: string): Promise<Notulen> => {
    const { data } = await apiClient.get<Notulen>(`/notulen/${id}`);
    return data;
  },

  create: async (request: CreateNotulenRequest): Promise<Notulen> => {
    const { data } = await apiClient.post<Notulen>('/notulen', request);
    return data;
  },

  update: async (id: string, request: Partial<CreateNotulenRequest>): Promise<Notulen> => {
    const { data } = await apiClient.put<Notulen>(`/notulen/${id}`, request);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/notulen/${id}`);
  },

  finalize: async (id: string): Promise<Notulen> => {
    const { data } = await apiClient.put<Notulen>(`/notulen/${id}/finalize`);
    return data;
  },

  archive: async (id: string): Promise<Notulen> => {
    const { data } = await apiClient.put<Notulen>(`/notulen/${id}/archive`);
    return data;
  },

  getMarkdown: async (id: string): Promise<string> => {
    const { data } = await apiClient.get<string>(`/notulen/${id}/markdown`);
    return data;
  },
};