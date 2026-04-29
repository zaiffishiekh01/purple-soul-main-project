'use client';

import { createContext, useContext, useEffect, useState, useRef, useCallback, ReactNode } from 'react';
import { apiClient, APIError } from '@/lib/api/client';
import { supabase } from '@/lib/supabase/client';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  roles: string[];
  permissions: Array<{ resource: string; action: string }>;
  status: string;
}

interface APIAuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: APIError | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: APIError | null }>;
  signOut: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasPermission: (resource: string, action: string) => boolean;
  signInWithOAuth?: (provider: string) => Promise<{ error: APIError | null }>;
  signInWithOTP?: (email: string) => Promise<{ error: APIError | null }>;
  verifyOTP?: (email: string, token: string) => Promise<{ error: APIError | null }>;
  enrollMFA?: () => Promise<{ error: APIError | null; data?: any }>;
  verifyMFA?: (code: string) => Promise<{ error: APIError | null }>;
}

const APIAuthContext = createContext<APIAuthContextType | undefined>(undefined);

function supabaseUserToUser(supabaseUser: any): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    fullName: supabaseUser.user_metadata?.full_name || 'User',
    role: 'customer',
    roles: ['customer'],
    permissions: [],
    status: 'active',
  };
}

export function APIAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const currentUserId = useRef<string | null>(null);
  const initialized = useRef(false);

  const updateUser = useCallback((supabaseUser: any | null) => {
    const newId = supabaseUser?.id ?? null;
    if (newId === currentUserId.current) return;
    currentUserId.current = newId;
    setUser(supabaseUser ? supabaseUserToUser(supabaseUser) : null);
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const devBypassAuth = process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true';
    if (devBypassAuth) {
      const devEmail = process.env.NEXT_PUBLIC_DEV_USER_EMAIL || 'dev@test.com';
      const devRole = process.env.NEXT_PUBLIC_DEV_USER_ROLE || 'customer';
      currentUserId.current = 'dev-bypass-id';
      setUser({
        id: 'dev-bypass-id',
        email: devEmail,
        fullName: 'Dev User (Bypass)',
        role: devRole,
        roles: [devRole],
        permissions: [],
        status: 'active',
      });
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') {
        updateUser(session?.user ?? null);
        setLoading(false);
      } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        updateUser(session?.user ?? null);
      } else if (event === 'SIGNED_OUT') {
        updateUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [updateUser]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        updateUser(data.user);
        return { error: null };
      }
      return { error: new APIError('Login failed', 401) };
    } catch (error: any) {
      return { error: new APIError(error.message || 'Login failed', 401) };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) throw error;
      if (data.user) {
        updateUser(data.user);
        return { error: null };
      }
      return { error: new APIError('Signup failed', 400) };
    } catch (error: any) {
      return { error: new APIError(error.message || 'Signup failed', 400) };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      updateUser(null);
    }
  };

  const hasRole = (role: string): boolean => user?.roles?.includes(role) ?? false;

  const hasPermission = (resource: string, action: string): boolean =>
    user?.permissions?.some((p) => p.resource === resource && p.action === action) ?? false;

  return (
    <APIAuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        hasRole,
        hasPermission,
        signInWithOAuth: async () => ({ error: new APIError('OAuth not implemented', 501) }),
        signInWithOTP: async () => ({ error: new APIError('OTP not implemented', 501) }),
        verifyOTP: async () => ({ error: new APIError('OTP verification not implemented', 501) }),
        enrollMFA: async () => ({ error: new APIError('MFA enrollment not implemented', 501) }),
        verifyMFA: async () => ({ error: new APIError('MFA verification not implemented', 501) }),
      }}
    >
      {children}
    </APIAuthContext.Provider>
  );
}

export function useAPIAuth() {
  const context = useContext(APIAuthContext);
  if (context === undefined) {
    throw new Error('useAPIAuth must be used within an APIAuthProvider');
  }
  return context;
}
