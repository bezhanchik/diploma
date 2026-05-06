// src/pages/CasesPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';

// Типизация строго под текущую схему БД
type Challenge = {
  id: number;
  title: string;
  description: string | null;
  track_id: number;
  track_name?: string; // Придет с бэкенда или добавим вручную
};

type Track = {
  id: number;
  name: string;
};

export default function CasesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrackId, setSelectedTrackId] = useState<number | ''>('');

  // 1. Загружаем треки
  const { data: tracks = [] } = useQuery<Track[]>({
    queryKey: ['tracks'],
    queryFn: async () => {
      const { data } = await apiClient.get('/tracks');
      return data;
    },
  });

  // 2. Загружаем кейсы
  const { data: challenges = [], isLoading, error } = useQuery<Challenge[]>({
    queryKey: ['challenges', selectedTrackId],
    queryFn: async () => {
      let url = '/challenges?limit=50';
      if (selectedTrackId) {
        url += `&track_id=${selectedTrackId}`;
      }
      
      const { data } = await apiClient.get(url);
      
      // "Подмешиваем" название трека для отображения, если бэкенд не делает JOIN
      return data.map((c: Challenge) => ({
        ...c,
        track_name: tracks.find(t => t.id === c.track_id)?.name || `Трек #${c.track_id}`
      }));
    },
  });

  // Фильтрация по названию на клиенте
  const filteredChallenges = challenges.filter((challenge) =>
    challenge.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-red-100">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-slate-900">Ошибка загрузки</h3>
        <p className="text-slate-500 mt-2">Не удалось загрузить кейсы.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Шапка + Поиск + Фильтры */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Кейсы и задачи</h1>
            <p className="text-slate-500 mt-1">Реальные задачи от партнёров платформы</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <input
              type="text"
              placeholder="Поиск по названию..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all w-full sm:w-64"
            />
          </div>
        </div>

        {/* Фильтр по трекам */}
        <div className="flex flex-wrap gap-3">
          <select
            value={selectedTrackId}
            onChange={(e) => setSelectedTrackId(e.target.value ? Number(e.target.value) : '')}
            className="px-4 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white cursor-pointer"
          >
            <option value="">Все треки</option>
            {tracks.map((track) => (
              <option key={track.id} value={track.id}>
                {track.name}
              </option>
            ))}
          </select>

          {selectedTrackId && (
            <button
              onClick={() => setSelectedTrackId('')}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
            >
              Сбросить фильтр
            </button>
          )}
        </div>
      </div>

      {/* Список кейсов */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filteredChallenges.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-slate-900">Кейсы не найдены</h3>
          <p className="text-slate-500 mt-2">Попробуйте изменить параметры поиска</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map((challenge) => (
            <Link
              key={challenge.id}
              to={`/cases/${challenge.id}`}
              className="group bg-white rounded-3xl border border-slate-100 p-6 hover:shadow-xl hover:border-indigo-100 transition-all duration-300 flex flex-col h-full"
            >
              {/* Тег трека */}
              <div className="mb-4">
                <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                  {challenge.track_name}
                </span>
              </div>

              {/* Заголовок */}
              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">
                {challenge.title}
              </h3>
              
              {/* Описание */}
              <p className="text-slate-500 text-sm line-clamp-3 mb-4 flex-1">
                {challenge.description || 'Описание задачи отсутствует.'}
              </p>

              {/* Кнопка */}
              <div className="mt-auto pt-4 border-t border-slate-50 flex items-center text-indigo-600 font-bold text-sm group-hover:translate-x-1 transition-transform">
                Подробнее о кейсе <span className="ml-2">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}