import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Package, Truck, CreditCard, User, Mail, Phone, MapPin,
  ArrowLeft, RefreshCw, CheckCircle, Clock, AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getOrderByNumber } from '../lib/orderHelper';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const timelineSteps = [
  { key: 'placed', label: 'Order Placed', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Package },
];

function getTimelineProgress(status: string): number {
  const map: Record<string, number> = {
    pending: 1,
    processing: 2,
    shipped: 3,
    delivered: 4,
    cancelled: 0,
  };
  return map[status] ?? 0;
}

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  price: number;
  quantity: number;
  selected_color: string | null;
  selected_size: string | null;
}

interface OrderRecord {
  id: string;
  order_number: string;
  status: string;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  shipping_address: Record<string, string>;
  billing_address?: Record<string, string>;
  payment_method: string;
  payment_status: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  created_at: string;
  items?: OrderItem[];
}

export default function OrderDetailPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderNumber) {
        setError('No order number provided');
        setLoading(false);
        return;
      }
      try {
        const result = await getOrderByNumber(orderNumber);
        if (result.success && result.order) {
          setOrder(result.order as OrderRecord);
        } else {
          setError('Order not found');
        }
      } catch {
        setError('Failed to load order');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 text-purple-600 mx-auto mb-4 animate-spin" />
          <p className="text-secondary">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-primary mb-2">Order Not Found</h2>
          <p className="text-secondary mb-4">{error ?? 'Unable to load this order.'}</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-purple-600 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const progress = getTimelineProgress(order.status);
  const addr = order.shipping_address as Record<string, string> | undefined;
  const billAddr = (order.billing_address as Record<string, string> | undefined) ?? addr;

  return (
    <div className="min-h-screen bg-page py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg border border-default hover:bg-surface-deep transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-secondary" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-primary">Order {order.order_number}</h1>
              <p className="text-sm text-muted">
                Placed on {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${statusColors[order.status] ?? 'bg-surface-deep text-secondary'}`}>
            {order.status}
          </span>
        </div>

        {/* Timeline */}
        {order.status !== 'cancelled' && (
          <div className="bg-surface rounded-xl shadow-theme-sm p-6">
            <h2 className="text-lg font-semibold text-primary mb-6">Order Progress</h2>
            <div className="flex items-center justify-between">
              {timelineSteps.map((step, i) => {
                const Icon = step.icon;
                const isActive = i + 1 <= progress;
                const isCurrent = i + 1 === progress;
                return (
                  <div key={step.key} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          isCurrent
                            ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white ring-4 ring-purple-200 dark:ring-purple-900'
                            : isActive
                              ? 'bg-purple-600 text-white'
                              : 'bg-surface-deep text-muted border border-default'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-xs mt-2 font-medium ${isActive ? 'text-primary' : 'text-muted'}`}>
                        {step.label}
                      </span>
                    </div>
                    {i < timelineSteps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 rounded-full ${i + 1 < progress ? 'bg-purple-600' : 'bg-surface-deep'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="bg-surface rounded-xl shadow-theme-sm p-6">
          <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-600" />
            Order Items
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-default">
                  <th className="text-left py-3 text-secondary font-medium">Product</th>
                  <th className="text-center py-3 text-secondary font-medium">Qty</th>
                  <th className="text-right py-3 text-secondary font-medium">Unit Price</th>
                  <th className="text-right py-3 text-secondary font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {(order.items ?? []).map((item) => (
                  <tr key={item.id} className="border-b border-default">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-surface-deep overflow-hidden flex-shrink-0">
                          {item.product_image ? (
                            <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-6 h-6 text-muted m-auto mt-2" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-primary">{item.product_name}</p>
                          {[item.selected_color, item.selected_size].filter(Boolean).length > 0 && (
                            <p className="text-xs text-muted">
                              {[item.selected_color, item.selected_size].filter(Boolean).join(' / ')}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="text-center py-3 text-secondary">{item.quantity}</td>
                    <td className="text-right py-3 text-secondary">${item.price.toFixed(2)}</td>
                    <td className="text-right py-3 font-semibold text-primary">${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Shipping Address */}
          <div className="bg-surface rounded-xl shadow-theme-sm p-6">
            <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-purple-600" />
              Shipping Address
            </h2>
            {addr ? (
              <div className="text-sm text-secondary space-y-1">
                <p className="font-medium text-primary">{addr.name ?? order.customer_name ?? 'Customer'}</p>
                {addr.address && <p>{addr.address}</p>}
                {[addr.city, addr.state, addr.zip].filter(Boolean).join(', ') && (
                  <p>{[addr.city, addr.state, addr.zip].filter(Boolean).join(', ')}</p>
                )}
                {addr.country && <p>{addr.country}</p>}
                {addr.phone && <p className="flex items-center gap-1 mt-2"><Phone className="w-3 h-3" />{addr.phone}</p>}
              </div>
            ) : (
              <p className="text-sm text-muted">No shipping address available.</p>
            )}
          </div>

          {/* Billing Address */}
          <div className="bg-surface rounded-xl shadow-theme-sm p-6">
            <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-purple-600" />
              Billing Address
            </h2>
            {billAddr ? (
              <div className="text-sm text-secondary space-y-1">
                <p className="font-medium text-primary">{billAddr.name ?? order.customer_name ?? 'Customer'}</p>
                {billAddr.address && <p>{billAddr.address}</p>}
                {[billAddr.city, billAddr.state, billAddr.zip].filter(Boolean).join(', ') && (
                  <p>{[billAddr.city, billAddr.state, billAddr.zip].filter(Boolean).join(', ')}</p>
                )}
                {billAddr.country && <p>{billAddr.country}</p>}
              </div>
            ) : (
              <p className="text-sm text-muted">No billing address available.</p>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-surface rounded-xl shadow-theme-sm p-6">
          <h2 className="text-lg font-semibold text-primary mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-secondary">
              <span>Subtotal</span>
              <span className="font-medium">${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-secondary">
              <span>Shipping</span>
              <span className="font-medium">{order.shipping === 0 ? 'FREE' : `$${order.shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-secondary">
              <span>Tax</span>
              <span className="font-medium">${order.tax.toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span className="font-medium">-${order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-default pt-3 mt-3">
              <div className="flex justify-between">
                <span className="text-base font-bold text-primary">Total</span>
                <span className="text-xl font-bold text-purple-600">${order.total.toFixed(2)}</span>
              </div>
            </div>
            <div className="text-xs text-muted pt-2">
              Paid via {order.payment_method} &middot; Status: <span className="capitalize">{order.payment_status}</span>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-surface rounded-xl shadow-theme-sm p-6">
          <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-purple-600" />
            Contact Information
          </h2>
          <div className="space-y-2 text-sm">
            {order.customer_name && (
              <p className="flex items-center gap-2 text-secondary">
                <User className="w-4 h-4 text-muted" />
                {order.customer_name}
              </p>
            )}
            {order.customer_email && (
              <p className="flex items-center gap-2 text-secondary">
                <Mail className="w-4 h-4 text-muted" />
                {order.customer_email}
              </p>
            )}
            {order.customer_phone && (
              <p className="flex items-center gap-2 text-secondary">
                <Phone className="w-4 h-4 text-muted" />
                {order.customer_phone}
              </p>
            )}
          </div>
        </div>

        {/* Reorder */}
        <div className="flex justify-end">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-all"
          >
            <RefreshCw className="w-5 h-5" />
            Reorder
          </button>
        </div>
      </div>
    </div>
  );
}
