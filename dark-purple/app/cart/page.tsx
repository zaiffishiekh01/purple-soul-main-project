'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Minus, ShoppingBag, Lock, Shield, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { useState } from 'react';

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [bundleSelected, setBundleSelected] = useState(false);
  const discount = 0;
  const total = subtotal - discount;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2D1B4E] to-[#1a0b2e]">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20">
              <ShoppingBag className="w-24 h-24 mx-auto mb-6 text-purple-300/50" />
              <h1 className="text-3xl font-bold text-white mb-4">Your Cart is Empty</h1>
              <p className="text-purple-200/70 mb-8">
                Discover sacred items crafted with spiritual care
              </p>
              <Link href="/">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-6 text-lg rounded-xl">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2D1B4E] to-[#1a0b2e]">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 text-center">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/20">
              <div className="space-y-6">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 md:gap-6 pb-6 border-b border-white/10 last:border-0"
                  >
                    <div className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0 rounded-xl overflow-hidden bg-white/5">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/30">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/p/${item.id}`}
                        className="text-white font-semibold text-lg hover:text-purple-300 transition-colors line-clamp-2"
                      >
                        {item.title}
                      </Link>

                      <div className="mt-2 text-purple-200 text-sm">
                        ${item.price.toFixed(2)} each
                      </div>

                      {item.traditions && item.traditions.length > 0 && (
                        <div className="mt-1 flex gap-1">
                          {item.traditions.map((tradition) => (
                            <span key={tradition} className="text-xs px-2 py-1 bg-purple-500/20 text-purple-200 rounded">
                              {tradition}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-4 flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-2 hover:bg-white/10 rounded-md transition-colors disabled:opacity-50"
                          >
                            <Minus className="w-4 h-4 text-white" />
                          </button>
                          <span className="px-3 text-white font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-white/10 rounded-md transition-colors"
                          >
                            <Plus className="w-4 h-4 text-white" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 hover:bg-red-500/20 rounded-md transition-colors text-red-300"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-white font-bold text-xl">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {!bundleSelected && items.length > 0 && (
              <div className="mt-6 bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/20">
                <div className="mb-3">
                  <h3 className="text-sm text-purple-200/60 uppercase tracking-wider font-light">
                    Complete the Set
                  </h3>
                </div>

                <div className="flex gap-4 md:gap-6 items-start">
                  <div className="flex-1">
                    <h4 className="text-white font-semibold text-lg mb-3">
                      Eternal Light Set
                    </h4>

                    <ul className="space-y-1.5 mb-4">
                      <li className="text-purple-200/70 text-sm flex items-center gap-2">
                        <span className="w-1 h-1 bg-purple-300/50 rounded-full"></span>
                        Eternal Light Lamp
                      </li>
                      <li className="text-purple-200/70 text-sm flex items-center gap-2">
                        <span className="w-1 h-1 bg-purple-300/50 rounded-full"></span>
                        Handcrafted Wick Set
                      </li>
                      <li className="text-purple-200/70 text-sm flex items-center gap-2">
                        <span className="w-1 h-1 bg-purple-300/50 rounded-full"></span>
                        Brass Oil Spoon
                      </li>
                    </ul>

                    <p className="text-purple-200/60 text-sm leading-relaxed mb-4">
                      A thoughtful pairing for balanced and mindful use.
                    </p>

                    <div className="flex items-baseline gap-3 mb-4">
                      <span className="text-white font-bold text-xl">$82.00</span>
                      <span className="text-purple-200/60 text-sm">You save $7.00</span>
                    </div>

                    <Button
                      onClick={() => setBundleSelected(true)}
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10 hover:border-white/40 transition-colors"
                    >
                      Switch to Set
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {bundleSelected && (
              <div className="mt-6 bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                      <svg className="w-3 h-3 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-purple-200/70 text-sm">
                      Eternal Light Set selected ✓
                    </span>
                  </div>
                  <button
                    onClick={() => setBundleSelected(false)}
                    className="text-purple-200/60 text-sm hover:text-white transition-colors"
                  >
                    Change
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6 bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
              <div className="flex gap-4 items-start">
                <Shield className="w-6 h-6 text-purple-300 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Curated with Spiritual Care</h3>
                  <p className="text-purple-200/70 text-sm">
                    Every item is selected to honor Abrahamic traditions with respect and authenticity
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/20 sticky top-24">
              <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-purple-200">
                  <span>Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-300">
                    <span>Discount</span>
                    <span className="font-semibold">-${discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="border-t border-white/20 pt-4">
                  <div className="flex justify-between text-white text-xl font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="text-sm text-purple-200 mb-2 block">Promo Code</label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                  />
                  <Button
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Apply
                  </Button>
                </div>
              </div>

              <Button
                onClick={() => router.push('/checkout/customer')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-6 text-lg rounded-xl mb-4"
              >
                <Lock className="w-5 h-5 mr-2" />
                Proceed to Checkout
              </Button>

              <Link href="/">
                <Button variant="ghost" className="w-full text-purple-200 hover:text-white hover:bg-white/5">
                  Continue Shopping
                </Button>
              </Link>

              <div className="mt-6 pt-6 border-t border-white/10 space-y-3 text-sm">
                <div className="flex items-center gap-2 text-purple-200/70">
                  <Lock className="w-4 h-4" />
                  <span>Secure Checkout</span>
                </div>
                <div className="flex items-center gap-2 text-purple-200/70">
                  <Shield className="w-4 h-4" />
                  <span>Respect for All Traditions</span>
                </div>
                <div className="flex items-center gap-2 text-purple-200/70">
                  <Heart className="w-4 h-4" />
                  <span>Ethical Fulfillment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
