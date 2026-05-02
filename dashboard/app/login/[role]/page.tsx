import { Suspense } from 'react';
import { PublicRoute } from '@/src/components/PublicRoute';
import { Auth } from '@/src/components/Auth';

export default function LoginRolePage() {
  return (
    <PublicRoute>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500">Loading…</div>}>
        <Auth />
      </Suspense>
    </PublicRoute>
  );
}
