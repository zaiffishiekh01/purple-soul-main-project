import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardClient } from '../lib/data-client';
import { loadOrdersWithItemsAndProducts } from '../lib/dashboard-relational-loaders';
import { dashboardKeys } from '../lib/dashboard-query-keys';
import { Order } from '../types';
import { useAuth } from '../contexts/AuthContext';

export function useOrders(vendorId?: string) {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: dashboardKeys.orders({ isAdmin, vendorId: vendorId ?? null }),
    queryFn: () =>
      loadOrdersWithItemsAndProducts({
        isAdmin,
        vendorId: vendorId ?? undefined,
      }),
    enabled: isAdmin || !!vendorId,
  });

  const orders = (query.data ?? []) as Order[];

  const updateOrder = useCallback(
    async (id: string, updates: Partial<Order>) => {
      const { data, error } = await dashboardClient
        .from('orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: dashboardKeys.ordersPrefix });
      return data as Order;
    },
    [queryClient]
  );

  const refetch = useCallback(async () => {
    await query.refetch();
  }, [query]);

  return useMemo(
    () => ({
      orders,
      loading: query.isPending || query.isRefetching,
      updateOrder,
      refetch,
    }),
    [orders, query.isPending, query.isRefetching, updateOrder, refetch]
  );
}
