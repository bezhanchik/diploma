import { apiClient } from './client';
import type { User, UserStats, UpdateProfileData } from '../types';

export const fetchMe = async (): Promise<User> => {
  const { data } = await apiClient.get<User>('/auth/me');
  return data;
};

export const updateProfile = async (payload: UpdateProfileData): Promise<User> => {
  const { data } = await apiClient.put<User>('/auth/profile', payload);
  return data;
};

export const fetchUserStats = async (): Promise<UserStats> => {
  const [eventsRes, teamsRes] = await Promise.all([
    apiClient.get<{ count: number }>('/users/events-count'),
    apiClient.get<{ count: number }>('/users/teams-count'),
  ]);
  return {
    events_count: eventsRes.data.count,
    teams_count: teamsRes.data.count,
    rating: 120,
  };
};

export const registerUser = async (payload: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}): Promise<User> => {
  const { data } = await apiClient.post<User>('/auth/register', payload);
  return data;
};

export const fetchAllUsers = async (): Promise<User[]> => {
  const { data } = await apiClient.get<User[]>('/users');
  return data;
};

export const makeAdmin = async (userId: number): Promise<User> => {
  const { data } = await apiClient.post<User>(`/users/${userId}/make-admin`);
  return data;
};

export const removeAdmin = async (userId: number): Promise<User> => {
  const { data } = await apiClient.post<User>(`/users/${userId}/remove-admin`);
  return data;
};
