// src/pages/ProfilePage.tsx
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { logout } from '../store/authSlice';
import { useProfile, useUserStats, useUpdateProfile } from '../hooks/useProfile';


export default function ProfilePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', lastName: '' });

  const [notifications, setNotifications] = useState({
    email: true,
    news: true,
  });

  const { data: user, isLoading: userLoading, error: userError } = useProfile();
  const { data: stats, isLoading: statsLoading } = useUserStats();
  const updateProfileMutation = useUpdateProfile();

  const queryClient = useQueryClient();

  const handleLogout = () => {
    queryClient.removeQueries({ queryKey: ['auth', 'me'] });
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const handleSave = () => {
    updateProfileMutation.mutate(
      { first_name: formData.firstName, last_name: formData.lastName },
      { onSuccess: () => setIsEditing(false) },
    );
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
              onClick={() => {
                setFormData({ firstName: user?.first_name ?? '', lastName: user?.last_name ?? '' });
                setIsEditing(true);
              }}
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
                  value={isEditing ? formData.firstName : (user?.first_name ?? '')}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Фамилия</label>
                <input
                  type="text"
                  value={isEditing ? formData.lastName : (user?.last_name ?? '')}
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
                value={user?.email ?? ''}
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