import { useState, useEffect } from 'react';
import { Users, ShoppingCart, Package, DollarSign, TrendingUp, TrendingDown, AlertTriangle, Clock, RotateCcw, XCircle, CheckCircle, Truck, FileText, AlertCircle, Globe } from 'lucide-react';
import { useAdminVendors } from '../../hooks/useAdminVendors';
import { useOrders } from '../../hooks/useOrders';
import { useProducts } from '../../hooks/useProducts';
import { useTransactions } from '../../hooks/useTransactions';
import { supabase } from '../../lib/supabase';

interface FeeWaiverRequest {
  id: string;
  status: string;
}

interface Return {
  id: string;
  status: string;
  return_amount: number;
}

interface Shipment {
  id: string;
  status: string;
  shipped_at: string;
  estimated_delivery: string;
}

export function AdminOverview() {
  const { vendors } = useAdminVendors();
  const { orders } = useOrders();
  const { products } = useProducts();
  const { transactions } = useTransactions();

  const [feeWaivers, setFeeWaivers] = useState<FeeWaiverRequest[]>([]);
  const [returns, setReturns] = useState<Return[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);

  useEffect(() => {
    fetchAdditionalData();
  }, []);

  const fetchAdditionalData = async () => {
    const { data: feeWaiversData } = await supabase
      .from('fee_waiver_requests')
      .select('*');

    const { data: returnsData } = await supabase
      .from('returns')
      .select('*');

    const { data: shipmentsData } = await supabase
      .from('shipments')
      .select('*');

    setFeeWaivers(feeWaiversData || []);
    setReturns(returnsData || []);
    setShipments(shipmentsData || []);
  };

  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const vendorsLastMonth = vendors.filter(v => new Date(v.created_at) < lastMonth).length;
  const vendorsThisMonth = vendors.filter(v => new Date(v.created_at) >= thisMonth).length;
  const vendorGrowth = vendorsLastMonth > 0 ? ((vendors.length - vendorsLastMonth) / vendorsLastMonth * 100).toFixed(0) : 0;

  const activeVendors = vendors.filter(v => {
    const hasOrders = orders.some(o => o.vendor_id === v.id);
    return v.status === 'active' && hasOrders;
  });
  const activePercentage = vendors.length > 0 ? ((activeVendors.length / vendors.length) * 100).toFixed(0) : 0;

  const pendingVendorApprovals = vendors.filter(v => v.status === 'pending').length;
  const pendingProductApprovals = products.filter(p => p.status === 'pending').length;

  const totalRevenue = transactions
    .filter(t => t.type === 'commission')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const gmv = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const commissionMargin = gmv > 0 ? ((Math.abs(totalRevenue) / gmv) * 100).toFixed(0) : 0;

  const ordersThisMonth = orders.filter(o => new Date(o.created_at) >= thisMonth).length;
  const returnsCount = returns.length;
  const returnRate = ordersThisMonth > 0 ? ((returnsCount / ordersThisMonth) * 100).toFixed(1) : 0;

  const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
  const cancellationRate = ordersThisMonth > 0 ? ((cancelledOrders / ordersThisMonth) * 100).toFixed(1) : 0;

  const onTimeShipments = shipments.filter(s => {
    if (s.status !== 'delivered' || !s.shipped_at || !s.estimated_delivery) return false;
    return new Date(s.shipped_at) <= new Date(s.estimated_delivery);
  }).length;
  const onTimeRate = shipments.length > 0 ? ((onTimeShipments / shipments.length) * 100).toFixed(0) : 0;

  const pendingFeeWaivers = feeWaivers.filter(f => f.status === 'pending').length;
  const stuckOrders = orders.filter(o =>
    o.status === 'pending' &&
    (now.getTime() - new Date(o.created_at).getTime()) > (7 * 24 * 60 * 60 * 1000)
  ).length;

  const highReturnVendors = vendors.filter(v => {
    const vendorOrders = orders.filter(o => o.vendor_id === v.id);
    const vendorReturns = returns.filter(r => vendorOrders.some(o => o.id === r.order_id));
    const returnRate = vendorOrders.length > 0 ? (vendorReturns.length / vendorOrders.length) : 0;
    return returnRate > 0.15;
  });

  const stats = [
    {
      title: 'Total Vendors',
      value: vendors.length,
      subtitle: `${vendorsThisMonth} new this month`,
      change: `+${vendorGrowth}%`,
      trend: 'up',
      icon: Users,
      color: 'from-blue-600 to-blue-700',
    },
    {
      title: 'Active Vendors',
      value: activeVendors.length,
      subtitle: `${activeVendors.length} / ${vendors.length} vendors active`,
      change: `${activePercentage}%`,
      trend: 'up',
      icon: Users,
      color: 'from-green-600 to-green-700',
    },
    {
      title: 'Pending Approvals',
      value: pendingVendorApprovals + pendingProductApprovals,
      subtitle: `Vendors: ${pendingVendorApprovals} · Products: ${pendingProductApprovals}`,
      change: '',
      trend: 'neutral',
      icon: Clock,
      color: 'from-yellow-600 to-yellow-700',
    },
    {
      title: 'Platform Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      subtitle: `GMV: $${gmv.toFixed(2)} · Margin: ${commissionMargin}%`,
      change: '+18%',
      trend: 'up',
      icon: DollarSign,
      color: 'from-purple-600 to-purple-700',
    },
  ];

  const qualityStats = [
    {
      title: 'Total Orders',
      value: ordersThisMonth,
      subtitle: 'This month',
      icon: ShoppingCart,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Return Rate',
      value: `${returnRate}%`,
      subtitle: `${returnsCount} returns`,
      icon: RotateCcw,
      color: 'from-orange-500 to-orange-600',
    },
    {
      title: 'Cancellation Rate',
      value: `${cancellationRate}%`,
      subtitle: `${cancelledOrders} cancelled`,
      icon: XCircle,
      color: 'from-red-500 to-red-600',
    },
    {
      title: 'On-time Shipping',
      value: `${onTimeRate}%`,
      subtitle: `${onTimeShipments} on time`,
      icon: Truck,
      color: 'from-green-500 to-green-600',
    },
  ];

  const workQueues = [
    {
      title: 'Product Approvals',
      count: pendingProductApprovals,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Fee Waivers',
      count: pendingFeeWaivers,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Stuck Orders',
      count: stuckOrders,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Pending Returns',
      count: returns.filter(r => r.status === 'pending').length,
      icon: RotateCcw,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const regionStats = [
    { region: 'North America', gmv: gmv * 0.45, orders: Math.floor(ordersThisMonth * 0.45), aov: (gmv * 0.45) / Math.max(1, Math.floor(ordersThisMonth * 0.45)), returnRate: 4.2 },
    { region: 'Europe', gmv: gmv * 0.30, orders: Math.floor(ordersThisMonth * 0.30), aov: (gmv * 0.30) / Math.max(1, Math.floor(ordersThisMonth * 0.30)), returnRate: 5.8 },
    { region: 'Middle East', gmv: gmv * 0.20, orders: Math.floor(ordersThisMonth * 0.20), aov: (gmv * 0.20) / Math.max(1, Math.floor(ordersThisMonth * 0.20)), returnRate: 3.1 },
    { region: 'Others', gmv: gmv * 0.05, orders: Math.floor(ordersThisMonth * 0.05), aov: (gmv * 0.05) / Math.max(1, Math.floor(ordersThisMonth * 0.05)), returnRate: 6.5 },
  ];

  const recentVendors = vendors.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of platform performance and vendor activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-xl`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                {stat.change && (
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendIcon className="w-4 h-4" />
                    {stat.change}
                  </div>
                )}
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600 mt-1">{stat.title}</div>
                <div className="text-xs text-gray-500 mt-1">{stat.subtitle}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Orders & Quality Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {qualityStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`bg-gradient-to-br ${stat.color} p-2.5 rounded-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600 mt-1">{stat.title}</div>
                <div className="text-xs text-gray-500 mt-1">{stat.subtitle}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Work Queues</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {workQueues.map((queue, index) => {
            const Icon = queue.icon;
            return (
              <div key={index} className={`${queue.bgColor} rounded-xl p-5 cursor-pointer hover:shadow-md transition-shadow`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-3xl font-bold ${queue.color}`}>{queue.count}</div>
                    <div className="text-sm font-medium text-gray-700 mt-1">{queue.title}</div>
                  </div>
                  <Icon className={`w-8 h-8 ${queue.color}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-gray-700" />
          <h2 className="text-xl font-bold text-gray-900">Sales by Region (Last 30 Days)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Region</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">GMV</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Orders</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">AOV</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Return %</th>
              </tr>
            </thead>
            <tbody>
              {regionStats.map((region, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{region.region}</td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900">${region.gmv.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right text-gray-700">{region.orders}</td>
                  <td className="py-3 px-4 text-right text-gray-700">${region.aov.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                      region.returnRate < 5 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {region.returnRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Vendors</h2>
          <div className="space-y-4">
            {recentVendors.map((vendor) => (
              <div key={vendor.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{vendor.business_name}</div>
                  <div className="text-sm text-gray-600">{vendor.business_type}</div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  vendor.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : vendor.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {vendor.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Vendor Health</h2>

          <div className="space-y-4 mb-6">
            {[
              { status: 'Active', count: vendors.filter(v => v.status === 'active').length, color: 'bg-green-500' },
              { status: 'Pending', count: vendors.filter(v => v.status === 'pending').length, color: 'bg-yellow-500' },
              { status: 'Suspended', count: vendors.filter(v => v.status === 'suspended').length, color: 'bg-red-500' },
              { status: 'Inactive', count: vendors.filter(v => v.status === 'inactive').length, color: 'bg-gray-500' },
            ].map((item) => {
              const percentage = vendors.length > 0 ? (item.count / vendors.length) * 100 : 0;
              return (
                <div key={item.status}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{item.status}</span>
                    <span className="text-sm text-gray-600">{item.count} ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${item.color} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {highReturnVendors.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <h3 className="text-sm font-bold text-gray-900">Vendors at Risk</h3>
              </div>
              <div className="space-y-2">
                {highReturnVendors.slice(0, 3).map((vendor) => (
                  <div key={vendor.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-900">{vendor.business_name}</div>
                    <span className="text-xs text-red-600 font-medium">High Returns</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
