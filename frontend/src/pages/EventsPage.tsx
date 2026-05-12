// src/pages/EventsPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEvents } from '../hooks/useEvents';
import type { EventStatus } from '../types';

const STATUS_LABEL: Record<string, string> = {
  draft: 'Черновик',
  active: 'Идёт регистрация',
  completed: 'Завершено',
  cancelled: 'Отменено',
  IN_PROGRESS: 'В процессе',
  REGISTRATION_OPEN: 'Регистрация открыта',
  REGISTRATION_CLOSED: 'Регистрация закрыта',
  PLANNING: 'Планирование',
};

const STATUS_STYLE: Record<string, string> = {
  active: 'bg-green-50 text-green-700 border-green-200',
  REGISTRATION_OPEN: 'bg-green-50 text-green-700 border-green-200',
  IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-slate-100 text-slate-500 border-slate-200',
  REGISTRATION_CLOSED: 'bg-slate-100 text-slate-500 border-slate-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
  draft: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  PLANNING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
};

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<EventStatus | ''>('');

  const { data: events = [], isLoading } = useEvents(statusFilter);

  // Фильтрация по названию на клиенте (для быстрого отклика)
  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Дата уточняется';
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Шапка страницы + Поиск */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Все мероприятия</h1>
          <p className="text-slate-500 mt-1">Найдите хакатон или кейс-чемпионат по душе</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Поле поиска */}
          <input
            type="text"
            placeholder="Поиск по названию..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all w-full sm:w-64"
          />
          
          {/* Фильтр по статусу */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white cursor-pointer"
          >
            <option value="">Все статусы</option>
            <option value="active">Активные</option>
            <option value="draft">Черновики</option>
            <option value="completed">Завершенные</option>
          </select>
        </div>
      </div>

      {/* Список мероприятий */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-slate-200 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-slate-900">Ничего не найдено</h3>
          <p className="text-slate-500 mt-2">Попробуйте изменить параметры поиска или фильтры</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Link
              key={event.id}
              to={`/events/${event.id}`}
              className="group bg-white rounded-3xl border border-slate-100 p-6 hover:shadow-xl hover:border-indigo-100 transition-all duration-300 flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide border ${
                    STATUS_STYLE[event.status ?? ''] ?? 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}
                >
                  {STATUS_LABEL[event.status ?? ''] ?? event.status ?? 'Статус'}
                </span>
                <span className="text-sm text-slate-400 font-medium">
                  {formatDate(event.start_date)}
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                {event.title}
              </h3>
              
              <p className="text-slate-500 text-sm line-clamp-3 mb-6 flex-1">
                {event.description || 'Присоединяйтесь к лучшим разработчикам и решайте реальные задачи от партнеров. Отличный шанс прокачать навыки и найти команду мечты.'}
              </p>

              <div className="mt-auto pt-4 border-t border-slate-50 flex items-center text-indigo-600 font-bold text-sm group-hover:translate-x-1 transition-transform">
                Подробнее о мероприятии <span className="ml-2">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}