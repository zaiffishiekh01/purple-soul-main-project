import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, Download, RefreshCw, MessageSquare, MapPin } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { OrderTimeline } from '@/components/orders/order-timeline';
import { format } from 'date-fns';

async function getOrderDetails(orderId: string) {
  const supabase = createClient();

  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        products (
          id,
          title,
          images,
          price
        )
      )
    `)
    .eq('id', orderId)
    .maybeSingle();

  if (error || !order) {
    return null;
  }

  return order;
}

export default async function OrderDetailPage({
  params,
}: {
  params: { orderId: string };
}) {
  const order = await getOrderDetails(params.orderId);

  if (!order) {
    notFound();
  }

  const shippingAddress = order.shipping_address as any;
  const statusColors: Record<string, string> = {
    created: 'bg-gray-500',
    payment_pending: 'bg-yellow-500',
    paid: 'bg-green-500',
    vendor_confirmed: 'bg-blue-500',
    shipped: 'bg-blue-600',
    in_transit: 'bg-blue-700',
    delivered: 'bg-green-600',
    cancelled: 'bg-red-500',
    return_requested: 'bg-orange-500',
    refunded: 'bg-gray-600'
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-6">
          <Link href="/account/orders">
            <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/5">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Button>
          </Link>
        </div>

        <div className="glass-card glass-card-hover p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-serif text-white mb-2">
                Order {order.order_number}
              </h1>
              <p className="text-white/60">
                Placed on {format(new Date(order.created_at), 'MMMM d, yyyy \'at\' h:mm a')}
              </p>
            </div>
            <Badge className={`${statusColors[order.status]} text-white border-none`}>
              {order.status.replace(/_/g, ' ').toUpperCase()}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Shipping Address
              </h3>
              <div className="text-white/70 text-sm space-y-1">
                <p>{shippingAddress?.name}</p>
                <p>{shippingAddress?.line1}</p>
                {shippingAddress?.line2 && <p>{shippingAddress.line2}</p>}
                <p>
                  {shippingAddress?.city}, {shippingAddress?.state} {shippingAddress?.postal_code}
                </p>
                <p>{shippingAddress?.country}</p>
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-3">Contact Information</h3>
              <div className="text-white/70 text-sm space-y-1">
                <p>{order.email}</p>
                {order.contact_info?.phone && <p>{(order.contact_info as any).phone}</p>}
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-3">Order Summary</h3>
              <div className="text-sm space-y-2">
                <div className="flex justify-between text-white/70">
                  <span>Subtotal</span>
                  <span className="text-white">${parseFloat(order.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Shipping</span>
                  <span className="text-white">${parseFloat(order.shipping_cost).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Tax</span>
                  <span className="text-white">${parseFloat(order.tax).toFixed(2)}</span>
                </div>
                {order.discount_amount && parseFloat(order.discount_amount) > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount</span>
                    <span>-${parseFloat(order.discount_amount).toFixed(2)}</span>
                  </div>
                )}
                <div className="ethereal-divider my-2"></div>
                <div className="flex justify-between font-semibold text-white text-lg">
                  <span>Total</span>
                  <span>${parseFloat(order.total).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="glass-card glass-card-hover p-8">
              <h2 className="text-2xl font-serif text-white mb-6">Order Items</h2>
              <div className="space-y-6">
                {order.order_items.map((item: any) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-white/5">
                      <Image
                        src={item.products?.images?.[0] || 'https://images.pexels.com/photos/4188303/pexels-photo-4188303.jpeg'}
                        alt={item.products?.title || 'Product'}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium mb-1">
                        {item.products?.title || 'Product'}
                      </h3>
                      <p className="text-white/60 text-sm mb-2">Quantity: {item.quantity}</p>
                      <p className="text-rose-gold font-medium">
                        ${parseFloat(item.price).toFixed(2)} each
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">
                        ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="glass-card glass-card-hover p-8">
              <h2 className="text-2xl font-serif text-white mb-6">Order Timeline</h2>
              <OrderTimeline
                currentStatus={order.status}
                createdAt={order.created_at}
                shippedAt={null}
                deliveredAt={null}
                cancelledAt={null}
              />
            </div>
          </div>
        </div>

        <div className="glass-card glass-card-hover p-8">
          <h2 className="text-2xl font-serif text-white mb-6">Order Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="bg-white/5 border-white/20 text-white hover:bg-white/10 justify-start"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Invoice
            </Button>
            <Button
              variant="outline"
              className="bg-white/5 border-white/20 text-white hover:bg-white/10 justify-start"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reorder Items
            </Button>
            <Button
              variant="outline"
              className="bg-white/5 border-white/20 text-white hover:bg-white/10 justify-start"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
          </div>

          {order.status === 'delivered' && (
            <div className="mt-4">
              <Button
                variant="outline"
                className="w-full md:w-auto bg-orange-500/10 border-orange-500/30 text-orange-300 hover:bg-orange-500/20"
              >
                <Package className="w-4 h-4 mr-2" />
                Request Return
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
