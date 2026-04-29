import { memo } from 'react';
import { TrendingUp, TrendingDown, Package, ShoppingCart, DollarSign, AlertTriangle, Download, Box, RotateCcw, XCircle, Clock, Award, TrendingUp as TrendingUpIcon, MessageSquare, Calendar, Eye, ShoppingBag } from 'lucide-react';

interface RecentActivity {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'order' | 'alert' | 'payment' | 'return' | 'delivery';
}

interface TopProduct {
  name: string;
  revenue: number;
  units: number;
}

interface DashboardProps {
  stats: {
    totalProducts: number;
    totalOrders: number;
    pendingOrders: number;
    totalReturns: number;
    totalRevenue: number;
    lowStockItems: number;
    ordersChange: number;
    revenueChange: number;
  };
  insights?: {
    returnRate: number;
    cancellationRateVendor: number;
    cancellationRateCustomer: number;
    onTimeShipmentRate: number;
    topProducts: TopProduct[];
    openTickets: number;
    nextPayoutAmount: number;
    nextPayoutDate: string;
    impressions: number;
    addToCarts: number;
    conversions: number;
  };
  recentActivities?: RecentActivity[];
  onNavigate?: (section: string) => void;
}

const DashboardComponent = ({ stats, insights, recentActivities = [], onNavigate }: DashboardProps) => {
  const downloadPhysicalTemplate = () => {
    const headers = [
      'name',
      'sku',
      'category',
      'description',
      'material',
      'color',
      'size_dimensions',
      'care_instructions',
      'price',
      'cost',
      'stock_quantity',
      'shipping_timeline',
      'tags',
      'images',
      'status'
    ];

    const example1 = [
      'Handmade Sufi Prayer Beads Set',
      'BEADS-001',
      'Clothing & Modest Wear',
      'Beautiful handcrafted prayer beads for meditation and spiritual practice',
      'Natural Wood',
      'Natural Brown',
      '8mm beads, 10 inches long',
      'Wipe with dry cloth, avoid water',
      '29.99',
      '15.00',
      '100',
      '3-5 business days',
      'prayer,meditation,sufi,handmade,spiritual',
      'https://example.com/image1.jpg,https://example.com/image2.jpg,https://example.com/image3.jpg,https://example.com/image4.jpg',
      'active'
    ];

    const example2 = [
      'Islamic Wall Art Canvas Print',
      'ART-WALL-001',
      'Home & Decor',
      'Beautiful Islamic calligraphy wall art for home decoration',
      'Canvas Cotton Blend',
      'Gold and Black',
      '24x36 inches',
      'Dust with soft cloth, no direct sunlight',
      '79.99',
      '35.00',
      '50',
      '5-7 business days',
      'art,decor,islamic,calligraphy,wall',
      'https://example.com/art1.jpg,https://example.com/art2.jpg,https://example.com/art3.jpg,https://example.com/art4.jpg',
      'active'
    ];

    const csvContent = [
      headers.join(','),
      example1.join(','),
      example2.join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'physical-products-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const downloadDigitalTemplate = () => {
    const headers = [
      'name',
      'sku',
      'category',
      'description',
      'price',
      'cost',
      'download_limit',
      'license_duration_days',
      'tags',
      'images',
      'status'
    ];

    const audioExample = [
      'Complete Quran Recitation Collection MP3',
      'AUDIO-QRC-001',
      'Audio & Media',
      'High-quality Quran recitation by renowned sheikh in MP3 format',
      '49.99',
      '0.00',
      '5',
      '730',
      'quran,audio,recitation,islamic,mp3,digital',
      'https://example.com/audio-cover1.jpg,https://example.com/audio-cover2.jpg,https://example.com/audio-cover3.jpg,https://example.com/audio-cover4.jpg',
      'active'
    ];

    const ebookExample = [
      'Islamic History Comprehensive eBook Guide',
      'EBOOK-IH-001',
      'Books & Islamic Literature',
      'Comprehensive guide to Islamic history and scholars in PDF format',
      '19.99',
      '0.00',
      '3',
      '365',
      'ebook,islamic,history,education,pdf,digital',
      'https://example.com/book-cover1.jpg,https://example.com/book-cover2.jpg,https://example.com/book-cover3.jpg,https://example.com/book-cover4.jpg',
      'active'
    ];

    const videoExample = [
      'Islamic Calligraphy Video Course Bundle',
      'VIDEO-CAL-001',
      'Digital Products',
      'Complete video course on Islamic calligraphy techniques',
      '89.99',
      '0.00',
      'unlimited',
      '36500',
      'video,course,calligraphy,islamic,education,digital',
      'https://example.com/video-thumb1.jpg,https://example.com/video-thumb2.jpg,https://example.com/video-thumb3.jpg,https://example.com/video-thumb4.jpg',
      'active'
    ];

    const softwareExample = [
      'Prayer Time Calculator Desktop App',
      'SOFTWARE-PT-001',
      'Digital Products',
      'Accurate prayer time calculator for all locations worldwide',
      '29.99',
      '0.00',
      '2',
      '365',
      'software,prayer,islamic,app,utility,digital',
      'https://example.com/software1.jpg,https://example.com/software2.jpg,https://example.com/software3.jpg,https://example.com/software4.jpg',
      'active'
    ];

    const csvContent = [
      headers.join(','),
      audioExample.join(','),
      ebookExample.join(','),
      videoExample.join(','),
      softwareExample.join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'digital-products-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };
  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Box,
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      change: stats.ordersChange,
      icon: ShoppingCart,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: Package,
      color: 'from-amber-500 to-orange-600',
      alert: stats.pendingOrders > 5,
    },
    {
      title: 'Total Returns',
      value: stats.totalReturns,
      icon: RotateCcw,
      color: 'from-indigo-500 to-indigo-600',
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      change: stats.revenueChange,
      icon: DollarSign,
      color: 'from-emerald-500 to-green-600',
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockItems,
      icon: AlertTriangle,
      color: 'from-red-500 to-rose-600',
      alert: stats.lowStockItems > 0,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                {stat.alert && (
                  <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
                    Alert
                  </span>
                )}
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-2">{stat.title}</h3>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                {stat.change !== undefined && (
                  <div
                    className={`flex items-center gap-1 ${
                      stat.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {stat.change >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span className="text-sm font-semibold">{Math.abs(stat.change)}%</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
          {recentActivities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-4 rounded-xl hover:bg-sufi-light/20 transition-colors"
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'order'
                        ? 'bg-blue-500'
                        : activity.type === 'alert'
                        ? 'bg-red-500'
                        : activity.type === 'return'
                        ? 'bg-orange-500'
                        : activity.type === 'delivery'
                        ? 'bg-green-600'
                        : 'bg-green-500'
                    }`}
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-2">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-sufi-purple to-sufi-dark rounded-2xl p-6 text-white shadow-xl">
          <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => onNavigate?.('products')}
              className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl p-3 text-left transition-all"
            >
              <p className="font-semibold">Add New Product</p>
              <p className="text-sm opacity-90 mt-1">Expand your catalog</p>
            </button>
            <button
              onClick={() => onNavigate?.('orders')}
              className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl p-3 text-left transition-all"
            >
              <p className="font-semibold">Process Orders</p>
              <p className="text-sm opacity-90 mt-1">Review pending items</p>
            </button>
            <button
              onClick={downloadPhysicalTemplate}
              className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl p-3 text-left transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Physical Products Template</p>
                  <p className="text-sm opacity-90 mt-1">Download bulk upload CSV</p>
                </div>
                <Download className="w-5 h-5 opacity-80" />
              </div>
            </button>
            <button
              onClick={downloadDigitalTemplate}
              className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl p-3 text-left transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Digital Products Template</p>
                  <p className="text-sm opacity-90 mt-1">Download bulk upload CSV</p>
                </div>
                <Download className="w-5 h-5 opacity-80" />
              </div>
            </button>
            <button
              onClick={() => onNavigate?.('analytics')}
              className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl p-3 text-left transition-all"
            >
              <p className="font-semibold">View Reports</p>
              <p className="text-sm opacity-90 mt-1">Analyze performance</p>
            </button>
          </div>
        </div>
      </div>

      {/* Graphical Insights Section */}
      {insights && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Graphical Insights</h2>

          {/* Row 1: Return/Refund Rate, Cancellation Rate, On-Time Shipment */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Return/Refund Rate */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${insights.returnRate > 8 ? 'bg-red-100' : insights.returnRate > 5 ? 'bg-amber-100' : 'bg-green-100'}`}>
                    <RotateCcw className={`w-5 h-5 ${insights.returnRate > 8 ? 'text-red-600' : insights.returnRate > 5 ? 'text-amber-600' : 'text-green-600'}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Return / Refund Rate</h3>
                    <p className="text-xs text-gray-500">% of orders returned</p>
                  </div>
                </div>
              </div>
              <div className="flex items-end gap-2">
                <p className={`text-4xl font-bold ${insights.returnRate > 8 ? 'text-red-600' : insights.returnRate > 5 ? 'text-amber-600' : 'text-green-600'}`}>
                  {insights.returnRate.toFixed(1)}%
                </p>
                {insights.returnRate > 5 && (
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full mb-2 ${insights.returnRate > 8 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    {insights.returnRate > 8 ? 'High Risk' : 'Warning'}
                  </span>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-600">Threshold: {insights.returnRate > 8 ? '> 8%' : insights.returnRate > 5 ? '5-8%' : '< 5%'}</p>
              </div>
            </div>

            {/* Cancellation Rate */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-blue-100">
                  <XCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Cancellation Rate</h3>
                  <p className="text-xs text-gray-500">Orders cancelled</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">By Vendor</span>
                  <span className="text-lg font-bold text-blue-600">{insights.cancellationRateVendor.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${insights.cancellationRateVendor}%` }}></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">By Customer</span>
                  <span className="text-lg font-bold text-purple-600">{insights.cancellationRateCustomer.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${insights.cancellationRateCustomer}%` }}></div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">Helps spot operational issues</p>
            </div>

            {/* On-Time Shipment Rate */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${insights.onTimeShipmentRate >= 95 ? 'bg-green-100' : insights.onTimeShipmentRate >= 85 ? 'bg-amber-100' : 'bg-red-100'}`}>
                    <Clock className={`w-5 h-5 ${insights.onTimeShipmentRate >= 95 ? 'text-green-600' : insights.onTimeShipmentRate >= 85 ? 'text-amber-600' : 'text-red-600'}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">On-Time Shipment</h3>
                    <p className="text-xs text-gray-500">Within SLA</p>
                  </div>
                </div>
              </div>
              <div className="relative pt-1">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-4xl font-bold ${insights.onTimeShipmentRate >= 95 ? 'text-green-600' : insights.onTimeShipmentRate >= 85 ? 'text-amber-600' : 'text-red-600'}`}>
                    {insights.onTimeShipmentRate.toFixed(0)}%
                  </span>
                  {insights.onTimeShipmentRate >= 95 && (
                    <Award className="w-6 h-6 text-green-600" />
                  )}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className={`h-3 rounded-full ${insights.onTimeShipmentRate >= 95 ? 'bg-green-500' : insights.onTimeShipmentRate >= 85 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${insights.onTimeShipmentRate}%` }}></div>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-3">Critical for marketplace scoring</p>
            </div>
          </div>

          {/* Row 2: Top Products, Support Tickets, Next Payout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Top Selling Products */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Top Selling Products</h3>
                  <p className="text-xs text-gray-500">Last 30 days</p>
                </div>
              </div>
              <div className="space-y-3">
                {insights.topProducts.slice(0, 3).map((product, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm truncate max-w-[120px]">{product.name}</p>
                        <p className="text-xs text-gray-600">{product.units} units</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-purple-600">${product.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Open Support Tickets */}
            <div
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-xl transition-all group"
              onClick={() => onNavigate?.('support')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${insights.openTickets > 0 ? 'bg-orange-100' : 'bg-green-100'}`}>
                    <MessageSquare className={`w-5 h-5 ${insights.openTickets > 0 ? 'text-orange-600' : 'text-green-600'}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Open Tickets</h3>
                    <p className="text-xs text-gray-500">Active support issues</p>
                  </div>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <p className={`text-4xl font-bold ${insights.openTickets > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {insights.openTickets}
                </p>
                <button className="text-sm font-semibold text-blue-600 group-hover:underline flex items-center gap-1">
                  View All
                  <TrendingUpIcon className="w-4 h-4" />
                </button>
              </div>
              {insights.openTickets > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-orange-600 font-semibold">Requires attention</p>
                </div>
              )}
            </div>

            {/* Next Payout Estimate */}
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 shadow-xl text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Next Payout</h3>
                  <p className="text-xs opacity-90">Scheduled payment</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-5xl font-bold">${insights.nextPayoutAmount.toLocaleString()}</p>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span className="opacity-90">{insights.nextPayoutDate}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-xs opacity-75">Builds trust, reduces anxiety</p>
              </div>
            </div>
          </div>

          {/* Row 3: Conversion Funnel */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                <TrendingUpIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Impressions → Orders Conversion</h3>
                <p className="text-xs text-gray-500">Customer journey funnel</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {/* Impressions */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Eye className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-semibold text-gray-700">Impressions</span>
                </div>
                <div className="relative">
                  <div className="w-full h-24 bg-gradient-to-b from-blue-500 to-blue-400 rounded-t-xl flex items-center justify-center">
                    <p className="text-3xl font-bold text-white">{insights.impressions.toLocaleString()}</p>
                  </div>
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                    <div className="w-6 h-6 bg-blue-400 rotate-45"></div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-5">Views on your products</p>
              </div>

              {/* Add to Cart */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <ShoppingBag className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-semibold text-gray-700">Add to Cart</span>
                </div>
                <div className="relative">
                  <div className="w-full h-20 bg-gradient-to-b from-purple-500 to-purple-400 rounded-t-xl flex items-center justify-center">
                    <p className="text-2xl font-bold text-white">{insights.addToCarts.toLocaleString()}</p>
                  </div>
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                    <div className="w-6 h-6 bg-purple-400 rotate-45"></div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-5">
                  {((insights.addToCarts / insights.impressions) * 100).toFixed(1)}% conversion
                </p>
              </div>

              {/* Orders */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <ShoppingCart className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-semibold text-gray-700">Orders</span>
                </div>
                <div className="relative">
                  <div className="w-full h-16 bg-gradient-to-b from-green-500 to-green-400 rounded-t-xl flex items-center justify-center">
                    <p className="text-xl font-bold text-white">{insights.conversions.toLocaleString()}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-8">
                  {((insights.conversions / insights.impressions) * 100).toFixed(1)}% conversion
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Overall Conversion Rate:</span>
                <span className="font-bold text-green-600 text-lg">
                  {((insights.conversions / insights.impressions) * 100).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const Dashboard = memo(DashboardComponent);
