interface EventCardProps {
  title: string;
  type: string;
  date: string;
  status: string;
}

export default function EventCard({ title, type, date, status }: EventCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
      <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium mb-3">
        {type}
      </span>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-slate-500 text-sm mb-1">{date}</p>
      <span className="inline-block px-2 py-1 bg-green-50 text-green-700 rounded-lg text-xs">
        {status}
      </span>
    </div>
  );
}