import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
  });

  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://127.0.0.1:8000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || 'Ошибка регистрации');
        return;
      }

      setSuccess('Аккаунт создан, теперь можно войти');
      setTimeout(() => {
        navigate('/login', {replace: true});
      }, 800);
    } catch {
      setError('Не удалось подключиться к серверу');
    }
  }
  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-2xl shadow">
      <h2 className="text-2xl font-bold mb-4">Регистрация</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          className="border rounded-xl px-4 py-3"
          type="text"
          placeholder="Имя"
          value={form.first_name}
          onChange={(e) => setForm({ ...form, first_name: e.target.value })}
          required
        />

        <input
          className="border rounded-xl px-4 py-3"
          type="text"
          placeholder="Фамилия"
          value={form.last_name}
          onChange={(e) => setForm({ ...form, last_name: e.target.value })}
          required
        />

        <input
          className="border rounded-xl px-4 py-3"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />

        <input
          className="border rounded-xl px-4 py-3"
          type="password"
          placeholder="Пароль"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}

        <button className="bg-slate-900 text-white rounded-xl px-4 py-3">
          Зарегистрироваться
        </button>
      </form>
    </div>
  );
}

export default RegisterPage;