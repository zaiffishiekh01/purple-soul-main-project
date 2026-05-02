import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardClient } from '../lib/data-client';
import { loadVendorInventoryWithProducts } from '../lib/dashboard-relational-loaders';
import { dashboardKeys } from '../lib/dashboard-query-keys';

export interface InventoryItem {
  id: string;
  vendor_id: string;
  product_id: string;
  product_name?: string;
  sku?: string;
  quantity: number;
  reserved_quantity: number;
  low_stock_threshold: number;
  warehouse_location: string | null;
  last_restocked_at: string | null;
  updated_at: string;
  products?: {
    name: string;
    sku: string;
  };
}

function mapInventoryRows(rows: unknown[]): InventoryItem[] {
  return rows.map((item) => {
    const row = item as InventoryItem & { products?: { name: string; sku: string } };
    return {
      ...row,
      product_name: row.products?.name,
      sku: row.products?.sku,
    };
  }) as InventoryItem[];
}

export function useInventory(vendorId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: vendorId
      ? dashboardKeys.inventoryVendor(vendorId)
      : (['dashboard', 'inventory', 'vendor', 'none'] as const),
    queryFn: async () => {
      if (!vendorId) return [];
      const rows = await loadVendorInventoryWithProducts(vendorId);
      return mapInventoryRows(rows ?? []);
    },
    enabled: !!vendorId,
  });

  const inventory = (query.data ?? []) as InventoryItem[];

  const invalidate = useCallback(() => {
    if (!vendorId) return Promise.resolve();
    return queryClient.invalidateQueries({ queryKey: dashboardKeys.inventoryVendor(vendorId) });
  }, [queryClient, vendorId]);

  const updateInventory = useCallback(
    async (id: string, updates: Partial<InventoryItem>) => {
      const { data, error } = await dashboardClient
        .from('inventory')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await invalidate();
      return data;
    },
    [invalidate]
  );

  const restockItem = useCallback(
    async (id: string, additionalQuantity: number) => {
      const item = inventory.find((i) => i.id === id);
      if (!item) throw new Error('Inventory item not found');

      const newQuantity = item.quantity + additionalQuantity;
      const { data, error } = await dashboardClient
        .from('inventory')
        .update({
          quantity: newQuantity,
          last_restocked_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await invalidate();
      return data;
    },
    [inventory, invalidate]
  );

  const refetch = useCallback(async () => {
    await query.refetch();
  }, [query]);

  return useMemo(
    () => ({
      inventory,
      loading: query.isPending || query.isRefetching,
      updateInventory,
      restockItem,
      refetch,
    }),
    [inventory, query.isPending, query.isRefetching, updateInventory, restockItem, refetch]
  );
}
