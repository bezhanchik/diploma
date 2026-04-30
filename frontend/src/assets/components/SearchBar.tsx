// src/assets/components/SearchBar.tsx
export default function SearchBar() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 flex flex-col md:flex-row gap-2 items-center">
      {/* Поле ввода */}
      <div className="flex-1 w-full relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          🔍
        </span>
        <input
          type="text"
          placeholder="Поиск по названию..."
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-slate-300 focus:ring-0 transition-all outline-none"
        />
      </div>

      {/* Фильтр */}
      <select className="w-full md:w-auto px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-slate-300 focus:ring-0 outline-none cursor-pointer text-slate-600">
        <option value="">Все типы</option>
        <option value="hackathon">Хакатон</option>
        <option value="case">Кейс-чемпионат</option>
        <option value="project">Проектное соревнование</option>
      </select>

      {/* Кнопка */}
      <button className="w-full md:w-auto px-6 py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 active:scale-95 transition-all">
        Найти
      </button>
    </div>
  );
}
