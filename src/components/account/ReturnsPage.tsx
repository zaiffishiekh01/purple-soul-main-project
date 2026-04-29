import { useState, useEffect } from 'react';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { supabase } from '../../lib/supabase';
import {
  RotateCcw, DollarSign, Package, Search, AlertCircle,
  CheckCircle2, ChevronLeft, ChevronRight, Sparkles, X, Loader2,
} from 'lucide-react';

interface ReturnsPageProps { onBack?: () => void; }

interface Order {
  id: string;
  order_number: string;
  total: number;
  created_at: string;
  order_items?: any[];
}

interface ReturnRequest {
  id: string;
  order_id: string;
  order_number?: string;
  reason?: string;
  status: string;
  amount?: number;
  created_at: string;
  items?: any[];
}

const statusColors: Record<string, string> = {
  submitted: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  approved: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  in_transit: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  received: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  refunded: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  rejected: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
};

const statusLabels: Record<string, string> = {
  submitted: 'Submitted',
  approved: 'Approved',
  in_transit: 'In Transit',
  received: 'Received',
  refunded: 'Refunded',
  rejected: 'Rejected',
};

const reasonLabels: Record<string, string> = {
  not_as_described: 'Not as described',
  damaged: 'Damaged/Defective',
  wrong_item: 'Wrong item received',
  changed_mind: 'Changed my mind',
  poor_quality: 'Poor quality',
};

export default function ReturnsPage({ onBack }: ReturnsPageProps) {
  const { user } = useCustomerAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('returns');
  const [selectedOrder, setSelectedOrder] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [returnReason, setReturnReason] = useState('');
  const [itemCondition, setItemCondition] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch delivered orders for returns
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', user!.id)
        .eq('status', 'delivered')
        .order('created_at', { ascending: false });

      setOrders(ordersData || []);

      // Fetch returns
      const { data: returnsData } = await supabase
        .from('returns')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      setReturns(returnsData || []);
    } catch (error) {
      console.error('Error fetching returns data:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedOrderData = orders.find(o => o.id === selectedOrder);
  const returnTotal = selectedOrderData?.order_items
    ?.filter((i: any) => selectedItems.includes(i.id))
    .reduce((sum: number, i: any) => sum + (i.price || 0) * (i.quantity || 1), 0) || 0;

  const handleSubmitReturn = async () => {
    if (!selectedOrder || selectedItems.length === 0 || !returnReason || !itemCondition) {
      setSuccessMessage('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const returnNumber = `RET-${Date.now()}`;
      const { data, error } = await supabase
        .from('returns')
        .insert({
          order_id: selectedOrder,
          user_id: user!.id,
          return_number: returnNumber,
          items: selectedOrderData?.order_items?.filter((i: any) => selectedItems.includes(i.id)) || [],
          reason: returnReason,
          condition: itemCondition,
          amount: returnTotal,
          status: 'submitted',
        })
        .select()
        .single();

      if (error) throw error;

      setReturns(prev => [data, ...prev]);
      setSelectedOrder('');
      setSelectedItems([]);
      setReturnReason('');
      setItemCondition('');
      setSuccessMessage('Return request submitted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Error submitting return:', error);
      setSuccessMessage('Failed to submit return: ' + error.message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-400" />
          <p className="text-purple-200/70">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface border border-default rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-primary mb-2">Returns & Refunds</h2>
        <p className="text-secondary">Manage your return requests and refunds</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-green-700 dark:text-green-400 font-medium">{successMessage}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-default overflow-x-auto">
        {[
          { id: 'returns', label: 'My Returns' },
          { id: 'new', label: 'Start a Return' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-secondary hover:text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Returns List */}
      {activeTab === 'returns' && (
        returns.length === 0 ? (
          <div className="bg-surface border border-default rounded-2xl p-12 text-center">
            <RotateCcw className="w-16 h-16 text-muted mx-auto mb-4" />
            <h3 className="text-xl font-bold text-primary mb-2">No returns yet</h3>
            <p className="text-secondary">Start a return for your delivered orders</p>
          </div>
        ) : (
          <div className="space-y-4">
            {returns.map(ret => {
              const config = statusColors[ret.status] || statusColors.submitted;
              return (
                <div key={ret.id} className="p-4 bg-surface-elevated border border-default rounded-xl">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-primary">Return #{ret.return_number || ret.id.slice(0, 8)}</p>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${config}`}>
                          {statusLabels[ret.status] || ret.status}
                        </span>
                      </div>
                      <p className="text-sm text-secondary">
                        Order #{ret.order_id?.slice(0, 8) || 'N/A'} • Submitted {new Date(ret.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="font-semibold text-purple-600 dark:text-purple-400">${(ret.amount || 0).toFixed(2)}</p>
                  </div>
                  {ret.reason && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm text-muted">Reason:</span>
                      <span className="text-sm text-secondary">{reasonLabels[ret.reason] || ret.reason}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}

      {/* New Return Form */}
      {activeTab === 'new' && (
        <div className="bg-surface border border-default rounded-2xl p-6">
          <h3 className="text-lg font-bold text-primary mb-6">Start a Return</h3>
          <div className="space-y-6">
            {/* Order Selection */}
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">Select Order</label>
              <select
                value={selectedOrder}
                onChange={(e) => { setSelectedOrder(e.target.value); setSelectedItems([]); }}
                className="w-full px-4 py-3 border border-default rounded-xl bg-surface-elevated text-primary focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Choose an order...</option>
                {orders.map(order => (
                  <option key={order.id} value={order.id}>
                    Order #{order.order_number} - ${(order.total || 0).toFixed(2)} ({new Date(order.created_at).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>

            {/* Items Selection */}
            {selectedOrderData && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-secondary">Select Items to Return</label>
                {(selectedOrderData.order_items || []).map((item: any) => (
                  <label key={item.id} className="flex items-center gap-4 p-4 bg-surface-elevated border border-default rounded-lg cursor-pointer hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems([...selectedItems, item.id]);
                        } else {
                          setSelectedItems(selectedItems.filter(i => i !== item.id));
                        }
                      }}
                      className="w-5 h-5 rounded border-default bg-background checked:bg-purple-600 focus:ring-2 focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-primary">{item.product_name || 'Product'}</p>
                      <p className="text-sm text-secondary">Qty: {item.quantity} • ${(item.price || 0).toFixed(2)}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">Reason for Return</label>
              <select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full px-4 py-3 border border-default rounded-xl bg-surface-elevated text-primary focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select reason...</option>
                <option value="not_as_described">Not as described</option>
                <option value="damaged">Damaged/Defective</option>
                <option value="wrong_item">Wrong item received</option>
                <option value="changed_mind">Changed my mind</option>
                <option value="poor_quality">Poor quality</option>
              </select>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">Item Condition</label>
              <select
                value={itemCondition}
                onChange={(e) => setItemCondition(e.target.value)}
                className="w-full px-4 py-3 border border-default rounded-xl bg-surface-elevated text-primary focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select condition...</option>
                <option value="unopened">Unopened/Sealed</option>
                <option value="opened_unused">Opened but unused</option>
                <option value="opened_used">Opened/Used</option>
                <option value="damaged">Damaged</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitReturn}
              disabled={submitting || !selectedOrder || selectedItems.length === 0 || !returnReason || !itemCondition}
              className="w-full gradient-purple-soul text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <RotateCcw className="w-5 h-5" />}
              {submitting ? 'Submitting...' : 'Submit Return Request'}
            </button>
          </div>
        </div>
      )}

      {/* Return Policy Info */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
            <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h4 className="font-semibold text-amber-900 dark:text-amber-200 mb-2">Return Policy</h4>
            <ul className="text-sm text-amber-800 dark:text-amber-300 space-y-1">
              <li>• 30-day return window from delivery date</li>
              <li>• Items must be in original condition</li>
              <li>• Refunds processed within 5-7 business days</li>
              <li>• Return shipping may apply</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
