import { Navigate } from 'react-router-dom';
import { isAuth } from '../../shared/auth';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAuth()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;