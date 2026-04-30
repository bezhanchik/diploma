// src/assets/components/Sidebar.tsx
import { NavLink } from "react-router-dom";
import { useState } from "react";
import { useAdminCheck } from "../../api/hooks";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: adminData } = useAdminCheck();
  const isAdmin = adminData?.is_admin || false;

  const linkBase = 'px-4 py-3 rounded-xl transition block';
  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? `${linkBase} bg-slate-800 text-white`
      : `${linkBase} text-slate-300 hover:bg-slate-800 hover:text-white`;

  return (
    <>
      {/* Кнопка открытия сайдбара (только на мобильных) */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-lg shadow-lg"
      >
        ☰
      </button>

      {/* Затемнение фона при открытом сайдбаре */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Сам сайдбар */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-slate-900 text-white p-6 z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:flex md:flex-col
        `}
      >
        {/* Кнопка закрытия (только на мобильных) */}
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          ✕
        </button>

        <h1 className="text-2xl font-bold mb-8">HackSpaceEdu</h1>

        <nav className="flex flex-col gap-3">
          <NavLink to={'/'} className={getLinkClass} onClick={() => setIsOpen(false)}>Главная</NavLink>
          <NavLink to={'/events'} className={getLinkClass} onClick={() => setIsOpen(false)}>Мероприятия</NavLink>
          <NavLink to={'/teams'} className={getLinkClass} onClick={() => setIsOpen(false)}>Команды</NavLink>
          <NavLink to={'/cases'} className={getLinkClass} onClick={() => setIsOpen(false)}>Кейсы</NavLink>
          <NavLink to={'/schedule'} className={getLinkClass} onClick={() => setIsOpen(false)}>Расписание</NavLink>
          <NavLink to={'/analytics'} className={getLinkClass} onClick={() => setIsOpen(false)}>Аналитика</NavLink>
          
          {isAdmin && (
            <NavLink to="/admin" className={getLinkClass} onClick={() => setIsOpen(false)}>Админ-панель</NavLink>
          )}
        </nav>

        <div className="mt-auto pt-8 text-sm text-slate-400">
          Платформа для учебных хакатонов
        </div>
      </aside>
    </>
  );
}

export default Sidebar;