import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface CustomerProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  phone?: string;
  country?: string;
  language?: string;
  avatar_url?: string;
  role?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

interface CustomerAuthContextType {
  user: User | null;
  profile: CustomerProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<CustomerProfile>) => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

async function fetchCustomerProfile(userId: string): Promise<CustomerProfile | null> {
  try {
    console.log('[Auth] Fetching profile for:', userId);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('[Auth] Profile fetch error:', error);
      return null;
    }
    console.log('[Auth] Profile found:', data?.email);
    return data as CustomerProfile | null;
  } catch (e) {
    console.error('[Auth] Profile fetch exception:', e);
    return null;
  }
}

async function createCustomerProfile(authUser: User, fullName?: string) {
  try {
    console.log('[Auth] Creating profile for:', authUser.email);
    const { error } = await supabase
      .from('users')
      .upsert({
        id: authUser.id,
        email: authUser.email || '',
        full_name: fullName || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Customer',
        role: 'customer',
        status: 'pending',
      }, { onConflict: 'id' });

    if (error) {
      console.error('[Auth] Profile creation error:', error);
    } else {
      console.log('[Auth] Profile created successfully');
    }
  } catch (error) {
    console.error('[Auth] Profile creation exception:', error);
  }
}

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (authUser: User) => {
    console.log('[Auth] Loading profile...');
    let prof = await fetchCustomerProfile(authUser.id);
    if (!prof) {
      console.log('[Auth] No profile found, creating one...');
      await createCustomerProfile(authUser);
      prof = await fetchCustomerProfile(authUser.id);
    }
    console.log('[Auth] Profile loaded:', prof?.email);
    setProfile(prof);
  }, []);

  useEffect(() => {
    console.log('[Auth] Initializing auth...');
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('[Auth] Getting session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('[Auth] Session error:', sessionError);
        }

        if (mounted) {
          if (session?.user) {
            console.log('[Auth] User found:', session.user.email);
            setUser(session.user);
            await loadProfile(session.user);
          } else {
            console.log('[Auth] No session found');
            setUser(null);
            setProfile(null);
          }
          console.log('[Auth] Setting loading to false');
          setLoading(false);
        }
      } catch (error) {
        console.error('[Auth] Auth init error:', error);
        if (mounted) {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session: Session | null) => {
        console.log('[Auth] Auth state changed:', event);
        if (!mounted) return;
        if (event === 'TOKEN_REFRESHED') return;

        if (event === 'SIGNED_OUT') {
          console.log('[Auth] User signed out');
          setUser(null);
          setProfile(null);
          setLoading(false);
        } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          if (session?.user) {
            console.log('[Auth] User signed in:', session.user.email);
            setUser(session.user);
            await loadProfile(session.user);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    console.log('[Auth] Signing in:', email);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('[Auth] Sign in error:', error);
      throw error;
    }
    console.log('[Auth] Sign in successful');
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    console.log('[Auth] Signing up:', email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName || email.split('@')[0] },
        emailRedirectTo: `${window.location.origin}/#/account/dashboard`,
      },
    });

    if (error) {
      console.error('[Auth] Sign up error:', error);
      throw error;
    }

    console.log('[Auth] Sign up successful');

    if (data.user) {
      await createCustomerProfile(data.user, fullName);
    }
  }, []);

  const signOut = useCallback(async () => {
    console.log('[Auth] Signing out');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setProfile(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/#/account/security`,
    });
    if (error) throw error;
  }, []);

  const updateProfile = useCallback(async (data: Partial<CustomerProfile>) => {
    console.log('[Auth] Updating profile:', data);
    if (!user) throw new Error('Not authenticated');

    try {
      const { error } = await supabase
        .from('users')
        .update(data)
        .eq('id', user.id);

      if (error) {
        console.error('[Auth] Profile update error:', error);
        throw error;
      }

      console.log('[Auth] Profile updated successfully');

      if (data.full_name) {
        await supabase.auth.updateUser({ data: { full_name: data.full_name } });
      }

      setProfile(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      console.error('[Auth] Profile update exception:', error);
      throw error;
    }
  }, [user]);

  const value = useMemo<CustomerAuthContextType>(() => {
    const val = {
      user,
      profile,
      loading,
      isAuthenticated: !!user,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updateProfile,
    };
    console.log('[Auth] Context value:', { 
      hasUser: !!user, 
      hasProfile: !!profile, 
      loading, 
      isAuthenticated: !!user 
    });
    return val;
  }, [user, profile, loading, signIn, signUp, signOut, resetPassword, updateProfile]);

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (context === undefined) {
    console.error('[Auth] useCustomerAuth called outside provider!');
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
}
