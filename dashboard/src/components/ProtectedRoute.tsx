'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requireVendor?: boolean;
}

export function ProtectedRoute({ children, requireAdmin, requireVendor }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();
  const shouldRedirectToRoot = !loading && !user;

  useEffect(() => {
    if (shouldRedirectToRoot) {
      router.replace('/');
    }
  }, [router, shouldRedirectToRoot]);

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

  if (shouldRedirectToRoot) {
    return null;
  }

  if (requireAdmin && !isAdmin) {
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

  return <>{children}</>;
}
