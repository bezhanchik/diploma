import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { RootState } from '../store/store';

type EventItem = {
  id: number;
  title: string;
  status?: string | null;
};

export default function AdminPage() {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('');
  const queryClient = useQueryClient();
  
  // Токен из Redux
  const token = useSelector((state: RootState) => state.auth.token);

  // Загрузка мероприятий через TanStack Query
  const { data: events = [], isLoading, error: loadError } = useQuery<EventItem[]>({
    queryKey: ['events'],
    queryFn: async () => {
      const { data } = await apiClient.get('/events');
      return data;
    },
  });

  // Создание мероприятия
  const createMutation = useMutation({
    mutationFn: (eventData: { title: string; status: string }) =>
      apiClient.post('/events', eventData, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setTitle('');
      setStatus('');
    },
  });

  // Удаление мероприятия
  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiClient.delete(`/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  // Обновление мероприятия
  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: number; title: string; status: string }) =>
      apiClient.put(`/events/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    createMutation.mutate({ title, status });
  }

  function handleDelete(id: number) {
    if (window.confirm('Удалить мероприятие?')) {
      deleteMutation.mutate(id);
    }
  }

  function handleEdit(id: number, currentTitle: string, currentStatus?: string | null) {
    const newTitle = window.prompt('Новое название', currentTitle);
    if (!newTitle) return;

    const newStatus = window.prompt('Новый статус', currentStatus || '');
    if (newStatus === null) return;

    updateMutation.mutate({ id, title: newTitle, status: newStatus });
  }

  const error = loadError instanceof Error ? loadError.message : 
                createMutation.error instanceof Error ? createMutation.error.message :
                deleteMutation.error instanceof Error ? deleteMutation.error.message :
                updateMutation.error instanceof Error ? updateMutation.error.message : '';

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Админ-панель</h2>

        <form onSubmit={handleCreate} className="max-w-xl bg-white p-4 rounded-2xl shadow flex flex-col gap-4">
          <input
            className="border rounded-xl px-4 py-3"
            type="text"
            placeholder="Название мероприятия"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            className="border rounded-xl px-4 py-3"
            type="text"
            placeholder="Статус"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="bg-slate-900 text-white rounded-xl px-4 py-3 disabled:opacity-50"
          >
            {createMutation.isPending ? 'Создается...' : 'Создать мероприятие'}
          </button>
        </form>
      </section>

      {error && <p className="text-red-500">{error}</p>}

      {isLoading ? (
        <p className="text-slate-500">Загрузка...</p>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {events.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl shadow p-5 space-y-3">
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="text-slate-500">{item.status || 'Без статуса'}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(item.id, item.title, item.status)}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 transition"
                >
                  Редактировать
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition"
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}