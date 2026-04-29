import { useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function DebugRenderTest() {
  const countRef = useRef(0);
  countRef.current += 1;

  const { user, loading, isAdmin } = useAuth();

  console.log('🔍 DEBUG RENDER COUNT:', countRef.current);
  console.log('🔍 DEBUG AUTH STATE:', { hasUser: !!user, loading, isAdmin });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Debug Page</h1>
        <div className="space-y-2 text-sm">
          <p className="font-mono">
            <span className="font-semibold">Render Count:</span> {countRef.current}
          </p>
          <p className="font-mono">
            <span className="font-semibold">Loading:</span> {loading ? 'true' : 'false'}
          </p>
          <p className="font-mono">
            <span className="font-semibold">Has User:</span> {user ? 'true' : 'false'}
          </p>
          <p className="font-mono">
            <span className="font-semibold">Is Admin:</span> {isAdmin ? 'true' : 'false'}
          </p>
          <p className="font-mono">
            <span className="font-semibold">User ID:</span> {user?.id || 'null'}
          </p>
        </div>
        <div className="mt-6 text-xs text-gray-500">
          This page should render exactly ONCE after loading completes.
          Check browser console for render logs.
        </div>
      </div>
    </div>
  );
}
