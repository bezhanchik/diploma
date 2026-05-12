import { useQuery } from '@tanstack/react-query';
import { fetchSchedule } from '../api/schedule';

export const useSchedule = () => {
  return useQuery({
    queryKey: ['schedule'],
    queryFn: fetchSchedule,
    staleTime: 60_000,
  });
};
