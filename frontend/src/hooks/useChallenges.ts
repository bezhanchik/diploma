import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchChallenges, fetchChallengeDetail, createChallenge, deleteChallenge } from '../api/challenges';
import { useTracks } from './useTracks';

export const useChallenges = (trackId?: number) => {
  const { data: tracks = [] } = useTracks();

  return useQuery({
    queryKey: ['challenges', trackId],
    queryFn: () => fetchChallenges(trackId, tracks),
    enabled: tracks.length > 0 || !trackId,
  });
};

export const useChallengeDetail = (id: number) => {
  return useQuery({
    queryKey: ['challenges', 'detail', id],
    queryFn: () => fetchChallengeDetail(id),
    staleTime: 60_000,
  });
};

export const useCreateChallenge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createChallenge,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['challenges'] }),
  });
};

export const useDeleteChallenge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteChallenge(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['challenges'] }),
  });
};
