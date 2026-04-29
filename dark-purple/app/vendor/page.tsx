'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ShoppingCart, DollarSign, AlertTriangle, Loader2, Plus, Eye } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/button';

interface DashboardStats {
  revenue: {
    total: number;
    last_30_days: number;
  };
  orders: {
    total: number;
    pending: number;
    processing: number;
  };
  products: {
    total: number;
    low_stock: number;
    out_of_stock: number;
  };
  alerts: {
    low_stock: number;
    out_of_stock: number;
    pending_orders: number;
  };
}

interface RecentOrder {
  id: string;
  order_number: string;
  total: string;
  status: string;
  created_at: string;
  customer: {
    email: string;
  };
}

export default function VendorDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsData, ordersData] = await Promise.all([
        apiClient.get<{ data: DashboardStats }>('/vendor/dashboard/stats'),
        apiClient.get<{ data: RecentOrder[] }>('/vendor/orders?limit=5')
      ]);

      setStats(statsData.data);
      setRecentOrders(ordersData.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-white/50" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-6 border-red-500/30">
        <div className="flex items-center gap-3 text-red-400">
          <AlertTriangle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats?.products.total || 0,
      subtitle: `${(stats?.products.total || 0) - (stats?.products.out_of_stock || 0)} in stock`,
      icon: Package,
      gradient: 'from-blue-500/20 to-blue-600/20',
      iconColor: '#60a5fa'
    },
    {
      title: 'Total Orders',
      value: stats?.orders.total || 0,
      subtitle: `${stats?.orders.pending || 0} pending`,
      icon: ShoppingCart,
      gradient: 'from-green-500/20 to-green-600/20',
      iconColor: '#34d399'
    },
    {
      title: 'Revenue (30 Days)',
      value: `$${(stats?.revenue.last_30_days || 0).toFixed(2)}`,
      subtitle: 'Last 30 days',
      icon: DollarSign,
      gradient: 'from-amber-500/20 to-amber-600/20',
      iconColor: '#d4af8a'
    },
    {
      title: 'Low Stock Items',
      value: stats?.alerts.low_stock || 0,
      subtitle: 'Need attention',
      icon: AlertTriangle,
      gradient: 'from-orange-500/20 to-orange-600/20',
      iconColor: '#fb923c'
    }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-serif text-white">Vendor Dashboard</h1>
          <p className="mt-2 text-white/60">
            Welcome back! Here's an overview of your store.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.title} className="glass-card glass-card-hover p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-white/70 text-sm font-medium">
                    {stat.title}
                  </div>
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                    <Icon className="h-5 w-5" style={{ color: stat.iconColor }} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <p className="text-sm text-white/50">{stat.subtitle}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-card glass-card-hover p-8">
            <h2 className="text-2xl font-serif text-white mb-6">Recent Orders</h2>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 mx-auto mb-3" style={{ color: '#d4af8a' }} />
                <p className="text-white/60">
                  No orders yet. Orders will appear here once customers start purchasing your products.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/vendor/orders/${order.id}`}
                    className="block p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">{order.order_number}</div>
                        <div className="text-white/50 text-sm mt-1">
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-rose-gold font-semibold">
                          ${parseFloat(order.total).toFixed(2)}
                        </div>
                        <div className="text-white/50 text-sm mt-1 capitalize">
                          {order.status.replace(/_/g, ' ')}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
                <Link href="/vendor/orders">
                  <Button
                    variant="outline"
                    className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10"
                  >
                    View All Orders
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div className="glass-card glass-card-hover p-8">
            <h2 className="text-2xl font-serif text-white mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/vendor/products/new">
                <Button className="w-full celestial-button">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Product
                </Button>
              </Link>
              <Link href="/vendor/products">
                <Button
                  variant="outline"
                  className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View All Products
                </Button>
              </Link>
              <Link href="/vendor/orders">
                <Button
                  variant="outline"
                  className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Manage Orders
                </Button>
              </Link>
            </div>

            {(stats?.alerts.low_stock || 0) > 0 && (
              <div className="mt-6 p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-400 mt-0.5" />
                  <div>
                    <div className="text-orange-300 font-medium mb-1">
                      Low Stock Alert
                    </div>
                    <p className="text-white/60 text-sm">
                      You have {stats?.alerts.low_stock} {stats?.alerts.low_stock === 1 ? 'product' : 'products'} with low inventory.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
