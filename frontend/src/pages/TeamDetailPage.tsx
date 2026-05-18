import { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTeam, useRemoveTeamMember } from '../hooks/useTeams';
import { useEvents } from '../hooks/useEvents';
import { useTracks } from '../hooks/useTracks';
import { useProfile } from '../hooks/useProfile';
import { useTeamProjects, useSubmitSolution } from '../hooks/useProjects';
import { useEvent } from '../hooks/useEvents';
import type { SubmitSolutionData } from '../types';

const fmt = (d: string) =>
  new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const isUrl = (s: string) => s.startsWith('http://') || s.startsWith('https://');

// ─── Модалка подачи решения ────────────────────────────────────────────────

type SubmitModalProps = {
  teamId: number;
  eventId: number | null;
  onClose: () => void;
};

function SubmitModal({ teamId, eventId, onClose }: SubmitModalProps) {
  const { data: eventDetail } = useEvent(eventId ?? 0);
  const submitMutation = useSubmitSolution();

  const [challengeId, setChallengeId] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [mode, setMode] = useState<'url' | 'file'>('url');
  const [repoUrl, setRepoUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const challenges = eventDetail?.tracks.flatMap((t) => t.challenges) ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!challengeId) { setError('Выберите кейс'); return; }
    if (!projectTitle.trim()) { setError('Укажите название проекта'); return; }
    if (mode === 'url' && !repoUrl.trim()) { setError('Укажите ссылку на репозиторий'); return; }
    if (mode === 'file' && !file) { setError('Выберите файл'); return; }

    const payload: SubmitSolutionData = {
      teamId,
      challengeId: Number(challengeId),
      projectTitle: projectTitle.trim(),
      projectDescription: projectDesc.trim() || undefined,
      repositoryUrl: mode === 'url' ? repoUrl.trim() : undefined,
      file: mode === 'file' ? file ?? undefined : undefined,
    };

    submitMutation.mutate(payload, { onSuccess: onClose });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Подать решение</h2>
          <p className="text-sm text-slate-500 mt-1">Загрузите файл или укажите ссылку на репозиторий</p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Кейс */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Кейс *
            </label>
            <select
              value={challengeId}
              onChange={(e) => setChallengeId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none bg-white text-sm"
            >
              <option value="">— Выберите кейс —</option>
              {challenges.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          {/* Название проекта */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Название проекта *
            </label>
            <input
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              placeholder="Например: Умная система мониторинга"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm"
            />
          </div>

          {/* Описание */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Описание
            </label>
            <textarea
              value={projectDesc}
              onChange={(e) => setProjectDesc(e.target.value)}
              placeholder="Краткое описание вашего решения"
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm resize-none"
            />
          </div>

          {/* Тип решения */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Тип решения *
            </label>
            <div className="flex gap-2">
              {(['url', 'file'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${
                    mode === m
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {m === 'url' ? '🔗 Ссылка' : '📁 Файл'}
                </button>
              ))}
            </div>
          </div>

          {mode === 'url' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                Ссылка на репозиторий *
              </label>
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/your/repo"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                Файл *
              </label>
              <div
                onClick={() => fileRef.current?.click()}
                className="w-full px-4 py-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-400 cursor-pointer transition-colors text-center"
              >
                {file ? (
                  <p className="text-sm font-medium text-indigo-600">{file.name}</p>
                ) : (
                  <p className="text-sm text-slate-400">Нажмите, чтобы выбрать файл<br/><span className="text-xs">zip, pdf, tar, docx, pptx</span></p>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".zip,.pdf,.tar,.gz,.rar,.7z,.docx,.pptx"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {submitMutation.error && (
            <p className="text-red-500 text-sm">
              {(submitMutation.error as Error).message}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={submitMutation.isPending}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all disabled:opacity-50"
            >
              {submitMutation.isPending ? 'Отправка...' : 'Подать решение'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Секция решений ────────────────────────────────────────────────────────

function ProjectsSection({
  teamId,
  isTeamMember,
  eventId,
}: {
  teamId: number;
  isTeamMember: boolean;
  eventId: number | null;
}) {
  const [showModal, setShowModal] = useState(false);
  const { data: projects = [], isLoading } = useTeamProjects(teamId);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span className="w-1.5 h-5 bg-emerald-500 rounded-full" />
          Решения команды
        </h2>
        {isTeamMember && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all shadow-sm"
          >
            + Подать решение
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl">
          <p className="text-slate-400 text-sm">Решения ещё не поданы</p>
          {isTeamMember && (
            <button
              onClick={() => setShowModal(true)}
              className="mt-3 text-sm text-indigo-600 font-semibold hover:underline"
            >
              Подать первое решение
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="border border-slate-100 rounded-2xl overflow-hidden">
              <div className="px-5 py-3 bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{project.title ?? 'Проект'}</p>
                  {project.description && (
                    <p className="text-xs text-slate-500 mt-0.5">{project.description}</p>
                  )}
                </div>
                <span className="text-xs text-slate-400 shrink-0">{project.submissions.length} версий</span>
              </div>

              {project.submissions.length === 0 ? (
                <p className="px-5 py-3 text-sm text-slate-400">Нет загруженных версий</p>
              ) : (
                <ul className="divide-y divide-slate-50">
                  {project.submissions.map((sub) => (
                    <li key={sub.id} className="px-5 py-3 flex items-center gap-4">
                      <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-black shrink-0">
                        v{sub.version}
                      </span>
                      <div className="flex-1 min-w-0">
                        {sub.repository_url ? (
                          isUrl(sub.repository_url) ? (
                            <a
                              href={sub.repository_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm text-indigo-600 hover:underline truncate block"
                            >
                              {sub.repository_url}
                            </a>
                          ) : (
                            <a
                              href={`http://localhost:8000${sub.repository_url}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm text-emerald-600 hover:underline flex items-center gap-1"
                            >
                              📁 Скачать файл
                            </a>
                          )
                        ) : (
                          <span className="text-sm text-slate-400">—</span>
                        )}
                        <p className="text-xs text-slate-400 mt-0.5">{fmt(sub.created_at)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <SubmitModal
          teamId={teamId}
          eventId={eventId}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

// ─── Основная страница ─────────────────────────────────────────────────────

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
  const isTeamMember =
    isAdmin ||
    (team?.members?.some((m) => m.user_id === currentUser?.id) ?? false);

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
            {captain && (
              <li className="flex items-center gap-4 py-3">
                <div className="w-10 h-10 rounded-2xl bg-yellow-100 flex items-center justify-center text-lg shrink-0">👑</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{captain.user?.first_name} {captain.user?.last_name}</p>
                  <p className="text-xs text-slate-400 truncate">{captain.user?.email}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold shrink-0">капитан</span>
              </li>
            )}
            {regularMembers.map((member) => (
              <li key={member.user_id} className="flex items-center gap-4 py-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-lg shrink-0">👤</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{member.user?.first_name} {member.user?.last_name}</p>
                  <p className="text-xs text-slate-400 truncate">{member.user?.email}</p>
                </div>
                {canManage && (
                  <button
                    onClick={() => { if (confirm('Удалить участника из команды?')) removeMemberMutation.mutate({ teamId: team.id, userId: member.user_id }); }}
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

      {/* Решения */}
      <ProjectsSection
        teamId={teamId}
        isTeamMember={isTeamMember}
        eventId={team.event_id}
      />
    </div>
  );
}
