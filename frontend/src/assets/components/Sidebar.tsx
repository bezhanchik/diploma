import { NavLink } from "react-router-dom";

function Sidebar()
{
  const linkBase = 'px-4 py-3 rounded-xl transition';
  const getLinkClass = ({isActive}: {isActive: boolean}) => 
    isActive
    ? `${linkBase} bg-slate-800 hover:bg-slate-700`
    : `${linkBase} hover:bg-slate-800`
  return (
    <aside className="w-64 bg-slate-900 text-white p-6 hidden md:flex md:flex-col">
      <h1 className="text-2xl font-bold mb-8">HackSpaceEdu</h1>

      <nav className="flex flex-col gap-3">
        <NavLink to={'/'} className={getLinkClass}>Главная</NavLink>
        <NavLink to={'/events'} className={getLinkClass} >Мероприятия</NavLink>
        <NavLink to={'/teams'} className={getLinkClass} >Команды</NavLink>
        <NavLink to={'/cases'} className={getLinkClass} >Кейсы</NavLink>
        <NavLink to={'/schedule'} className={getLinkClass} >Расписание</NavLink>
        <NavLink to={'/analytics'} className={getLinkClass} >Аналитика</NavLink>
        <NavLink to="/admin" className={getLinkClass}>Админ-панель</NavLink>
      </nav>

      <div className="mt-auto pt-8 text-sm text-slate-400">
        Платформа для учебных хакатонов
      </div>
    </aside>
  );
}

export default Sidebar;