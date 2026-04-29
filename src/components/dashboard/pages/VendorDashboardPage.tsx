import { useMemo } from 'react';
import { useDashboardAuth } from '../../../contexts/DashboardAuthContext';
import { useDashboardData } from '../../../hooks/useDashboardData';
import { useNotifications } from '../../../hooks/useNotifications';
import {
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
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

function getStatusBadge(status: string): string {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'delivered':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'pending':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'processing':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    case 'cancelled':
    case 'refunded':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  }
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: typeof DollarSign;
  growth?: number;
  iconBg: string;
}

function StatCard({ title, value, icon: Icon, growth, iconBg }: StatCardProps) {
  const GrowthIcon = growth !== undefined ? (growth > 0 ? TrendingUp : growth < 0 ? TrendingDown : Minus) : null;

  return (
    <div className="bg-surface rounded-xl border border-default p-6 shadow-theme-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-muted">{title}</p>
            <p className="text-2xl font-bold text-primary">{value}</p>
          </div>
        </div>
        {GrowthIcon && growth !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {growth > 0 ? <ArrowUpRight className="w-4 h-4" /> : growth < 0 ? <ArrowDownRight className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
            {Math.abs(growth)}%
          </div>
        )}
      </div>
    </div>
  );
}

export default function VendorDashboardPage() {
  const { vendor, loading: authLoading } = useDashboardAuth();
  const { stats, loading: statsLoading } = useDashboardData({
    vendorId: vendor?.id,
  });
  const { notifications, loading: notifLoading } = useNotifications();

  const loading = authLoading || statsLoading || notifLoading;

  const lowStockItems = useMemo(() => stats.lowStockProducts, [stats.lowStockProducts]);

  const recentActivity = useMemo(() => {
    const items: { id: string; message: string; time: string; type: string }[] = [];

    stats.recentOrders.forEach((order) => {
      items.push({
        id: `order-${order.id}`,
        message: `New order ${order.order_number} from ${order.customer_name}`,
        time: formatDate(order.created_at),
        type: 'order',
      });
    });

    lowStockItems.forEach((product) => {
      items.push({
        id: `stock-${product.id}`,
        message: `Low stock alert: ${product.name} (${product.stock_quantity} remaining)`,
        time: formatDate(product.updated_at),
        type: 'alert',
      });
    });

    notifications.slice(0, 3).forEach((notif) => {
      items.push({
        id: `notif-${notif.id}`,
        message: notif.message,
        time: formatDate(notif.created_at),
        type: notif.type,
      });
    });

    return items.sort((a, b) => b.time.localeCompare(a.time)).slice(0, 8);
  }, [stats.recentOrders, lowStockItems, notifications]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-sm text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="text-center py-20">
        <Package className="w-12 h-12 text-muted mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-primary">No vendor profile found</h2>
        <p className="text-sm text-muted mt-1">Please contact support to set up your vendor account.</p>
      </div>
    );
  }

  const simulatedGrowth = {
    revenue: 12.5,
    orders: -3.2,
    products: 8.0,
    pending: 0,
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-primary">Dashboard Overview</h1>
        <p className="text-sm text-muted mt-1">Welcome back, {vendor.business_name}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          growth={simulatedGrowth.revenue}
          iconBg="bg-gradient-to-br from-purple-600 to-purple-700"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingCart}
          growth={simulatedGrowth.orders}
          iconBg="bg-gradient-to-br from-blue-600 to-blue-700"
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={Package}
          growth={simulatedGrowth.products}
          iconBg="bg-gradient-to-br from-green-600 to-green-700"
        />
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon={Clock}
          growth={simulatedGrowth.pending}
          iconBg="bg-gradient-to-br from-amber-600 to-amber-700"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-surface rounded-xl border border-default shadow-theme-sm">
          <div className="flex items-center justify-between p-6 pb-4">
            <h2 className="text-lg font-semibold text-primary">Recent Orders</h2>
            <a
              href="/vendor/orders"
              className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
            >
              View all
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
          <div className="overflow-x-auto">
            {stats.recentOrders.length === 0 ? (
              <div className="text-center py-12 px-6">
                <ShoppingCart className="w-10 h-10 text-muted mx-auto mb-3" />
                <p className="text-sm text-muted">No orders yet</p>
                <p className="text-xs text-muted mt-1">Orders will appear here once customers start purchasing.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-t border-default">
                    <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-6 py-3">Order</th>
                    <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-6 py-3">Customer</th>
                    <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-6 py-3">Date</th>
                    <th className="text-right text-xs font-medium text-muted uppercase tracking-wider px-6 py-3">Total</th>
                    <th className="text-center text-xs font-medium text-muted uppercase tracking-wider px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-default">
                  {stats.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-surface-deep/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-purple-600">{order.order_number}</td>
                      <td className="px-6 py-4 text-sm text-secondary">{order.customer_name}</td>
                      <td className="px-6 py-4 text-sm text-muted">{formatDate(order.created_at)}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-primary text-right">{formatCurrency(order.total_amount)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Low stock alerts */}
        <div className="bg-surface rounded-xl border border-default shadow-theme-sm">
          <div className="flex items-center justify-between p-6 pb-4">
            <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Low Stock Alerts
            </h2>
          </div>
          {lowStockItems.length === 0 ? (
            <div className="text-center py-12 px-6">
              <Package className="w-10 h-10 text-muted mx-auto mb-3" />
              <p className="text-sm text-muted">All stocked up</p>
              <p className="text-xs text-muted mt-1">No products are running low on inventory.</p>
            </div>
          ) : (
            <div className="px-6 pb-6 space-y-3">
              {lowStockItems.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-surface-deep/60 border border-default"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-primary truncate">{product.name}</p>
                    <p className="text-xs text-muted">SKU: {product.sku}</p>
                  </div>
                  <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    (product.stock_quantity ?? 0) === 0
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}>
                    {product.stock_quantity ?? 0} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent activity feed */}
      <div className="bg-surface rounded-xl border border-default shadow-theme-sm">
        <div className="flex items-center gap-2 p-6 pb-4">
          <Activity className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-primary">Recent Activity</h2>
        </div>
        {recentActivity.length === 0 ? (
          <div className="text-center py-12 px-6">
            <Activity className="w-10 h-10 text-muted mx-auto mb-3" />
            <p className="text-sm text-muted">No activity yet</p>
            <p className="text-xs text-muted mt-1">Your recent activity will be shown here.</p>
          </div>
        ) : (
          <div className="px-6 pb-6 space-y-3">
            {recentActivity.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-deep/50 transition-colors"
              >
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                  item.type === 'order' ? 'bg-purple-600' : item.type === 'alert' ? 'bg-amber-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-secondary">{item.message}</p>
                  <p className="text-xs text-muted mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
