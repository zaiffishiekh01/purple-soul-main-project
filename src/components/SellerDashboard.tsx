import React, { useState, useEffect } from 'react';
import { TrendingUp, Package, DollarSign, Eye, MapPin, MessageSquare, Star, Calendar } from 'lucide-react';
import { supabase, Artisan } from '../lib/supabase';

interface AnalyticsData {
  date: string;
  views: number;
  sales_count: number;
  revenue: number;
  customer_regions: Record<string, number>;
  top_products: Array<{ id: string; name: string; count: number }>;
}

export default function SellerDashboard() {
  const [artisan, setArtisan] = useState<Artisan | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [loading, setLoading] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  async function loadDashboardData() {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const [artisanResult, messagesResult] = await Promise.all([
      supabase.from('artisans').select('*').eq('user_id', user.id).maybeSingle(),
      supabase
        .from('artisan_messages')
        .select('id', { count: 'exact', head: true })
        .eq('is_read', false)
        .eq('sender_type', 'customer')
    ]);

    if (artisanResult.data) {
      setArtisan(artisanResult.data);
      await loadAnalytics(artisanResult.data.id);
    }

    setUnreadMessages(messagesResult.count || 0);
    setLoading(false);
  }

  async function loadAnalytics(artisanId: string) {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data } = await supabase
      .from('seller_analytics')
      .select('*')
      .eq('artisan_id', artisanId)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (data) setAnalytics(data);
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-surface-deep rounded w-1/4"></div>
          <div className="grid md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-surface-deep rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!artisan) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <Package className="w-20 h-20 text-muted mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-primary mb-2">Become a Seller</h2>
        <p className="text-secondary mb-6">
          Create your artisan profile to start selling your crafts
        </p>
        <button className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 font-medium">
          Set Up Seller Profile
        </button>
      </div>
    );
  }

  const totalViews = analytics.reduce((sum, day) => sum + day.views, 0);
  const totalSales = analytics.reduce((sum, day) => sum + day.sales_count, 0);
  const totalRevenue = analytics.reduce((sum, day) => sum + day.revenue, 0);

  const regionData = analytics.reduce((acc, day) => {
    Object.entries(day.customer_regions || {}).forEach(([region, count]) => {
      acc[region] = (acc[region] || 0) + (count as number);
    });
    return acc;
  }, {} as Record<string, number>);

  const topRegions = Object.entries(regionData)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Seller Dashboard</h1>
            <p className="text-secondary">Welcome back, {artisan.display_name}</p>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-4 py-2 border rounded-lg bg-surface"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
        </div>

        {!artisan.verified && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <p className="text-yellow-800">
              Your profile is under review. Once verified, your products will be visible to customers.
            </p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface p-6 rounded-lg shadow-theme-md border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-2">
            <Eye className="w-8 h-8 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-primary mb-1">{totalViews.toLocaleString()}</div>
          <div className="text-sm text-secondary">Profile Views</div>
        </div>

        <div className="bg-surface p-6 rounded-lg shadow-theme-md border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-primary mb-1">{totalSales}</div>
          <div className="text-sm text-secondary">Items Sold</div>
        </div>

        <div className="bg-surface p-6 rounded-lg shadow-theme-md border-l-4 border-amber-500">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-amber-600" />
          </div>
          <div className="text-3xl font-bold text-primary mb-1">${totalRevenue.toLocaleString()}</div>
          <div className="text-sm text-secondary">Revenue</div>
        </div>

        <div className="bg-surface p-6 rounded-lg shadow-theme-md border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-2">
            <MessageSquare className="w-8 h-8 text-purple-600" />
            {unreadMessages > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadMessages}
              </span>
            )}
          </div>
          <div className="text-3xl font-bold text-primary mb-1">{unreadMessages}</div>
          <div className="text-sm text-secondary">New Messages</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Trend */}
        <div className="bg-surface p-6 rounded-lg shadow-theme-md">
          <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            Sales Trend
          </h3>
          <div className="space-y-2">
            {analytics.slice(-7).map((day, index) => {
              const maxSales = Math.max(...analytics.map(d => d.sales_count), 1);
              const percentage = (day.sales_count / maxSales) * 100;

              return (
                <div key={index}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-secondary">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="font-semibold text-primary">{day.sales_count} sales</span>
                  </div>
                  <div className="w-full bg-surface-deep rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Customer Regions */}
        <div className="bg-surface p-6 rounded-lg shadow-theme-md">
          <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-600" />
            Top Customer Regions
          </h3>
          <div className="space-y-4">
            {topRegions.length > 0 ? (
              topRegions.map(([region, count], index) => {
                const maxCount = topRegions[0][1];
                const percentage = (count / maxCount) * 100;

                return (
                  <div key={index}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-primary">{region}</span>
                      <span className="text-secondary">{count} customers</span>
                    </div>
                    <div className="w-full bg-surface-deep rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-muted text-center py-8">No customer data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Profile Performance */}
      <div className="bg-surface p-6 rounded-lg shadow-theme-md mb-8">
        <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-600" />
          Profile Performance
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-surface-deep rounded-lg">
            <div className="text-3xl font-bold text-primary mb-1">{artisan.rating.toFixed(1)}</div>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= artisan.rating ? 'text-amber-500 fill-current' : 'text-muted'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-secondary">Average Rating</div>
          </div>

          <div className="text-center p-4 bg-surface-deep rounded-lg">
            <div className="text-3xl font-bold text-primary mb-1">{artisan.total_sales}</div>
            <div className="text-sm text-secondary">Total Items Sold</div>
          </div>

          <div className="text-center p-4 bg-surface-deep rounded-lg">
            <div className="text-3xl font-bold text-primary mb-1">{artisan.years_experience}</div>
            <div className="text-sm text-secondary">Years Experience</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <button className="bg-surface p-6 rounded-lg shadow-theme-md hover:shadow-theme-lg transition-shadow text-left border-2 border-transparent hover:border-amber-200">
          <Package className="w-8 h-8 text-amber-600 mb-3" />
          <h4 className="font-semibold text-primary mb-1">Manage Products</h4>
          <p className="text-sm text-secondary">Add, edit, or remove your listings</p>
        </button>

        <button className="bg-surface p-6 rounded-lg shadow-theme-md hover:shadow-theme-lg transition-shadow text-left border-2 border-transparent hover:border-amber-200">
          <MessageSquare className="w-8 h-8 text-amber-600 mb-3" />
          <h4 className="font-semibold text-primary mb-1">Customer Messages</h4>
          <p className="text-sm text-secondary">Respond to customer inquiries</p>
        </button>

        <button className="bg-surface p-6 rounded-lg shadow-theme-md hover:shadow-theme-lg transition-shadow text-left border-2 border-transparent hover:border-amber-200">
          <Calendar className="w-8 h-8 text-amber-600 mb-3" />
          <h4 className="font-semibold text-primary mb-1">Custom Orders</h4>
          <p className="text-sm text-secondary">Manage made-to-order requests</p>
        </button>
      </div>
    </div>
  );
}
