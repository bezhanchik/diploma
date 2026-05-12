import { useParams, Link } from 'react-router-dom';
import { useChallengeDetail } from '../hooks/useChallenges';

const TRACK_COLORS = [
  'from-indigo-500 to-indigo-700',
  'from-violet-500 to-violet-700',
  'from-cyan-500 to-cyan-700',
  'from-emerald-500 to-emerald-700',
  'from-orange-500 to-orange-700',
  'from-rose-500 to-rose-700',
];

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: challenge, isLoading, error } = useChallengeDetail(Number(id));

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 w-40 bg-slate-100 rounded-xl" />
        <div className="h-48 bg-slate-100 rounded-3xl" />
        <div className="h-32 bg-slate-100 rounded-3xl" />
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-red-100">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-slate-900">Кейс не найден</h3>
        <Link to="/cases" className="mt-4 inline-block text-indigo-600 font-semibold hover:underline">
          ← Все кейсы
        </Link>
      </div>
    );
  }

  const gradient = TRACK_COLORS[((challenge.id - 1) % TRACK_COLORS.length)];

  return (
    <div className="space-y-6 animate-fade-in">
      <Link to="/cases" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 transition-colors">
        ← Все кейсы
      </Link>

      {/* Шапка */}
      <div className={`bg-gradient-to-r ${gradient} rounded-3xl p-8 text-white shadow-lg`}>
        {challenge.track_name && (
          <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-4">
            🎯 {challenge.track_name}
          </span>
        )}
        <h1 className="text-3xl font-black leading-tight">{challenge.title}</h1>
      </div>

      {/* Описание */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span className="w-1.5 h-5 bg-indigo-500 rounded-full" />
          Описание задачи
        </h2>
        {challenge.description ? (
          <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{challenge.description}</p>
        ) : (
          <p className="text-slate-400 italic">Описание задачи отсутствует.</p>
        )}
      </div>

      {/* Похожие кейсы */}
      {challenge.related.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Другие кейсы в этом треке</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {challenge.related.map((c) => (
              <Link
                key={c.id}
                to={`/cases/${c.id}`}
                className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md hover:border-indigo-100 transition-all group"
              >
                <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {c.title}
                </p>
                {c.description && (
                  <p className="text-sm text-slate-400 mt-2 line-clamp-2">{c.description}</p>
                )}
                <span className="inline-block mt-3 text-xs font-semibold text-indigo-600">
                  Подробнее →
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
