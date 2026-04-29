import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, DollarSign, ShoppingCart, Users, Package, TrendingDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAdminVendors } from '../../hooks/useAdminVendors';
import { useOrders } from '../../hooks/useOrders';
import { useProducts } from '../../hooks/useProducts';
import { useTransactions } from '../../hooks/useTransactions';

export function AdminAnalytics() {
  const { vendors } = useAdminVendors();
  const { orders } = useOrders();
  const { products } = useProducts();
  const { transactions } = useTransactions();

  const vendorStats = useMemo(() => {
    const stats = vendors.map(vendor => {
      const vendorOrders = orders.filter(o => o.vendor_id === vendor.id);
      const revenue = vendorOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
      return {
        id: vendor.id,
        name: vendor.business_name,
        revenue,
        orders: vendorOrders.length,
        growth: '+0%'
      };
    });
    stats.sort((a, b) => b.revenue - a.revenue);
    return stats.slice(0, 5);
  }, [vendors.length, orders.length]);

  const totalRevenue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const activeVendors = vendors.filter(v => v.status === 'active').length;
  const totalProducts = products.length;
  const stats = [
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      change: '+18.3%',
      trend: 'up',
      icon: DollarSign,
      color: 'emerald',
    },
    {
      title: 'Total Orders',
      value: orders.length.toLocaleString(),
      change: '+12.5%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'blue',
    },
    {
      title: 'Active Vendors',
      value: activeVendors.toString(),
      change: `+${Math.round((activeVendors / Math.max(vendors.length, 1)) * 100)}%`,
      trend: 'up',
      icon: Users,
      color: 'purple',
    },
    {
      title: 'Total Products',
      value: totalProducts.toLocaleString(),
      change: '+5.2%',
      trend: 'up',
      icon: Package,
      color: 'orange',
    },
  ];

  const topVendors = vendorStats.length > 0 ? vendorStats : [
    { name: 'No vendors yet', revenue: 0, orders: 0, growth: '+0%' },
  ];

  const topCategories = [
    { name: 'Books & Islamic Literature', sales: 423, revenue: '$52,340' },
    { name: 'Clothing & Accessories', sales: 356, revenue: '$38,450' },
    { name: 'Food & Halal Products', sales: 289, revenue: '$34,640' },
    { name: 'Home & Lifestyle', sales: 166, revenue: '$0' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-emerald-600" />
          Platform Analytics
        </h1>
        <p className="text-gray-600 mt-1">Comprehensive insights into platform performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${stat.color}-100`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {stat.change}
                </div>
              </div>
              <h3 className="text-gray-600 text-sm mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Performing Vendors</h2>
          <div className="space-y-4">
            {topVendors.map((vendor, index) => (
              <div key={vendor.id || vendor.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{vendor.name}</div>
                    <div className="text-sm text-gray-600">{vendor.orders} orders</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">${typeof vendor.revenue === 'number' ? vendor.revenue.toLocaleString() : vendor.revenue}</div>
                  <div className="text-sm text-green-600">{vendor.growth}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Categories</h2>
          <div className="space-y-4">
            {topCategories.map((category, index) => (
              <div key={category.name} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-900">{category.name}</div>
                  <div className="font-bold text-gray-900">{category.revenue}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">{category.sales} sales</div>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full"
                      style={{ width: `${Math.max(20, (category.sales / 500) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-emerald-100 mb-2">Average Order Value</h3>
          <p className="text-4xl font-bold mb-1">${orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : '0.00'}</p>
          <p className="text-emerald-100 text-sm">+5.2% from last month</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-blue-100 mb-2">Conversion Rate</h3>
          <p className="text-4xl font-bold mb-1">4.2%</p>
          <p className="text-blue-100 text-sm">+0.8% from last month</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-purple-100 mb-2">Customer Retention</h3>
          <p className="text-4xl font-bold mb-1">87%</p>
          <p className="text-purple-100 text-sm">+3.5% from last month</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue Trend</h2>
        <div className="h-64 flex items-end justify-between gap-2">
          {[65, 72, 68, 80, 75, 88, 95, 92, 100, 98, 105, 110].map((height, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg transition-all hover:from-emerald-600 hover:to-emerald-500"
                style={{ height: `${height}%` }}
              />
              <div className="text-xs text-gray-600">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
