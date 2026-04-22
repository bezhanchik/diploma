type EventCardProps = {
  title: string;
  type: string;
  date: string;
  status: string;
};

function EventCard({ title, type, date, status }: EventCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-4">
        <span className="text-xs font-medium px-3 py-1 rounded-full bg-slate-100 text-slate-600">
          {type}
        </span>
        <span className="text-xs font-medium px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">
          {status}
        </span>
      </div>

      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-slate-500 mb-4">Дата проведения: {date}</p>

      <div className="flex gap-3">
        <button className="flex-1 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition">
          Открыть
        </button>
        <button className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition">
          Подробнее
        </button>
      </div>
    </div>
  );
}

export default EventCard;