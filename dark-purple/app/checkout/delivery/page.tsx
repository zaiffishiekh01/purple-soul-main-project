'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckoutStepper } from '@/components/checkout/stepper';
import { useCheckout } from '@/lib/checkout/context';
import { ArrowRight, ArrowLeft, Truck, Zap, Clock } from 'lucide-react';

interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  carrier: string;
  base_price: number;
  estimated_days_min: number;
  estimated_days_max: number;
}

const SHIPPING_OPTIONS: ShippingMethod[] = [
  {
    id: 'free',
    name: 'Free Standard Shipping',
    description: 'Delivery in 7-10 business days',
    carrier: 'USPS',
    base_price: 0,
    estimated_days_min: 7,
    estimated_days_max: 10
  },
  {
    id: 'standard',
    name: 'Standard Shipping',
    description: 'Delivery in 5-7 business days',
    carrier: 'USPS',
    base_price: 9.99,
    estimated_days_min: 5,
    estimated_days_max: 7
  },
  {
    id: 'express',
    name: 'Express Shipping',
    description: 'Delivery in 2-3 business days',
    carrier: 'FedEx',
    base_price: 19.99,
    estimated_days_min: 2,
    estimated_days_max: 3
  },
  {
    id: 'overnight',
    name: 'Overnight Shipping',
    description: 'Next business day delivery',
    carrier: 'FedEx',
    base_price: 39.99,
    estimated_days_min: 1,
    estimated_days_max: 1
  }
];

export default function CheckoutDeliveryPage() {
  const router = useRouter();
  const { shippingAddress, shipping, setShipping } = useCheckout();
  const [selectedMethodId, setSelectedMethodId] = useState(shipping?.methodId || 'free');

  useEffect(() => {
    if (!shippingAddress) {
      router.push('/checkout/address');
    }
  }, [shippingAddress, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selected = SHIPPING_OPTIONS.find(m => m.id === selectedMethodId);
    if (!selected) return;

    setShipping({
      methodId: selected.id,
      methodName: selected.name,
      price: selected.base_price,
      estimatedDays: `${selected.estimated_days_min}-${selected.estimated_days_max} days`
    });

    router.push('/checkout/payment');
  };

  const getIcon = (methodName: string) => {
    if (methodName.toLowerCase().includes('overnight')) return <Zap className="w-6 h-6" />;
    if (methodName.toLowerCase().includes('express')) return <Clock className="w-6 h-6" />;
    return <Truck className="w-6 h-6" />;
  };

  if (!shippingAddress) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2D1B4E] to-[#1a0b2e]">
      <CheckoutStepper />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/20">
            <h1 className="text-3xl font-bold text-white mb-2">Delivery Method</h1>
            <p className="text-purple-200/70 mb-8">
              Shipping to: {shippingAddress.city}, {shippingAddress.stateProvince} {shippingAddress.postalCode}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {SHIPPING_OPTIONS.map((method) => (
                <label
                  key={method.id}
                  className={`
                    flex items-center gap-4 p-6 rounded-xl cursor-pointer transition-all
                    ${selectedMethodId === method.id
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-400'
                      : 'bg-white/5 border-2 border-white/10 hover:border-white/20'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="shippingMethod"
                    value={method.id}
                    checked={selectedMethodId === method.id}
                    onChange={() => setSelectedMethodId(method.id)}
                    className="w-5 h-5 accent-purple-500"
                  />

                  <div className="text-purple-300">
                    {getIcon(method.name)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-white font-semibold text-lg">{method.name}</h3>
                      <p className="text-white font-bold text-lg">
                        {method.base_price === 0 ? 'FREE' : `$${method.base_price.toFixed(2)}`}
                      </p>
                    </div>
                    <p className="text-purple-200/70 text-sm">{method.description}</p>
                    <p className="text-purple-200/70 text-sm mt-1">
                      Estimated delivery: {method.estimated_days_min}-{method.estimated_days_max} business days
                    </p>
                  </div>
                </label>
              ))}

              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  onClick={() => router.push('/checkout/address')}
                  variant="outline"
                  className="flex-1 border-white/30 text-white bg-white/5 hover:bg-white/10 hover:border-white/40"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={!selectedMethodId}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white disabled:opacity-50"
                >
                  Continue to Payment
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
