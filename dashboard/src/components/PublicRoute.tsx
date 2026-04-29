'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

interface PublicRouteProps {
  children: ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();
  const shouldRedirect = !!user;

  useEffect(() => {
    if (shouldRedirect) {
      router.replace(isAdmin ? '/admin/dashboard' : '/vendor/dashboard');
    }
  }, [isAdmin, router, shouldRedirect]);

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

  if (shouldRedirect) {
    return null;
  }

  return <>{children}</>;
}
