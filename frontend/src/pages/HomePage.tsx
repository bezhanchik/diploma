import EventCard from "../assets/components/EventCard";


function HomePage() {
  return (
    <>
      <section className="mb-6">
        <h2 className="text-2xl font-bold">Ближайшие мероприятия</h2>
        <p className="text-slate-500 mt-1">
          Учебные хакатоны и проектные соревнования для школ, колледжей и вузов
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <EventCard
          title="Школьный IT-хакатон"
          type="Хакатон"
          date="15 мая 2026"
          status="Открыта регистрация"
        />
        <EventCard
          title="Кейс-чемпионат по веб-разработке"
          type="Кейс-чемпионат"
          date="22 мая 2026"
          status="Формирование команд"
        />
        <EventCard
          title="Инженерный проектный марафон"
          type="Проектное соревнование"
          date="1 июня 2026"
          status="Скоро старт"
        />
      </div>
    </>
  );
}


export default HomePage;