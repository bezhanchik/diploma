import { useState } from 'react';
import { useEvents, useCreateEvent, useUpdateEvent, useDeleteEvent } from '../../hooks/useEvents';
import type { Event, EventStatus } from '../../types';
import ConfirmModal from '../../assets/components/ConfirmModal';

const STATUS_LABEL: Record<string, string> = {
  draft: 'Черновик',
  active: 'Активно',
  completed: 'Завершено',
  cancelled: 'Отменено',
};

const STATUS_STYLE: Record<string, string> = {
  active: 'bg-green-50 text-green-700 border-green-200',
  completed: 'bg-slate-100 text-slate-500 border-slate-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
  draft: 'bg-yellow-50 text-yellow-700 border-yellow-200',
};

const fmt = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

type EventFormState = {
  title: string;
  status: string;
  start_date: string;
  end_date: string;
};

const emptyForm = (): EventFormState => ({ title: '', status: 'draft', start_date: '', end_date: '' });

function EventFormFields({
  form,
  onChange,
  error,
}: {
  form: EventFormState;
  onChange: (f: EventFormState) => void;
  error?: string;
}) {
  const set = (key: keyof EventFormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange({ ...form, [key]: e.target.value });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
          Название *
        </label>
        <input
          type="text"
          value={form.title}
          onChange={set('title')}
          placeholder="Название мероприятия"
          className={`w-full px-4 py-2.5 rounded-xl border ${error ? 'border-red-400' : 'border-slate-200'} focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all`}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
          Статус
        </label>
        <select
          value={form.status}
          onChange={set('status')}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white"
        >
          <option value="draft">Черновик</option>
          <option value="active">Активно</option>
          <option value="completed">Завершено</option>
          <option value="cancelled">Отменено</option>
        </select>
      </div>

      <div />

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
          Дата начала
        </label>
        <input
          type="datetime-local"
          value={form.start_date}
          onChange={set('start_date')}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
          Дата окончания
        </label>
        <input
          type="datetime-local"
          value={form.end_date}
          onChange={set('end_date')}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
        />
      </div>
    </div>
  );
}

export default function EventsTab() {
  const [form, setForm] = useState<EventFormState>(emptyForm());
  const [formError, setFormError] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editEvent, setEditEvent] = useState<Event | null>(null);
  const [editForm, setEditForm] = useState<EventFormState>(emptyForm());

  const { data: events = [], isLoading } = useEvents();
  const createMutation = useCreateEvent();
  const deleteMutation = useDeleteEvent();
  const updateMutation = useUpdateEvent();

  const statusCounts = events.reduce<Record<string, number>>((acc, e) => {
    const s = e.status ?? 'unknown';
    acc[s] = (acc[s] ?? 0) + 1;
    return acc;
  }, {});

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setFormError('Название обязательно'); return; }
    if (form.title.trim().length < 3) { setFormError('Минимум 3 символа'); return; }
    setFormError('');
    createMutation.mutate(
      {
        title: form.title.trim(),
        status: form.status as EventStatus,
        start_date: form.start_date || undefined,
        end_date: form.end_date || undefined,
      },
      { onSuccess: () => setForm(emptyForm()) },
    );
  };

  const openEdit = (event: Event) => {
    setEditEvent(event);
    setEditForm({
      title: event.title,
      status: event.status ?? 'draft',
      start_date: event.start_date ? event.start_date.slice(0, 16) : '',
      end_date: event.end_date ? event.end_date.slice(0, 16) : '',
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEvent) return;
    updateMutation.mutate(
      {
        id: editEvent.id,
        title: editForm.title.trim(),
        status: editForm.status as EventStatus,
        start_date: editForm.start_date || undefined,
        end_date: editForm.end_date || undefined,
      },
      { onSuccess: () => setEditEvent(null) },
    );
  };

  return (
    <div className="space-y-6">
      {/* Счётчики по статусам */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(['draft', 'active', 'completed', 'cancelled'] as const).map((s) => (
          <div key={s} className="bg-white rounded-2xl border border-slate-100 p-4 text-center shadow-sm">
            <div className="text-2xl font-black text-slate-900">{statusCounts[s] ?? 0}</div>
            <div className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${STATUS_STYLE[s]}`}>
              {STATUS_LABEL[s]}
            </div>
          </div>
        ))}
      </div>

      {/* Форма создания */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span className="w-1.5 h-5 bg-indigo-500 rounded-full" />
          Новое мероприятие
        </h3>
        <form onSubmit={handleCreate} className="space-y-4">
          <EventFormFields form={form} onChange={setForm} error={formError} />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-sm disabled:opacity-50"
            >
              {createMutation.isPending ? 'Создание...' : '+ Создать'}
            </button>
          </div>
        </form>
      </div>

      {/* Таблица мероприятий */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900">Все мероприятия</h3>
          <span className="text-sm text-slate-400">{events.length} шт.</span>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}
          </div>
        ) : events.length === 0 ? (
          <p className="text-center py-12 text-slate-400">Нет мероприятий</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide bg-slate-50">
                  <th className="px-6 py-3">Название</th>
                  <th className="px-4 py-3">Статус</th>
                  <th className="px-4 py-3">Начало</th>
                  <th className="px-4 py-3">Конец</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-slate-900">{event.title}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLE[event.status ?? ''] ?? 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                        {STATUS_LABEL[event.status ?? ''] ?? event.status ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{fmt(event.start_date)}</td>
                    <td className="px-4 py-3 text-slate-500">{fmt(event.end_date)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => openEdit(event)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-medium transition-colors"
                        >
                          Изменить
                        </button>
                        <button
                          onClick={() => setDeleteId(event.id)}
                          className="px-3 py-1.5 rounded-lg bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 text-xs font-medium transition-colors"
                        >
                          Удалить
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Модалка редактирования */}
      {editEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setEditEvent(null)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-slate-900 mb-5">Редактировать мероприятие</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <EventFormFields form={editForm} onChange={setEditForm} />
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setEditEvent(null)} className="px-5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium">
                  Отмена
                </button>
                <button type="submit" disabled={updateMutation.isPending} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50">
                  {updateMutation.isPending ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId, { onSuccess: () => setDeleteId(null) })}
        title="Удалить мероприятие"
        message="Вы уверены? Это действие нельзя отменить."
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
