// src/pages/ProfilePage.tsx
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logout } from '../shared/auth';
import { apiClient } from '../api/client';
import type { RootState } from '../store/store';

// Типизация
type User = {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  created_at: string;
};

type UserStats = {
  events_count: number;
  teams_count: number;
  rating: number;
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const reduxUser = useSelector((state: RootState) => state.auth.user);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: reduxUser?.first_name || '',
    lastName: reduxUser?.last_name || '',
    email: reduxUser?.email || '',
  });
  
  const [notifications, setNotifications] = useState({
    email: true,
    news: true,
  });

  // Загрузка данных пользователя с бэкенда
  const { data: user, isLoading: userLoading, error: userError } = useQuery<User>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await apiClient.get('/auth/me');
      return data as User;
    },
  });

  // Загрузка статистики пользователя
  const { data: stats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ['user', 'stats'],
    queryFn: async () => {
      const [eventsRes, teamsRes] = await Promise.all([
        apiClient.get('/users/events-count'),
        apiClient.get('/users/teams-count'),
      ]);
      return {
        events_count: eventsRes.data.count,
        teams_count: teamsRes.data.count,
        rating: 120,
      } as UserStats;
    },
  });

  // Обновление профиля
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { first_name: string; last_name: string }) => {
      const { data: response } = await apiClient.put('/auth/profile', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      setIsEditing(false);
    },
  });

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      first_name: formData.firstName,
      last_name: formData.lastName,
    });
  };

  if (userLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-red-100">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-slate-900">Ошибка загрузки</h3>
        <p className="text-slate-500 mt-2">Не удалось загрузить профиль.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Верхняя панель */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Профиль пользователя</h1>
          <p className="text-slate-500 mt-1">{user?.email}</p>
          {user?.role === 'admin' && (
            <span className="inline-block mt-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
              Администратор
            </span>
          )}
        </div>

        <div className="flex gap-3">
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="px-6 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
            >
              Редактировать
            </button>
          ) : (
            <>
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    firstName: user?.first_name || '',
                    lastName: user?.last_name || '',
                    email: user?.email || '',
                  });
                }}
                className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
              >
                Отмена
              </button>
              <button 
                onClick={handleSave}
                disabled={updateProfileMutation.isPending}
                className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50"
              >
                {updateProfileMutation.isPending ? 'Сохранение...' : 'Сохранить'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Основной контент */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Левая колонка: Личные данные */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-8 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
            Основная информация
          </h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Имя</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Фамилия</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email адрес</label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-3 rounded-xl bg-slate-100 border-transparent text-slate-500 cursor-not-allowed"
              />
              <p className="text-xs text-slate-400 mt-1">Email нельзя изменить</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Дата регистрации</label>
              <input
                type="text"
                value={user?.created_at ? new Date(user.created_at).toLocaleDateString('ru-RU') : ''}
                disabled
                className="w-full px-4 py-3 rounded-xl bg-slate-100 border-transparent text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Правая колонка: Статистика и Настройки */}
        <div className="space-y-6">
          
          {/* Карточка статистики */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-bold text-slate-900 mb-4">Активность</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50">
                <span className="text-sm text-slate-600">Участие в хакатонах</span>
                <span className="text-lg font-black text-slate-900">
                  {statsLoading ? '...' : stats?.events_count || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50">
                <span className="text-sm text-slate-600">Создано команд</span>
                <span className="text-lg font-black text-slate-900">
                  {statsLoading ? '...' : stats?.teams_count || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50">
                <span className="text-sm text-slate-600">Текущий рейтинг</span>
                <span className="text-lg font-black text-slate-900">
                  {statsLoading ? '...' : stats?.rating || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Карточка настроек */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-bold text-slate-900 mb-4">Настройки</h3>
            
            <div className="space-y-3 mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={notifications.email}
                  onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                />
                <span className="text-sm text-slate-600">Email уведомления</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={notifications.news}
                  onChange={(e) => setNotifications({...notifications, news: e.target.checked})}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                />
                <span className="text-sm text-slate-600">Новости платформы</span>
              </label>
            </div>

            <button 
              onClick={handleLogout}
              className="w-full py-3 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors border border-red-100"
            >
              Выйти из аккаунта
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}