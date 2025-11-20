import apiClient from '../../api/axios.client';
import {
  LeaderboardResponse,
  ParticipantRankInfo,
  LeaderboardFilters
} from '../../api/types/gamification.types';

export const StepsService = {
  // 1. Haal Leaderboard op (Met filters uit je Go struct)
  // Docs: GET /api/leaderboard
  getLeaderboard: async (filters?: LeaderboardFilters): Promise<LeaderboardResponse> => {
    // Axios zet het filters object automatisch om naar query params:
    // ?route=10KM&page=1&limit=50
    const response = await apiClient.get<LeaderboardResponse>('/api/leaderboard', { 
      params: filters 
    });
    return response.data;
  },

  // 2. Haal detail rank op van 1 persoon (met aboveMe/belowMe)
  // Deze matcht met repository method: GetParticipantRank
  // Ik neem aan dat het endpoint /api/leaderboard/rank/{id} is.
  getParticipantRank: async (participantId: string): Promise<ParticipantRankInfo> => {
    const response = await apiClient.get<ParticipantRankInfo>(`/api/leaderboard/rank/${participantId}`);
    return response.data;
  },

  // 3. Admin correctie: Update Steps handmatig
  // Docs: POST /api/steps/update (Vaak is dit voor de app, admin endpoint kan afwijken)
  // Als admin correcties mag doen, gebruiken we vaak een admin-specifiek endpoint.
  updateStepsCorrection: async (participantId: string, deltaSteps: number): Promise<void> => {
    await apiClient.post(`/api/steps/admin/correction`, { 
      participant_id: participantId, 
      delta_steps: deltaSteps 
    });
  }
};