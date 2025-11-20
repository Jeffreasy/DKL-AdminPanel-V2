// Gebaseerd op models/event.go

export interface Geofence {
  type: 'start' | 'checkpoint' | 'finish';
  lat: number;
  long: number;
  radius: number;
  name?: string;
}

// EventConfig is een flexibele map in Go, dus Record in TS
export type EventConfig = Record<string, any>;

export type EventStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';

export interface Event {
  id: string;
  name: string;
  description?: string;
  start_time: string; // ISO 8601 string
  end_time?: string;
  status: EventStatus;
  status_description?: string;
  geofences: Geofence[];
  event_config?: EventConfig;
  is_active: boolean;
}

// Request payload voor het aanmaken van een event
export interface CreateEventRequest {
  name: string;
  description?: string;
  start_time: string;
  end_time?: string;
  status?: EventStatus;
  geofences: Geofence[];
  event_config?: EventConfig;
  is_active: boolean;
}

// Request payload voor het bijwerken
export type UpdateEventRequest = Partial<CreateEventRequest>;

// Event Registration model
export interface EventRegistration {
  id: string;
  event_id: string;
  participant_id: string;
  participant_role_name: string;
  distance_route?: string;
  steps: number;
  ondersteuning?: string;
  status?: string;
  registered_at: string;
}