import React, { useState } from 'react';
import { ArrowLeft, MapPin, CreditCard, Package, Check, Loader2 } from 'lucide-react';
import { CartItem } from '../App';

interface OrderReviewProps {
  cart?: CartItem[];
  onPlaceOrder: () => void;
  onBack: () => void;
}

export default function OrderReview({ cart = [], onPlaceOrder, onBack }: OrderReviewProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    onPlaceOrder();
  };

  const orderItems = cart.length > 0 ? cart : [
    {
      id: '1',
      name: 'Hand-Carved Olive Wood Prayer Beads',
      price: 89,
      originalPrice: 125,
      quantity: 1,
      image: 'https://images.pexels.com/photos/7363675/pexels-photo-7363675.jpeg?auto=compress&cs=tinysrgb&w=400',
      selectedColor: 'Natural Wood',
      category: '',
      description: '',
      images: [],
      rating: 4.5,
      reviews: 0,
      inStock: true,
      tags: []
    },
    {
      id: '2',
      name: 'Islamic Calligraphy Wall Art - Ayat al-Kursi',
      price: 245,
      quantity: 1,
      image: 'https://images.pexels.com/photos/6076442/pexels-photo-6076442.jpeg?auto=compress&cs=tinysrgb&w=400',
      category: '',
      description: '',
      images: [],
      rating: 4.5,
      reviews: 0,
      inStock: true,
      tags: []
    },
  ];

  const shippingAddress = {
    fullName: 'Sarah Johnson',
    addressLine1: '123 Main Street',
    addressLine2: 'Apt 4B',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    phone: '(555) 123-4567',
  };

  const paymentMethod = {
    brand: 'Visa',
    last4: '4242',
  };

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const bundleDiscount = orderItems.reduce((sum, item) => {
    if (item.bundleDiscount && item.bundleId) {
      return sum + (item.price * item.quantity * item.bundleDiscount / 100);
    }
    return sum;
  }, 0);

  const subtotalAfterDiscount = subtotal - bundleDiscount;
  const shipping = subtotalAfterDiscount > 50 ? 0 : 10;
  const tax = subtotalAfterDiscount * 0.1;
  const total = subtotalAfterDiscount + tax + shipping;

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-secondary hover:text-primary transition-colors mb-8"
          disabled={isProcessing}
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Payment
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Review Your Order</h1>
          <p className="text-secondary">Please review your order before placing it</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface border border-default rounded-2xl shadow-theme-md p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                  <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-xl font-bold text-primary">Order Items</h2>
              </div>

              <div className="space-y-4">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-default last:border-0 last:pb-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg border border-default"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-primary mb-1">{item.name}</h3>
                      {item.selectedColor && (
                        <p className="text-sm text-secondary mb-2">Color: {item.selectedColor}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-secondary">Qty: {item.quantity}</p>
                        <div>
                          <span className="font-bold text-purple-600 dark:text-purple-400">${item.price}</span>
                          {item.originalPrice && (
                            <span className="text-sm text-muted line-through ml-2">${item.originalPrice}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface border border-default rounded-2xl shadow-theme-md p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                  <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-xl font-bold text-primary">Shipping Address</h2>
              </div>

              <div className="text-secondary space-y-1">
                <p className="font-semibold text-primary">{shippingAddress.fullName}</p>
                <p>{shippingAddress.addressLine1}</p>
                {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
                <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}</p>
                <p className="text-sm mt-2">{shippingAddress.phone}</p>
              </div>

              <div className="mt-4 pt-4 border-t border-default">
                <div className="flex items-center gap-2 text-sm">
                  <Package className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-secondary">
                    Estimated delivery: <strong className="text-primary">Friday, March 20</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-surface border border-default rounded-2xl shadow-theme-md p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                  <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-xl font-bold text-primary">Payment Method</h2>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-blue-600 text-white rounded-lg p-3">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-primary">{paymentMethod.brand}</p>
                  <p className="text-sm text-secondary">•••• •••• •••• {paymentMethod.last4}</p>
                </div>
              </div>
            </div>

            <div className="bg-surface border border-default rounded-2xl shadow-theme-md p-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-5 h-5 rounded border-2 border-default bg-background checked:bg-purple-600 dark:checked:bg-purple-700 checked:border-purple-600 dark:checked:border-purple-700 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600 transition-all"
                  />
                  {agreedToTerms && (
                    <Check className="w-3 h-3 text-white absolute pointer-events-none" />
                  )}
                </div>
                <div className="text-sm text-secondary">
                  I agree to the{' '}
                  <a href="#" className="text-purple-600 dark:text-purple-400 hover:underline">
                    Terms & Conditions
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-purple-600 dark:text-purple-400 hover:underline">
                    Privacy Policy
                  </a>
                  . I understand that all artisan products are handcrafted and may have unique variations.
                </div>
              </label>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-surface border border-default rounded-2xl shadow-theme-lg p-6 sticky top-6">
              <h2 className="text-xl font-bold text-primary mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-default">
                <div className="flex justify-between text-secondary">
                  <span>Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Bundle Discount</span>
                  <span className="font-semibold">-${bundleDiscount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-secondary">
                  <span>Shipping</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">FREE</span>
                </div>
                <div className="flex justify-between text-secondary">
                  <span>Tax</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-8">
                <span className="text-lg font-bold text-primary">Total</span>
                <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">${total.toFixed(2)}</span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={!agreedToTerms || isProcessing}
                className={`w-full py-4 rounded-xl font-bold transition-all shadow-theme-lg flex items-center justify-center gap-2 ${
                  agreedToTerms && !isProcessing
                    ? 'gradient-purple-soul text-white hover:opacity-90'
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Place Order
                  </>
                )}
              </button>

              <p className="text-xs text-center text-secondary mt-4">
                By placing this order, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
