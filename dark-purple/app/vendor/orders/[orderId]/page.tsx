'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CircleAlert as AlertCircle, ArrowLeft, Package, Loader as Loader2, MessageCircle, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { RequestContactModal } from '@/components/vendor/request-contact-modal';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface OrderItem {
  id: string;
  quantity: number;
  price: string;
  product_id: string;
  products: {
    id: string;
    title: string;
    images: string[];
  };
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: string;
  email: string;
  customer_id: string;
  created_at: string;
  shipping_address?: any;
  contact_info?: any;
  order_items: OrderItem[];
}

interface ContactRequest {
  id: string;
  status: string;
  customer_accepted: boolean;
}

export default function VendorOrderDetails({ params }: { params: { orderId: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [contactRequest, setContactRequest] = useState<ContactRequest | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [hasApprovedContact, setHasApprovedContact] = useState(false);

  useEffect(() => {
    fetchOrder();
    checkContactRequest();
  }, [params.orderId]);

  const fetchOrder = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

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
          products!inner(id, title, images, vendor_id)
        `)
        .eq('order_id', params.orderId)
        .eq('products.vendor_id', user.id);

      if (itemsError) throw itemsError;

      if (!itemsData || itemsData.length === 0) {
        throw new Error('No items found for this vendor in this order');
      }

      setOrder({
        ...orderData,
        order_items: itemsData
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const checkContactRequest = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if there's an existing contact request for this order
      const { data: request } = await supabase
        .from('contact_requests')
        .select('id, status, customer_accepted')
        .eq('order_id', params.orderId)
        .maybeSingle();

      if (request) {
        setContactRequest(request);
        setHasApprovedContact(request.status === 'approved' && request.customer_accepted);
      }
    } catch (err) {
      console.error('Error checking contact request:', err);
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

  const getNextStatuses = (currentStatus: string): { value: string; label: string }[] => {
    const statusFlow: Record<string, { value: string; label: string }[]> = {
      paid: [
        { value: 'vendor_confirmed', label: 'Confirm Order' },
        { value: 'cancelled', label: 'Cancel' }
      ],
      vendor_confirmed: [
        { value: 'shipped', label: 'Mark as Shipped' },
        { value: 'cancelled', label: 'Cancel' }
      ],
      shipped: [
        { value: 'in_transit', label: 'In Transit' }
      ],
      in_transit: [
        { value: 'delivered', label: 'Mark as Delivered' }
      ],
      delivered: [],
      cancelled: []
    };
    return statusFlow[currentStatus] || [];
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
          <Link href="/vendor/orders">
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

  const nextStatuses = getNextStatuses(order.status);

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/vendor/orders">
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

        {nextStatuses.length > 0 && (
          <div className="glass-card glass-card-hover p-8 mb-8">
            <h2 className="text-2xl font-serif text-white mb-4">Update Order Status</h2>
            <div className="flex flex-wrap gap-3">
              {nextStatuses.map(({ value, label }) => (
                <Button
                  key={value}
                  onClick={() => updateStatus(value)}
                  disabled={updating}
                  className={value === 'cancelled'
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'celestial-button'
                  }
                >
                  {updating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    label
                  )}
                </Button>
              ))}
            </div>
          </div>
        )}

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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif text-white">Customer</h2>
                {!hasApprovedContact && (
                  <ShieldCheck className="h-5 w-5 text-rose-gold" />
                )}
              </div>

              {!hasApprovedContact ? (
                <div className="space-y-4">
                  <Alert className="bg-white/5 border-rose-gold/30">
                    <ShieldCheck className="h-4 w-4 text-rose-gold" />
                    <AlertDescription className="text-white/80 text-sm">
                      Customer contact information is protected. Request admin approval to contact this customer.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-white/50 mb-1">Customer ID</p>
                      <p className="text-white font-mono text-sm">
                        Customer #{order.customer_id.substring(0, 8)}...
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-white/50 mb-1">Contact</p>
                      <p className="text-white/60 text-sm">Use platform messaging</p>
                    </div>
                  </div>

                  {contactRequest ? (
                    <div className="pt-4">
                      <Badge variant={contactRequest.status === 'approved' ? 'default' : 'secondary'}>
                        Contact Request: {contactRequest.status}
                      </Badge>
                      {contactRequest.status === 'pending' && (
                        <p className="text-xs text-white/60 mt-2">
                          Waiting for admin review
                        </p>
                      )}
                      {contactRequest.status === 'approved' && !contactRequest.customer_accepted && (
                        <p className="text-xs text-white/60 mt-2">
                          Waiting for customer approval
                        </p>
                      )}
                    </div>
                  ) : (
                    <Button
                      onClick={() => setShowContactModal(true)}
                      className="w-full celestial-button"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Request Customer Contact
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-white/50 mb-1">Email</p>
                    <p className="text-white">{order.contact_info?.email || order.email}</p>
                  </div>
                  {order.contact_info?.phone && (
                    <div>
                      <p className="text-sm text-white/50 mb-1">Phone</p>
                      <p className="text-white">{order.contact_info.phone}</p>
                    </div>
                  )}
                  <Button
                    className="w-full celestial-button mt-4"
                    onClick={() => {
                      // Navigate to messaging
                      toast.info('Messaging feature coming soon');
                    }}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              )}
            </div>

            <div className="glass-card glass-card-hover p-8">
              <h2 className="text-2xl font-serif text-white mb-6">Shipping Address</h2>

              {hasApprovedContact && order.shipping_address ? (
                <div className="text-sm text-white space-y-1">
                  <p>{order.shipping_address.address_line1}</p>
                  {order.shipping_address.address_line2 && (
                    <p>{order.shipping_address.address_line2}</p>
                  )}
                  <p>
                    {order.shipping_address.city}, {order.shipping_address.state_province}{' '}
                    {order.shipping_address.postal_code}
                  </p>
                  <p>{order.shipping_address.country}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Alert className="bg-white/5 border-white/10">
                    <AlertDescription className="text-white/60 text-sm">
                      <div className="space-y-1">
                        <p>City: {order.shipping_address?.city || 'Hidden'}</p>
                        <p>State: {order.shipping_address?.state_province || 'Hidden'}</p>
                        <p>Country: {order.shipping_address?.country || 'Hidden'}</p>
                        <p className="text-xs text-white/40 mt-2">
                          Full address visible after contact approval
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          </div>

          <RequestContactModal
            open={showContactModal}
            onOpenChange={setShowContactModal}
            customerId={order.customer_id}
            orderId={order.id}
            orderNumber={order.order_number}
          />
        </div>
      </div>
    </div>
  );
}
