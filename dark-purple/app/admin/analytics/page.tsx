'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Package,
  Users,
  Activity
} from 'lucide-react';

interface AnalyticsData {
  revenue: {
    total: number;
    this_month: number;
    last_month: number;
  };
  orders: {
    total: number;
    this_month: number;
    pending: number;
  };
  products: {
    total: number;
    active: number;
    low_stock: number;
  };
  vendors: {
    total: number;
    active: number;
  };
  top_products: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  top_vendors: Array<{
    id: string;
    email: string;
    sales: number;
    revenue: number;
  }>;
}

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const stats = data.stats;

        setAnalytics({
          revenue: {
            total: stats.total_revenue || 0,
            this_month: stats.total_revenue || 0,
            last_month: 0,
          },
          orders: {
            total: stats.total_orders || 0,
            this_month: stats.total_orders || 0,
            pending: stats.pending_orders || 0,
          },
          products: {
            total: stats.total_products || 0,
            active: stats.active_products || 0,
            low_stock: 0,
          },
          vendors: {
            total: stats.total_vendors || 0,
            active: stats.total_vendors || 0,
          },
          top_products: [],
          top_vendors: [],
        });
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center text-gray-500">
        Failed to load analytics data
      </div>
    );
  }

  const revenueGrowth = analytics.revenue.last_month > 0
    ? ((analytics.revenue.this_month - analytics.revenue.last_month) / analytics.revenue.last_month) * 100
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-2 text-gray-600">
          Comprehensive marketplace insights and performance metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Revenue
            </CardTitle>
            <div className="bg-green-50 p-2 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ${(analytics.revenue.total / 100).toFixed(2)}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              ${(analytics.revenue.this_month / 100).toFixed(2)} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Orders
            </CardTitle>
            <div className="bg-blue-50 p-2 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {analytics.orders.total}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {analytics.orders.pending} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Products
            </CardTitle>
            <div className="bg-purple-50 p-2 rounded-lg">
              <Package className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {analytics.products.total}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {analytics.products.active} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Vendors
            </CardTitle>
            <div className="bg-orange-50 p-2 rounded-lg">
              <Users className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {analytics.vendors.total}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {analytics.vendors.active} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Average Order Value
            </CardTitle>
            <div className="bg-indigo-50 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ${analytics.orders.total > 0
                ? ((analytics.revenue.total / analytics.orders.total) / 100).toFixed(2)
                : '0.00'}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Per order
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Conversion Rate
            </CardTitle>
            <div className="bg-pink-50 p-2 rounded-lg">
              <Activity className="h-5 w-5 text-pink-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              N/A
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Coming soon
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              Chart visualization coming soon
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              Chart visualization coming soon
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.top_products.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No sales data available yet
                </p>
              ) : (
                analytics.top_products.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.sales} sales</p>
                    </div>
                    <p className="font-medium text-gray-900">
                      ${(product.revenue / 100).toFixed(2)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.top_vendors.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No vendor sales data available yet
                </p>
              ) : (
                analytics.top_vendors.map((vendor, index) => (
                  <div key={vendor.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{vendor.email}</p>
                      <p className="text-sm text-gray-500">{vendor.sales} orders</p>
                    </div>
                    <p className="font-medium text-gray-900">
                      ${(vendor.revenue / 100).toFixed(2)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
