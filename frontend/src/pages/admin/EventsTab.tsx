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

type EventFormData = {
  title: string;
  status: string;
  start_date: string;
  end_date: string;
  organization_id: number | null;
};

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export default function EventsTab() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    status: 'draft',
    start_date: '',
    end_date: '',
    organization_id: null,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Валидация названия
    if (!formData.title.trim()) {
      errors.title = 'Название мероприятия обязательно';
    } else if (formData.title.length < 3) {
      errors.title = 'Название должно содержать минимум 3 символа';
    } else if (formData.title.length > 200) {
      errors.title = 'Название не должно превышать 200 символов';
    }
    
    // Валидация дат
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      
      if (start > end) {
        errors.end_date = 'Дата окончания не может быть раньше даты начала';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/events/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          status: formData.status,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
          organization_id: formData.organization_id,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Не удалось создать мероприятие');
      }
      
      // Успешное создание
      setIsModalOpen(false);
      resetForm();
      loadEvents(); // Перезагружаем список
    } catch (e: any) {
      setError(e.message || 'Ошибка создания мероприятия');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const resetForm = () => {
    setFormData({
      title: '',
      status: 'draft',
      start_date: '',
      end_date: '',
      organization_id: null,
    });
    setFormErrors({});
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
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-slate-800"
        >
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
                    {event.status === 'active' ? 'Активно' : 
                     event.status === 'draft' ? 'Черновик' : 
                     event.status || '—'}
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

      {/* Модальное окно создания мероприятия */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Создание мероприятия</h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Название *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    if (formErrors.title) delete formErrors.title;
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 ${
                    formErrors.title ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="Введите название мероприятия"
                />
                {formErrors.title && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Статус
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <option value="draft">Черновик</option>
                  <option value="active">Активно</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Дата начала
                </label>
                <input
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => {
                    setFormData({ ...formData, start_date: e.target.value });
                    if (formErrors.end_date) delete formErrors.end_date;
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Дата окончания
                </label>
                <input
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => {
                    setFormData({ ...formData, end_date: e.target.value });
                    if (formErrors.end_date) delete formErrors.end_date;
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 ${
                    formErrors.end_date ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                {formErrors.end_date && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.end_date}</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Создание...' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}