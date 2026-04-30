// src/pages/admin/EventsTab.tsx
import { useState, useEffect } from 'react';

type EventItem = {
  id: number;
  title: string;
  status: string | null;
  start_date: string | null;
  end_date: string | null;
  organization_id: number | null;
  created_at: string;
};

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export default function EventsTab() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const loadEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_URL}/events/?skip=${(page - 1) * limit}&limit=${limit}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (!response.ok) throw new Error('Не удалось загрузить мероприятия');
      const data = await response.json();
      setEvents(data);
    } catch (e: any) {
      setError(e.message || 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [page]);

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить мероприятие?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/events/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Не удалось удалить');
      loadEvents(); // перезагружаем список
    } catch (e: any) {
      setError(e.message || 'Ошибка удаления');
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('ru-RU');
  };

  if (loading && events.length === 0) {
    return <div className="p-6">Загрузка...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Мероприятия</h2>
        {/* Кнопка создания — можно вынести в модалку */}
        <button className="bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-slate-800">
          + Создать
        </button>
      </div>

      {error && <p className="text-red-500 bg-red-50 p-3 rounded-lg">{error}</p>}

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Название</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Статус</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Начало</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Окончание</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Действия</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-t hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{event.title}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    event.status === 'active' ? 'bg-green-100 text-green-700' :
                    event.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {event.status || '—'}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{formatDate(event.start_date)}</td>
                <td className="px-4 py-3 text-slate-600">{formatDate(event.end_date)}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button className="px-3 py-1 text-sm border rounded-lg hover:bg-slate-100">
                    Редактировать
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {events.length === 0 && !loading && (
          <p className="text-center py-8 text-slate-500">
            Мероприятий пока нет
          </p>
        )}
      </div>

      {/* Пагинация */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-slate-50"
        >
          ← Назад
        </button>
        <span className="text-slate-600">Страница {page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={events.length < limit}
          className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-slate-50"
        >
          Вперёд →
        </button>
      </div>
    </div>
  );
}