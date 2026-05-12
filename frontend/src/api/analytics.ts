import { apiClient } from './client';
import type { AnalyticsSummary, EventStatusStat, TopEvent } from '../types';

export const fetchAnalyticsSummary = async (): Promise<AnalyticsSummary> => {
  const { data } = await apiClient.get<AnalyticsSummary>('/analytics/summary');
  return data;
};

export const fetchEventsByStatus = async (): Promise<EventStatusStat[]> => {
  const { data } = await apiClient.get<EventStatusStat[]>('/analytics/events-by-status');
  return data;
};

export const fetchTopEvents = async (): Promise<TopEvent[]> => {
  const { data } = await apiClient.get<TopEvent[]>('/analytics/top-events');
  return data;
};
