import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import SearchBar from './SearchBar';

function Layout() {
  const location = useLocation();

  const hideSearchBar =
    location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-h-screen bg-slate-100 flex text-slate-800">
      <Sidebar />

      <main className="flex-1 p-8">
        <Header />
        {!hideSearchBar && <SearchBar />}
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;