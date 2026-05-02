import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardClient } from '../lib/data-client';
import { dashboardKeys } from '../lib/dashboard-query-keys';
import { useAuth } from '../contexts/AuthContext';
import { processRefund as processRefundAPI } from '../lib/payments';

export interface Return {
  id: string;
  vendor_id: string;
  order_id: string;
  return_number: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  items: Array<{
    product_id?: string;
    product_name: string;
    sku?: string;
    quantity: number;
    unit_price?: number;
    price?: number;
    reason?: string;
  }>;
  reason: string;
  status: string;
  return_amount: number;
  restocking_fee: number;
  refund_method: string;
  notes: string;
  requested_at: string;
  approved_at: string | null;
  received_at: string | null;
  refunded_at: string | null;
  processed_at: string | null;
  created_at: string;
}

async function fetchVendorReturns(userId: string): Promise<Return[]> {
  const { data: vendorData } = await dashboardClient
    .from('vendors')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (!vendorData) return [];

  const { data, error } = await dashboardClient
    .from('returns')
    .select('*')
    .eq('vendor_id', vendorData.id)
    .order('requested_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Return[];
}

export function useReturns() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: userId
      ? dashboardKeys.returnsByUser(userId)
      : (['dashboard', 'returns', 'by-user', 'none'] as const),
    queryFn: () => fetchVendorReturns(userId!),
    enabled: !!userId,
  });

  const returns = (query.data ?? []) as Return[];

  const invalidate = useCallback(() => {
    if (!userId) return Promise.resolve();
    return queryClient.invalidateQueries({ queryKey: dashboardKeys.returnsByUser(userId) });
  }, [queryClient, userId]);

  const updateReturn = useCallback(
    async (returnId: string, updates: Partial<Return>) => {
      const { data, error } = await dashboardClient
        .from('returns')
        .update(updates)
        .eq('id', returnId)
        .select()
        .single();

      if (error) throw error;
      await invalidate();
      return data;
    },
    [invalidate]
  );

  const approveReturn = useCallback(
    async (returnId: string, notes?: string) => {
      return updateReturn(returnId, {
        status: 'approved',
        approved_at: new Date().toISOString(),
        ...(notes && { notes }),
      } as Partial<Return>);
    },
    [updateReturn]
  );

  const rejectReturn = useCallback(
    async (returnId: string, rejectionReason: string, notes?: string) => {
      return updateReturn(returnId, {
        status: 'rejected',
        notes: rejectionReason + (notes ? '\n\n' + notes : ''),
        processed_at: new Date().toISOString(),
      } as Partial<Return>);
    },
    [updateReturn]
  );

  const markReceived = useCallback(
    async (returnId: string, notes?: string) => {
      return updateReturn(returnId, {
        status: 'received',
        received_at: new Date().toISOString(),
        ...(notes && { notes }),
      } as Partial<Return>);
    },
    [updateReturn]
  );

  const processRefund = useCallback(
    async (
      returnId: string,
      refundData: {
        refund_method: string;
        refund_amount: number;
        notes?: string;
      }
    ) => {
      const returnItem = returns.find((r) => r.id === returnId);
      if (!returnItem) throw new Error('Return not found');

      const result = await processRefundAPI({
        returnId,
        refundAmount: refundData.refund_amount,
        refundMethod: refundData.refund_method,
        notes: refundData.notes,
      });

      if (!result || !result.success) {
        throw new Error(result?.message || 'Failed to process refund');
      }

      await invalidate();
      return result;
    },
    [returns, invalidate]
  );

  const refetch = useCallback(async () => {
    await query.refetch();
  }, [query]);

  return useMemo(
    () => ({
      returns,
      loading: query.isPending || query.isRefetching,
      updateReturn,
      approveReturn,
      rejectReturn,
      markReceived,
      processRefund,
      refetch,
    }),
    [
      returns,
      query.isPending,
      query.isRefetching,
      updateReturn,
      approveReturn,
      rejectReturn,
      markReceived,
      processRefund,
      refetch,
    ]
  );
}
