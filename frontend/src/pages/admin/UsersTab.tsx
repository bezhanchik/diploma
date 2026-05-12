import { useState } from 'react';
import { useAllUsers, useMakeAdmin, useRemoveAdmin } from '../../hooks/useUsers';
import { useProfile } from '../../hooks/useProfile';

export default function UsersTab() {
  const [search, setSearch] = useState('');
  const { data: users = [], isLoading } = useAllUsers();
  const { data: currentUser } = useProfile();
  const makeAdminMutation = useMakeAdmin();
  const removeAdminMutation = useRemoveAdmin();

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      `${u.first_name ?? ''} ${u.last_name ?? ''}`.toLowerCase().includes(q)
    );
  });

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Поиск + счётчик */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Поиск по имени или email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72 outline-none text-sm text-slate-700 placeholder-slate-400"
          />
        </div>
        <span className="text-sm text-slate-400 shrink-0">{filtered.length} из {users.length}</span>
      </div>

      {/* Таблица */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center py-12 text-slate-400">Пользователи не найдены</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide bg-slate-50">
                  <th className="px-6 py-3">Пользователь</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Роль</th>
                  <th className="px-4 py-3">Дата регистрации</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((user) => {
                  const initials = user.first_name
                    ? user.first_name.charAt(0).toUpperCase()
                    : user.email.charAt(0).toUpperCase();
                  const isAdminUser = user.role === 'admin';
                  const isSelf = user.id === currentUser?.id;
                  const isPending =
                    (makeAdminMutation.isPending && makeAdminMutation.variables === user.id) ||
                    (removeAdminMutation.isPending && removeAdminMutation.variables === user.id);

                  return (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${isAdminUser ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : 'bg-gradient-to-br from-indigo-400 to-indigo-600'}`}>
                            {initials}
                          </div>
                          <span className="font-medium text-slate-900">
                            {user.first_name
                              ? `${user.first_name} ${user.last_name ?? ''}`.trim()
                              : '—'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${isAdminUser ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                          {isAdminUser ? 'Администратор' : 'Пользователь'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{fmt(user.created_at)}</td>
                      <td className="px-4 py-3">
                        {!isSelf && (
                          <button
                            disabled={isPending}
                            onClick={() => {
                              if (isAdminUser) {
                                removeAdminMutation.mutate(user.id);
                              } else {
                                makeAdminMutation.mutate(user.id);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                              isAdminUser
                                ? 'bg-red-50 border border-red-100 text-red-600 hover:bg-red-100'
                                : 'bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-100'
                            }`}
                          >
                            {isPending ? '...' : isAdminUser ? 'Снять права' : 'Сделать админом'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
