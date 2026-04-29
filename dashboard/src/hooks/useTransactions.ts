import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Transaction } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface FinanceMetrics {
  balance: number;
  pendingPayouts: number;
  monthlyRevenue: number;
  totalSales: number;
  totalRefunds: number;
  totalFees: number;
  totalPayouts: number;
}

export function useTransactions(vendorId?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [metrics, setMetrics] = useState<FinanceMetrics>({
    balance: 0,
    pendingPayouts: 0,
    monthlyRevenue: 0,
    totalSales: 0,
    totalRefunds: 0,
    totalFees: 0,
    totalPayouts: 0,
  });
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();
  const isFetchingRef = useRef(false);
  const vendorIdRef = useRef(vendorId);

  useEffect(() => {
    vendorIdRef.current = vendorId;
  }, [vendorId]);

  useEffect(() => {
    if (isFetchingRef.current) return;

    const fetchTransactions = async () => {
      if (!vendorId && !isAdmin) {
        setTransactions([]);
        setLoading(false);
        return;
      }

      isFetchingRef.current = true;
      try {
        setLoading(true);
        let query = supabase
          .from('transactions')
          .select(`
            *,
            vendors (
              id,
              business_name,
              contact_email
            )
          `);

        if (!isAdmin && vendorId) {
          query = query.eq('vendor_id', vendorId);
        }

        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) throw error;

        const transactionData = data || [];
        setTransactions(transactionData);
        calculateMetrics(transactionData);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setTransactions([]);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    };

    fetchTransactions();
  }, [vendorId, isAdmin]);

  const calculateMetrics = (txns: Transaction[]) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let balance = 0;
    let pendingPayouts = 0;
    let monthlyRevenue = 0;
    let totalSales = 0;
    let totalRefunds = 0;
    let totalFees = 0;
    let totalPayouts = 0;

    txns.forEach((txn) => {
      const txnDate = new Date(txn.created_at);
      const amount = parseFloat(txn.amount.toString());

      if (txn.type === 'sale') {
        totalSales += amount;
        if (txn.status === 'completed') {
          balance += amount;
        } else if (txn.status === 'pending') {
          pendingPayouts += amount;
        }

        if (txnDate >= startOfMonth) {
          monthlyRevenue += amount;
        }
      } else if (txn.type === 'refund') {
        totalRefunds += Math.abs(amount);
        balance += amount;

        if (txnDate >= startOfMonth) {
          monthlyRevenue += amount;
        }
      } else if (txn.type === 'fee') {
        totalFees += Math.abs(amount);
        balance += amount;
      } else if (txn.type === 'payout') {
        totalPayouts += Math.abs(amount);
        balance += amount;
      } else if (txn.type === 'adjustment') {
        balance += amount;
      }
    });

    setMetrics({
      balance: Math.max(0, balance),
      pendingPayouts,
      monthlyRevenue,
      totalSales,
      totalRefunds,
      totalFees,
      totalPayouts,
    });
  };

  const exportTransactions = useCallback(() => {
    const csv = [
      ['Date', 'Type', 'Description', 'Amount', 'Status'].join(','),
      ...transactions.map((txn) =>
        [
          new Date(txn.created_at).toLocaleDateString(),
          txn.type,
          `"${txn.description}"`,
          txn.amount,
          txn.status,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, [transactions]);

  const refetch = useCallback(async () => {
    const currentVendorId = vendorIdRef.current;
    if (!currentVendorId && !isAdmin) return;

    try {
      setLoading(true);
      let query = supabase
        .from('transactions')
        .select(`
          *,
          vendors (
            id,
            business_name,
            contact_email
          )
        `);

      if (!isAdmin && currentVendorId) {
        query = query.eq('vendor_id', currentVendorId);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      const transactionData = data || [];
      setTransactions(transactionData);
      calculateMetrics(transactionData);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  return useMemo(() => ({
    transactions,
    metrics,
    loading,
    exportTransactions,
    refetch,
  }), [transactions, metrics, loading, exportTransactions, refetch]);
}
