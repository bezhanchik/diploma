
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import SearchBar from './SearchBar';

function Layout() {
  const location = useLocation();
  // Скрываем поиск на главной, логине и регистрации
  const hideSearchBar = ['/', '/login', '/register'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 font-sans overflow-hidden">
      
      {/* Сайдбар: занимает свое место в потоке */}
      <Sidebar />

      {/* Правая часть: растягивается на всю оставшуюся ширину */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        <Header />

        {/* Контейнер контента с ограничениями ширины */}
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Поиск с отступом снизу */}
          {!hideSearchBar && (
            <div className="mb-8">
              <SearchBar />
            </div>
          )}

          <main className="animate-fade-in">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default Layout;