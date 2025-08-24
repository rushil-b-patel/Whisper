import { useAuth } from './AuthContext';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const { user, authLoading } = useAuth();
  if (authLoading) {
    return <div>Loading...</div>;
  }
  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
}

function RedirectRoute({ children }) {
  const { user, authLoading } = useAuth();
  if (authLoading) {
    return (
      <div className="h-[40vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (user) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function VerifyEmailRoute({ children }) {
  const { user, authLoading } = useAuth();
  if (authLoading) {
    return <div>Loading...</div>;
  }
  if (user && !user.isVerified) {
    return children;
  }
  return <Navigate to="/" replace />;
}

export { ProtectedRoute, RedirectRoute, VerifyEmailRoute };
