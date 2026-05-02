import { useState, useEffect } from 'react';
import { dashboardClient } from '../lib/data-client';

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

/** Postgres `SELECT * FROM rpc(...)` returns one column named after the function, not a flat row. */
function unwrapRpcJsonRow(row: unknown): AdminPermissions | null {
  if (!row || typeof row !== 'object' || Array.isArray(row)) return null;
  const obj = row as Record<string, unknown>;
  if (typeof obj.is_super_admin === 'boolean' || typeof obj.vendor_management === 'boolean') {
    return obj as unknown as AdminPermissions;
  }
  const values = Object.values(obj);
  if (
    values.length === 1 &&
    values[0] !== null &&
    typeof values[0] === 'object' &&
    !Array.isArray(values[0])
  ) {
    const inner = values[0] as Record<string, unknown>;
    if (typeof inner.is_super_admin === 'boolean' || typeof inner.vendor_management === 'boolean') {
      return inner as unknown as AdminPermissions;
    }
  }
  return null;
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
      const { data: { user } } = await dashboardClient.auth.getUser();
      
      if (!user) {
        return;
      }

      const { data, error } = await dashboardClient.rpc('get_admin_permissions', {
        p_user_id: user.id
      });

      if (error) {
        console.error('❌ Error from get_admin_permissions RPC:', error);
        throw error;
      }

      const perms = data ? unwrapRpcJsonRow(data) ?? (data as AdminPermissions) : null;
      if (perms) {
        setPermissions(perms);
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
      const { data: adminUsers, error: adminError } = await dashboardClient
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
    const { data: { session } } = await dashboardClient.auth.getSession();
    if (!session?.user) {
      throw new Error('Not authenticated. Please sign in again.');
    }

    const { data: currentAdmin, error: adminCheckError } = await dashboardClient
      .from('admin_users')
      .select('is_super_admin, role')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (adminCheckError) {
      throw new Error('Failed to verify your permissions.');
    }

    const isSuperAdmin = currentAdmin?.is_super_admin === true || currentAdmin?.role === 'super_admin';
    if (!isSuperAdmin) {
      throw new Error('You must be a Super Admin to create new admin users.');
    }

    await dashboardClient.functions.invoke('create-admin', {
      body: {
        email,
        password,
        roleName,
        permissions: {
          vendor_management: permissions.vendor_management ?? false,
          order_management: permissions.order_management ?? false,
          product_management: permissions.product_management ?? false,
          finance_management: permissions.finance_management ?? false,
          analytics_monitoring: permissions.analytics_monitoring ?? false,
        },
      },
    });

    await fetchAdmins();
    return { success: true };
  };

  const updateAdminRole = async (adminId: string, roleName: string, permissions: Partial<AdminPermissions>) => {
    try {
      const { error } = await dashboardClient
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
      const { error: adminError } = await dashboardClient
        .from('admin_users')
        .delete()
        .eq('id', adminId);

      if (adminError) throw adminError;

      const { error: deleteError } = await dashboardClient.functions.invoke('delete-admin-user', {
        body: { userId },
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
