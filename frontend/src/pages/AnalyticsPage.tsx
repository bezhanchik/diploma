// src/pages/AnalyticsPage.tsx
import { Link } from 'react-router-dom';
import { useAnalyticsSummary, useEventsByStatus, useTopEvents } from '../hooks/useAnalytics';

const STATUS_LABEL: Record<string, string> = {
  draft: 'Черновик',
  active: 'Идёт регистрация',
  completed: 'Завершено',
  cancelled: 'Отменено',
  IN_PROGRESS: 'В процессе',
  REGISTRATION_OPEN: 'Регистрация открыта',
  REGISTRATION_CLOSED: 'Регистрация закрыта',
  PLANNING: 'Планирование',
  unknown: 'Без статуса',
};

const STATUS_COLOR: Record<string, string> = {
  active: 'bg-green-500',
  REGISTRATION_OPEN: 'bg-green-500',
  IN_PROGRESS: 'bg-blue-500',
  completed: 'bg-slate-400',
  REGISTRATION_CLOSED: 'bg-slate-400',
  cancelled: 'bg-red-400',
  draft: 'bg-yellow-400',
  PLANNING: 'bg-yellow-400',
  unknown: 'bg-slate-300',
};

function StatCard({
  label, value, icon, gradient,
}: {
  label: string; value: number; icon: string; gradient: string;
}) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl mb-4`}>
        {icon}
      </div>
      <div className="text-4xl font-black text-slate-900">{value.toLocaleString('ru-RU')}</div>
      <div className="text-sm font-semibold text-slate-500 mt-1">{label}</div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: summary, isLoading: summaryLoading } = useAnalyticsSummary();
  const { data: byStatus = [], isLoading: statusLoading } = useEventsByStatus();
  const { data: topEvents = [], isLoading: topLoading } = useTopEvents();

  const totalEvents = byStatus.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Шапка */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h1 className="text-3xl font-bold text-slate-900">Аналитика</h1>
        <p className="text-slate-500 mt-1">Статистика платформы в реальном времени</p>
      </div>

      {/* Карточки-счётчики */}
      {summaryLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-40 bg-slate-100 rounded-3xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Пользователей" value={summary?.users_count ?? 0} icon="👤" gradient="from-indigo-400 to-indigo-600" />
          <StatCard label="Мероприятий" value={summary?.events_count ?? 0} icon="🗓️" gradient="from-purple-400 to-purple-600" />
          <StatCard label="Команд" value={summary?.teams_count ?? 0} icon="👥" gradient="from-cyan-400 to-cyan-600" />
          <StatCard label="Кейсов" value={summary?.challenges_count ?? 0} icon="💼" gradient="from-emerald-400 to-emerald-600" />
        </div>
      )}

      {/* Нижний блок */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* По статусам */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
            Мероприятия по статусам
          </h2>
          {statusLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <div key={i} className="h-8 bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
          ) : byStatus.length === 0 ? (
            <p className="text-slate-400 text-sm">Нет данных</p>
          ) : (
            <div className="space-y-4">
              {byStatus
                .sort((a, b) => b.count - a.count)
                .map((s) => {
                  const pct = totalEvents > 0 ? Math.round((s.count / totalEvents) * 100) : 0;
                  return (
                    <div key={s.status}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm font-medium text-slate-700">
                          {STATUS_LABEL[s.status] ?? s.status}
                        </span>
                        <span className="text-sm font-bold text-slate-900">{s.count} <span className="text-slate-400 font-normal">({pct}%)</span></span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${STATUS_COLOR[s.status] ?? 'bg-slate-400'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Топ мероприятий */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-purple-500 rounded-full" />
            Топ по командам
          </h2>
          {topLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
          ) : topEvents.length === 0 ? (
            <p className="text-slate-400 text-sm">Нет данных</p>
          ) : (
            <ol className="space-y-3">
              {topEvents.map((event, i) => (
                <li key={event.id}>
                  <Link
                    to={`/events/${event.id}`}
                    className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors group"
                  >
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                      i === 0 ? 'bg-yellow-100 text-yellow-700' :
                      i === 1 ? 'bg-slate-100 text-slate-600' :
                      i === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-slate-50 text-slate-400'
                    }`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                        {event.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {STATUS_LABEL[event.status ?? ''] ?? event.status ?? '—'}
                      </p>
                    </div>
                    <span className="shrink-0 flex items-center gap-1 text-sm font-bold text-slate-700">
                      👥 {event.teams_count}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
