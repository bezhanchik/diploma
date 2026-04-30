// src/pages/HomePage.tsx
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { RootState } from '../store/store';

type Event = {
  id: number;
  title: string;
  status: string | null;
  start_date: string | null;
  end_date: string | null;
};

export default function HomePage() {
  const token = useSelector((state: RootState) => state.auth.token);

  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ['home-events'],
    queryFn: async () => {
      const { data } = await apiClient.get('/events?limit=10');
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const upcomingEvents = events
    .filter((ev) => ev.status === 'active')
    .sort((a, b) => {
      const dateA = a.start_date ? new Date(a.start_date).getTime() : Infinity;
      const dateB = b.start_date ? new Date(b.start_date).getTime() : Infinity;
      return dateA - dateB;
    })
    .slice(0, 3);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Дата уточняется';
    return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  };

  return (
    <div className="space-y-12 animate-fade-in">
      
      {/* Hero Section */}
      <section className="text-center py-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-medium text-slate-600 mb-6">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Платформа для учебных хакатонов
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
          Hack<span className="text-slate-500">Space</span>Edu
        </h1>
        
        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
          Организуйте хакатоны, формируйте команды и создавайте проекты будущего в единой экосистеме.
        </p>

        {!token && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="px-8 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition shadow-md hover:shadow-lg">
              Присоединиться
            </Link>
            <Link to="/login" className="px-8 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition shadow-sm hover:shadow-md">
              Войти
            </Link>
          </div>
        )}
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Мероприятий', value: '50+' },
          { label: 'Команд', value: '200+' },
          { label: 'Участников', value: '1200+' },
          { label: 'Экспертов', value: '15+' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center hover:shadow-md transition-shadow">
            <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
            <div className="text-sm text-slate-500 uppercase tracking-wide mt-1">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Events */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Ближайшие события</h2>
            <p className="text-slate-500 text-sm mt-1">Не пропустите старт новых хакатонов</p>
          </div>
          <Link to="/events" className="text-slate-600 hover:text-slate-900 font-medium text-sm">Все →</Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
             {[1,2,3].map(i => <div key={i} className="h-48 bg-slate-200 rounded-2xl" />)}
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center text-slate-500">
            Нет активных мероприятий
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <Link 
                key={event.id} 
                to={`/events/${event.id}`} 
                className="group bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-slate-300 transition-all block"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-bold rounded border border-green-100">АКТИВЕН</span>
                  <span className="text-slate-400 text-xs">•</span>
                  <span className="text-slate-500 text-xs">{formatDate(event.start_date)}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-slate-700 line-clamp-2">{event.title}</h3>
                <div className="mt-4 flex items-center text-slate-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                  Подробнее <span className="ml-1">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Features */}
      <section className="bg-white rounded-3xl p-8 border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Возможности платформы</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '🚀', title: 'Мероприятия', desc: 'Создавайте хакатоны, управляйте треками и расписанием' },
            { icon: '👥', title: 'Команды', desc: 'Формируйте команды, распределяйте роли и общайтесь' },
            { icon: '📊', title: 'Аналитика', desc: 'Оценивайте проекты, смотрите статистику и результаты' },
          ].map((item, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all">
              <div className="text-3xl mb-4">{item.icon}</div>
              <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-slate-500 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}