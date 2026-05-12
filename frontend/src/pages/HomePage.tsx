// src/pages/HomePage.tsx
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEvents } from '../hooks/useEvents';
import type { RootState } from '../store/store';

export default function HomePage() {
  const token = useSelector((state: RootState) => state.auth.token);

  const { data: events = [], isLoading } = useEvents();

  const upcomingEvents = events
    .filter((ev) => ev.status === 'active')
    .sort((a, b) => {
      const dateA = a.start_date ? new Date(a.start_date).getTime() : Infinity;
      const dateB = b.start_date ? new Date(b.start_date).getTime() : Infinity;
      return dateA - dateB;
    })
    .slice(0, 4); // Показываем 4 лучших события

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'TBA';
    return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="space-y-16 pb-20">
      
      {/* --- HERO SECTION: Градиент и Драйв --- */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-2xl shadow-slate-900/20">
        {/* Декоративные пятна на фоне */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 px-6 py-20 md:py-28 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-md text-sm font-medium text-indigo-200 mb-8 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            Сезон хакатонов открыт
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-tight">
            Создавай будущее <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              вместе с нами
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10">
            Платформа для тех, кто кодит, дизайнит и управляет. 
            Находи команды, участвуй в челленджах и получай реальный опыт.
          </p>

          {!token ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="group relative px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold text-lg hover:bg-indigo-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]">
                Начать путь
                <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
              </Link>
              <Link to="/login" className="px-8 py-4 bg-transparent border border-white/20 text-white rounded-2xl font-bold text-lg hover:bg-white/10 transition-all backdrop-blur-sm">
                У меня есть аккаунт
              </Link>
            </div>
          ) : (
             <Link to="/events" className="inline-block px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/30">
                Перейти к мероприятиям
             </Link>
          )}
        </div>
      </section>

      {/* --- STATS: Bento Grid Style --- */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Хакатонов проведено', value: '50+', icon: '🚀' },
          { label: 'Активных команд', value: '200+', icon: '👥' },
          { label: 'Участников', value: '1200+', icon: '💻' },
          { label: 'Призовой фонд', value: '₽5M+', icon: '💎' },
        ].map((stat, idx) => (
          <div key={idx} className="group relative bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-4xl grayscale group-hover:grayscale-0">
              {stat.icon}
            </div>
            <div className="relative z-10">
              <div className="text-4xl font-black text-slate-900 mb-1">{stat.value}</div>
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</div>
            </div>
          </div>
        ))}
      </section>

      {/* --- EVENTS: Dark Cards --- */}
      <section>
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Горячие события</h2>
            <p className="text-slate-500 mt-2">Успей зарегистрироваться до старта</p>
          </div>
          <Link to="/events" className="hidden md:flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-700 transition-colors">
            Все мероприятия <span className="text-xl">→</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {[1,2,3,4].map(i => <div key={i} className="h-64 bg-slate-200 rounded-3xl animate-pulse" />)}
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
            <div className="text-6xl mb-4">😴</div>
            <h3 className="text-xl font-bold text-slate-900">Тишина в эфире</h3>
            <p className="text-slate-500 mt-2">Пока нет активных хакатонов. Загляни позже!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {upcomingEvents.map((event, idx) => (
              <Link 
                key={event.id} 
                to={`/events/${event.id}`} 
                className={`group relative flex flex-col justify-between h-full bg-white rounded-3xl border border-slate-100 p-6 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-900/5 transition-all duration-300 ${idx === 0 ? 'md:col-span-2 lg:col-span-2 bg-slate-900 text-white border-none' : ''}`}
              >
                {/* Если это первое событие, делаем его темным и большим */}
                {idx === 0 && (
                   <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl -z-10" />
                )}

                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${idx === 0 ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                      {event.status || 'Live'}
                    </span>
                    <span className={`text-sm font-medium ${idx === 0 ? 'text-slate-400' : 'text-slate-400'}`}>
                      {formatDate(event.start_date)}
                    </span>
                  </div>
                  
                  <h3 className={`text-xl font-bold mb-2 line-clamp-2 ${idx === 0 ? 'text-3xl mb-4' : ''}`}>
                    {event.title}
                  </h3>
                  
                  <p className={`text-sm line-clamp-2 ${idx === 0 ? 'text-slate-400' : 'text-slate-500'}`}>
                    Присоединяйся к лучшим разработчикам и решай реальные задачи от партнеров.
                  </p>
                </div>

                <div className={`mt-6 flex items-center font-bold text-sm ${idx === 0 ? 'text-indigo-400 group-hover:text-indigo-300' : 'text-indigo-600 group-hover:text-indigo-700'}`}>
                  Участвовать <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        <div className="mt-6 text-center md:hidden">
           <Link to="/events" className="inline-block px-6 py-3 bg-slate-100 text-slate-900 rounded-xl font-bold">Все мероприятия</Link>
        </div>
      </section>

      {/* --- FEATURES: Glassmorphism Cards --- */}
      <section className="relative bg-slate-50 rounded-[3rem] py-20 px-4 overflow-hidden">
         {/* Фоновые круги */}
         <div className="absolute top-10 left-10 w-64 h-64 bg-purple-200/30 rounded-full blur-3xl" />
         <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl" />

         <div className="relative z-10 max-w-6xl mx-auto">
            <div className="text-center mb-16">
               <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Больше, чем просто платформа</h2>
               <p className="text-slate-600 text-lg">Инструменты, которые помогут тебе вырасти как специалисту</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { 
                  title: 'Умный нетворкинг', 
                  desc: 'Алгоритмы подберут тебе идеальную команду по стеку и интересам.',
                  icon: '',
                  color: 'from-blue-500 to-cyan-500'
                },
                { 
                  title: 'Реальные кейсы', 
                  desc: 'Задачи от топ-компаний. Лучшие решения попадают в продакшн.',
                  icon: '💼',
                  color: 'from-indigo-500 to-purple-500'
                },
                { 
                  title: 'Геймификация', 
                  desc: 'Получай XP, ачивки и поднимайся в рейтинге лучших хакеров.',
                  icon: '🏆',
                  color: 'from-orange-500 to-red-500'
                },
              ].map((item, idx) => (
                <div key={idx} className="group bg-white/60 backdrop-blur-xl border border-white/50 p-8 rounded-3xl shadow-lg hover:bg-white hover:scale-105 transition-all duration-300">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl text-white shadow-lg mb-6 group-hover:rotate-6 transition-transform`}>
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
         </div>
      </section>

    </div>
  );
}