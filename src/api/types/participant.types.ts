export type AccountType = 'full' | 'temporary';

// Komt overeen met de 'Participant' struct in Go
export interface Participant {
  id: string; // UUID
  naam: string;
  email: string;
  telefoon?: string;
  account_type: AccountType;
  has_app_access: boolean;
  registration_year?: number;
  gebruiker_id?: string;
  terms: boolean;
  test_mode: boolean;
  created_at: string;
  updated_at: string;
  // Eventuele relaties indien de backend die meegeeft in de list view
  registrations?: EventRegistration[]; 
}

// Komt overeen met 'EventRegistration' struct
export interface EventRegistration {
  id: string;
  event_id: string;
  participant_id: string;
  participant_role_name: string; 
  distance_route?: string;
  steps: number;
  ondersteuning?: string; // "Ja" | "Nee" of null
  status?: string;
  registered_at: string;
}

export interface ParticipantQueryParams {
  limit?: number;
  offset?: number;
  event_id?: string;
  search?: string;
}