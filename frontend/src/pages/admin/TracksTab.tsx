import { useState } from 'react';
import { useEvents } from '../../hooks/useEvents';
import { useTracks, useCreateTrack, useDeleteTrack } from '../../hooks/useTracks';
import { useChallenges, useCreateChallenge, useDeleteChallenge } from '../../hooks/useChallenges';

function ChallengeRow({
  challenge,
  onDelete,
}: {
  challenge: { id: number; title: string; description: string | null };
  onDelete: (id: number) => void;
}) {
  return (
    <li className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-slate-50 group transition-colors">
      <span className="text-slate-400 text-xs shrink-0">💼</span>
      <span className="flex-1 text-sm text-slate-700 truncate">{challenge.title}</span>
      <button
        onClick={() => onDelete(challenge.id)}
        className="opacity-0 group-hover:opacity-100 px-2 py-0.5 rounded-lg bg-red-50 border border-red-100 text-red-500 text-xs font-medium transition-all"
      >
        Удалить
      </button>
    </li>
  );
}

function TrackCard({
  track,
  onDeleteTrack,
}: {
  track: { id: number; name: string };
  onDeleteTrack: (id: number) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const { data: challenges = [] } = useChallenges(track.id);
  const createChallengeMutation = useCreateChallenge();
  const deleteChallengeMutation = useDeleteChallenge();

  const handleAddChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    createChallengeMutation.mutate(
      { title: title.trim(), description: description.trim() || undefined, track_id: track.id },
      {
        onSuccess: () => {
          setTitle('');
          setDescription('');
          setShowForm(false);
        },
      },
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-50">
        <span className="w-1.5 h-5 bg-indigo-400 rounded-full shrink-0" />
        <span className="font-semibold text-slate-900 flex-1">{track.name}</span>
        <span className="text-xs text-slate-400">{challenges.length} кейсов</span>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-medium hover:bg-indigo-100 transition-colors"
        >
          + Кейс
        </button>
        <button
          onClick={() => onDeleteTrack(track.id)}
          className="px-2.5 py-1 rounded-lg bg-red-50 border border-red-100 text-red-500 text-xs font-medium hover:bg-red-100 transition-colors"
        >
          Удалить трек
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddChallenge} className="px-5 py-3 bg-indigo-50/50 border-b border-indigo-100 flex flex-col gap-2">
          <input
            type="text"
            placeholder="Название кейса *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
            autoFocus
          />
          <input
            type="text"
            placeholder="Описание (опционально)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={createChallengeMutation.isPending || !title.trim()}
              className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition-colors"
            >
              {createChallengeMutation.isPending ? 'Добавление...' : 'Добавить'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setTitle(''); setDescription(''); }}
              className="px-4 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium"
            >
              Отмена
            </button>
          </div>
        </form>
      )}

      <ul className="px-2 py-2">
        {challenges.length === 0 ? (
          <li className="text-xs text-slate-400 px-3 py-2">Кейсов пока нет</li>
        ) : (
          challenges.map((c) => (
            <ChallengeRow
              key={c.id}
              challenge={c}
              onDelete={(id) => deleteChallengeMutation.mutate(id)}
            />
          ))
        )}
      </ul>
    </div>
  );
}

export default function TracksTab() {
  const [selectedEventId, setSelectedEventId] = useState<number | ''>('');
  const [newTrackName, setNewTrackName] = useState('');

  const { data: events = [] } = useEvents();
  const { data: tracks = [] } = useTracks(selectedEventId || undefined);
  const createTrackMutation = useCreateTrack();
  const deleteTrackMutation = useDeleteTrack();

  const handleCreateTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrackName.trim()) return;
    createTrackMutation.mutate(
      { name: newTrackName.trim(), event_id: selectedEventId || null },
      { onSuccess: () => setNewTrackName('') },
    );
  };

  return (
    <div className="space-y-6">
      {/* Выбор мероприятия */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <label className="text-sm font-semibold text-slate-600 shrink-0">Мероприятие:</label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value ? Number(e.target.value) : '')}
            className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none bg-white text-sm w-full sm:w-64"
          >
            <option value="">— Все мероприятия —</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>{ev.title}</option>
            ))}
          </select>
        </div>

        {/* Создать трек */}
        <form onSubmit={handleCreateTrack} className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Название трека"
            value={newTrackName}
            onChange={(e) => setNewTrackName(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm flex-1"
          />
          <button
            type="submit"
            disabled={createTrackMutation.isPending || !newTrackName.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors shrink-0"
          >
            + Трек
          </button>
        </form>
      </div>

      {/* Список треков */}
      {tracks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
          <div className="text-4xl mb-3">🎯</div>
          <p className="text-slate-400 text-sm">
            {selectedEventId ? 'Треков для этого мероприятия нет' : 'Выберите мероприятие или создайте трек'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tracks.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              onDeleteTrack={(id) => deleteTrackMutation.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
