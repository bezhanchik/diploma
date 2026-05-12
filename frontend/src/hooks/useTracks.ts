import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTracks, createTrack, deleteTrack } from '../api/tracks';

export const useTracks = (eventId?: number) =>
  useQuery({
    queryKey: ['tracks', eventId],
    queryFn: () => fetchTracks(eventId),
    staleTime: 5 * 60_000,
  });

export const useCreateTrack = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTrack,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tracks'] }),
  });
};

export const useDeleteTrack = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteTrack(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tracks'] }),
  });
};
