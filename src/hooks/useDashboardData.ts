import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { DashboardStats, Order, Product } from '../types/dashboard';

export interface UseDashboardDataOptions {
  vendorId?: string;
  isAdmin?: boolean;
}

/**
 * Generic hook for fetching dashboard stats from Supabase.
 * Fetches order count, revenue, product count, pending orders,
 * recent orders, low stock products, and unread notifications.
 */
export function useDashboardData(options: UseDashboardDataOptions = {}) {
  const { vendorId, isAdmin = false } = options;
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    pendingOrders: 0,
    recentOrders: [],
    lowStockProducts: [],
    unreadNotifications: 0,
  });
  const [loading, setLoading] = useState(true);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    if (isFetchingRef.current) return;
    if (!vendorId && !isAdmin) {
      setLoading(false);
      return;
    }

    isFetchingRef.current = true;

    const fetchStats = async () => {
      try {
        setLoading(true);

        const tableName = isAdmin ? 'orders' : 'vendor_orders';

        // Build base order query
        let ordersQuery = supabase.from(tableName).select('*', { count: 'exact', head: false });
        if (!isAdmin && vendorId) {
          ordersQuery = ordersQuery.eq('vendor_id', vendorId);
        }

        // Pending orders count query
        let pendingQuery = supabase.from(tableName).select('*', { count: 'exact', head: true });
        if (!isAdmin && vendorId) {
          pendingQuery = pendingQuery.eq('vendor_id', vendorId);
        }
        pendingQuery = pendingQuery.eq('status', 'pending');

        // Products count query
        let productsCountQuery = supabase.from('products').select('*', { count: 'exact', head: true });
        if (!isAdmin && vendorId) {
          productsCountQuery = productsCountQuery.eq('vendor_id', vendorId);
        }

        // Revenue query (sum of total_amount for paid orders)
        let revenueQuery = supabase
          .from(tableName)
          .select('total_amount')
          .eq('payment_status', 'paid');
        if (!isAdmin && vendorId) {
          revenueQuery = revenueQuery.eq('vendor_id', vendorId);
        }

        // Recent orders query
        let recentQuery = supabase
          .from(tableName)
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        if (!isAdmin && vendorId) {
          recentQuery = recentQuery.eq('vendor_id', vendorId);
        }

        // Low stock products query
        let lowStockQuery = supabase
          .from('products')
          .select('*')
          .lte('stock_quantity', 5)
          .order('stock_quantity', { ascending: true })
          .limit(5);
        if (!isAdmin && vendorId) {
          lowStockQuery = lowStockQuery.eq('vendor_id', vendorId);
        }

        // Unread notifications query
        let notificationsQuery = supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('is_read', false);
        if (!isAdmin && vendorId) {
          notificationsQuery = notificationsQuery.eq('vendor_id', vendorId);
        }

        // Execute all queries in parallel
        const [
          ordersResult,
          pendingResult,
          productsCountResult,
          revenueResult,
          recentResult,
          lowStockResult,
          notificationsResult,
        ] = await Promise.all([
          ordersQuery,
          pendingQuery,
          productsCountQuery,
          revenueQuery,
          recentQuery,
          lowStockQuery,
          notificationsQuery,
        ]);

        if (ordersResult.error) throw ordersResult.error;
        if (pendingResult.error) throw pendingResult.error;
        if (productsCountResult.error) throw productsCountResult.error;
        if (revenueResult.error) throw revenueResult.error;
        if (recentResult.error) throw recentResult.error;
        if (lowStockResult.error) throw lowStockResult.error;
        if (notificationsResult.error) throw notificationsResult.error;

        // Calculate total revenue
        let totalRevenue = 0;
        if (revenueResult.data) {
          totalRevenue = revenueResult.data.reduce(
            (sum: number, order: { total_amount: number }) => sum + (order.total_amount || 0),
            0,
          );
        }

        setStats({
          totalOrders: ordersResult.count ?? 0,
          totalRevenue,
          totalProducts: productsCountResult.count ?? 0,
          pendingOrders: pendingResult.count ?? 0,
          recentOrders: (recentResult.data || []) as Order[],
          lowStockProducts: (lowStockResult.data || []) as Product[],
          unreadNotifications: notificationsResult.count ?? 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    };

    fetchStats();
  }, [vendorId, isAdmin]);

  const refetch = useCallback(async () => {
    if (!vendorId && !isAdmin) return;

    try {
      setLoading(true);

      const tableName = isAdmin ? 'orders' : 'vendor_orders';

      const [
        { data: ordersData, error: ordersError },
        { data: recentData, error: recentError },
        { data: lowStockData, error: lowStockError },
        { data: revenueData, error: revenueError },
      ] = await Promise.all([
        supabase.from(tableName).select('*', { count: 'exact', head: true })
          .then((r) => {
            if (!isAdmin && vendorId) return supabase.from(tableName).select('*', { count: 'exact', head: true }).eq('vendor_id', vendorId);
            return r;
          }),
        supabase.from(tableName).select('*').order('created_at', { ascending: false }).limit(5)
          .then((r) => {
            if (!isAdmin && vendorId) return supabase.from(tableName).select('*').eq('vendor_id', vendorId).order('created_at', { ascending: false }).limit(5);
            return r;
          }),
        supabase.from('products').select('*').lte('stock_quantity', 5).order('stock_quantity', { ascending: true }).limit(5)
          .then((r) => {
            if (!isAdmin && vendorId) return supabase.from('products').select('*').eq('vendor_id', vendorId).lte('stock_quantity', 5).order('stock_quantity', { ascending: true }).limit(5);
            return r;
          }),
        supabase.from(tableName).select('total_amount').eq('payment_status', 'paid')
          .then((r) => {
            if (!isAdmin && vendorId) return supabase.from(tableName).select('total_amount').eq('vendor_id', vendorId).eq('payment_status', 'paid');
            return r;
          }),
      ]);

      if (ordersError) throw ordersError;
      if (recentError) throw recentError;
      if (lowStockError) throw lowStockError;
      if (revenueError) throw revenueError;

      let totalRevenue = 0;
      if (revenueData) {
        totalRevenue = revenueData.reduce(
          (sum: number, order: { total_amount: number }) => sum + (order.total_amount || 0),
          0,
        );
      }

      setStats((prev) => ({
        ...prev,
        totalOrders: ordersData?.count ?? prev.totalOrders,
        totalRevenue,
        recentOrders: (recentData || []) as Order[],
        lowStockProducts: (lowStockData || []) as Product[],
      }));
    } catch (error) {
      console.error('Error refetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }, [vendorId, isAdmin]);

  return useMemo(() => ({
    stats,
    loading,
    refetch,
  }), [stats, loading, refetch]);
}
