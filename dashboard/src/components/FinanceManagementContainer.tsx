import { useState, useEffect } from 'react';
import { FinanceManagement } from './FinanceManagement';
import { FeeWaiverSection } from './FeeWaiverSection';
import { useTransactions } from '../hooks/useTransactions';
import { dashboardClient } from '../lib/data-client';
import { useAuth } from '../contexts/AuthContext';

interface PayoutSettings {
  id: string;
  vendor_id: string;
  payout_frequency: string;
  payout_day: string;
  payout_method: string;
  bank_account_last4: string;
  bank_name: string;
  minimum_payout: number;
  auto_payout_enabled: boolean;
}

export function FinanceManagementContainer() {
  const { transactions, metrics, loading, exportTransactions } = useTransactions();
  const [payoutSettings, setPayoutSettings] = useState<PayoutSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const { user } = useAuth();

  const userId = user?.id;

  useEffect(() => {
    if (userId) {
      fetchPayoutSettings();
    }
  }, [userId]);

  const fetchPayoutSettings = async () => {
    try {
      const { data: vendorData } = await dashboardClient
        .from('vendors')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!vendorData) return;

      setVendorId(vendorData.id);

      const { data, error } = await dashboardClient
        .from('payout_settings')
        .select('*')
        .eq('vendor_id', vendorData.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setPayoutSettings(data);
      } else {
        const newSettings = {
          vendor_id: vendorData.id,
          payout_frequency: 'weekly',
          payout_day: 'Monday',
          payout_method: 'bank_transfer',
          bank_account_last4: '',
          bank_name: '',
          minimum_payout: 100.00,
          auto_payout_enabled: true,
        };

        const { data: created, error: createError } = await dashboardClient
          .from('payout_settings')
          .insert(newSettings)
          .select()
          .single();

        if (createError) throw createError;
        setPayoutSettings(created);
      }
    } catch (error) {
      console.error('Error fetching payout settings:', error);
    } finally {
      setLoadingSettings(false);
    }
  };

  const updatePayoutSettings = async (updates: Partial<PayoutSettings>) => {
    if (!payoutSettings) return;

    try {
      const { data, error } = await dashboardClient
        .from('payout_settings')
        .update(updates)
        .eq('id', payoutSettings.id)
        .select()
        .single();

      if (error) throw error;
      setPayoutSettings(data);
      return data;
    } catch (error) {
      console.error('Error updating payout settings:', error);
      throw error;
    }
  };

  if (loading || loadingSettings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sufi-purple"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FinanceManagement
        transactions={transactions}
        balance={metrics.balance}
        pendingPayouts={metrics.pendingPayouts}
        monthlyRevenue={metrics.monthlyRevenue}
        payoutSettings={payoutSettings}
        onExport={exportTransactions}
        onUpdatePayoutSettings={updatePayoutSettings}
      />

      {vendorId && <FeeWaiverSection vendorId={vendorId} />}
    </div>
  );
}
