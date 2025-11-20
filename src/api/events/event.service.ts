import apiClient from '@/api/axios.client';
import { Event, CreateEventRequest, UpdateEventRequest } from '@/api/types/event.types';

class EventService {
  private static instance: EventService;
  private readonly BASE_PATH = '/events';

  private constructor() {}

  public static getInstance(): EventService {
    if (!EventService.instance) {
      EventService.instance = new EventService();
    }
    return EventService.instance;
  }

  /**
   * Haal alle events op
   * Endpoint: GET /api/events
   */
  public async getAll(activeOnly = false): Promise<Event[]> {
    const params = activeOnly ? { active_only: true } : {};
    const response = await apiClient.get<Event[]>(this.BASE_PATH, { params });
    return response.data;
  }

  /**
   * Haal één event op bij ID
   * Endpoint: GET /api/events/:id
   */
  public async getById(id: string): Promise<Event> {
    const response = await apiClient.get<Event>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  /**
   * Haal het actieve event op
   * Endpoint: GET /api/events/active
   */
  public async getActive(): Promise<Event> {
    const response = await apiClient.get<Event>(`${this.BASE_PATH}/active`);
    return response.data;
  }

  /**
   * Maak een nieuw event aan
   * Endpoint: POST /api/events
   */
  public async create(data: CreateEventRequest): Promise<Event> {
    const response = await apiClient.post<Event>(this.BASE_PATH, data);
    return response.data;
  }

  /**
   * Update een event
   * Endpoint: PUT /api/events/:id
   */
  public async update(id: string, data: UpdateEventRequest): Promise<Event> {
    const response = await apiClient.put<Event>(`${this.BASE_PATH}/${id}`, data);
    return response.data;
  }

  /**
   * Verwijder een event
   * Endpoint: DELETE /api/events/:id
   */
  public async delete(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`${this.BASE_PATH}/${id}`);
    return response.data;
  }
}

export const eventService = EventService.getInstance();