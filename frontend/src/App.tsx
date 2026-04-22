import { Routes, Route } from 'react-router-dom';
import Layout from './assets/components/Layout';
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './assets/components/ProtectedRoute';
import PublicOnlyRoute from './assets/components/PublicOnlyRoute';
import AdminPage from './pages/AdminPage';
import AdminRoute from './assets/components/AdminRoute';

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

export default function App() {
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