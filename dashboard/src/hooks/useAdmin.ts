import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AdminUser } from '../types';
import { useAuth } from '../contexts/AuthContext';

export function useAdmin() {
  const { userId } = useAuth();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchAdminStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) throw error;

        setAdminUser(data);
        setIsAdmin(!!data);
      } catch (error) {
        console.error('Error fetching admin status:', error);
        setAdminUser(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    if (!userId) {
      setAdminUser(null);
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    fetchAdminStatus();
  }, [userId]);

  const isSuperAdmin = adminUser?.role === 'super_admin';

  const refetch = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      setAdminUser(data);
      setIsAdmin(!!data);
    } catch (error) {
      console.error('Error fetching admin status:', error);
      setAdminUser(null);
      setIsAdmin(false);
    }
  };

  return {
    adminUser,
    isAdmin,
    isSuperAdmin,
    loading,
    refetch,
  };
}
