import { useState, useEffect } from 'react';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import UserAccount from './UserAccount';
import AuthModal from './AuthModal';

interface UserAccountWrapperProps {
  cart: any[];
  userPreferences: any;
  onNavigate: (view: string) => void;
}

export default function UserAccountWrapper({ cart, userPreferences, onNavigate }: UserAccountWrapperProps) {
  const auth = useCustomerAuth();
  const [showAuth, setShowAuth] = useState(!auth.isAuthenticated);

  useEffect(() => {
    console.log('[UserAccountWrapper] Auth state:', {
      hasUser: !!auth.user,
      isAuthenticated: auth.isAuthenticated,
      loading: auth.loading,
      hasProfile: !!auth.profile,
      userEmail: auth.user?.email,
    });

    setShowAuth(!auth.isAuthenticated && !auth.loading);
  }, [auth.user, auth.isAuthenticated, auth.loading, auth.profile]);

  if (auth.loading) {
    console.log('[UserAccountWrapper] Showing loading...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-purple-950/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    console.log('[UserAccountWrapper] Showing auth modal');
    return (
      <AuthModal
        onClose={() => onNavigate("home")}
        onSuccess={() => setShowAuth(false)}
      />
    );
  }

  console.log('[UserAccountWrapper] Showing UserAccount');
  return (
    <UserAccount
      cart={cart}
      userPreferences={userPreferences}
      onNavigate={onNavigate}
    />
  );
}
