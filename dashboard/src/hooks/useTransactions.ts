import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { loadTransactionsWithVendors } from '../lib/dashboard-relational-loaders';
import { dashboardKeys } from '../lib/dashboard-query-keys';
import { Transaction } from '../types';
import { useAuth } from '../contexts/AuthContext';

export interface FinanceMetrics {
  balance: number;
  pendingPayouts: number;
  monthlyRevenue: number;
  totalSales: number;
  totalRefunds: number;
  totalFees: number;
  totalPayouts: number;
}

function calculateMetrics(txns: Transaction[]): FinanceMetrics {
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

  return {
    balance: Math.max(0, balance),
    pendingPayouts,
    monthlyRevenue,
    totalSales,
    totalRefunds,
    totalFees,
    totalPayouts,
  };
}

export function useTransactions(vendorId?: string) {
  const { isAdmin } = useAuth();

  const query = useQuery({
    queryKey: dashboardKeys.transactions({ isAdmin, vendorId: vendorId ?? null }),
    queryFn: () =>
      loadTransactionsWithVendors({
        isAdmin,
        vendorId: vendorId ?? undefined,
      }),
    enabled: isAdmin || !!vendorId,
  });

  const transactions = (query.data ?? []) as Transaction[];

  const metrics = useMemo(() => calculateMetrics(transactions), [transactions]);

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
    await query.refetch();
  }, [query]);

  return useMemo(
    () => ({
      transactions,
      metrics,
      loading: query.isPending || query.isRefetching,
      exportTransactions,
      refetch,
    }),
    [transactions, metrics, query.isPending, query.isRefetching, exportTransactions, refetch]
  );
}
