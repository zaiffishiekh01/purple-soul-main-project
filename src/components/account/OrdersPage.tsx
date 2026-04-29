import { useState, useEffect } from 'react';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { supabase } from '../../lib/supabase';
import {
  Package, Search, Filter, Eye, Download, RefreshCw,
  X, Truck, MapPin, Calendar, DollarSign, ChevronDown,
  ChevronUp, AlertCircle, CheckCircle, Clock, RotateCcw, Loader2,
} from 'lucide-react';

interface OrdersPageProps { onBack?: () => void; onViewOrder?: (orderNumber: string) => void; }

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status?: string;
  total: number;
  subtotal?: number;
  shipping_cost?: number;
  tax_amount?: number;
  created_at: string;
  shipping_address?: any;
  order_items?: any[];
}

const statusConfig: Record<string, { color: string; bg: string; icon: typeof Package; label: string }> = {
  delivered: { color: 'text-green-700 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30', icon: CheckCircle, label: 'Delivered' },
  shipped: { color: 'text-purple-700 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30', icon: Truck, label: 'Shipped' },
  processing: { color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30', icon: Clock, label: 'Processing' },
  cancelled: { color: 'text-red-700 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', icon: AlertCircle, label: 'Cancelled' },
  pending: { color: 'text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: Clock, label: 'Pending' },
};

export default function OrdersPage({ onBack, onViewOrder }: OrdersPageProps) {
  const { user } = useCustomerAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    fetchOrders();
  }, [user, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = orders.filter(o => {
    if (search && !o.order_number.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const tabs = [
    { id: 'all', label: `All Orders (${orders.length})` },
    { id: 'active', label: `Active (${orders.filter(o => ['processing', 'shipped', 'pending'].includes(o.status)).length})` },
    { id: 'completed', label: `Completed (${orders.filter(o => o.status === 'delivered').length})` },
    { id: 'cancelled', label: `Cancelled (${orders.filter(o => o.status === 'cancelled').length})` },
  ];

  const getTabOrders = (tab: string) => {
    switch (tab) {
      case 'active': return filtered.filter(o => ['processing', 'shipped', 'pending'].includes(o.status));
      case 'completed': return filtered.filter(o => o.status === 'delivered');
      case 'cancelled': return filtered.filter(o => o.status === 'cancelled');
      default: return filtered;
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedOrders(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDownloadInvoice = (order: Order) => {
    const invoiceContent = `
INVOICE
=======
Order Number: ${order.order_number}
Date: ${new Date(order.created_at).toLocaleDateString()}
Status: ${order.status.toUpperCase()}

ITEMS:
${order.order_items?.map(i => `${i.product_name || 'Product'} x${i.quantity} - $${(i.price * i.quantity).toFixed(2)}`).join('\n') || 'No items'}

Subtotal: $${(order.subtotal || 0).toFixed(2)}
Shipping: $${(order.shipping_cost || 0).toFixed(2)}
Tax: $${(order.tax_amount || 0).toFixed(2)}
TOTAL: $${order.total.toFixed(2)}
    `.trim();

    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${order.order_number}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-400" />
          <p className="text-purple-200/70">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface border border-default rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-primary mb-2">My Orders</h2>
        <p className="text-secondary">View and manage your order history</p>
      </div>

      {/* Search & Filter */}
      <div className="bg-surface border border-default rounded-2xl p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order number..."
              className="w-full pl-10 pr-4 py-3 border border-default rounded-xl bg-surface-elevated text-primary focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-default rounded-xl bg-surface-elevated text-primary focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex gap-2 border-b border-default overflow-x-auto">
          {tabs.map(tab => (
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
      </div>

      {/* Orders List */}
      {getTabOrders(activeTab).length === 0 ? (
        <div className="bg-surface border border-default rounded-2xl p-12 text-center">
          <Package className="w-16 h-16 text-muted mx-auto mb-4" />
          <h3 className="text-xl font-bold text-primary mb-2">No orders found</h3>
          <p className="text-secondary">Start shopping to see your orders here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {getTabOrders(activeTab).map(order => {
            const config = statusConfig[order.status] || statusConfig.processing;
            const StatusIcon = config.icon;
            const isExpanded = expandedOrders.has(order.id);

            return (
              <div key={order.id} className="bg-surface border border-default rounded-2xl overflow-hidden hover:shadow-theme-lg transition-all">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-primary">Order #{order.order_number}</h3>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize flex items-center gap-1.5 ${config.bg} ${config.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {config.label}
                        </span>
                      </div>
                      <p className="text-sm text-secondary">
                        Placed {new Date(order.created_at).toLocaleDateString()} • ${(order.total || 0).toFixed(2)} • {order.order_items?.length || 0} {order.order_items?.length === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onViewOrder?.(order.order_number)}
                        className="px-3 py-2 border border-default rounded-lg text-sm text-secondary hover:text-primary hover:border-purple-300 dark:hover:border-purple-700 transition-colors flex items-center gap-1.5"
                      >
                        <Eye className="w-4 h-4" /> View
                      </button>
                      <button
                        onClick={() => handleDownloadInvoice(order)}
                        className="p-2 border border-default rounded-lg text-muted hover:text-primary hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                        title="Download Invoice"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Product Thumbnails */}
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {order.order_items?.slice(0, 4).map((item: any, i: number) => (
                        <div key={i} className="w-10 h-10 rounded-lg border-2 border-surface overflow-hidden bg-surface-deep">
                          {item.product_image ? (
                            <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Package className="w-4 h-4 text-muted" /></div>
                          )}
                        </div>
                      ))}
                      {(order.order_items?.length || 0) > 4 && (
                        <div className="w-10 h-10 rounded-lg border-2 border-surface bg-surface-elevated flex items-center justify-center text-xs text-secondary font-medium">
                          +{order.order_items!.length - 4}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => toggleExpand(order.id)}
                      className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1"
                    >
                      {isExpanded ? (
                        <>Hide details <ChevronUp className="w-4 h-4" /></>
                      ) : (
                        <>Show details <ChevronDown className="w-4 h-4" /></>
                      )}
                    </button>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && order.order_items && order.order_items.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-default space-y-4">
                      <div>
                        <h4 className="font-semibold text-primary mb-3">Items</h4>
                        <div className="space-y-3">
                          {order.order_items.map((item: any) => (
                            <div key={item.id} className="flex items-center gap-4 p-3 bg-surface-elevated rounded-lg">
                              <div className="w-14 h-14 rounded-lg border border-default bg-surface-deep overflow-hidden flex-shrink-0">
                                {item.product_image ? (
                                  <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-muted" /></div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-primary truncate">{item.product_name || 'Product'}</p>
                                <p className="text-sm text-secondary">Qty: {item.quantity}</p>
                              </div>
                              <p className="font-semibold text-primary">${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 p-4 bg-surface-elevated rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-secondary">
                          <Calendar className="w-4 h-4 text-purple-600" />
                          <span>Ordered: {new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-secondary">
                          <DollarSign className="w-4 h-4 text-purple-600" />
                          <span>Total: ${(order.total || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
