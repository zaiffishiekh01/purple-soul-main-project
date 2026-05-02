import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardClient } from '../lib/data-client';
import { dashboardKeys } from '../lib/dashboard-query-keys';
import { Vendor } from '../types';

async function fetchAdminVendorsList(): Promise<Vendor[]> {
  const { data, error } = await dashboardClient
    .from('vendors')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  const vendorUserIds = data?.map((v) => v.user_id) || [];
  const { data: adminUsers } = await dashboardClient
    .from('admin_users')
    .select('user_id')
    .in('user_id', vendorUserIds);

  const adminUserIds = new Set(adminUsers?.map((au) => au.user_id) || []);
  return (data || []).filter((v) => !adminUserIds.has(v.user_id)) as Vendor[];
}

export function useAdminVendors() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: dashboardKeys.vendorsAdmin,
    queryFn: fetchAdminVendorsList,
  });

  const vendors = (query.data ?? []) as Vendor[];

  const invalidate = useCallback(() => {
    return queryClient.invalidateQueries({ queryKey: dashboardKeys.vendorsAdmin });
  }, [queryClient]);

  const updateVendorStatus = useCallback(
    async (vendorId: string, status: string, additionalUpdates?: Partial<Vendor>) => {
      const updates = { status, updated_at: new Date().toISOString(), ...additionalUpdates };
      const { error } = await dashboardClient.from('vendors').update(updates).eq('id', vendorId);
      if (error) throw error;
      await invalidate();
    },
    [invalidate]
  );

  const approveVendor = useCallback(
    async (vendorId: string) => {
      const { data: { user } } = await dashboardClient.auth.getUser();
      const { error } = await dashboardClient
        .from('vendors')
        .update({
          is_approved: true,
          approved_at: new Date().toISOString(),
          approved_by: user?.id,
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', vendorId);
      if (error) throw error;
      await invalidate();
    },
    [invalidate]
  );

  const rejectVendor = useCallback(
    async (vendorId: string) => {
      const { error } = await dashboardClient
        .from('vendors')
        .update({
          is_approved: false,
          status: 'suspended',
          updated_at: new Date().toISOString(),
        })
        .eq('id', vendorId);
      if (error) throw error;
      await invalidate();
    },
    [invalidate]
  );

  const updateVendor = useCallback(
    async (vendorId: string, updates: Partial<Vendor>) => {
      const { error } = await dashboardClient
        .from('vendors')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', vendorId);
      if (error) throw error;
      await invalidate();
    },
    [invalidate]
  );

  const deleteVendor = useCallback(
    async (vendorId: string) => {
      const { error: rpcError } = await dashboardClient.rpc('delete_vendor_bypass', {
        p_vendor_id: vendorId,
      });

      if (rpcError) {
        const { error: deleteError } = await dashboardClient.from('vendors').delete().eq('id', vendorId);
        if (deleteError) throw deleteError;
      }

      await invalidate();
      return { success: true as const };
    },
    [invalidate]
  );

  return useMemo(
    () => ({
      vendors,
      loading: query.isPending || query.isRefetching,
      updateVendorStatus,
      approveVendor,
      rejectVendor,
      updateVendor,
      deleteVendor,
      refetch: invalidate,
    }),
    [
      vendors,
      query.isPending,
      query.isRefetching,
      updateVendorStatus,
      approveVendor,
      rejectVendor,
      updateVendor,
      deleteVendor,
      invalidate,
    ]
  );
}
