function SearchBar() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-8 flex flex-col md:flex-row gap-4">
      <input
        type="text"
        placeholder="Поиск по названию мероприятия..."
        className="flex-1 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-300"
      />

      <select className="px-4 py-3 rounded-xl border border-slate-200 outline-none">
        <option>Все типы</option>
        <option>Хакатон</option>
        <option>Кейс-чемпионат</option>
        <option>Проектное соревнование</option>
      </select>

      <button className="px-6 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition">
        Найти
      </button>
    </div>
  );
}

export default SearchBar;