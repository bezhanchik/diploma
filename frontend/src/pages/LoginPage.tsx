import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');

    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await fetch('http://127.0.0.1:8000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || 'Ошибка входа');
        return;
      }

      localStorage.setItem('token', data.access_token);
      navigate('/');
    } catch {
      setError('Не удалось подключиться к серверу');
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-2xl shadow">
      <h2 className="text-2xl font-bold mb-4">Вход</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          className="border rounded-xl px-4 py-3"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="border rounded-xl px-4 py-3"
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button className="bg-slate-900 text-white rounded-xl px-4 py-3">
          Войти
        </button>
        <a href="/register" className=''>Зарегистрироваться</a>
      </form>
    </div>
  );
}

export default LoginPage;