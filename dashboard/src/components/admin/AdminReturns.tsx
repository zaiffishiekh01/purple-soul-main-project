import { useState, useEffect } from 'react';
import { RotateCcw, Search, CheckCircle, XCircle, DollarSign, Package } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Return {
  id: string;
  order_id: string;
  vendor_id: string;
  return_number: string;
  customer_name: string;
  customer_email: string;
  reason: string;
  status: string;
  return_amount: number;
  restocking_fee: number;
  refund_method: string;
  notes: string;
  items: any;
  requested_at: string;
  approved_at: string | null;
  processed_at: string | null;
  vendors?: {
    business_name: string;
  };
  orders?: {
    order_number: string;
  };
}

export default function AdminReturns() {
  const [returns, setReturns] = useState<Return[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);

  useEffect(() => {
    fetchReturns();
  }, [statusFilter]);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('returns')
        .select(`
          *,
          vendors (business_name),
          orders (order_number)
        `)
        .order('requested_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setReturns(data || []);
    } catch (error) {
      console.error('Error fetching returns:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateReturnStatus = async (returnId: string, newStatus: string) => {
    try {
      const updates: any = { status: newStatus };

      if (newStatus === 'approved') {
        updates.approved_at = new Date().toISOString();
      } else if (newStatus === 'processed') {
        updates.processed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('returns')
        .update(updates)
        .eq('id', returnId);

      if (error) throw error;
      fetchReturns();
      setSelectedReturn(null);
    } catch (error) {
      console.error('Error updating return:', error);
    }
  };

  const filteredReturns = returns.filter(ret =>
    ret.return_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ret.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ret.vendors?.business_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: returns.length,
    pending: returns.filter(r => r.status === 'pending').length,
    approved: returns.filter(r => r.status === 'approved').length,
    rejected: returns.filter(r => r.status === 'rejected').length,
    totalAmount: returns.reduce((sum, r) => sum + (r.return_amount || 0), 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Returns Management</h2>
          <p className="text-gray-600 mt-1">Monitor and manage all returns across vendors</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Returns</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <RotateCcw className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Package className="w-10 h-10 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Approved</p>
              <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Amount</p>
              <p className="text-3xl font-bold text-gray-900">${stats.totalAmount.toFixed(2)}</p>
            </div>
            <DollarSign className="w-10 h-10 text-blue-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by return number, customer, or vendor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === 'approved'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === 'rejected'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rejected
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Return Number</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Order</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Vendor</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Reason</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    Loading returns...
                  </td>
                </tr>
              ) : filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    No returns found
                  </td>
                </tr>
              ) : (
                filteredReturns.map((ret) => (
                  <tr key={ret.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm">{ret.return_number}</td>
                    <td className="py-3 px-4 text-sm">{ret.orders?.order_number}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium">{ret.customer_name}</div>
                      <div className="text-sm text-gray-500">{ret.customer_email}</div>
                    </td>
                    <td className="py-3 px-4 text-sm">{ret.vendors?.business_name}</td>
                    <td className="py-3 px-4">
                      <span className="text-sm capitalize">{ret.reason?.replace('_', ' ')}</span>
                    </td>
                    <td className="py-3 px-4 font-medium">${ret.return_amount?.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        ret.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : ret.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : ret.status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {ret.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setSelectedReturn(ret)}
                        className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedReturn && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Return Details</h3>
                <button
                  onClick={() => setSelectedReturn(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Return Number</label>
                  <p className="mt-1 font-mono text-sm">{selectedReturn.return_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Order Number</label>
                  <p className="mt-1">{selectedReturn.orders?.order_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Customer</label>
                  <p className="mt-1">{selectedReturn.customer_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Vendor</label>
                  <p className="mt-1">{selectedReturn.vendors?.business_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Return Amount</label>
                  <p className="mt-1 font-bold">${selectedReturn.return_amount?.toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Current Status</label>
                  <p className="mt-1 capitalize">{selectedReturn.status}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Reason</label>
                <p className="mt-1 capitalize">{selectedReturn.reason?.replace('_', ' ')}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Notes</label>
                <p className="mt-1 text-sm text-gray-600">{selectedReturn.notes || 'No notes'}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Admin Actions</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateReturnStatus(selectedReturn.id, 'approved')}
                    disabled={selectedReturn.status === 'approved'}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Approve Return
                  </button>
                  <button
                    onClick={() => updateReturnStatus(selectedReturn.id, 'rejected')}
                    disabled={selectedReturn.status === 'rejected'}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reject Return
                  </button>
                  <button
                    onClick={() => updateReturnStatus(selectedReturn.id, 'processed')}
                    disabled={selectedReturn.status === 'processed'}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Mark Processed
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
