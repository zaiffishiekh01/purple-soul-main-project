'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Eye, Package, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { apiClient } from '@/lib/api/client';

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: string;
  email: string;
  created_at: string;
  order_items: Array<{
    quantity: number;
    product_id: string;
    product: {
      title: string;
    };
  }>;
}

export default function VendorOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const endpoint = filter === 'all'
        ? '/vendor/orders?limit=100'
        : `/vendor/orders?status=${filter}&limit=100`;

      const response = await apiClient.get<{ data: Order[] }>(endpoint);
      setOrders(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
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

  const filters = [
    { value: 'all', label: 'All' },
    { value: 'paid', label: 'New' },
    { value: 'vendor_confirmed', label: 'Confirmed' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' }
  ];

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

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-serif text-white">Orders</h1>
          <p className="mt-2 text-white/60">
            Manage and fulfill customer orders
          </p>
        </div>

        <div className="glass-card glass-card-hover p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            {filters.map(({ value, label }) => (
              <Button
                key={value}
                variant={filter === value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(value)}
                className={filter === value
                  ? 'celestial-button'
                  : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                }
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="glass-card glass-card-hover p-12 text-center">
            <Package className="h-16 w-16 mx-auto mb-4" style={{ color: '#d4af8a' }} />
            <h3 className="text-2xl font-serif text-white mb-2">
              No orders found
            </h3>
            <p className="text-white/60">
              {filter === 'all'
                ? 'Orders will appear here once customers make purchases'
                : `No ${filters.find(f => f.value === filter)?.label.toLowerCase()} orders at the moment`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="glass-card glass-card-hover p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-xl text-white">
                      Order {order.order_number}
                    </h3>
                    <p className="text-sm text-white/50 mt-1">
                      {format(new Date(order.created_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                  <Badge className={`${getStatusColor(order.status)} text-white border-none`}>
                    {order.status.replace(/_/g, ' ').toUpperCase()}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                  <div>
                    <p className="text-sm text-white/50 mb-1">Customer</p>
                    <p className="font-medium text-white">{order.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/50 mb-1">Items</p>
                    <p className="font-medium text-white">
                      {order.order_items.reduce((sum, item) => sum + item.quantity, 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-white/50 mb-1">Total</p>
                    <p className="font-medium text-rose-gold text-lg">
                      ${parseFloat(order.total).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="text-sm text-white/60">
                    {order.order_items.map((item, idx) => (
                      <span key={idx}>
                        {item.quantity}x {item.product.title}
                        {idx < order.order_items.length - 1 && ', '}
                      </span>
                    ))}
                  </div>
                  <Link href={`/vendor/orders/${order.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
