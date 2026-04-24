import { Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from './store/store';
import Layout from './assets/components/Layout';
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './assets/components/ProtectedRoute';
import PublicOnlyRoute from './assets/components/PublicOnlyRoute';
import AdminPage from './pages/AdminPage';
import AdminRoute from './assets/components/AdminRoute';
import DevTools from './assets/components/DevTools';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 минут кеширования
      retry: 1,
    },
  },
});

function TeamsPage() {
  return <h2 className="text-2xl font-bold">Команды</h2>;
}

function CasesPage() {
  return <h2 className="text-2xl font-bold">Кейсы</h2>;
}

function SchedulePage() {
  return <h2 className="text-2xl font-bold">Расписание</h2>;
}

function AnalyticsPage() {
  return <h2 className="text-2xl font-bold">Аналитика</h2>;
}

function NotFoundPage() {
  return <h2 className="text-2xl font-bold">404 — Страница не найдена</h2>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="teams" element={<TeamsPage />} />
        <Route path="cases" element={<CasesPage />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="analytics" element={<AnalyticsPage />} />

        <Route
          path="login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="my-events"
          element={
            <ProtectedRoute>
              <EventsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppRoutes />
         {/* <DevTools />  */}
          {/* <ReactQueryDevtools initialIsOpen={false} /> Официальные девтулзы */}
      </QueryClientProvider>
    </Provider>
  );
}