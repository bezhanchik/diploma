import { apiClient } from './client';
import type { ScheduleEvent } from '../types';

export const fetchSchedule = async (): Promise<ScheduleEvent[]> => {
  const { data } = await apiClient.get<ScheduleEvent[]>('/schedule');
  return data;
};
