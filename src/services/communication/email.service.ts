import apiClient from '../../api/axios.client';
import {
  EmailTemplate,
  IncomingEmail,
  SentEmail,
  UpdateTemplateRequest
} from '../../api/types/email.types';

export const emailService = {
  // --- TEMPLATES ---
  getTemplates: async () => {
    const { data } = await apiClient.get<EmailTemplate[]>('/mail/templates');
    return data;
  },

  updateTemplate: async (id: string, data: UpdateTemplateRequest) => {
    return apiClient.put<EmailTemplate>(`/mail/templates/${id}`, data);
  },

  // --- INCOMING (INBOX) ---
  getIncoming: async (limit = 20) => {
    const { data } = await apiClient.get<IncomingEmail[]>('/mail/incoming', {
        params: { limit }
    });
    return data;
  },

  // --- SENT (LOGS) ---
  getSent: async (limit = 20) => {
    const { data } = await apiClient.get<SentEmail[]>('/mail/sent', {
        params: { limit }
    });
    return data;
  },

  // Retry een mislukte email (optioneel)
  retryEmail: async (id: string) => {
    return apiClient.post(`/mail/sent/${id}/retry`);
  }
};