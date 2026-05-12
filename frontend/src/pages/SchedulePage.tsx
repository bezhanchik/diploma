// src/pages/SchedulePage.tsx
import { Link } from 'react-router-dom';
import { useSchedule } from '../hooks/useSchedule';
import type { ScheduleEvent } from '../types';

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

const fmt = (d: string) =>
  new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });

const fmtYear = (d: string) =>
  new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

const getDuration = (start: string, end: string | null): string => {
  if (!end) return '';
  const days = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86_400_000);
  if (days <= 1) return '1 день';
  if (days < 5) return `${days} дня`;
  return `${days} дней`;
};

const groupByMonth = (events: ScheduleEvent[]): [string, ScheduleEvent[]][] => {
  const map = new Map<string, ScheduleEvent[]>();
  events.forEach((e) => {
    const key = new Date(e.start_date!).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(e);
  });
  return Array.from(map.entries());
};

function EventRow({ event, accent = false }: { event: ScheduleEvent; accent?: boolean }) {
  const statusStyle = STATUS_STYLE[event.status ?? ''] ?? 'bg-slate-100 text-slate-500 border-slate-200';
  const statusLabel = STATUS_LABEL[event.status ?? ''] ?? event.status ?? '—';

  return (
    <Link
      to={`/events/${event.id}`}
      className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all hover:shadow-md ${
        accent
          ? 'bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-700'
          : 'bg-white border-slate-100 hover:border-indigo-100'
      }`}
    >
      {/* Дата */}
      <div className={`w-20 shrink-0 text-center ${accent ? 'text-indigo-100' : 'text-slate-400'}`}>
        {event.start_date && (
          <>
            <div className={`text-2xl font-black leading-none ${accent ? 'text-white' : 'text-slate-900'}`}>
              {new Date(event.start_date).getDate()}
            </div>
            <div className="text-xs uppercase tracking-wide">
              {new Date(event.start_date).toLocaleDateString('ru-RU', { month: 'short' })}
            </div>
          </>
        )}
      </div>

      {/* Разделитель */}
      <div className={`w-px h-12 shrink-0 ${accent ? 'bg-indigo-400' : 'bg-slate-100'}`} />

      {/* Контент */}
      <div className="flex-1 min-w-0">
        <h3 className={`font-bold text-base truncate ${accent ? 'text-white' : 'text-slate-900'} group-hover:${accent ? '' : 'text-indigo-600'} transition-colors`}>
          {event.title}
        </h3>
        <div className={`text-xs mt-1 flex items-center gap-3 ${accent ? 'text-indigo-200' : 'text-slate-400'}`}>
          {event.end_date && (
            <span>до {fmt(event.end_date)} · {getDuration(event.start_date!, event.end_date)}</span>
          )}
          <span>👥 {event.teams_count} {event.teams_count === 1 ? 'команда' : 'команд'}</span>
        </div>
      </div>

      {/* Статус */}
      {!accent && (
        <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyle}`}>
          {statusLabel}
        </span>
      )}

      <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity ${accent ? 'text-white' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

export default function SchedulePage() {
  const { data: events = [], isLoading } = useSchedule();
  const now = new Date();

  const current = events.filter((e) => {
    if (!e.start_date) return false;
    const start = new Date(e.start_date);
    const end = e.end_date ? new Date(e.end_date) : null;
    return start <= now && (!end || end >= now);
  });

  const upcoming = events.filter((e) => e.start_date && new Date(e.start_date) > now);
  const past = events
    .filter((e) => e.end_date && new Date(e.end_date) < now)
    .reverse();
  const noDate = events.filter((e) => !e.start_date);

  const upcomingByMonth = groupByMonth(upcoming);
  const pastByMonth = groupByMonth(past);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Шапка */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h1 className="text-3xl font-bold text-slate-900">Расписание</h1>
        <p className="text-slate-500 mt-1">Все мероприятия платформы по датам</p>
      </div>

      {/* Текущие */}
      {current.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Сейчас проходят</h2>
          </div>
          {current.map((e) => <EventRow key={e.id} event={e} accent />)}
        </section>
      )}

      {/* Предстоящие по месяцам */}
      {upcomingByMonth.length > 0 && (
        <section className="space-y-6">
          {upcomingByMonth.map(([month, evts]) => (
            <div key={month} className="space-y-3">
              <div className="flex items-center gap-4">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest capitalize">{month}</h2>
                <div className="flex-1 h-px bg-slate-100" />
              </div>
              {evts.map((e) => <EventRow key={e.id} event={e} />)}
            </div>
          ))}
        </section>
      )}

      {/* Без даты */}
      {noDate.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Дата уточняется</h2>
            <div className="flex-1 h-px bg-slate-100" />
          </div>
          {noDate.map((e) => <EventRow key={e.id} event={e} />)}
        </section>
      )}

      {/* Прошедшие */}
      {pastByMonth.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Завершённые</h2>
            <div className="flex-1 h-px bg-slate-100" />
          </div>
          {pastByMonth.map(([month, evts]) => (
            <div key={month} className="space-y-2 opacity-60">
              <p className="text-xs text-slate-400 uppercase tracking-widest capitalize px-1">{month}</p>
              {evts.map((e) => <EventRow key={e.id} event={e} />)}
            </div>
          ))}
        </section>
      )}

      {events.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-bold text-slate-900">Мероприятий пока нет</h3>
          <p className="text-slate-500 mt-2">Следите за обновлениями</p>
        </div>
      )}
    </div>
  );
}
