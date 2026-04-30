'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo, useRef } from 'react';
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

const DEV_BYPASS_CREDENTIALS = {
  vendor: {
    email: 'test.vendor@purple-soul.com',
    password: 'VendorTest123!',
  },
  admin: {
    email: 'fk.envcal@gmail.com',
    password: 'Admin123!',
  },
} as const;

interface AuthContextType {
  user: User | null;
  userId: string | null;
  userEmail: string | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ isAdmin: boolean }>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function createDevMockUser(email: string): User {
  return {
    id: email === DEV_BYPASS_CREDENTIALS.admin.email
      ? '00000000-0000-0000-0000-000000000001'
      : '00000000-0000-0000-0000-000000000002',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    email,
  } as User;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;
  console.log('🟡 AuthProvider render:', renderCountRef.current);

  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdminStatus = async (userId: string): Promise<boolean> => {
    try {
      const { data } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      return !!data;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
        }

        if (mounted) {
          if (session?.user) {
            const adminStatus = await checkAdminStatus(session.user.id);
            if (mounted) {
              setUser(session.user);
              setUserId(session.user.id);
              setUserEmail(session.user.email || null);
              setIsAdmin(adminStatus);
              setLoading(false);
            }
          } else {
            setUser(null);
            setUserId(null);
            setUserEmail(null);
            setIsAdmin(false);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setUser(null);
          setUserId(null);
          setUserEmail(null);
          setIsAdmin(false);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (!mounted) return;
        if (event === 'TOKEN_REFRESHED') {
          console.log('🟡 AuthContext: Ignoring TOKEN_REFRESHED event');
          return;
        }

        (async () => {
          if (!mounted) return;

          if (event === 'SIGNED_OUT') {
            setUser(null);
            setUserId(null);
            setUserEmail(null);
            setIsAdmin(false);
          } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
            if (session?.user) {
              const adminStatus = await checkAdminStatus(session.user.id);
              if (mounted) {
                setUser(session.user);
                setUserId(session.user.id);
                setUserEmail(session.user.email || null);
                setIsAdmin(adminStatus);
              }
            }
          }
        })();
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<{ isAdmin: boolean }> => {
    const isDev = process.env.NODE_ENV === 'development';
    const isDevAdminCreds =
      email === DEV_BYPASS_CREDENTIALS.admin.email &&
      password === DEV_BYPASS_CREDENTIALS.admin.password;
    const isDevVendorCreds =
      email === DEV_BYPASS_CREDENTIALS.vendor.email &&
      password === DEV_BYPASS_CREDENTIALS.vendor.password;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      if (isDev && (isDevAdminCreds || isDevVendorCreds)) {
        const mockUser = createDevMockUser(email);
        const adminStatus = isDevAdminCreds;
        setUser(mockUser);
        setUserId(mockUser.id);
        setUserEmail(mockUser.email || null);
        setIsAdmin(adminStatus);
        return { isAdmin: adminStatus };
      }

      throw error ?? new Error('No user returned from sign in');
    }

    const adminStatus = await checkAdminStatus(data.user.id);

    setUser(data.user);
    setUserId(data.user.id);
    setUserEmail(data.user.email || null);
    setIsAdmin(adminStatus);

    return { isAdmin: adminStatus };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login/vendor`
      }
    });

    if (error) throw error;

    if (data.user) {
      const { error: vendorError } = await supabase
        .from('vendors')
        .insert({
          user_id: data.user.id,
          business_name: email.split('@')[0],
          contact_email: email,
          status: 'pending',
          is_approved: false
        });

      if (vendorError) {
        console.error('Error creating vendor:', vendorError);
        throw vendorError;
      }
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();

    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('sb-')) {
        localStorage.removeItem(key);
      }
    });

    setUser(null);
    setUserId(null);
    setUserEmail(null);
    setIsAdmin(false);

    window.location.href = '/';
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  }, []);

  const value = useMemo(() => ({
    user,
    userId,
    userEmail,
    loading,
    isAdmin,
    signIn,
    signUp,
    signOut,
    resetPassword
  }), [user, userId, userEmail, loading, isAdmin, signIn, signUp, signOut, resetPassword]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
