import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar, Download, Send, Clock } from 'lucide-react';
import { Transaction } from '../types';
import { PayoutSettingsModal } from './modals/PayoutSettingsModal';
import { dashboardClient } from '../lib/data-client';
import { useVendor } from '../hooks/useVendor';

interface PayoutSettings {
  payout_frequency: string;
  payout_day: string;
  payout_method: string;
  bank_account_last4: string;
  bank_name: string;
  minimum_payout: number;
  auto_payout_enabled: boolean;
}

interface FinanceManagementProps {
  transactions: Transaction[];
  balance: number;
  pendingPayouts: number;
  monthlyRevenue: number;
  payoutSettings: PayoutSettings | null;
  onExport: () => void;
  onUpdatePayoutSettings: (settings: Partial<PayoutSettings>) => Promise<void>;
}

export function FinanceManagement({
  transactions,
  balance,
  pendingPayouts,
  monthlyRevenue,
  payoutSettings,
  onExport,
  onUpdatePayoutSettings,
}: FinanceManagementProps) {
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showRequestPayoutModal, setShowRequestPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [platformFee, setPlatformFee] = useState<number>(0);
  const [feePercentage, setFeePercentage] = useState<number>(0);
  const { vendor } = useVendor();

  const vendorId = vendor?.id;

  useEffect(() => {
    if (vendorId) {
      fetchPlatformFee();
    }
  }, [vendorId]);

  const fetchPlatformFee = async () => {
    try {
      const { data } = await dashboardClient
        .from('platform_fees')
        .select('fee_percentage')
        .eq('vendor_id', vendor?.id)
        .maybeSingle();

      if (data) {
        setFeePercentage(data.fee_percentage);
      }
    } catch (error) {
      console.error('Error fetching platform fee:', error);
    }
  };

  const calculateFee = (amount: number) => {
    return (amount * feePercentage) / 100;
  };

  const handleRequestPayout = async () => {
    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount <= 0 || amount > balance) {
      alert('Please enter a valid amount');
      return;
    }

    const fee = calculateFee(amount);
    const netAmount = amount - fee;

    try {
      const { error } = await dashboardClient.from('payout_requests').insert({
        vendor_id: vendor?.id,
        amount,
        platform_fee: fee,
        net_amount: netAmount,
        status: 'pending',
        notes: 'Payout request from vendor',
      });

      if (error) throw error;

      alert('Payout request submitted successfully!');
      setShowRequestPayoutModal(false);
      setPayoutAmount('');
      window.location.reload();
    } catch (error) {
      console.error('Error requesting payout:', error);
      alert('Failed to submit payout request');
    }
  };
  const getTransactionTypeColor = (type: string) => {
    const colors = {
      sale: 'text-green-600',
      refund: 'text-red-600',
      payout: 'text-blue-600',
      fee: 'text-orange-600',
      adjustment: 'text-gray-600',
    };
    return colors[type as keyof typeof colors] || colors.adjustment;
  };

  const getTransactionTypeIcon = (type: string) => {
    if (type === 'sale') return '+';
    if (type === 'refund' || type === 'fee' || type === 'payout') return '-';
    return '±';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          {feePercentage > 0 && (
            <p className="text-sm text-gray-600">
              Platform Fee: <span className="font-semibold text-gray-900">{feePercentage}%</span>
            </p>
          )}
        </div>
        <button
          onClick={() => setShowRequestPayoutModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all flex items-center gap-2 font-medium shadow-lg"
        >
          <Send className="w-5 h-5" />
          Request Payout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
              <DollarSign className="w-6 h-6" />
            </div>
            <TrendingUp className="w-5 h-5 opacity-75" />
          </div>
          <h3 className="text-sm font-medium opacity-90 mb-2">Available Balance</h3>
          <p className="text-4xl font-bold">${balance.toLocaleString()}</p>
          <p className="text-sm opacity-75 mt-2">Ready for withdrawal</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg inline-block mb-4">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-2">Monthly Revenue</h3>
          <p className="text-3xl font-bold text-gray-900">${monthlyRevenue.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-2">This month</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg inline-block mb-4">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-2">Pending Payouts</h3>
          <p className="text-3xl font-bold text-gray-900">${pendingPayouts.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-2">Processing</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Fees & Markups</h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 mb-3">Platform Fees</h4>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Platform Commission</span>
                <span className="font-semibold text-gray-900">{feePercentage || 5}%</span>
              </div>
              <p className="text-xs text-gray-500">Applied to each sale</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Fixed Per-Order Fee</span>
                <span className="font-semibold text-gray-900">$0.30</span>
              </div>
              <p className="text-xs text-gray-500">Transaction processing fee</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Category Markup</span>
                <span className="font-semibold text-gray-900">2%</span>
              </div>
              <p className="text-xs text-gray-500">Additional markup for electronics</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 mb-3">Net Earnings Estimate</h4>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Product Price</span>
                  <span className="font-semibold text-gray-900">$100.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Platform Commission ({feePercentage || 5}%)</span>
                  <span className="font-semibold text-red-600">-${((feePercentage || 5) * 1).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Fixed Fee</span>
                  <span className="font-semibold text-red-600">-$0.30</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Category Markup</span>
                  <span className="font-semibold text-red-600">-$2.00</span>
                </div>
                <div className="border-t border-blue-300 pt-3 flex justify-between">
                  <span className="font-bold text-gray-900">Net Payout</span>
                  <span className="font-bold text-green-600 text-lg">
                    ${(100 - (feePercentage || 5) - 0.30 - 2).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500 italic">
              This is an example calculation. Actual fees may vary based on product category and marketplace promotions.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Transaction History</h3>
          <button
            onClick={onExport}
            className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span className="font-medium">Export</span>
          </button>
        </div>

        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 rounded-xl hover:bg-sufi-light/10 transition-colors border border-gray-100"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                    transaction.type === 'sale'
                      ? 'bg-green-100 text-green-600'
                      : transaction.type === 'refund'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  {getTransactionTypeIcon(transaction.type)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 capitalize">{transaction.type}</p>
                  <p className="text-sm text-gray-600">{transaction.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(transaction.created_at).toLocaleDateString()} at{' '}
                    {new Date(transaction.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`text-xl font-bold ${getTransactionTypeColor(transaction.type)}`}
                >
                  {getTransactionTypeIcon(transaction.type)}${Math.abs(transaction.amount).toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 capitalize">{transaction.status}</p>
              </div>
            </div>
          ))}
        </div>

        {transactions.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-gray-500">No transactions found</p>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-sufi-purple to-sufi-dark rounded-2xl p-6 text-white shadow-xl">
        <h3 className="text-lg font-bold mb-4">Payout Settings</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm opacity-90 mb-2">Next Scheduled Payout</p>
            <p className="text-2xl font-bold">
              {payoutSettings?.payout_frequency === 'daily'
                ? 'Daily'
                : payoutSettings?.payout_frequency === 'weekly'
                ? `Every ${payoutSettings?.payout_day}`
                : payoutSettings?.payout_frequency === 'biweekly'
                ? `Every other ${payoutSettings?.payout_day}`
                : `${payoutSettings?.payout_day} of each month`}
            </p>
          </div>
          <div>
            <p className="text-sm opacity-90 mb-2">Payout Method</p>
            <p className="text-2xl font-bold">
              {payoutSettings?.payout_method === 'bank_transfer'
                ? 'Bank Transfer'
                : payoutSettings?.payout_method === 'paypal'
                ? 'PayPal'
                : 'Stripe'}
            </p>
            {payoutSettings?.bank_account_last4 && (
              <p className="text-sm opacity-75 mt-1">
                {payoutSettings?.bank_name} ****{payoutSettings?.bank_account_last4}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowPayoutModal(true)}
          className="mt-6 w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl p-3 text-center transition-all font-medium"
        >
          Update Payout Settings
        </button>
      </div>

      {showPayoutModal && payoutSettings && (
        <PayoutSettingsModal
          settings={payoutSettings}
          onClose={() => setShowPayoutModal(false)}
          onSave={onUpdatePayoutSettings}
        />
      )}

      {showRequestPayoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Request Payout</h2>
              <button
                onClick={() => {
                  setShowRequestPayoutModal(false);
                  setPayoutAmount('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Available Balance</h3>
                <p className="text-3xl font-bold text-blue-600">${balance.toFixed(2)}</p>
              </div>

              {feePercentage > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <span className="font-semibold">Platform Fee:</span> {feePercentage}% will be deducted from your payout
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payout Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={balance}
                  value={payoutAmount}
                  onChange={(e) => {
                    setPayoutAmount(e.target.value);
                    const amount = parseFloat(e.target.value) || 0;
                    setPlatformFee(calculateFee(amount));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter amount"
                />
              </div>

              {payoutAmount && !isNaN(parseFloat(payoutAmount)) && parseFloat(payoutAmount) > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Requested Amount:</span>
                    <span className="font-semibold text-gray-900">${parseFloat(payoutAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Platform Fee ({feePercentage}%):</span>
                    <span className="font-semibold text-red-600">-${platformFee.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 flex justify-between">
                    <span className="font-semibold text-gray-900">You Will Receive:</span>
                    <span className="font-bold text-green-600 text-lg">
                      ${(parseFloat(payoutAmount) - platformFee).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowRequestPayoutModal(false);
                    setPayoutAmount('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestPayout}
                  disabled={!payoutAmount || parseFloat(payoutAmount) <= 0 || parseFloat(payoutAmount) > balance}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
