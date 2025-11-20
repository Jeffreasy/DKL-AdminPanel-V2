import apiClient from '../../api/axios.client';
import { Badge, Achievement, LeaderboardResponse, LeaderboardFilters } from '../../api/types/gamification.types';

export const GamificationService = {
  // --- BADGES ---
  getBadges: async (): Promise<Badge[]> => {
    const response = await apiClient.get<Badge[]>('/admin/badges');
    return response.data;
  },

  createBadge: async (badge: Partial<Badge>): Promise<Badge> => {
    const response = await apiClient.post<Badge>('/admin/badges', badge);
    return response.data;
  },

  updateBadge: async (id: string, badge: Partial<Badge>): Promise<Badge> => {
    const response = await apiClient.put<Badge>(`/admin/badges/${id}`, badge);
    return response.data;
  },

  deleteBadge: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/badges/${id}`);
  },

  // --- LEADERBOARD ---
  getLeaderboard: async (filters?: LeaderboardFilters): Promise<LeaderboardResponse> => {
    const response = await apiClient.get<LeaderboardResponse>('/leaderboard', { params: filters });
    return response.data;
  },

  // --- ACHIEVEMENTS ---
  getAchievements: async (): Promise<Achievement[]> => {
    const response = await apiClient.get<Achievement[]>('/gamification/achievements');
    return response.data;
  },

  createAchievement: async (achievement: Partial<Achievement>): Promise<Achievement> => {
    const response = await apiClient.post<Achievement>('/gamification/achievements', achievement);
    return response.data;
  },

  updateAchievement: async (id: string, achievement: Partial<Achievement>): Promise<Achievement> => {
    const response = await apiClient.put<Achievement>(`/gamification/achievements/${id}`, achievement);
    return response.data;
  },

  // --- TOEKENNEN (Manueel) ---
  // Admin kan handmatig een badge geven aan een gebruiker
  awardBadgeToParticipant: async (participantId: string, badgeId: string): Promise<void> => {
    await apiClient.post(`/gamification/participants/${participantId}/badges`, { badge_id: badgeId });
  }
};