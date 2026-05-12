import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchEvents, fetchEvent, createEvent, updateEvent, deleteEvent } from '../api/events';
import type { EventStatus, CreateEventData } from '../types';

export const useEvents = (status?: EventStatus | '') => {
  return useQuery({
    queryKey: ['events', status],
    queryFn: () => fetchEvents(status || undefined),
    staleTime: 60_000,
  });
};

export const useEvent = (id: number) => {
  return useQuery({
    queryKey: ['events', id],
    queryFn: () => fetchEvent(id),
    staleTime: 60_000,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEventData) => createEvent(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & CreateEventData) => updateEvent(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteEvent(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });
};
