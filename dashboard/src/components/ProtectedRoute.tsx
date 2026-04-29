import { ReactNode, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requireVendor?: boolean;
}

export function ProtectedRoute({ children, requireAdmin, requireVendor }: ProtectedRouteProps) {
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;
  console.log('🟣 ProtectedRoute render:', renderCountRef.current, { requireAdmin, requireVendor });

  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('🟣 ProtectedRoute: No user, redirecting to /');
    return <Navigate to="/" replace />;
  }

  if (requireAdmin && !isAdmin) {
    console.log('🟣 ProtectedRoute: Admin required but user is not admin, BLOCKING');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don't have permission to access the admin area.</p>
          <p className="text-sm text-gray-500">If you believe this is an error, please contact support.</p>
        </div>
      </div>
    );
  }

  if (requireVendor && isAdmin) {
    console.log('🟣 ProtectedRoute: Vendor required but user is admin, BLOCKING');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <h1 className="text-2xl font-bold text-blue-600 mb-4">Wrong Area</h1>
          <p className="text-gray-600 mb-6">This is the vendor area. As an admin, please use the admin dashboard.</p>
          <a
            href="/admin/dashboard"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Admin Dashboard
          </a>
        </div>
      </div>
    );
  }

  console.log('🟣 ProtectedRoute: Rendering children');
  return <>{children}</>;
}
