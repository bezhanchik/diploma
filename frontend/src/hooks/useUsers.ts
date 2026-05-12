import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAllUsers, makeAdmin, removeAdmin } from '../api/users';

export const useAllUsers = () =>
  useQuery({ queryKey: ['users', 'all'], queryFn: fetchAllUsers, staleTime: 30_000 });

export const useMakeAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => makeAdmin(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
};

export const useRemoveAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => removeAdmin(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
};
