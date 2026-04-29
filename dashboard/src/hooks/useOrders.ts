import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Order } from '../types';
import { useAuth } from '../contexts/AuthContext';

export function useOrders(vendorId?: string) {
  const { isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    if (isFetchingRef.current) return;

    const fetchOrders = async () => {
      if (!vendorId && !isAdmin) {
        setOrders([]);
        setLoading(false);
        return;
      }

      isFetchingRef.current = true;
      try {
        setLoading(true);

        const tableName = isAdmin ? 'orders' : 'vendor_orders';

        let query = supabase
          .from(tableName)
          .select(`
            *,
            order_items (
              id,
              product_id,
              quantity,
              unit_price,
              products (
                id,
                name,
                sku,
                category
              )
            )
          `);

        if (!isAdmin && vendorId) {
          query = query.eq('vendor_id', vendorId);
        }

        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) throw error;
        setOrders((data || []) as Order[]);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    };

    fetchOrders();
  }, [vendorId, isAdmin]);

  const updateOrder = useCallback(async (id: string, updates: Partial<Order>) => {
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    setOrders((prev) => prev.map((o) => (o.id === id ? (data as Order) : o)));
    return data as Order;
  }, []);

  const refetch = useCallback(async () => {
    if (!vendorId && !isAdmin) return;

    try {
      setLoading(true);

      const tableName = isAdmin ? 'orders' : 'vendor_orders';

      let query = supabase
        .from(tableName)
        .select(`
          *,
          order_items (
            id,
            product_id,
            quantity,
            unit_price,
            products (
              id,
              name,
              sku,
              category
            )
          )
        `);

      if (!isAdmin && vendorId) {
        query = query.eq('vendor_id', vendorId);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setOrders((data || []) as Order[]);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [vendorId, isAdmin]);

  return useMemo(() => ({
    orders,
    loading,
    updateOrder,
    refetch,
  }), [orders, loading, updateOrder, refetch]);
}
