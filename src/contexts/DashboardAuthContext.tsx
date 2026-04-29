import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo, useRef } from 'react';
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { DashboardUser, DashboardUserRole, Vendor, AdminUser, AdminPermissions } from '../types/dashboard';

interface DashboardAuthContextType {
  user: User | null;
  userId: string | null;
  userEmail: string | null;
  loading: boolean;
  dashboardUser: DashboardUser | null;
  role: DashboardUserRole | null;
  isVendor: boolean;
  isAdmin: boolean;
  vendor: Vendor | null;
  admin: AdminUser | null;
  permissions: AdminPermissions | null;
  signIn: (email: string, password: string) => Promise<DashboardUser>;
  signUp: (email: string, password: string, vendorData?: Partial<Vendor>) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const DashboardAuthContext = createContext<DashboardAuthContextType | undefined>(undefined);

async function fetchVendorProfile(userId: string): Promise<Vendor | null> {
  try {
    const { data } = await supabase
      .from('vendors')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    return data as Vendor | null;
  } catch {
    return null;
  }
}

async function fetchAdminProfile(userId: string): Promise<AdminUser | null> {
  try {
    const { data } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    return data as AdminUser | null;
  } catch {
    return null;
  }
}

function buildDashboardUser(
  authUser: User,
  vendor: Vendor | null,
  admin: AdminUser | null,
): DashboardUser {
  const isVendor = vendor !== null;
  const isAdmin = admin !== null;
  const role: DashboardUserRole = isAdmin ? 'admin' : isVendor ? 'vendor' : 'vendor';

  return {
    role,
    id: isAdmin ? admin!.id : isVendor ? vendor!.id : '',
    user_id: authUser.id,
    email: authUser.email || '',
    vendor,
    admin,
    permissions: admin?.permissions ?? null,
  };
}

export function DashboardAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardUser, setDashboardUser] = useState<DashboardUser | null>(null);

  const loadProfiles = useCallback(async (authUser: User) => {
    const [vendor, admin] = await Promise.all([
      fetchVendorProfile(authUser.id),
      fetchAdminProfile(authUser.id),
    ]);

    const dsUser = buildDashboardUser(authUser, vendor, admin);
    setDashboardUser(dsUser);
    return dsUser;
  }, []);

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
            setUser(session.user);
            setUserId(session.user.id);
            setUserEmail(session.user.email || null);
            await loadProfiles(session.user);
            setLoading(false);
          } else {
            setUser(null);
            setUserId(null);
            setUserEmail(null);
            setDashboardUser(null);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setUser(null);
          setUserId(null);
          setUserEmail(null);
          setDashboardUser(null);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (!mounted) return;
        if (event === 'TOKEN_REFRESHED') return;

        (async () => {
          if (!mounted) return;

          if (event === 'SIGNED_OUT') {
            setUser(null);
            setUserId(null);
            setUserEmail(null);
            setDashboardUser(null);
          } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
            if (session?.user) {
              setUser(session.user);
              setUserId(session.user.id);
              setUserEmail(session.user.email || null);
              await loadProfiles(session.user);
            }
          }
        })();
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfiles]);

  const signIn = useCallback(async (email: string, password: string): Promise<DashboardUser> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('No user returned from sign in');

    setUser(data.user);
    setUserId(data.user.id);
    setUserEmail(data.user.email || null);

    const dsUser = await loadProfiles(data.user);
    return dsUser;
  }, [loadProfiles]);

  const signUp = useCallback(async (
    email: string,
    password: string,
    vendorData?: Partial<Vendor>,
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login/vendor`,
      },
    });

    if (error) throw error;

    if (data.user) {
      const vendorInsert = {
        user_id: data.user.id,
        business_name: vendorData?.business_name || email.split('@')[0],
        business_type: vendorData?.business_type || '',
        contact_email: email,
        contact_phone: vendorData?.contact_phone || '',
        address: vendorData?.address || {},
        tax_id: vendorData?.tax_id || '',
        status: 'pending',
        logo_url: vendorData?.logo_url || '',
        is_approved: false,
      };

      const { error: vendorError } = await supabase
        .from('vendors')
        .insert(vendorInsert);

      if (vendorError) {
        console.error('Error creating vendor:', vendorError);
        throw vendorError;
      }
    }
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    setUser(null);
    setUserId(null);
    setUserEmail(null);
    setDashboardUser(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  }, []);

  const value = useMemo<DashboardAuthContextType>(() => ({
    user,
    userId,
    userEmail,
    loading,
    dashboardUser,
    role: dashboardUser?.role ?? null,
    isVendor: dashboardUser?.role === 'vendor',
    isAdmin: dashboardUser?.role === 'admin',
    vendor: dashboardUser?.vendor ?? null,
    admin: dashboardUser?.admin ?? null,
    permissions: dashboardUser?.permissions ?? null,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }), [user, userId, userEmail, loading, dashboardUser, signIn, signUp, signOut, resetPassword]);

  return (
    <DashboardAuthContext.Provider value={value}>
      {children}
    </DashboardAuthContext.Provider>
  );
}

export function useDashboardAuth() {
  const context = useContext(DashboardAuthContext);
  if (context === undefined) {
    throw new Error('useDashboardAuth must be used within a DashboardAuthProvider');
  }
  return context;
}
