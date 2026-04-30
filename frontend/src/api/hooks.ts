import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

// Пример хука для мероприятий
export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data } = await apiClient.get('/events');
      return data;
    },
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (eventData: any) => apiClient.post('/events', eventData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

// Хук для проверки админа
export const useAdminCheck = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  
  return useQuery({
    queryKey: ['adminCheck'],
    queryFn: async () => {
      const { data } = await apiClient.get('/auth/admin-check');
      return data;
    },
    enabled: !!token, // ← Включаем запрос только когда есть токен
    retry: false,
  });
};