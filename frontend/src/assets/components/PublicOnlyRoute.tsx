import { Navigate } from 'react-router-dom';
import { isAuth } from '../../shared/auth';

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  if (isAuth()) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default PublicOnlyRoute; 