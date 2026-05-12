import { useQuery } from '@tanstack/react-query';
import { fetchAnalyticsSummary, fetchEventsByStatus, fetchTopEvents } from '../api/analytics';

export const useAnalyticsSummary = () =>
  useQuery({ queryKey: ['analytics', 'summary'], queryFn: fetchAnalyticsSummary, staleTime: 60_000 });

export const useEventsByStatus = () =>
  useQuery({ queryKey: ['analytics', 'events-by-status'], queryFn: fetchEventsByStatus, staleTime: 60_000 });

export const useTopEvents = () =>
  useQuery({ queryKey: ['analytics', 'top-events'], queryFn: fetchTopEvents, staleTime: 60_000 });
