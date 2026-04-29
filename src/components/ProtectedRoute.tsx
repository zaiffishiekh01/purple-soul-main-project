import { ReactNode } from 'react';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  onRequireAuth: () => void;
}

export function ProtectedRoute({ children, onRequireAuth }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useCustomerAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2D1B4E] to-[#1a0b2e]">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    onRequireAuth();
    return null;
  }

  return <>{children}</>;
}
