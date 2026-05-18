import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTeamProjects, submitSolution } from '../api/projects';
import type { SubmitSolutionData } from '../types';

export const useTeamProjects = (teamId: number) =>
  useQuery({
    queryKey: ['projects', 'team', teamId],
    queryFn: () => fetchTeamProjects(teamId),
    staleTime: 30_000,
  });

export const useSubmitSolution = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SubmitSolutionData) => submitSolution(data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['projects', 'team', vars.teamId] });
    },
  });
};
