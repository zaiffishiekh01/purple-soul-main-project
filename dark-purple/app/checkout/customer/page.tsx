'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckoutStepper } from '@/components/checkout/stepper';
import { useCheckout } from '@/lib/checkout/context';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export default function CheckoutCustomerPage() {
  const router = useRouter();
  const { customer, setCustomer } = useCheckout();

  const [formData, setFormData] = useState({
    email: customer?.email || '',
    firstName: customer?.firstName || '',
    lastName: customer?.lastName || '',
    phone: customer?.phone || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [subtotal, setSubtotal] = useState(0);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const response = await fetch('/api/cart');
      const data = await response.json();
      setCartItems(data.items || []);
      setSubtotal(data.subtotal || 0);

      if (data.items?.length === 0) {
        router.push('/cart');
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setCustomer({
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone || undefined
    });

    router.push('/checkout/address');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2D1B4E] to-[#1a0b2e]">
      <CheckoutStepper />

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/20">
              <h1 className="text-3xl font-bold text-white mb-6">Contact Information</h1>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="email" className="text-white mb-2">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                    placeholder="you@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-300 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-white mb-2">First Name</Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                      placeholder="First name"
                    />
                    {errors.firstName && (
                      <p className="text-red-300 text-sm mt-1">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="lastName" className="text-white mb-2">Last Name</Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                      placeholder="Last name"
                    />
                    {errors.lastName && (
                      <p className="text-red-300 text-sm mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone" className="text-white mb-2">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <Button
                    type="button"
                    onClick={() => router.push('/cart')}
                    variant="outline"
                    className="flex-1 border-white/30 text-white bg-white/5 hover:bg-white/10 hover:border-white/40"
                  >
                    Back to Cart
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    Continue to Address
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 sticky top-24">
              <h2 className="text-xl font-bold text-white mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6">
                {cartItems.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <div className="w-12 h-12 rounded-lg bg-white/5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{item.product?.title}</p>
                      <p className="text-purple-200/70 text-xs">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-white font-medium text-sm">
                      ${(item.price_at_addition * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
                {cartItems.length > 3 && (
                  <p className="text-purple-200/70 text-sm">
                    + {cartItems.length - 3} more item{cartItems.length - 3 !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              <div className="border-t border-white/20 pt-4 space-y-2">
                <div className="flex justify-between text-purple-200">
                  <span>Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-purple-200/70 text-sm">
                  <span>Shipping</span>
                  <span>Calculated next</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
