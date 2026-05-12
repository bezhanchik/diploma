import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTeam, fetchTeams, createTeam, addTeamMember, removeTeamMember } from '../api/teams';
import type { CreateTeamData, AddMemberData } from '../types';

export const useTeams = (eventId?: number) => {
  return useQuery({
    queryKey: ['teams', eventId],
    queryFn: () => fetchTeams(eventId),
  });
};

export const useTeam = (id: number) => {
  return useQuery({
    queryKey: ['teams', id],
    queryFn: () => fetchTeam(id),
    staleTime: 60_000,
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTeamData) => createTeam(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teams'] }),
  });
};

export const useAddTeamMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, ...data }: { teamId: number } & AddMemberData) =>
      addTeamMember(teamId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teams'] }),
  });
};

export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: number; userId: number }) =>
      removeTeamMember(teamId, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teams'] }),
  });
};
