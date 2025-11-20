export interface SystemHealthData {
  uptime: string; // Uptime as string like "13m29.403903557s"
  email_metrics: {
    sent: number;
    failed: number;
  };
  rate_limit_status: boolean;
}

export interface RecentActivityData {
  new_users: number;
  new_participants: number;
  new_contacts: number;
  event_registrations: number;
  sent_emails: number;
}

export interface DashboardData {
  total_users: number;
  active_users: number;
  total_participants: number;
  active_participants: number;
  total_events: number;
  upcoming_events: number;
  event_registrations: number;
  total_contacts: number;
  unanswered_contacts: number;
  total_newsletters: number;
  sent_newsletters: number;
  system_health: SystemHealthData;
  recent_activity: RecentActivityData;
}