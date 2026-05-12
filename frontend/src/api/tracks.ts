import { apiClient } from './client';
import type { Track } from '../types';

export const fetchTracks = async (eventId?: number): Promise<Track[]> => {
  const url = eventId ? `/tracks?event_id=${eventId}` : '/tracks';
  const { data } = await apiClient.get<Track[]>(url);
  return data;
};

export const createTrack = async (payload: { name: string; event_id?: number | null }): Promise<Track> => {
  const { data } = await apiClient.post<Track>('/tracks', payload);
  return data;
};

export const deleteTrack = async (id: number): Promise<void> => {
  await apiClient.delete(`/tracks/${id}`);
};
