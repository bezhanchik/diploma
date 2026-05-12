
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import Header from './Header';
import type { RootState } from '../../store/store';

function Layout() {
  const token = useSelector((state: RootState) => state.auth.token);

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 font-sans overflow-hidden">
      <Sidebar key={token ? 'auth' : 'guest'} />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <Header />

        <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <main className="animate-fade-in">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default Layout;