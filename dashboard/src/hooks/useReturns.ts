import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
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

export function useReturns() {
  const [returns, setReturns] = useState<Return[]>([]);
  const [loading, setLoading] = useState(true);
  const { userId } = useAuth();

  const fetchReturns = async () => {
    try {
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!vendorData) {
        setReturns([]);
        return;
      }

      const { data, error } = await supabase
        .from('returns')
        .select('*')
        .eq('vendor_id', vendorData.id)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      setReturns(data || []);
    } catch (error) {
      console.error('Error fetching returns:', error);
      setReturns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchReturns();
    } else {
      setReturns([]);
      setLoading(false);
    }
  }, [userId]);

  const updateReturn = async (returnId: string, updates: Partial<Return>) => {
    try {
      const { data, error } = await supabase
        .from('returns')
        .update(updates)
        .eq('id', returnId)
        .select()
        .single();

      if (error) throw error;

      setReturns((prev) =>
        prev.map((ret) => (ret.id === returnId ? { ...ret, ...data } : ret))
      );

      return data;
    } catch (error) {
      console.error('Error updating return:', error);
      throw error;
    }
  };

  const approveReturn = async (returnId: string, notes?: string) => {
    return updateReturn(returnId, {
      status: 'approved',
      approved_at: new Date().toISOString(),
      ...(notes && { notes }),
    } as Partial<Return>);
  };

  const rejectReturn = async (returnId: string, rejectionReason: string, notes?: string) => {
    return updateReturn(returnId, {
      status: 'rejected',
      notes: rejectionReason + (notes ? '\n\n' + notes : ''),
      processed_at: new Date().toISOString(),
    } as Partial<Return>);
  };

  const markReceived = async (returnId: string, notes?: string) => {
    return updateReturn(returnId, {
      status: 'received',
      received_at: new Date().toISOString(),
      ...(notes && { notes }),
    } as Partial<Return>);
  };

  const processRefund = async (
    returnId: string,
    refundData: {
      refund_method: string;
      refund_amount: number;
      notes?: string;
    }
  ) => {
    try {
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

      await fetchReturns();

      return result;
    } catch (error: any) {
      console.error('Error processing refund:', error);
      throw new Error(error.message || 'Failed to process refund');
    }
  };

  return {
    returns,
    loading,
    updateReturn,
    approveReturn,
    rejectReturn,
    markReceived,
    processRefund,
    refetch: fetchReturns,
  };
}
