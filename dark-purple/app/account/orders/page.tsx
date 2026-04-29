'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Search, Filter, Eye, Download, RefreshCw, Sparkles, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAPIAuth as useAuth } from '@/lib/auth/api-context';
import { supabase } from '@/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';

const statusColors: Record<string, string> = {
  created: 'bg-gray-500/20 text-gray-200 border-gray-500/30',
  payment_pending: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30',
  paid: 'bg-green-500/20 text-green-200 border-green-500/30',
  processing: 'bg-blue-500/20 text-blue-200 border-blue-500/30',
  shipped: 'bg-purple-500/20 text-purple-200 border-purple-500/30',
  delivered: 'bg-green-500/20 text-green-200 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-200 border-red-500/30',
  refunded: 'bg-amber-500/20 text-amber-200 border-amber-500/30',
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            unit_price,
            total,
            product_id,
            products (
              title,
              images
            )
          )
        `)
        .eq('customer_id', user?.id)
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

  const filteredOrders = orders.filter(order => {
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      return (
        order.order_number?.toLowerCase().includes(search) ||
        order.order_items?.some((item: any) =>
          item.products?.title?.toLowerCase().includes(search)
        )
      );
    }
    return true;
  });

  const getTabOrders = (tab: string) => {
    switch (tab) {
      case 'active':
        return filteredOrders.filter(o =>
          ['created', 'payment_pending', 'paid', 'processing', 'shipped', 'in_transit'].includes(o.status)
        );
      case 'completed':
        return filteredOrders.filter(o => o.status === 'delivered');
      case 'returns':
        return filteredOrders.filter(o =>
          ['return_requested', 'return_approved', 'return_in_transit', 'return_received', 'refunded'].includes(o.status)
        );
      default:
        return filteredOrders;
    }
  };

  const currentOrders = getTabOrders(activeTab);

  return (
    <div className="min-h-screen">
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass-card mb-6">
              <Sparkles className="w-4 h-4" style={{ color: '#d4af8a' }} />
              <span className="text-sm font-semibold text-white/90">Order Management</span>
            </div>

            <h1 className="hero-text font-serif text-white mb-6 leading-tight">
              My Orders
            </h1>

            <p className="text-xl text-white/70 leading-relaxed max-w-2xl mx-auto">
              View and manage your order history, track shipments, and reorder your favorite items
            </p>
          </div>
        </div>
      </section>

      <div className="ethereal-divider mb-12"></div>

      <div className="container mx-auto px-4 pb-20">
        <div className="max-w-6xl mx-auto space-y-8">
          <Card className="glass-card glass-card-hover p-8">
            <div className="space-y-6">
              <div>
                <h2 className="section-title font-serif text-white mb-2">Search & Filter</h2>
                <p className="text-base text-white/60">Find your orders quickly</p>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#d4af8a' }} />
                  <Input
                    placeholder="Search by order number or product..."
                    className="pl-10 h-12 bg-white/5 border-white/20 text-white placeholder:text-white/40"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px] h-12 bg-white/5 border-white/20 text-white">
                    <Filter className="w-4 h-4 mr-2" style={{ color: '#d4af8a' }} />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Orders</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white/5 border border-white/10">
              <TabsTrigger value="all" className="data-[state=active]:bg-white/10 text-white">
                All Orders ({filteredOrders.length})
              </TabsTrigger>
              <TabsTrigger value="active" className="data-[state=active]:bg-white/10 text-white">
                Active ({getTabOrders('active').length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-white/10 text-white">
                Completed ({getTabOrders('completed').length})
              </TabsTrigger>
              <TabsTrigger value="returns" className="data-[state=active]:bg-white/10 text-white">
                Returns ({getTabOrders('returns').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {loading ? (
                <Card className="glass-card p-8">
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-white/50" />
                  </div>
                </Card>
              ) : currentOrders.length === 0 ? (
                <Card className="glass-card glass-card-hover p-8">
                  <CardContent className="py-12 text-center">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 glass-card">
                      <Package className="w-10 h-10" style={{ color: '#d4af8a' }} />
                    </div>
                    <h3 className="text-2xl font-serif font-semibold mb-4 text-white">
                      {activeTab === 'all' ? 'No orders yet' : `No ${activeTab} orders`}
                    </h3>
                    <p className="text-base text-white/60 mb-8">
                      {activeTab === 'all'
                        ? 'Start shopping to see your orders here'
                        : `You don't have any ${activeTab} orders at the moment`}
                    </p>
                    {activeTab === 'all' && (
                      <Link href="/">
                        <button className="celestial-button text-white px-8">
                          Start Shopping
                        </button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              ) : (
                currentOrders.map((order: any) => (
                  <Card key={order.id} className="glass-card glass-card-hover p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-2xl font-serif text-white">Order #{order.order_number}</h3>
                          <Badge className={statusColors[order.status] || statusColors.created}>
                            {order.status.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <p className="text-base text-white/60">
                          Placed {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })} • ${parseFloat(order.total).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/account/orders/${order.id}`}>
                          <Button variant="outline" size="sm" className="bg-white/5 border-white/20 text-white hover:bg-white/10">
                            <Eye className="w-4 h-4 mr-2" style={{ color: '#d4af8a' }} />
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {order.order_items && order.order_items.length > 0 && (
                      <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
                        {order.order_items.slice(0, 3).map((item: any) => (
                          <div key={item.id} className="flex-shrink-0">
                            {item.products?.images?.[0] && (
                              <img
                                src={item.products.images[0]}
                                alt={item.products.title}
                                className="w-16 h-16 object-cover rounded-lg border border-white/10"
                              />
                            )}
                          </div>
                        ))}
                        {order.order_items.length > 3 && (
                          <div className="w-16 h-16 flex items-center justify-center bg-white/5 rounded-lg border border-white/10">
                            <span className="text-sm text-white/60">+{order.order_items.length - 3}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-base text-white/60">
                          {order.order_items?.length || 0} {order.order_items?.length === 1 ? 'item' : 'items'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
                          <Download className="w-4 h-4 mr-2" style={{ color: '#d4af8a' }} />
                          Invoice
                        </Button>
                        <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
                          <RefreshCw className="w-4 h-4 mr-2" style={{ color: '#d4af8a' }} />
                          Reorder
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
