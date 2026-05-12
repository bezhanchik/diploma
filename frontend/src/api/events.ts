import { apiClient } from './client';
import type { Event, EventDetail, CreateEventData } from '../types';

export const fetchEvents = async (status?: string): Promise<Event[]> => {
  const params = new URLSearchParams({ limit: '50' });
  if (status) params.append('status', status);
  const { data } = await apiClient.get<Event[]>(`/events?${params}`);
  return data;
};

export const fetchEvent = async (id: number): Promise<EventDetail> => {
  const { data } = await apiClient.get<EventDetail>(`/events/${id}`);
  return data;
};

export const createEvent = async (payload: CreateEventData): Promise<Event> => {
  const { data } = await apiClient.post<Event>('/events', payload);
  return data;
};

export const updateEvent = async (id: number, payload: CreateEventData): Promise<Event> => {
  const { data } = await apiClient.put<Event>(`/events/${id}`, payload);
  return data;
};

export const deleteEvent = async (id: number): Promise<void> => {
  await apiClient.delete(`/events/${id}`);
};
