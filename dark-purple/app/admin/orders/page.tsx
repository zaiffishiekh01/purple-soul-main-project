'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Search, Eye, Loader2, Download, Package } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: string;
  email: string;
  created_at: string;
  order_items?: Array<{
    id: string;
    quantity: number;
  }>;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    shipped: 0,
    delivered: 0
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          total,
          email,
          created_at,
          order_items(id, quantity)
        `)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      setOrders(ordersData || []);

      const totalOrders = ordersData?.length || 0;
      const paidOrders = ordersData?.filter(o => o.status === 'paid' || o.status === 'vendor_confirmed' || o.status === 'shipped' || o.status === 'in_transit' || o.status === 'delivered').length || 0;
      const shippedOrders = ordersData?.filter(o => o.status === 'shipped' || o.status === 'in_transit').length || 0;
      const deliveredOrders = ordersData?.filter(o => o.status === 'delivered').length || 0;

      setStats({
        total: totalOrders,
        paid: paidOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      created: 'bg-gray-500',
      payment_pending: 'bg-yellow-500',
      paid: 'bg-green-500',
      vendor_confirmed: 'bg-blue-500',
      shipped: 'bg-blue-600',
      in_transit: 'bg-blue-700',
      delivered: 'bg-green-600',
      cancelled: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getTotalItems = (order: Order): number => {
    return order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
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
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const statuses = ['all', 'created', 'payment_pending', 'paid', 'vendor_confirmed', 'shipped', 'in_transit', 'delivered', 'cancelled'];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-serif text-white mb-2">Order Management</h1>
          <p className="text-white/60">
            Oversee all orders across the marketplace
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card glass-card-hover p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Total Orders</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
              </div>
              <Package className="h-10 w-10 text-rose-gold" />
            </div>
          </div>

          <div className="glass-card glass-card-hover p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Paid Orders</p>
                <p className="text-3xl font-bold text-green-400 mt-2">{stats.paid}</p>
              </div>
              <Package className="h-10 w-10 text-green-400" />
            </div>
          </div>

          <div className="glass-card glass-card-hover p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">In Transit</p>
                <p className="text-3xl font-bold text-blue-400 mt-2">{stats.shipped}</p>
              </div>
              <Package className="h-10 w-10 text-blue-400" />
            </div>
          </div>

          <div className="glass-card glass-card-hover p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Delivered</p>
                <p className="text-3xl font-bold text-emerald-400 mt-2">{stats.delivered}</p>
              </div>
              <Package className="h-10 w-10 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="glass-card glass-card-hover p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                placeholder="Search by order number or customer email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
            <Button className="celestial-button">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
          <div className="flex gap-2 flex-wrap mt-4">
            {statuses.map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                onClick={() => setStatusFilter(status)}
                size="sm"
                className={statusFilter === status
                  ? 'celestial-button'
                  : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                }
              >
                {status.replace(/_/g, ' ')}
              </Button>
            ))}
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Package className="h-12 w-12 text-white/40 mx-auto mb-4" />
            <p className="text-white/60">
              {searchQuery ? 'No orders found matching your search.' : 'No orders yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="glass-card glass-card-hover p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-semibold text-white hover:text-rose-gold transition-colors text-lg"
                      >
                        Order {order.order_number}
                      </Link>
                      <Badge className={`${getStatusColor(order.status)} text-white border-none`}>
                        {order.status.replace(/_/g, ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-white/70">
                        <span className="text-white/50">Customer:</span> {order.email}
                      </p>
                      <p className="text-sm text-white/70">
                        <span className="text-white/50">Date:</span> {format(new Date(order.created_at), 'MMM d, yyyy h:mm a')}
                      </p>
                      <p className="text-sm text-white/70">
                        <span className="text-white/50">Items:</span> {getTotalItems(order)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-white/50">Total</p>
                      <p className="text-2xl font-bold text-rose-gold">
                        ${parseFloat(order.total).toFixed(2)}
                      </p>
                    </div>
                    <Link href={`/admin/orders/${order.id}`}>
                      <Button className="celestial-button">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
