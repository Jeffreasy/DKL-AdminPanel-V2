import axiosClient from '../../api/axios.client';
import { Session } from '../../api/types/auth.types';

export const SessionService = {
  // Haal alle actieve sessies van de ingelogde gebruiker
  // Docs: GET /api/auth/sessions
  async getMySessions(): Promise<Session[]> {
    const response = await axiosClient.get<Session[]>('/api/auth/sessions');
    return response.data;
  },

  // Trek één specifieke sessie in (bijv. "Uitloggen op iPhone")
  // Docs: DELETE /api/auth/sessions/{sessionId}
  async revokeSession(sessionId: string): Promise<void> {
    await axiosClient.delete(`/api/auth/sessions/${sessionId}`);
  },

  // Trek alle sessies in behalve de huidige
  // Docs: POST /api/auth/sessions/revoke-others
  async revokeOtherSessions(): Promise<void> {
    await axiosClient.post('/api/auth/sessions/revoke-others');
  }
};