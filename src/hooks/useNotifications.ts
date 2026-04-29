import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Notification } from '../types/dashboard';
import { useDashboardAuth } from '../contexts/DashboardAuthContext';

/**
 * Hook for fetching and managing notifications in the dashboard.
 * Scopes to the current vendor; admins can be extended as needed.
 */
export function useNotifications() {
  const { vendor } = useDashboardAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const vendorId = vendor?.id;

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!vendorId) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('vendor_id', vendorId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setNotifications((data || []) as Notification[]);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [vendorId]);

  const markAsRead = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) throw error;

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!vendorId) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('vendor_id', vendorId)
      .eq('is_read', false);

    if (error) throw error;

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }, [vendorId]);

  const deleteNotification = useCallback(async (id: string) => {
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (error) throw error;

    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const refetch = useCallback(async () => {
    if (!vendorId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications((data || []) as Notification[]);
    } catch (error) {
      console.error('Error refetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  return useMemo(() => ({
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch,
  }), [notifications, loading, markAsRead, markAllAsRead, deleteNotification, refetch]);
}
