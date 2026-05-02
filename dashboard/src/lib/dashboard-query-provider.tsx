'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useState } from 'react';

function createDashboardQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 45_000,
        gcTime: 15 * 60_000,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
    },
  });
}

/** Server-state cache for dashboard API reads (shared across hooks / routes). */
export function DashboardQueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(createDashboardQueryClient);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
