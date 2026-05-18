import { apiClient } from './client';
import type { Team, CreateTeamData, AddMemberData, User } from '../types';

export const fetchTeam = async (id: number): Promise<Team> => {
  const { data } = await apiClient.get<Team>(`/teams/${id}`);
  return data;
};

export const fetchTeams = async (eventId?: number): Promise<Team[]> => {
  const url = eventId ? `/teams?event_id=${eventId}` : '/teams';
  const { data } = await apiClient.get<Team[]>(url);
  return data;
};

export const createTeam = async (payload: CreateTeamData): Promise<Team> => {
  const { data } = await apiClient.post<Team>('/teams', payload);
  return data;
};

export const addTeamMember = async (teamId: number, payload: AddMemberData): Promise<void> => {
  await apiClient.post(`/teams/${teamId}/members`, payload);
};

export const removeTeamMember = async (teamId: number, userId: number): Promise<void> => {
  await apiClient.delete(`/teams/${teamId}/members/${userId}`);
};

export const deleteTeam = async (teamId: number): Promise<void> => {
  await apiClient.delete(`/teams/${teamId}`);
};

export const findUserByEmail = async (email: string): Promise<User[]> => {
  const { data } = await apiClient.get<User[]>(`/users/search?email=${encodeURIComponent(email)}`);
  return data;
};
