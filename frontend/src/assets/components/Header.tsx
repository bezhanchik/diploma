// src/assets/components/Header.tsx
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { isAuth } from '../../shared/auth';
import { logout } from '../../store/authSlice';
import { useProfile } from '../../hooks/useProfile';


function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { data: user } = useProfile();

  function handleAvatarClick() {
    if (isAuth()) {
      navigate('/profile');
    } else {
      navigate('/login');
    }
  }

  function handleLogout() {
    queryClient.removeQueries({ queryKey: ['auth', 'me'] });
    dispatch(logout());
    navigate('/login', { replace: true });
  }

  const getInitials = () => {
    if (user?.first_name) return user.first_name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  const userName = user?.first_name
    ? `${user.first_name}${user.last_name ? ' ' + user.last_name : ''}`
    : user?.email?.split('@')[0] || 'Пользователь';

  return (
    <header className="flex items-center justify-between py-4 pl-16 pr-6 md:px-6 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-10">
      
      {/* Левая часть: Приветствие + Имя */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {isAuth() ? `Привет, ${userName}!` : 'Добро пожаловать'}
          </h1>
          <p className="text-sm text-slate-500 hidden sm:block">
            {isAuth() ? 'Готов к новым вызовам?' : 'Войди, чтобы начать'}
          </p>
        </div>
      </div>

      {/* Правая часть: Аватар + Выход */}
      <div className="flex items-center gap-4">
        {isAuth() && (
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
          >
            Выйти
          </button>
        )}

        <button
          onClick={handleAvatarClick}
          className="group relative w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all"
        >
          {getInitials()}
          
          {/* Подсказка при наведении */}
          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {isAuth() ? 'Профиль' : 'Войти'}
          </span>
        </button>
      </div>
    </header>
  );
}

export default Header;