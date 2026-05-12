
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
import CasesPage from './pages/CasesPage';
import ProfilePage from './pages/ProfilePage';
import TeamsPage from './pages/TeamsPage';
import SchedulePage from './pages/SchedulePage';
import AnalyticsPage from './pages/AnalyticsPage';
import EventDetailPage from './pages/EventDetailPage';
import CaseDetailPage from './pages/CaseDetailPage';
import TeamDetailPage from './pages/TeamDetailPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});


function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <h2 className="text-2xl font-bold text-slate-800">404 — Страница не найдена</h2>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* ✅ ВСЕ страницы теперь внутри Layout */}
      <Route element={<Layout />}>
        <Route index element={<HomePage />} /> {/* Главная здесь */}
        <Route path="events" element={<EventsPage />} />
        <Route path="events/:id" element={<EventDetailPage />} />
        <Route path="teams" element={<TeamsPage />} />
        <Route path="teams/:id" element={<TeamDetailPage />} />
        <Route path="cases" element={<CasesPage />} />
        <Route path="cases/:id" element={<CaseDetailPage />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route 
        path="profile" 
        element={
          <ProtectedRoute> {/* Только для авторизованных */}
            <ProfilePage />
          </ProtectedRoute>
        } 
        />

        <Route path="login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
        <Route path="my-events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
        <Route path="admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
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
      </QueryClientProvider>
    </Provider>
  );
}