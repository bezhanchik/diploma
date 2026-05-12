import { apiClient } from './client';
import type { Challenge, ChallengeDetail, Track } from '../types';

export const fetchChallenges = async (trackId?: number, tracks: Track[] = []): Promise<Challenge[]> => {
  const params = new URLSearchParams({ limit: '50' });
  if (trackId) params.append('track_id', String(trackId));
  const { data } = await apiClient.get<Challenge[]>(`/challenges?${params}`);

  return data.map((c) => ({
    ...c,
    track_name: tracks.find((t) => t.id === c.track_id)?.name ?? `Трек #${c.track_id}`,
  }));
};

export const fetchChallengeDetail = async (id: number): Promise<ChallengeDetail> => {
  const { data } = await apiClient.get<ChallengeDetail>(`/challenges/detail/${id}`);
  return data;
};

export const createChallenge = async (payload: {
  title: string;
  description?: string;
  track_id: number;
}): Promise<Challenge> => {
  const { data } = await apiClient.post<Challenge>('/challenges', payload);
  return data;
};

export const deleteChallenge = async (id: number): Promise<void> => {
  await apiClient.delete(`/challenges/${id}`);
};
