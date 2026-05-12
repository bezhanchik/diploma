import { useState } from 'react';
import EventsTab from './admin/EventsTab';
import UsersTab from './admin/UsersTab';
import TracksTab from './admin/TracksTab';

type Tab = 'events' | 'users' | 'tracks';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'events', label: 'Мероприятия', icon: '🗓️' },
  { id: 'users',  label: 'Пользователи', icon: '👤' },
  { id: 'tracks', label: 'Треки и кейсы', icon: '🎯' },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('events');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Шапка */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm px-6 py-5">
        <h1 className="text-2xl font-bold text-slate-900">Админ-панель</h1>
        <p className="text-slate-500 text-sm mt-1">Управление платформой HackSpaceEdu</p>
      </div>

      {/* Табы */}
      <div className="flex gap-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-1.5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Контент таба */}
      {activeTab === 'events' && <EventsTab />}
      {activeTab === 'users'  && <UsersTab />}
      {activeTab === 'tracks' && <TracksTab />}
    </div>
  );
}
