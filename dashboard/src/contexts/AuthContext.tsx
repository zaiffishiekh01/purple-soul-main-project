'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut, useSession } from 'next-auth/react';
import { dashboardClient } from '../lib/data-client';

type User = { id: string; email?: string | null };

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

/** NextAuth v5 returns opaque error codes (e.g. CredentialsSignin) when credentials fail. */
function messageForSignInError(code: string | undefined): string {
  if (!code) return 'Sign-in failed. Please try again.';
  if (code === 'CredentialsSignin') {
    return 'Invalid email or password.';
  }
  return 'Sign-in failed. Please try again.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status, update } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdminStatus = useCallback(async (uid: string): Promise<boolean> => {
    try {
      const { data } = await dashboardClient.from('admin_users').select('id').eq('user_id', uid).maybeSingle();
      return !!data;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const sync = async () => {
      if (status === 'loading') {
        return;
      }

      if (status === 'unauthenticated' || !session?.user?.id) {
        if (!cancelled) {
          setUser(null);
          setUserId(null);
          setUserEmail(null);
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }

      const uid = session.user.id;
      const email = session.user.email ?? null;
      const adminStatus = await checkAdminStatus(uid);

      if (!cancelled) {
        setUser({ id: uid, email });
        setUserId(uid);
        setUserEmail(email);
        setIsAdmin(adminStatus);
        setLoading(false);
      }
    };

    void sync();
    return () => {
      cancelled = true;
    };
  }, [session, status, checkAdminStatus]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<{ isAdmin: boolean }> => {
      const result = await nextAuthSignIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(messageForSignInError(result.error));
      }

      await update();

      const { data: sessionData } = await dashboardClient.auth.getSession();
      const uid = sessionData.session?.user?.id;
      if (!uid) {
        throw new Error('Sign-in succeeded but no session was returned.');
      }

      const adminStatus = await checkAdminStatus(uid);
      setUser({ id: uid, email: sessionData.session?.user.email ?? email });
      setUserId(uid);
      setUserEmail(sessionData.session?.user.email ?? email);
      setIsAdmin(adminStatus);

      return { isAdmin: adminStatus };
    },
    [checkAdminStatus, update],
  );

  const signUp = useCallback(async (email: string, password: string) => {
    const { data, error } = await dashboardClient.auth.signUp({ email, password });
    if (error) throw new Error(error.message);
    if (!data?.user?.id) {
      throw new Error('Sign up did not return a user. Please try again.');
    }
  }, []);

  const signOut = useCallback(async () => {
    await nextAuthSignOut({ redirect: false });
    setUser(null);
    setUserId(null);
    setUserEmail(null);
    setIsAdmin(false);
    window.location.href = '/';
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await dashboardClient.auth.resetPasswordForEmail(email);
  }, []);

  const value = useMemo(
    () => ({
      user,
      userId,
      userEmail,
      loading,
      isAdmin,
      signIn,
      signUp,
      signOut,
      resetPassword,
    }),
    [user, userId, userEmail, loading, isAdmin, signIn, signUp, signOut, resetPassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
