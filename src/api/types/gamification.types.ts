// Gamification Types
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface BadgeCriteria {
  min_steps?: number;
  min_days?: number;
  consecutive_days?: number;
  route?: string;
  early_participant?: boolean;
  has_team?: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url?: string;
  criteria: BadgeCriteria;
  points: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface BadgeRequest {
  name: string;
  description: string;
  icon_url?: string;
  criteria: BadgeCriteria;
  points: number;
  is_active?: boolean;
  display_order?: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  required_steps: number;
  category: string;
  points: number;
  is_active: boolean;
  created_at: string;
}

export interface LeaderboardEntry {
  id: string;
  naam: string;
  route: string;
  steps: number;
  achievement_points: number;
  total_score: number;
  rank: number;
  badge_count: number;
  joined_at: string;
}

export interface LeaderboardResponse {
  period: string;
  generated_at: string;
  entries: LeaderboardEntry[];
  total_participants: number;
  current_user_rank?: number;
}

export interface ParticipantRankInfo {
  user_id: string;
  naam: string;
  current_rank: number;
  total_steps: number;
  total_distance: number;
  achievements_count: number;
  badges_count: number;
  total_points: number;
  daily_average: number;
  weekly_average: number;
  best_day: {
    date: string;
    steps: number;
  };
  streak_days: number;
  aboveMe?: LeaderboardEntry[];
  belowMe?: LeaderboardEntry[];
}

export interface LeaderboardFilters {
  route?: string;
  year?: number;
  min_steps?: number;
  top_n?: number;
  page?: number;
  limit?: number;
}