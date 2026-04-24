import { useSelector, useDispatch } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import type { RootState } from '../../store/store';
import { setAdmin, setToken, logout } from '../../store/authSlice';
import { apiClient } from '../../api/client';

export default function DevTools() {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);
  
  // Тест TanStack Query
  const { data: pingData, isLoading: pingLoading } = useQuery({
    queryKey: ['ping'],
    queryFn: async () => {
      const { data } = await apiClient.get('/ping');
      return data;
    },
  });

  // Тест админ-чека
  const { data: adminData } = useQuery({
    queryKey: ['adminCheck'],
    queryFn: async () => {
      const { data } = await apiClient.get('/auth/admin-check');
      return data;
    },
    enabled: !!auth.token, // Только если есть токен
  });

  return (
    <div className="fixed bottom-4 right-4 bg-slate-800 text-white p-4 rounded-lg text-xs font-mono z-50">
      <h3 className="font-bold mb-2">🛠 DevTools</h3>
      
      {/* Redux State */}
      <div className="mb-2">
        <p className="text-green-400">Redux:</p>
        <p>Token: {auth.token ? '✅ Есть' : '❌ Нет'}</p>
        <p>isAdmin: {auth.isAdmin ? '✅ Да' : '❌ Нет'}</p>
        <p>Loading: {auth.isLoading ? '⏳ Да' : '✅ Готово'}</p>
      </div>

      {/* TanStack Query */}
      <div className="mb-2">
        <p className="text-blue-400">TanStack Query:</p>
        <p>Ping: {pingLoading ? '⏳' : pingData?.ok ? '✅ OK' : '❌'}</p>
        <p>Admin API: {adminData?.is_admin ? '✅ Админ' : '❌ Не админ'}</p>
      </div>

      {/* Кнопки тестирования */}
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => {
            dispatch(setToken('test_token_123'));
            dispatch(setAdmin(true));
          }}
          className="bg-green-600 px-2 py-1 rounded hover:bg-green-500"
        >
          Стать админом
        </button>
        <button
          onClick={() => dispatch(logout())}
          className="bg-red-600 px-2 py-1 rounded hover:bg-red-500"
        >
          Выйти
        </button>
      </div>
    </div>
  );
}