import { apiClient } from './client';
import type { Project, SubmitSolutionData } from '../types';

export const fetchTeamProjects = async (teamId: number): Promise<Project[]> => {
  const { data } = await apiClient.get<Project[]>(`/projects/team/${teamId}`);
  return data;
};

export const submitSolution = async (payload: SubmitSolutionData): Promise<Project> => {
  const form = new FormData();
  form.append('team_id', String(payload.teamId));
  form.append('challenge_id', String(payload.challengeId));
  form.append('project_title', payload.projectTitle);
  if (payload.projectDescription) form.append('project_description', payload.projectDescription);
  if (payload.repositoryUrl) form.append('repository_url', payload.repositoryUrl);
  if (payload.file) form.append('file', payload.file);

  const { data } = await apiClient.post<Project>('/projects/submit', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};
