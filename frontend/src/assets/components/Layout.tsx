// src/assets/components/Layout.tsx
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import SearchBar from './SearchBar';

function Layout() {
  const location = useLocation();
  const hideSearchBar = ['/', '/login', '/register'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 font-sans">
      <Sidebar />

      {/* Основной контент */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-64">
        <Header />

        <div className="flex-1 flex flex-col px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full gap-8">
          {!hideSearchBar && <SearchBar />}
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default Layout;