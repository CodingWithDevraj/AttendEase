import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  role?: 'admin' | 'staff';
}

const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const { isAuthenticated, currentUser } = useAuth();

  if (!isAuthenticated) {
    // Redirect to the appropriate login page based on the required role
    return <Navigate to={role === 'admin' ? '/admin-login' : '/staff-login'} replace />;
  }

  // If role is specified, check if user has the required role
  if (role && currentUser?.role !== role) {
    // Redirect to the appropriate dashboard based on user's role
    return <Navigate to={currentUser?.role === 'admin' ? '/admin' : '/staff'} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
