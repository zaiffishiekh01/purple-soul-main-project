import React, { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Tag, Gift, ChevronRight, Lock, ArrowLeft } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  color?: string;
  bundleDiscount?: number;
  bundleId?: string;
}

interface CartPageProps {
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number, color?: string, size?: string, bundleId?: string) => void;
  onRemove: (productId: string, color?: string, size?: string, bundleId?: string) => void;
  onCheckout: () => void;
  onBack?: () => void;
}

export default function CartPage({ cart, onUpdateQuantity, onRemove, onCheckout, onBack }: CartPageProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>(cart);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);

  // Sync local state with prop changes
  useEffect(() => {
    setCartItems(cart);
  }, [cart]);

  const updateQuantity = (id: string, change: number) => {
    const item = cartItems.find(i => i.id === id);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + change);
      onUpdateQuantity(id, newQuantity, item.color, undefined, item.bundleId);
    }
  };

  const removeItem = (id: string) => {
    const item = cartItems.find(i => i.id === id);
    if (item) {
      onRemove(id, item.color, undefined, item.bundleId);
    }
  };

  const applyPromo = () => {
    if (promoCode.trim()) {
      setAppliedPromo(promoCode);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const bundleDiscount = cartItems.reduce((sum, item) => {
    if (item.bundleDiscount) {
      return sum + (item.price * item.quantity * item.bundleDiscount / 100);
    }
    return sum;
  }, 0);
  const promoDiscount = appliedPromo ? subtotal * 0.1 : 0;
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = (subtotal - bundleDiscount - promoDiscount) * 0.08;
  const total = subtotal - bundleDiscount - promoDiscount + shipping + tax;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <ShoppingCart className="w-24 h-24 text-muted mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-primary mb-4">Your Cart is Empty</h2>
            <p className="text-secondary text-lg mb-8">Discover beautiful handcrafted items from artisan communities worldwide</p>
            <button
              onClick={onBack}
              className="gradient-purple-soul text-white px-8 py-4 rounded-xl font-bold hover:opacity-90 transition-all shadow-theme-lg"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors mb-6 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Continue Shopping
          </button>
        )}

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Shopping Cart</h1>
          <p className="text-secondary">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-surface border border-default rounded-2xl p-6 shadow-theme-md hover:shadow-theme-lg transition-all"
              >
                <div className="flex gap-6">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-32 h-32 object-cover rounded-xl border border-default"
                  />

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-primary mb-2">{item.name}</h3>
                        {item.color && (
                          <p className="text-sm text-secondary">Color: {item.color}</p>
                        )}
                        {item.bundleDiscount && (
                          <div className="flex items-center gap-1.5 mt-2 text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-lg w-fit">
                            <Tag className="w-3.5 h-3.5" />
                            <span>Bundle: {item.bundleDiscount}% off</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 hover:bg-surface-elevated rounded-lg transition-colors text-muted hover:text-red-600 dark:hover:text-red-400"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 bg-surface-elevated dark:bg-surface-deep border border-default rounded-xl p-1">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-2 hover:bg-surface rounded-lg transition-colors text-primary"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-primary font-bold w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-2 hover:bg-surface rounded-lg transition-colors text-primary"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                        {item.originalPrice && (
                          <div className="text-sm text-muted line-through">
                            ${(item.originalPrice * item.quantity).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-2 border-purple-200 dark:border-purple-800/50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Gift className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <h3 className="font-bold text-lg text-primary">Add More & Save</h3>
              </div>
              <p className="text-secondary mb-4">You're earning bundle discounts! Add related items to save even more.</p>
              <button className="text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                Browse Recommendations
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-surface border border-default rounded-2xl shadow-theme-lg sticky top-6">
              <div className="p-6 border-b border-default">
                <h2 className="text-2xl font-bold text-primary mb-6">Order Summary</h2>

                <div className="space-y-3 mb-6">
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

                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Promo Code</span>
                      <span className="font-semibold">-${promoDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-secondary">
                    <span>Shipping</span>
                    <span className="font-semibold">
                      {shipping === 0 ? (
                        <span className="text-green-600 dark:text-green-400">FREE</span>
                      ) : (
                        `$${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-secondary">
                    <span>Tax</span>
                    <span className="font-semibold">${tax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-default mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-primary">Total</span>
                    <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-bold text-primary mb-2">Promo Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter code"
                      className="flex-1 px-4 py-3 bg-background border border-default rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600"
                    />
                    <button
                      onClick={applyPromo}
                      className="px-6 py-3 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-bold rounded-xl hover:bg-purple-200 dark:hover:bg-purple-800/40 transition-all"
                    >
                      Apply
                    </button>
                  </div>
                  {appliedPromo && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                      Code "{appliedPromo}" applied!
                    </p>
                  )}
                </div>

                <button
                  onClick={onCheckout}
                  className="w-full gradient-purple-soul text-white py-4 rounded-xl font-bold hover:opacity-90 transition-all shadow-theme-lg flex items-center justify-center gap-2 mb-3"
                >
                  <Lock className="w-5 h-5" />
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5" />
                </button>

                <div className="text-center">
                  <button className="text-sm text-secondary hover:text-primary transition-colors">
                    Continue Shopping
                  </button>
                </div>
              </div>

              <div className="p-6 bg-surface-elevated dark:bg-surface-deep rounded-b-2xl">
                <div className="flex items-start gap-3 text-sm text-secondary">
                  <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <p>Your payment information is encrypted and secure. We never store your full card details.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
