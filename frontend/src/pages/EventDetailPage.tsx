import { useParams, Link } from 'react-router-dom';
import { useEvent } from '../hooks/useEvents';

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

const TRACK_COLORS = [
  'border-l-indigo-500',
  'border-l-violet-500',
  'border-l-cyan-500',
  'border-l-emerald-500',
  'border-l-orange-500',
  'border-l-rose-500',
];

const fmt = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : null;

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: event, isLoading, error } = useEvent(Number(id));

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-40 bg-slate-100 rounded-3xl" />
        <div className="h-32 bg-slate-100 rounded-3xl" />
        <div className="h-64 bg-slate-100 rounded-3xl" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-red-100">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-slate-900">Мероприятие не найдено</h3>
        <Link to="/events" className="mt-4 inline-block text-indigo-600 font-semibold hover:underline">
          ← Все мероприятия
        </Link>
      </div>
    );
  }

  const statusStyle = STATUS_STYLE[event.status ?? ''] ?? 'bg-slate-100 text-slate-500 border-slate-200';
  const statusLabel = STATUS_LABEL[event.status ?? ''] ?? event.status ?? '—';
  const startFmt = fmt(event.start_date);
  const endFmt = fmt(event.end_date);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Хлебные крошки */}
      <Link to="/events" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 transition-colors">
        ← Все мероприятия
      </Link>

      {/* Шапка */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-8 py-10">
          <div className="flex flex-wrap items-start gap-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusStyle}`}>
              {statusLabel}
            </span>
          </div>
          <h1 className="text-3xl font-black text-white mt-4 leading-tight">{event.title}</h1>
          {(startFmt || endFmt) && (
            <p className="text-indigo-200 mt-2 text-sm">
              {startFmt && `С ${startFmt}`}
              {endFmt && ` по ${endFmt}`}
            </p>
          )}
        </div>

        {/* Быстрая статистика */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100">
          {[
            { label: 'Треков', value: event.tracks.length, icon: '🎯' },
            { label: 'Кейсов', value: event.challenges_count, icon: '💼' },
            { label: 'Команд', value: event.teams_count, icon: '👥' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="py-5 text-center">
              <div className="text-2xl font-black text-slate-900">{value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{icon} {label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Треки и кейсы */}
      {event.tracks.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Треки и кейсы</h2>
          <div className="space-y-4">
            {event.tracks.map((track, ti) => (
              <div key={track.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-3">
                  <span className={`w-1.5 h-5 rounded-full ${TRACK_COLORS[ti % TRACK_COLORS.length].replace('border-l-', 'bg-')}`} />
                  <h3 className="font-bold text-slate-900">{track.name}</h3>
                  <span className="ml-auto text-xs text-slate-400">{track.challenges.length} кейсов</span>
                </div>
                {track.challenges.length === 0 ? (
                  <p className="px-6 py-4 text-sm text-slate-400">Кейсы не добавлены</p>
                ) : (
                  <ul className="divide-y divide-slate-50">
                    {track.challenges.map((c) => (
                      <li key={c.id}>
                        <Link
                          to={`/cases/${c.id}`}
                          className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                              {c.title}
                            </p>
                            {c.description && (
                              <p className="text-sm text-slate-400 truncate mt-0.5">{c.description}</p>
                            )}
                          </div>
                          <svg className="h-4 w-4 text-slate-300 group-hover:text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Команды */}
      {event.teams.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Участвующие команды</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {event.teams.map((team) => (
              <Link
                key={team.id}
                to={`/teams/${team.id}`}
                className="bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-md hover:border-indigo-100 transition-all group"
              >
                <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                  {team.name}
                </p>
                {team.captain && (
                  <p className="text-xs text-slate-400 mt-1 truncate">
                    Капитан: {team.captain.first_name} {team.captain.last_name}
                  </p>
                )}
                <p className="text-xs text-slate-400 mt-1">👥 {team.members_count} участников</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {event.tracks.length === 0 && event.teams.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
          <p className="text-slate-400">Информация о мероприятии пока заполняется</p>
        </div>
      )}
    </div>
  );
}
