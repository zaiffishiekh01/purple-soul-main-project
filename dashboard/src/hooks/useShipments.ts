import { useCallback, useContext, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardClient } from '../lib/data-client';
import { loadVendorShipmentsWithOrderInfo } from '../lib/dashboard-relational-loaders';
import { dashboardKeys } from '../lib/dashboard-query-keys';
import { VendorContext } from '../contexts/VendorContext';

export interface Shipment {
  id: string;
  order_id: string;
  vendor_id: string;
  tracking_number: string;
  carrier: string;
  shipping_method: string;
  status: string;
  shipped_at: string | null;
  estimated_delivery: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
  shipping_label_id?: string | null;
  order_number?: string;
  customer_name?: string;
  has_label?: boolean;
}

function mapShipments(
  data: unknown[]
): Shipment[] {
  return (
    data?.map(
      (
        shipment: Record<string, unknown> & {
          orders?: { order_number?: string; customer_name?: string };
          shipping_label_id?: string | null;
        }
      ) => ({
        ...shipment,
        order_number: shipment.orders?.order_number,
        customer_name: shipment.orders?.customer_name,
        has_label: !!shipment.shipping_label_id,
      })
    ) || []
  ) as Shipment[];
}

export function useShipments() {
  const queryClient = useQueryClient();
  const vendorContext = useContext(VendorContext);
  const vendor = vendorContext?.vendor ?? null;
  const vendorLoading = vendorContext?.loading ?? false;
  const vendorId = vendor?.id;

  const query = useQuery({
    queryKey: vendorId
      ? dashboardKeys.shipmentsVendor(vendorId)
      : (['dashboard', 'shipments', 'vendor', 'none'] as const),
    queryFn: async () => {
      if (!vendorId) return [];
      const data = await loadVendorShipmentsWithOrderInfo(vendorId);
      return mapShipments((data ?? []) as unknown[]);
    },
    enabled: !vendorLoading && !!vendorId,
  });

  const shipments = (query.data ?? []) as Shipment[];

  const invalidate = useCallback(() => {
    if (!vendorId) return Promise.resolve();
    return queryClient.invalidateQueries({ queryKey: dashboardKeys.shipmentsVendor(vendorId) });
  }, [queryClient, vendorId]);

  const createShipment = useCallback(
    async (shipment: Omit<Shipment, 'id' | 'vendor_id' | 'created_at' | 'updated_at' | 'order_number' | 'customer_name'>) => {
      if (!vendorId) return;

      const { data, error } = await dashboardClient
        .from('shipments')
        .insert({ ...shipment, vendor_id: vendorId })
        .select()
        .single();

      if (error) throw error;
      await invalidate();
      return data;
    },
    [vendorId, invalidate]
  );

  const updateShipment = useCallback(
    async (id: string, updates: Partial<Shipment>) => {
      const { data, error } = await dashboardClient
        .from('shipments')
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

  const deleteShipment = useCallback(
    async (id: string) => {
      const { error } = await dashboardClient.from('shipments').delete().eq('id', id);
      if (error) throw error;
      await invalidate();
    },
    [invalidate]
  );

  const refetch = useCallback(async () => {
    await query.refetch();
  }, [query]);

  const loading =
    vendorLoading || (!!vendorId && (query.isPending || query.isRefetching));

  return useMemo(
    () => ({
      shipments,
      loading,
      createShipment,
      updateShipment,
      deleteShipment,
      refetch,
    }),
    [shipments, loading, createShipment, updateShipment, deleteShipment, refetch]
  );
}
