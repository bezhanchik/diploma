import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://127.0.0.1:8000';

function AdminRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setError('Сначала войдите в систему');
      setLoading(false);
      setTimeout(() => navigate('/login', { replace: true }), 1200);
      return;
    }

    fetch(`${API_URL}/auth/admin-check`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.status === 403) {
          setError('У вас нет доступа к админ-панели');
          setTimeout(() => navigate('/', { replace: true }), 1200);
          return;
        }

        if (response.ok) {
          setIsAdmin(true);
          return;
        }

        setError('Ошибка проверки доступа');
        setTimeout(() => navigate('/', { replace: true }), 1200);
      })
      .catch(() => {
        setError('Не удалось проверить доступ');
        setTimeout(() => navigate('/', { replace: true }), 1200);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  if (loading) {
    return <div className="p-6">Загрузка...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return <>{children}</>;
}

export default AdminRoute;