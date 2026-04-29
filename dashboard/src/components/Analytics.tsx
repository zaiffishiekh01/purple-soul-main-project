import { TrendingUp, Users, ShoppingBag, Eye, ArrowUp, ArrowDown } from 'lucide-react';

interface AnalyticsProps {
  stats: {
    totalRevenue: number;
    revenueGrowth: number;
    totalOrders: number;
    ordersGrowth: number;
    avgOrderValue: number;
    avgOrderGrowth: number;
    conversionRate: number;
    conversionGrowth: number;
  };
}

export function Analytics({ stats }: AnalyticsProps) {
  const topProducts = [
    { name: 'Sufi Meditation Guide', sales: 145, revenue: 2175 },
    { name: 'Sacred Geometry Art', sales: 98, revenue: 2940 },
    { name: 'Spiritual Journal', sales: 87, revenue: 1305 },
    { name: 'Prayer Beads Set', sales: 72, revenue: 1080 },
  ];

  const recentActivity = [
    { metric: 'Page Views', value: '12,459', change: 15.3, positive: true },
    { metric: 'Unique Visitors', value: '3,247', change: 8.7, positive: true },
    { metric: 'Cart Abandonment', value: '23%', change: 4.2, positive: false },
    { metric: 'Return Rate', value: '2.1%', change: 0.5, positive: false },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
          <div className="flex items-center gap-1 mt-2">
            {stats.revenueGrowth >= 0 ? (
              <ArrowUp className="w-4 h-4 text-green-600" />
            ) : (
              <ArrowDown className="w-4 h-4 text-red-600" />
            )}
            <span
              className={`text-sm font-semibold ${
                stats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {Math.abs(stats.revenueGrowth)}%
            </span>
            <span className="text-xs text-gray-500 ml-1">vs last month</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-2">Total Orders</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
          <div className="flex items-center gap-1 mt-2">
            {stats.ordersGrowth >= 0 ? (
              <ArrowUp className="w-4 h-4 text-green-600" />
            ) : (
              <ArrowDown className="w-4 h-4 text-red-600" />
            )}
            <span
              className={`text-sm font-semibold ${
                stats.ordersGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {Math.abs(stats.ordersGrowth)}%
            </span>
            <span className="text-xs text-gray-500 ml-1">vs last month</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-2">Avg Order Value</h3>
          <p className="text-3xl font-bold text-gray-900">${stats.avgOrderValue.toFixed(2)}</p>
          <div className="flex items-center gap-1 mt-2">
            {stats.avgOrderGrowth >= 0 ? (
              <ArrowUp className="w-4 h-4 text-green-600" />
            ) : (
              <ArrowDown className="w-4 h-4 text-red-600" />
            )}
            <span
              className={`text-sm font-semibold ${
                stats.avgOrderGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {Math.abs(stats.avgOrderGrowth)}%
            </span>
            <span className="text-xs text-gray-500 ml-1">vs last month</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
              <Eye className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-2">Conversion Rate</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.conversionRate}%</p>
          <div className="flex items-center gap-1 mt-2">
            {stats.conversionGrowth >= 0 ? (
              <ArrowUp className="w-4 h-4 text-green-600" />
            ) : (
              <ArrowDown className="w-4 h-4 text-red-600" />
            )}
            <span
              className={`text-sm font-semibold ${
                stats.conversionGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {Math.abs(stats.conversionGrowth)}%
            </span>
            <span className="text-xs text-gray-500 ml-1">vs last month</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Top Selling Products</h3>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sufi-purple to-sufi-dark flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.sales} sales</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">${product.revenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Performance Metrics</h3>
          <div className="space-y-4">
            {recentActivity.map((item, index) => (
              <div key={index} className="p-4 rounded-xl bg-gradient-to-r from-gray-50 to-sufi-light/10">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600">{item.metric}</p>
                  <div className="flex items-center gap-1">
                    {item.positive ? (
                      <ArrowUp className="w-3 h-3 text-green-600" />
                    ) : (
                      <ArrowDown className="w-3 h-3 text-red-600" />
                    )}
                    <span
                      className={`text-xs font-semibold ${
                        item.positive ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {item.change}%
                    </span>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-sufi-purple to-sufi-dark rounded-2xl p-8 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold mb-2">Grow Your Business</h3>
            <p className="opacity-90">Access detailed reports and insights to optimize your sales strategy</p>
          </div>
          <button className="px-6 py-3 bg-white text-sufi-dark rounded-xl hover:shadow-lg transition-all font-semibold whitespace-nowrap">
            View Full Reports
          </button>
        </div>
      </div>
    </div>
  );
}
