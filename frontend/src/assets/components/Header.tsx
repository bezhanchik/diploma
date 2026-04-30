// src/assets/components/Header.tsx
import { useNavigate } from 'react-router-dom';
import { isAuth, logout } from '../../shared/auth';

function Header() {
  const navigate = useNavigate();

  function handleAvatarClick() {
    if (isAuth()) {
      navigate('/events');
    } else {
      navigate('/login');
    }
  }

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="flex items-center justify-between py-4 border-b border-slate-200 bg-white sticky top-0 z-10">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Добро пожаловать</h1>
      </div>

      <div className="flex items-center gap-3">
        {isAuth() && (
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-medium hover:bg-slate-50 transition"
          >
            Выйти
          </button>
        )}

        <button
          onClick={handleAvatarClick}
          className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center hover:bg-slate-300 transition text-slate-600 font-bold"
        >
          U
        </button>
      </div>
    </header>
  );
}

export default Header;