import { useParams, Link } from 'react-router-dom';
import { useTeam } from '../hooks/useTeams';
import { useEvents } from '../hooks/useEvents';
import { useTracks } from '../hooks/useTracks';
import { useProfile } from '../hooks/useProfile';
import { useRemoveTeamMember } from '../hooks/useTeams';

export default function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const teamId = Number(id);

  const { data: team, isLoading, error } = useTeam(teamId);
  const { data: events = [] } = useEvents();
  const { data: tracks = [] } = useTracks();
  const { data: currentUser } = useProfile();
  const removeMemberMutation = useRemoveTeamMember();

  const eventName = team?.event_id
    ? events.find((e) => e.id === team.event_id)?.title ?? `Мероприятие #${team.event_id}`
    : null;
  const trackName = team?.track_id
    ? tracks.find((t) => t.id === team.track_id)?.name ?? `Трек #${team.track_id}`
    : null;

  const isAdmin = currentUser?.role === 'admin';
  const isCaptain = team?.captain_id === currentUser?.id;
  const canManage = isAdmin || isCaptain;

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 w-40 bg-slate-100 rounded-xl" />
        <div className="h-48 bg-slate-100 rounded-3xl" />
        <div className="h-64 bg-slate-100 rounded-3xl" />
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-red-100">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-slate-900">Команда не найдена</h3>
        <Link to="/teams" className="mt-4 inline-block text-indigo-600 font-semibold hover:underline">
          ← Все команды
        </Link>
      </div>
    );
  }

  const members = team.members ?? [];
  const captain = members.find((m) => m.role === 'captain');
  const regularMembers = members.filter((m) => m.role !== 'captain');

  return (
    <div className="space-y-6 animate-fade-in">
      <Link to="/teams" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 transition-colors">
        ← Все команды
      </Link>

      {/* Шапка */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-10">
          <h1 className="text-3xl font-black text-white">{team.name}</h1>
          {team.captain && (
            <p className="text-indigo-200 mt-2 text-sm">
              Капитан: {team.captain.first_name} {team.captain.last_name}
            </p>
          )}
          <div className="flex flex-wrap gap-3 mt-4">
            {eventName && (
              <Link
                to={`/events/${team.event_id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold transition-colors"
              >
                📅 {eventName}
              </Link>
            )}
            {trackName && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold">
                🎯 {trackName}
              </span>
            )}
          </div>
        </div>

        {/* Счётчик */}
        <div className="px-8 py-4 border-t border-slate-100 flex items-center gap-2 text-sm text-slate-500">
          <span className="font-bold text-slate-900">{members.length}</span> участников
        </div>
      </div>

      {/* Участники */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-2">
          <span className="w-1.5 h-5 bg-indigo-500 rounded-full" />
          Состав команды
        </h2>

        {members.length === 0 ? (
          <p className="text-slate-400 text-sm">Участников пока нет</p>
        ) : (
          <ul className="divide-y divide-slate-50">
            {/* Капитан первым */}
            {captain && (
              <li className="flex items-center gap-4 py-3">
                <div className="w-10 h-10 rounded-2xl bg-yellow-100 flex items-center justify-center text-lg shrink-0">
                  👑
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">
                    {captain.user?.first_name} {captain.user?.last_name}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{captain.user?.email}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold shrink-0">
                  капитан
                </span>
              </li>
            )}

            {regularMembers.map((member) => (
              <li key={member.user_id} className="flex items-center gap-4 py-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-lg shrink-0">
                  👤
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">
                    {member.user?.first_name} {member.user?.last_name}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{member.user?.email}</p>
                </div>
                {canManage && (
                  <button
                    onClick={() => {
                      if (confirm('Удалить участника из команды?')) {
                        removeMemberMutation.mutate({ teamId: team.id, userId: member.user_id });
                      }
                    }}
                    className="px-3 py-1 rounded-lg bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 text-xs font-medium transition-colors shrink-0"
                  >
                    Удалить
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
