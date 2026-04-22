import { useEffect, useState } from 'react';

type EventItem = {
  id: number;
  title: string;
  status?: string | null;
};

const API_URL = 'http://127.0.0.1:8000';

function AdminPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  async function loadEvents() {
    try {
      const response = await fetch(`${API_URL}/events`);
      const data = await response.json();

      if (!response.ok) {
        setError('Не удалось загрузить мероприятия');
        return;
      }

      setEvents(data);
    } catch {
      setError('Ошибка загрузки');
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setError('');

    try {
      const response = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || 'Не удалось создать мероприятие');
        return;
      }

      setTitle('');
      setStatus('');
      loadEvents();
    } catch {
      setError('Ошибка создания');
    }
  }

  async function handleDelete(id: number) {
    try {
      const response = await fetch(`${API_URL}/events/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.detail || 'Не удалось удалить мероприятие');
        return;
      }

      loadEvents();
    } catch {
      setError('Ошибка удаления');
    }
  }

  async function handleEdit(id: number, currentTitle: string, currentStatus?: string | null) {
    const newTitle = window.prompt('Новое название', currentTitle);
    if (!newTitle) return;

    const newStatus = window.prompt('Новый статус', currentStatus || '');
    if (newStatus === null) return;

    try {
      const response = await fetch(`${API_URL}/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTitle,
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || 'Не удалось обновить мероприятие');
        return;
      }

      loadEvents();
    } catch {
      setError('Ошибка обновления');
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Админ-панель</h2>

        <form
          onSubmit={handleCreate}
          className="max-w-xl bg-white p-4 rounded-2xl shadow flex flex-col gap-4"
        >
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

          <button className="bg-slate-900 text-white rounded-xl px-4 py-3">
            Создать мероприятие
          </button>
        </form>
      </section>

      {error && <p className="text-red-500">{error}</p>}

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {events.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl shadow p-5 space-y-3">
            <h3 className="text-xl font-semibold">{item.title}</h3>
            <p className="text-slate-500">{item.status || 'Без статуса'}</p>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(item.id, item.title, item.status)}
                className="px-4 py-2 rounded-xl border border-slate-300"
              >
                Редактировать
              </button>

              <button
                onClick={() => handleDelete(item.id)}
                className="px-4 py-2 rounded-xl bg-red-600 text-white"
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

export default AdminPage;