// src/assets/components/Sidebar.tsx
import { NavLink, Link } from "react-router-dom";
import { useState } from "react";
import { useSelector } from 'react-redux';
import { useProfile } from '../../hooks/useProfile';
import type { RootState } from '../../store/store';

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const token = useSelector((state: RootState) => state.auth.token);
  const { data: user } = useProfile();
  const isAdmin = user?.role === 'admin';


  // Базовые стили для ссылок
  const linkBase = 'flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden';
  
  const getLinkClass = ({ isActive }: { isActive: boolean }) => {
    if (isActive) {
      return `${linkBase} bg-indigo-600 text-white shadow-lg shadow-indigo-900/20`;
    }
    return `${linkBase} text-slate-400 hover:bg-slate-800 hover:text-white`;
  };

  return (
    <>
      {/* Мобильная кнопка меню */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 bg-slate-900 text-white rounded-xl shadow-lg border border-slate-700 hover:bg-slate-800 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Затемнение фона (Overlay) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Сам сайдбар */}
      <aside
        className={`
          w-64 bg-slate-900 text-white flex flex-col h-screen border-r border-slate-800
          fixed md:relative z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {/* Кнопка закрытия (мобильная) */}
        <div className="flex justify-end p-4 md:hidden">
          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Логотип */}
        <Link to={'/'}>
          <div className="p-6 pb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg">
                H
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">HackSpace<span className="text-indigo-400">Edu</span></h1>
            </div>
          </div>
        </Link>

        {/* Навигация */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          <NavLink to={'/'} className={getLinkClass} onClick={() => setIsOpen(false)}>
            <span className="relative z-10 flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              Главная
            </span>
          </NavLink>
          
          <NavLink to={'/events'} className={getLinkClass} onClick={() => setIsOpen(false)}>
            <span className="relative z-10 flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Мероприятия
            </span>
          </NavLink>

          <NavLink to={'/teams'} className={getLinkClass} onClick={() => setIsOpen(false)}>
             <span className="relative z-10 flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              Команды
            </span>
          </NavLink>

          <NavLink to={'/cases'} className={getLinkClass} onClick={() => setIsOpen(false)}>
             <span className="relative z-10 flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Кейсы
            </span>
          </NavLink>

          <NavLink to={'/schedule'} className={getLinkClass} onClick={() => setIsOpen(false)}>
             <span className="relative z-10 flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Расписание
            </span>
          </NavLink>

          <NavLink to={'/analytics'} className={getLinkClass} onClick={() => setIsOpen(false)}>
             <span className="relative z-10 flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              Аналитика
            </span>
          </NavLink>
          
          {isAdmin && (
            <div className="pt-4 mt-4 border-t border-slate-800">
              <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Администрирование</p>
              <NavLink to="/admin" className={getLinkClass} onClick={() => setIsOpen(false)}>
                 <span className="relative z-10 flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  Админ-панель
                </span>
              </NavLink>
            </div>
          )}
        </nav>

        {/* Футер сайдбара */}
        <div className="mt-auto p-4 border-t border-slate-800">
          {token ? (
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800 transition-colors group"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md group-hover:scale-105 transition-transform bg-gradient-to-br ${isAdmin ? 'from-purple-500 to-indigo-600' : 'from-indigo-500 to-purple-600'}`}>
                {user?.first_name?.charAt(0).toUpperCase() ?? user?.email?.charAt(0).toUpperCase() ?? 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.first_name
                    ? `${user.first_name} ${user.last_name ?? ''}`.trim()
                    : user?.email ?? 'Пользователь'}
                </p>
                <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mt-0.5 ${isAdmin ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-700 text-slate-400'}`}>
                  {isAdmin ? 'Администратор' : 'Пользователь'}
                </span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500 group-hover:text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors"
            >
              Войти
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;