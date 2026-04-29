'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, ArrowLeft, Package, Loader2, User, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface OrderItem {
  id: string;
  quantity: number;
  price: string;
  product_id: string;
  products: {
    id: string;
    title: string;
    images: string[];
    vendor_id: string;
  };
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: string;
  email: string;
  created_at: string;
  shipping_address_line1?: string;
  shipping_address_line2?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_zip?: string;
  shipping_country?: string;
  billing_address_line1?: string;
  billing_address_line2?: string;
  billing_city?: string;
  billing_state?: string;
  billing_zip?: string;
  billing_country?: string;
  order_items: OrderItem[];
}

export default function AdminOrderDetail({ params }: { params: { orderId: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [params.orderId]);

  const fetchOrder = async () => {
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', params.orderId)
        .maybeSingle();

      if (orderError) throw orderError;
      if (!orderData) throw new Error('Order not found');

      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          products(id, title, images, vendor_id)
        `)
        .eq('order_id', params.orderId);

      if (itemsError) throw itemsError;

      setOrder({
        ...orderData,
        order_items: itemsData || []
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!order) return;

    setUpdating(true);
    try {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', params.orderId);

      if (updateError) throw updateError;

      setOrder({ ...order, status: newStatus });
      toast.success(`Order status updated to ${newStatus.replace(/_/g, ' ')}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update status';
      toast.error(message);
    } finally {
      setUpdating(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-white/50" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <Link href="/admin/orders">
            <Button variant="ghost" className="text-white hover:bg-white/10 mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
          </Link>
          <div className="glass-card p-6 border-red-500/30">
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle className="h-5 w-5" />
              <p>{error || 'Order not found'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const allStatuses = ['created', 'payment_pending', 'paid', 'vendor_confirmed', 'shipped', 'in_transit', 'delivered', 'cancelled'];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin/orders">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-serif text-white">
                Order {order.order_number}
              </h1>
              <p className="text-white/60 mt-1">
                {format(new Date(order.created_at), 'MMMM d, yyyy h:mm a')}
              </p>
            </div>
          </div>
          <Badge className={`${getStatusColor(order.status)} text-white border-none`}>
            {order.status.replace(/_/g, ' ').toUpperCase()}
          </Badge>
        </div>

        <div className="glass-card glass-card-hover p-8 mb-8">
          <h2 className="text-2xl font-serif text-white mb-4">Update Order Status</h2>
          <div className="flex items-center gap-4">
            <Select value={order.status} onValueChange={updateStatus} disabled={updating}>
              <SelectTrigger className="w-64 bg-white/5 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/20">
                {allStatuses.map((status) => (
                  <SelectItem key={status} value={status} className="text-white focus:bg-white/10 focus:text-white">
                    {status.replace(/_/g, ' ').toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {updating && <Loader2 className="h-5 w-5 animate-spin text-white/50" />}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="glass-card glass-card-hover p-8">
              <h2 className="text-2xl font-serif text-white mb-6">Order Items</h2>
              <div className="space-y-6">
                {order.order_items.map((item) => {
                  const imageUrl = item.products.images?.[0] || 'https://images.pexels.com/photos/4188303/pexels-photo-4188303.jpeg';
                  const itemTotal = parseFloat(item.price) * item.quantity;

                  return (
                    <div key={item.id} className="flex gap-6 pb-6 border-b border-white/10 last:border-0 last:pb-0">
                      <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                        <Image
                          src={imageUrl}
                          alt={item.products.title}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <Link href={`/p/${item.products.id}`} className="font-semibold text-white hover:text-rose-gold transition-colors text-lg">
                          {item.products.title}
                        </Link>
                        <div className="mt-2 text-sm text-white/60">
                          Quantity: {item.quantity}
                        </div>
                        <div className="mt-1 text-sm text-white/60">
                          ${parseFloat(item.price).toFixed(2)} each
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-rose-gold text-lg">
                          ${itemTotal.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-white/20">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-serif text-white">Total</span>
                  <span className="text-2xl font-bold text-rose-gold">
                    ${parseFloat(order.total).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card glass-card-hover p-8">
              <div className="flex items-center gap-3 mb-6">
                <User className="h-6 w-6 text-rose-gold" />
                <h2 className="text-2xl font-serif text-white">Customer</h2>
              </div>
              <div>
                <p className="text-sm text-white/50 mb-1">Email</p>
                <p className="text-white">{order.email}</p>
              </div>
            </div>

            {order.shipping_address_line1 && (
              <div className="glass-card glass-card-hover p-8">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="h-6 w-6 text-rose-gold" />
                  <h2 className="text-2xl font-serif text-white">Shipping Address</h2>
                </div>
                <div className="text-sm text-white space-y-1">
                  <p>{order.shipping_address_line1}</p>
                  {order.shipping_address_line2 && (
                    <p>{order.shipping_address_line2}</p>
                  )}
                  <p>
                    {order.shipping_city}, {order.shipping_state}{' '}
                    {order.shipping_zip}
                  </p>
                  <p>{order.shipping_country}</p>
                </div>
              </div>
            )}

            {order.billing_address_line1 && (
              <div className="glass-card glass-card-hover p-8">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="h-6 w-6 text-rose-gold" />
                  <h2 className="text-2xl font-serif text-white">Billing Address</h2>
                </div>
                <div className="text-sm text-white space-y-1">
                  <p>{order.billing_address_line1}</p>
                  {order.billing_address_line2 && (
                    <p>{order.billing_address_line2}</p>
                  )}
                  <p>
                    {order.billing_city}, {order.billing_state}{' '}
                    {order.billing_zip}
                  </p>
                  <p>{order.billing_country}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
