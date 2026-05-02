'use client';

import { SessionProvider } from 'next-auth/react';
import type { ReactNode } from 'react';
import { AuthProvider } from '@/src/contexts/AuthContext';
import { ToastProvider } from '@/src/components/Toast';
import { DashboardQueryProvider } from '@/src/lib/dashboard-query-provider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <DashboardQueryProvider>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </DashboardQueryProvider>
    </SessionProvider>
  );
}
