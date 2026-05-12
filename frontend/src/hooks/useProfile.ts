import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { fetchMe, fetchUserStats, updateProfile } from '../api/users';
import type { UpdateProfileData } from '../types';
import type { RootState } from '../store/store';

export const useProfile = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token) {
      queryClient.removeQueries({ queryKey: ['auth', 'me'] });
    }
  }, [token, queryClient]);

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: fetchMe,
    enabled: !!token,
  });
};

export const useUserStats = () => {
  return useQuery({
    queryKey: ['user', 'stats'],
    queryFn: fetchUserStats,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfileData) => updateProfile(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['auth', 'me'] }),
  });
};
