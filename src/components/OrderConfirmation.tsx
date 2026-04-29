import React from 'react';
import { CheckCircle, Package, MapPin, CreditCard, Download, Share2, Mail, ArrowRight, Calendar, ArrowLeft } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  bundleId?: string;
  bundleDiscount?: number;
}

interface OrderConfirmationProps {
  orderNumber?: string;
  cart: CartItem[];
  onViewTracking: () => void;
  onBack?: () => void;
  onContinueShopping?: () => void;
}

export default function OrderConfirmation({ orderNumber = 'ORD-20260315-7821', cart, onViewTracking, onBack, onContinueShopping }: OrderConfirmationProps) {
  const orderDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const bundleDiscount = cart.reduce((sum, item) => {
    if (item.bundleDiscount && item.bundleId) {
      return sum + (item.price * item.quantity * item.bundleDiscount / 100);
    }
    return sum;
  }, 0);

  const subtotalAfterDiscount = subtotal - bundleDiscount;
  const shipping = subtotalAfterDiscount > 50 ? 0 : 10;
  const tax = subtotalAfterDiscount * 0.1;
  const total = subtotalAfterDiscount + shipping + tax;

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-secondary hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Order Review
          </button>
        )}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-4xl font-bold text-primary mb-3">Order Confirmed!</h1>
          <p className="text-xl text-secondary mb-2">Thank you for your purchase</p>
          <p className="text-lg text-secondary">
            Order #{orderNumber}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-2 border-purple-200 dark:border-purple-800/50 rounded-2xl p-8 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-primary mb-2">What happens next?</h2>
            <p className="text-secondary">We've sent a confirmation email to your inbox</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/40 rounded-full mb-4">
                <Package className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-bold text-primary mb-2">Processing</h3>
              <p className="text-sm text-secondary">Your order is being prepared by our artisan partners</p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/40 rounded-full mb-4">
                <MapPin className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-bold text-primary mb-2">Shipping</h3>
              <p className="text-sm text-secondary">You'll receive tracking information within 1-2 business days</p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/40 rounded-full mb-4">
                <Calendar className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-bold text-primary mb-2">Delivery</h3>
              <p className="text-sm text-secondary">Estimated arrival: {estimatedDelivery}</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-surface border border-default rounded-2xl shadow-theme-md p-6">
            <h2 className="text-xl font-bold text-primary mb-4">Order Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary">Order Number:</span>
                <span className="font-semibold text-primary">{orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Order Date:</span>
                <span className="font-semibold text-primary">{orderDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Payment Method:</span>
                <span className="font-semibold text-primary">Visa •••• 4242</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Order Total:</span>
                <span className="font-bold text-lg text-purple-600 dark:text-purple-400">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-default rounded-2xl shadow-theme-md p-6">
            <h2 className="text-xl font-bold text-primary mb-4">Shipping Address</h2>
            <div className="text-secondary space-y-1 text-sm">
              <p className="font-semibold text-primary">Sarah Johnson</p>
              <p>123 Main Street, Apt 4B</p>
              <p>New York, NY 10001</p>
              <p>(555) 123-4567</p>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-default rounded-2xl shadow-theme-md p-6 mb-8">
          <h2 className="text-xl font-bold text-primary mb-6">Order Items</h2>
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex gap-4 pb-4 border-b border-default last:border-0 last:pb-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-xl border border-default"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-primary mb-2">{item.name}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-secondary">Quantity: {item.quantity}</p>
                    <span className="font-bold text-purple-600 dark:text-purple-400">${item.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-default space-y-2">
            <div className="flex justify-between text-secondary">
              <span>Subtotal</span>
              <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            {bundleDiscount > 0 && (
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>Bundle Discount</span>
                <span className="font-semibold">-${bundleDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-secondary">
              <span>Shipping</span>
              <span className={`font-semibold ${shipping === 0 ? 'text-green-600 dark:text-green-400' : ''}`}>
                {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-secondary">
              <span>Tax</span>
              <span className="font-semibold">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-default">
              <span className="text-lg font-bold text-primary">Total</span>
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={onViewTracking}
            className="flex items-center justify-center gap-2 gradient-purple-soul text-white py-4 rounded-xl font-bold hover:opacity-90 transition-all shadow-theme-lg"
          >
            <Package className="w-5 h-5" />
            Track Order
          </button>

          <button className="flex items-center justify-center gap-2 bg-surface-elevated dark:bg-surface-deep border-2 border-default py-4 rounded-xl font-bold text-primary hover:border-purple-300 dark:hover:border-purple-700 transition-all">
            <Download className="w-5 h-5" />
            Download Receipt
          </button>

          <button className="flex items-center justify-center gap-2 bg-surface-elevated dark:bg-surface-deep border-2 border-default py-4 rounded-xl font-bold text-primary hover:border-purple-300 dark:hover:border-purple-700 transition-all">
            <Mail className="w-5 h-5" />
            Email Receipt
          </button>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-2 border-purple-200 dark:border-purple-800/50 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-primary mb-3">Continue Shopping</h2>
          <p className="text-secondary mb-6">Discover more unique handcrafted items from artisan communities worldwide</p>
          <button
            onClick={onContinueShopping}
            className="inline-flex items-center gap-2 gradient-purple-soul text-white px-8 py-4 rounded-xl font-bold hover:opacity-90 transition-all shadow-theme-lg"
          >
            Browse Products
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-secondary mb-2">Need help with your order?</p>
          <a href="#" className="text-purple-600 dark:text-purple-400 hover:underline font-semibold">
            Contact Customer Support
          </a>
        </div>
      </div>
    </div>
  );
}
