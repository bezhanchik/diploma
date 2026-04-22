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
    <header className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold">Добро пожаловать</h1>
      </div>

      <div className="flex items-center gap-3">
        {isAuth() && (
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl border border-slate-300"
          >
            Выйти
          </button>
        )}

        <button
          onClick={handleAvatarClick}
          className="w-12 h-12 rounded-full bg-slate-300 flex items-center justify-center hover:bg-slate-400 transition"
        >
        </button>
      </div>
    </header>
  );
}

export default Header;