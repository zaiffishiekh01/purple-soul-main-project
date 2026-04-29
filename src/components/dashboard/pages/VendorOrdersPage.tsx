import { useState, useMemo, useCallback } from 'react';
import { useDashboardAuth } from '../../../contexts/DashboardAuthContext';
import { useOrders } from '../../../hooks/useOrders';
import {
  Search,
  Filter,
  Download,
  Eye,
  ChevronDown,
  ShoppingCart,
  ArrowUpRight,
} from 'lucide-react';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getStatusBadgeClasses(status: string): string {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'delivered':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'pending':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'processing':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    case 'shipped':
      return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
    case 'cancelled':
    case 'refunded':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  }
}

const ORDER_STATUSES = ['all', 'pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded'];

export default function VendorOrdersPage() {
  const { vendor, loading: authLoading } = useDashboardAuth();
  const { orders, loading: ordersLoading, updateOrder, refetch } = useOrders(vendor?.id);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loading = authLoading || ordersLoading;

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter;
      const matchesSearch =
        searchQuery === '' ||
        order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.customer_email && order.customer_email.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, searchQuery]);

  const handleExportCSV = useCallback(() => {
    const headers = ['Order Number', 'Customer', 'Email', 'Date', 'Total', 'Status', 'Payment Status'];
    const rows = filteredOrders.map((order) => [
      order.order_number,
      order.customer_name,
      order.customer_email || '',
      formatDate(order.created_at),
      order.total_amount.toString(),
      order.status,
      order.payment_status,
    ]);

    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [filteredOrders]);

  const handleUpdateStatus = useCallback(
    async (orderId: string, newStatus: string) => {
      try {
        setError(null);
        setUpdatingOrderId(orderId);
        await updateOrder(orderId, { status: newStatus });
        await refetch();
      } catch (err) {
        console.error('Error updating order status:', err);
        setError('Failed to update order status. Please try again.');
      } finally {
        setUpdatingOrderId(null);
      }
    },
    [updateOrder, refetch],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-sm text-muted">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="text-center py-20">
        <ShoppingCart className="w-12 h-12 text-muted mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-primary">No vendor profile found</h2>
        <p className="text-sm text-muted mt-1">Please contact support to set up your vendor account.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Orders</h1>
          <p className="text-sm text-muted mt-1">{orders.length} total orders</p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={filteredOrders.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-theme-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 flex items-center justify-between">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 text-sm font-medium">
            Dismiss
          </button>
        </div>
      )}

      {/* Filters bar */}
      <div className="bg-surface rounded-xl border border-default shadow-theme-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search by order number or customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-deep border border-default text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
            />
          </div>

          {/* Status filter */}
          <div className="relative">
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-deep border border-default text-sm text-secondary hover:text-primary transition-colors"
            >
              <Filter className="w-4 h-4" />
              {statusFilter === 'all' ? 'All Status' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              <ChevronDown className="w-4 h-4" />
            </button>
            {showStatusDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowStatusDropdown(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-default rounded-lg shadow-theme-xl z-20 py-1">
                  {ORDER_STATUSES.map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        setShowStatusDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-surface-deep transition-colors ${
                        statusFilter === status ? 'text-purple-600 font-medium' : 'text-secondary'
                      }`}
                    >
                      {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Active filter count */}
        {searchQuery || statusFilter !== 'all' ? (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-muted">
              {filteredOrders.length} result{filteredOrders.length !== 1 ? 's' : ''} found
            </span>
            {(searchQuery || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="text-xs text-purple-600 hover:text-purple-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : null}
      </div>

      {/* Orders table */}
      <div className="bg-surface rounded-xl border border-default shadow-theme-sm overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 px-6">
            <ShoppingCart className="w-12 h-12 text-muted mx-auto mb-4" />
            <h3 className="text-base font-semibold text-primary">No orders found</h3>
            <p className="text-sm text-muted mt-1">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'Orders will appear here once customers start purchasing.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-deep/60">
                  <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-6 py-3">Order</th>
                  <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-6 py-3">Customer</th>
                  <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-6 py-3">Date</th>
                  <th className="text-right text-xs font-medium text-muted uppercase tracking-wider px-6 py-3">Total</th>
                  <th className="text-center text-xs font-medium text-muted uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-right text-xs font-medium text-muted uppercase tracking-wider px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-default">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-surface-deep/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-purple-600">{order.order_number}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-primary">{order.customer_name}</p>
                        {order.customer_email && (
                          <p className="text-xs text-muted">{order.customer_email}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">{formatDate(order.created_at)}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-primary text-right">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {/* Status update dropdown */}
                        <div className="relative">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                            disabled={updatingOrderId === order.id}
                            className="text-xs rounded-md border border-default bg-surface-deep text-secondary px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:opacity-50 cursor-pointer"
                          >
                            {ORDER_STATUSES.filter((s) => s !== 'all').map((s) => (
                              <option key={s} value={s}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </option>
                            ))}
                          </select>
                          {updatingOrderId === order.id && (
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 mr-1">
                              <div className="w-3 h-3 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                            </div>
                          )}
                        </div>
                        <button
                          title="View details"
                          className="p-1.5 rounded-md hover:bg-surface-deep text-muted hover:text-primary transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
