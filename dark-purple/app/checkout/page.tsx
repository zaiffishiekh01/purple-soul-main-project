'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useToast } from '@/hooks/use-toast';
import { AuthGuard } from '@/components/auth/auth-guard';

export default function CheckoutPage() {
  const { items, subtotal, totalItems, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const shipping = subtotal >= 100 ? 0 : 10;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.address || !formData.city || !formData.state || !formData.zipCode) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Order placed successfully!',
      description: 'Thank you for your order. A confirmation email has been sent.',
    });

    setTimeout(() => {
      clearCart();
      router.push('/');
    }, 2000);
  };

  useEffect(() => {
    if (mounted && items.length === 0) {
      router.push('/cart');
    }
  }, [mounted, items, router]);

  if (!mounted) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white/30"></div>
        </div>
      </AuthGuard>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <AuthGuard>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <h1 className="section-title font-serif text-white mb-8 text-center">Checkout</h1>

        <div className="max-w-xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Shipping' },
              { num: 2, label: 'Payment' },
              { num: 3, label: 'Review' },
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                      step >= s.num
                        ? 'bg-rose-gold text-celestial-indigo'
                        : 'bg-white/10 text-white/60 border border-white/30'
                    }`}
                  >
                    {step > s.num ? <Check className="w-5 h-5" /> : s.num}
                  </div>
                  <span className={`mt-2 text-sm ${step >= s.num ? 'text-white' : 'text-white/60'}`}>
                    {s.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 transition-colors ${
                      step > s.num ? 'bg-rose-gold' : 'bg-white/20'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="glass-card p-8">
              <h2 className="text-2xl font-serif text-white mb-6">Shipping Address</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-white/80 mb-2 text-sm">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:border-rose-gold focus:outline-none transition-colors"
                    placeholder="John Abraham"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 mb-2 text-sm">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:border-rose-gold focus:outline-none transition-colors"
                      placeholder="john@email.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 mb-2 text-sm">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:border-rose-gold focus:outline-none transition-colors"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 mb-2 text-sm">Street Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:border-rose-gold focus:outline-none transition-colors"
                    placeholder="1234 Main St, Apt 56"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 mb-2 text-sm">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:border-rose-gold focus:outline-none transition-colors"
                      placeholder="New York"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 mb-2 text-sm">State *</label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:border-rose-gold focus:outline-none transition-colors"
                      required
                    >
                      <option value="">Select state...</option>
                      <option value="NY">New York</option>
                      <option value="CA">California</option>
                      <option value="TX">Texas</option>
                      <option value="FL">Florida</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 mb-2 text-sm">ZIP Code *</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:border-rose-gold focus:outline-none transition-colors"
                      placeholder="10025"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 mb-2 text-sm">Country *</label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:border-rose-gold focus:outline-none transition-colors"
                      required
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                    </select>
                  </div>
                </div>

                <div className="ethereal-divider"></div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="save-address"
                    className="w-4 h-4 rounded border-white/30 bg-white/10"
                  />
                  <label htmlFor="save-address" className="text-white/70 text-sm">
                    Save this address for future orders
                  </label>
                </div>

                <button type="submit" className="celestial-button w-full text-lg">
                  Place Order
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="glass-card p-6 sticky top-24">
              <h2 className="text-xl font-serif text-white mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white text-sm mb-1">{item.title}</h4>
                      <p className="text-white/60 text-xs">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-rose-gold text-sm font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="ethereal-divider"></div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-white/70 text-sm">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white/70 text-sm">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-white/70 text-sm">
                  <span>Estimated Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>

                <div className="ethereal-divider"></div>

                <div className="flex justify-between text-white text-lg font-medium">
                  <span>Total</span>
                  <span className="text-rose-gold">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-white/60 text-xs">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <path d="M10 2L3 7V13L10 18L17 13V7L10 2Z" stroke="currentColor" strokeWidth="1.2" fill="none" />
                    <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.2" fill="none" />
                  </svg>
                  <span>Curated with Spiritual Care</span>
                </div>
                <div className="flex items-center gap-2 text-white/60 text-xs">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <path d="M10 2L3 7V13L10 18L17 13V7L10 2Z" stroke="currentColor" strokeWidth="1.2" fill="none" />
                    <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.2" fill="none" />
                  </svg>
                  <span>Ethical Fulfillment & Secure Checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </AuthGuard>
  );
}
