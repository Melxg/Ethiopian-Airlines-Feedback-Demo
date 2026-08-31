import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';

type UserRole = 'passenger' | 'agent';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: UserRole;
}

export function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/');
      return;
    }

    if (allowedRole && user && user.role !== allowedRole) {
      // Redirect to appropriate dashboard based on user's actual role
      setLocation(user.role === 'agent' ? '/agent' : '/passenger');
    }
  }, [isAuthenticated, user, allowedRole, setLocation]);

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRole && user?.role !== allowedRole) {
    return null;
  }

  return <>{children}</>;
}
