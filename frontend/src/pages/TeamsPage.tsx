// src/pages/TeamsPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { findUserByEmail } from '../api/teams';
import { useTeams, useCreateTeam, useAddTeamMember, useRemoveTeamMember } from '../hooks/useTeams';
import { useEvents } from '../hooks/useEvents';
import { useTracks } from '../hooks/useTracks';
import { useProfile } from '../hooks/useProfile';
import type { Team } from '../types';

export default function TeamsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<number | ''>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamEventId, setNewTeamEventId] = useState<number | ''>('');
  const [newTeamTrackId, setNewTeamTrackId] = useState<number | ''>('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('member');

  const { data: currentUser } = useProfile();
  const isAdmin = currentUser?.role === 'admin';

  const { data: teams = [], isLoading: teamsLoading, error: teamsError } = useTeams(selectedEventId || undefined);
  const { data: events = [] } = useEvents();
  const { data: tracks = [] } = useTracks();

  const createTeamMutation = useCreateTeam();
  const addMemberMutation = useAddTeamMember();
  const removeMemberMutation = useRemoveTeamMember();

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEventName = (eventId: number | null | undefined) => {
    if (!eventId) return null;
    return events.find((e) => e.id === eventId)?.title ?? `Мероприятие #${eventId}`;
  };

  const getTrackName = (trackId: number | null | undefined) => {
    if (!trackId) return null;
    return tracks.find((t) => t.id === trackId)?.name ?? `Трек #${trackId}`;
  };

  const handleCreateTeam = (e: React.SyntheticEvent) => {
    e.preventDefault();
    createTeamMutation.mutate({
      name: newTeamName,
      event_id: newTeamEventId || null,
      track_id: newTeamTrackId || null,
    });
  };

  const handleAddMember = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!selectedTeam) return;
    try {
      const users = await findUserByEmail(newMemberEmail);
      if (!users[0]) {
        alert('Пользователь с таким email не найден');
        return;
      }
      addMemberMutation.mutate({
        teamId: selectedTeam.id,
        user_id: users[0].id,
        role: newMemberRole as 'captain' | 'member',
      });
    } catch {
      alert('Ошибка при поиске пользователя');
    }
  };

  if (teamsError) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-red-100">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-slate-900">Ошибка загрузки</h3>
        <p className="text-slate-500 mt-2">Не удалось загрузить команды.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Шапка + Поиск + Фильтры */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Команды</h1>
            <p className="text-slate-500 mt-1">Участвуйте в хакатонах вместе с командой</p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-sm hover:shadow-md"
          >
            + Создать команду
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Поиск по названию..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all flex-1"
          />

          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value ? Number(e.target.value) : '')}
            className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white cursor-pointer"
          >
            <option value="">Все мероприятия</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>

          {selectedEventId && (
            <button
              onClick={() => setSelectedEventId('')}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
            >
              Сбросить
            </button>
          )}
        </div>
      </div>

      {/* Список команд */}
      {teamsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 bg-slate-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-bold text-slate-900">Команды не найдены</h3>
          <p className="text-slate-500 mt-2">Попробуйте изменить параметры поиска</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all"
          >
            Создать первую команду
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <div
              key={team.id}
              className="group bg-white rounded-3xl border border-slate-100 hover:shadow-xl hover:border-indigo-100 transition-all duration-300 flex flex-col overflow-hidden"
            >
              {/* Шапка карточки */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white">
                  {team.name}
                </h3>
                {team.captain && (
                  <p className="text-indigo-100 text-sm mt-1">
                    Капитан: {team.captain.first_name} {team.captain.last_name}
                  </p>
                )}
              </div>

              {/* Тело карточки */}
              <div className="p-6 flex-1">
                {team.event_id && (
                  <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
                    <span>📅</span>
                    <span className="truncate">{getEventName(team.event_id)}</span>
                  </div>
                )}

                {team.track_id && (
                  <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
                    <span>🎯</span>
                    <span className="truncate">{getTrackName(team.track_id)}</span>
                  </div>
                )}

                {/* Участники */}
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <span>👥</span>
                    Участники ({team.members?.length || 0})
                  </h4>
                  {team.members && team.members.length > 0 ? (
                    <ul className="space-y-1.5">
                      {team.members.map((member) => (
                        <li key={member.user_id} className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">
                            {member.user?.first_name} {member.user?.last_name} ({member.user?.email})
                          </span>
                          {member.role === 'captain' && (
                            <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
                              капитан
                            </span>
                          )}
                          {member.role !== 'captain' && (isAdmin || team.captain_id === currentUser?.id) && (
                            <button
                              onClick={() => {
                                if (confirm('Удалить участника из команды?')) {
                                  removeMemberMutation.mutate({ teamId: team.id, userId: member.user_id });
                                }
                              }}
                              className="px-2 py-0.5 rounded-lg bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 text-xs font-medium transition-colors"
                            >
                              Удалить
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-400">Нет участников</p>
                  )}
                </div>
              </div>

              {/* Кнопки действий */}
              <div className="px-6 pb-6 flex gap-3">
                {(isAdmin || team.captain_id === currentUser?.id) && (
                  <button
                    onClick={() => {
                      setSelectedTeam(team);
                      setShowAddMemberModal(true);
                    }}
                    className="flex-1 px-4 py-2 rounded-xl border border-indigo-200 text-indigo-600 font-medium hover:bg-indigo-50 transition-all"
                  >
                    + Добавить участника
                  </button>
                )}
                <Link
                  to={`/teams/${team.id}`}
                  className="flex-1 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-all text-center"
                >
                  Подробнее
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно создания команды */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4">Создать команду</h2>
            <form onSubmit={handleCreateTeam}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Название команды *</label>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Мероприятие</label>
                <select
                  value={newTeamEventId}
                  onChange={(e) => setNewTeamEventId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                >
                  <option value="">Не выбрано</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>{event.title}</option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Трек</label>
                <select
                  value={newTeamTrackId}
                  onChange={(e) => setNewTeamTrackId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                >
                  <option value="">Не выбран</option>
                  {tracks.map((track) => (
                    <option key={track.id} value={track.id}>{track.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={createTeamMutation.isPending}
                  className="flex-1 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {createTeamMutation.isPending ? 'Создание...' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно добавления участника */}
      {showAddMemberModal && selectedTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddMemberModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-2">Добавить участника</h2>
            <p className="text-slate-500 text-sm mb-4">в команду «{selectedTeam.name}»</p>
            
            <form onSubmit={handleAddMember}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Email пользователя</label>
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Роль</label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                >
                  <option value="member">Участник</option>
                  <option value="captain">Капитан</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMemberModal(false);
                    setSelectedTeam(null);
                    setNewMemberEmail('');
                  }}
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={addMemberMutation.isPending}
                  className="flex-1 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {addMemberMutation.isPending ? 'Добавление...' : 'Добавить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}