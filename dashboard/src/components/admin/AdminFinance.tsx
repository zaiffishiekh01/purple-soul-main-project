import { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Download, CreditCard, MessageSquare } from 'lucide-react';
import { useTransactions } from '../../hooks/useTransactions';
import { dashboardClient } from '../../lib/data-client';
import { downloadCSV } from '../../lib/export';

export function AdminFinance() {
  const { transactions, loading } = useTransactions();
  const [dateFilter, setDateFilter] = useState('all');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [message, setMessage] = useState('');

  const filteredTransactions = transactions.filter(tx => {
    if (dateFilter === 'all') return true;
    const txDate = new Date(tx.created_at);
    const now = new Date();
    if (dateFilter === 'today') {
      return txDate.toDateString() === now.toDateString();
    }
    if (dateFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return txDate >= weekAgo;
    }
    if (dateFilter === 'month') {
      return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  const totalRevenue = filteredTransactions
    .filter(tx => tx.type === 'sale' && tx.status === 'completed')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalPayouts = filteredTransactions
    .filter(tx => tx.type === 'payout' && tx.status === 'completed')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const pendingPayouts = filteredTransactions
    .filter(tx => tx.type === 'payout' && tx.status === 'pending')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const platformFees = filteredTransactions
    .filter(tx => tx.type === 'fee' && tx.status === 'completed')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const sendMessageToVendor = async () => {
    if (!selectedVendor || !message.trim()) return;

    try {
      await dashboardClient.from('notifications').insert({
        vendor_id: selectedVendor.id,
        type: 'admin_message',
        title: 'Message from Admin',
        message: message.trim(),
        is_read: false,
      });

      setShowMessageModal(false);
      setMessage('');
      setSelectedVendor(null);
      alert('Message sent to vendor successfully!');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-emerald-600" />
            Platform Finance
          </h1>
          <p className="text-gray-600 mt-1">Monitor revenue, payouts, and platform fees</p>
        </div>
        <button
          onClick={() => {
            const exportData = filteredTransactions.map((tx) => ({
              vendor: tx.vendors?.business_name || tx.vendor_id?.slice(0, 8) || 'N/A',
              type: tx.type,
              amount: tx.amount,
              status: tx.status,
              date: new Date(tx.created_at).toLocaleString(),
            }));
            downloadCSV(exportData, 'finance-report');
          }}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-100">Total Revenue</span>
            <TrendingUp className="w-5 h-5 text-emerald-100" />
          </div>
          <div className="text-3xl font-bold">${totalRevenue.toFixed(2)}</div>
          <div className="text-sm text-emerald-100 mt-1">+18% from last period</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Total Payouts</span>
            <TrendingDown className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900">${totalPayouts.toFixed(2)}</div>
          <div className="text-sm text-gray-600 mt-1">Completed payouts</div>
        </div>

        <div className="bg-yellow-50 p-6 rounded-xl shadow-sm border border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-yellow-700">Pending Payouts</span>
            <Calendar className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="text-3xl font-bold text-yellow-900">${pendingPayouts.toFixed(2)}</div>
          <div className="text-sm text-yellow-700 mt-1">Awaiting processing</div>
        </div>

        <div className="bg-blue-50 p-6 rounded-xl shadow-sm border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-700">Platform Fees</span>
            <CreditCard className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-blue-900">${platformFees.toFixed(2)}</div>
          <div className="text-sm text-blue-700 mt-1">Commission earned</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Vendor</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.slice(0, 20).map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        {transaction.vendors?.business_name || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        ID: {transaction.vendor_id?.slice(0, 8)}...
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                      transaction.type === 'sale' ? 'bg-green-100 text-green-700 border-green-200' :
                      transaction.type === 'payout' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                      transaction.type === 'refund' ? 'bg-red-100 text-red-700 border-red-200' :
                      'bg-gray-100 text-gray-700 border-gray-200'
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className={`font-semibold ${
                      transaction.type === 'sale' || transaction.type === 'fee' ? 'text-green-600' :
                      transaction.type === 'payout' || transaction.type === 'refund' ? 'text-red-600' :
                      'text-gray-900'
                    }`}>
                      {transaction.type === 'sale' || transaction.type === 'fee' ? '+' : '-'}
                      ${transaction.amount.toFixed(2)}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                      transaction.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' :
                      transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                      'bg-red-100 text-red-700 border-red-200'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-gray-600">
                      {new Date(transaction.created_at).toLocaleString()}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {transaction.vendors && (
                      <button
                        onClick={() => {
                          setSelectedVendor(transaction.vendors);
                          setShowMessageModal(true);
                        }}
                        className="p-2 hover:bg-emerald-50 rounded-lg transition-colors text-emerald-600"
                        title="Message Vendor"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No transactions found for the selected period
            </div>
          )}
        </div>
      </div>

      {showMessageModal && selectedVendor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Message Vendor</h2>
              <button
                onClick={() => {
                  setShowMessageModal(false);
                  setMessage('');
                  setSelectedVendor(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To: {selectedVendor.business_name}
                </label>
                <div className="text-sm text-gray-500">
                  {selectedVendor.contact_email}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Type your message to the vendor..."
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowMessageModal(false);
                    setMessage('');
                    setSelectedVendor(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={sendMessageToVendor}
                  disabled={!message.trim()}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
