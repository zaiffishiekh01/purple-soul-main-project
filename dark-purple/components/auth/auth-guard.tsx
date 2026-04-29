'use client';

import { useState, useEffect } from 'react';
import { useAPIAuth } from '@/lib/auth/api-context';
import { AuthModalEnhanced } from './auth-modal-enhanced';
import { Loader as Loader2, Lock } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAPIAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const devBypassAuth = process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true';

  useEffect(() => {
    if (devBypassAuth) {
      return;
    }
    if (!loading && !user) {
      setShowAuthModal(true);
    } else if (!loading && user) {
      setShowAuthModal(false);
    }
  }, [user, loading, devBypassAuth]);

  if (devBypassAuth) {
    return (
      <div className="relative">
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black text-center py-1 text-xs font-medium">
          DEV MODE: Authentication Bypassed
        </div>
        <div className="pt-6">
          {children}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-white/60 animate-spin mx-auto" />
          <p className="text-white/60 font-light">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <AuthModalEnhanced open={showAuthModal} onOpenChange={setShowAuthModal} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="glass-card p-12 max-w-md text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8 text-white/60" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-serif text-white">Authentication Required</h2>
              <p className="text-white/60 font-light">
                Please sign in to access your account
              </p>
            </div>
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full px-6 py-3 rounded-lg bg-white/10 border border-white/30 text-white hover:bg-white/20 hover:border-white/40 transition-all duration-300 font-light"
            >
              Sign In
            </button>
          </div>
        </div>
      </>
    );
  }

  return <>{children}</>;
}
