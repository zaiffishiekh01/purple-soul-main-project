import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface AdminPermissions {
  vendor_management: boolean;
  order_management: boolean;
  product_management: boolean;
  finance_management: boolean;
  analytics_monitoring: boolean;
  is_super_admin: boolean;
  role?: string;
}

export interface AdminUser {
  id: string;
  user_id: string;
  email?: string;
  role: string;
  permissions: AdminPermissions;
  is_super_admin: boolean;
  created_at: string;
}

export function useAdminPermissions() {
  const [permissions, setPermissions] = useState<AdminPermissions>({
    vendor_management: false,
    order_management: false,
    product_management: false,
    finance_management: false,
    analytics_monitoring: false,
    is_super_admin: false,
    role: undefined,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      console.log('🔍 Fetching admin permissions...');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('⚠️ No user found, skipping permissions fetch');
        return;
      }

      console.log('👤 User ID:', user.id);

      const { data, error } = await supabase.rpc('get_admin_permissions', {
        p_user_id: user.id
      });

      if (error) {
        console.error('❌ Error from get_admin_permissions RPC:', error);
        throw error;
      }

      console.log('✅ Admin permissions loaded:', data);

      if (data) {
        setPermissions(data as AdminPermissions);
      } else {
        console.warn('⚠️ get_admin_permissions returned null data');
      }
    } catch (error: any) {
      console.error('❌ Error fetching admin permissions:', error);
      console.error('Error details:', error.message || error);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permission: keyof AdminPermissions): boolean => {
    if (permissions.is_super_admin) return true;
    return permissions[permission] === true;
  };

  const hasAnyPermission = (perms: Array<keyof AdminPermissions>): boolean => {
    if (permissions.is_super_admin) return true;
    return perms.some(p => permissions[p] === true);
  };

  return {
    permissions,
    loading,
    hasPermission,
    hasAnyPermission,
    isSuperAdmin: permissions.is_super_admin,
    isAdmin: permissions.is_super_admin || Object.values(permissions).some(p => p === true),
  };
}

export function useAdminManagement() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const { data: adminUsers, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (adminError) throw adminError;

      setAdmins(adminUsers as AdminUser[] || []);
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAdmin = async (email: string, password: string, roleName: string, permissions: Partial<AdminPermissions>) => {
    try {
      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        throw new Error('Not authenticated. Please sign in again.');
      }

      const currentUserId = session.user.id;
      const originalSession = {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      };

      console.log('🔍 Checking if current user is super admin...');
      
      // Check if current user is super admin
      const { data: currentAdmin, error: adminCheckError } = await supabase
        .from('admin_users')
        .select('is_super_admin, role')
        .eq('user_id', currentUserId)
        .maybeSingle();

      if (adminCheckError) {
        console.error('❌ Error checking admin status:', adminCheckError);
        throw new Error('Failed to verify your permissions.');
      }

      const isSuperAdmin = currentAdmin?.is_super_admin === true || currentAdmin?.role === 'super_admin';
      
      if (!isSuperAdmin) {
        throw new Error('You must be a Super Admin to create new admin users.');
      }

      console.log('✅ Super admin verified. Creating admin account...');

      // Step 1: Create the auth user (this will change the session!)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin/dashboard`,
        },
      });

      // CRITICAL: Immediately restore the original session!
      // signUp() automatically logs in as the new user, so we must switch back
      await supabase.auth.setSession(originalSession);
      console.log('✅ Session restored to original user');

      if (signUpError) {
        console.error('❌ Sign up error:', signUpError);
        if (signUpError.message.includes('already been registered')) {
          throw new Error(`An account with email "${email}" already exists. Please use a different email or delete the existing account first.`);
        }
        throw new Error(`Failed to create user account: ${signUpError.message}`);
      }

      const newUserId = signUpData?.user?.id;
      
      if (!newUserId) {
        throw new Error('No user returned from sign up.');
      }

      console.log('✅ Auth user created:', newUserId);
      console.log('🔧 Creating admin record via database function...');

      // Step 2: Create the admin_users record using the SECURITY DEFINER function
      // This bypasses RLS policies
      const { data: newAdmin, error: callError } = await supabase.rpc('create_admin_user_bypass', {
        p_user_id: newUserId,
        p_email: email,
        p_role: roleName,
        p_is_super_admin: roleName === 'super_admin',
        p_permissions: {
          vendor_management: permissions?.vendor_management || false,
          order_management: permissions?.order_management || false,
          product_management: permissions?.product_management || false,
          finance_management: permissions?.finance_management || false,
          analytics_monitoring: permissions?.analytics_monitoring || false,
        },
      });

      if (callError || !newAdmin) {
        console.error('❌ Failed to create admin record:', callError);
        throw new Error(`Failed to create admin record: ${callError?.message || 'Unknown error'}`);
      }

      if (newAdmin?.error) {
        throw new Error(newAdmin.error);
      }

      console.log('✅ Admin created successfully:', newAdmin);

      // Refresh the admin list
      await fetchAdmins();
      return { success: true };
    } catch (error: any) {
      console.error('❌ Error creating admin:', error);
      throw error;
    }
  };

  const updateAdminRole = async (adminId: string, roleName: string, permissions: Partial<AdminPermissions>) => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .update({
          role: roleName,
          permissions: {
            vendor_management: permissions.vendor_management || false,
            order_management: permissions.order_management || false,
            product_management: permissions.product_management || false,
            finance_management: permissions.finance_management || false,
            analytics_monitoring: permissions.analytics_monitoring || false,
          },
          is_super_admin: roleName === 'super_admin',
          updated_at: new Date().toISOString(),
        })
        .eq('id', adminId);

      if (error) throw error;

      await fetchAdmins();
    } catch (error) {
      console.error('Error updating admin role:', error);
      throw error;
    }
  };

  const deleteAdmin = async (adminId: string, userId: string) => {
    try {
      // Delete from admin_users table
      const { error: adminError } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', adminId);

      if (adminError) throw adminError;

      // Get session token for edge function call
      const { data: { session } } = await supabase.auth.getSession();
      
      // Delete auth user via edge function
      const { error: deleteError } = await supabase.functions.invoke('delete-admin-user', {
        body: { userId },
        headers: session?.access_token ? {
          Authorization: `Bearer ${session.access_token}`,
        } : undefined,
      });

      if (deleteError) {
        console.warn('Failed to delete auth user, but admin record deleted');
      }

      await fetchAdmins();
    } catch (error) {
      console.error('Error deleting admin:', error);
      throw error;
    }
  };

  return {
    admins,
    loading,
    createAdmin,
    updateAdminRole,
    deleteAdmin,
    refreshAdmins: fetchAdmins,
  };
}
