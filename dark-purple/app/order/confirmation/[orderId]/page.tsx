'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, Mail, ArrowRight } from 'lucide-react';
import { useCheckout } from '@/lib/checkout/context';

export default function OrderConfirmationPage({ params }: { params: { orderId: string } }) {
  const { customer, reset } = useCheckout();

  useEffect(() => {
    // Clear checkout state after successful order
    const timer = setTimeout(() => {
      reset();
    }, 1000);

    return () => clearTimeout(timer);
  }, [reset]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2D1B4E] to-[#1a0b2e]">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-white/20 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Order Confirmed!
            </h1>

            <p className="text-xl text-purple-200/90 mb-8">
              Thank you for your purchase
            </p>

            <div className="bg-white/5 rounded-xl p-6 mb-8">
              <p className="text-purple-200/70 text-sm mb-2">Order Number</p>
              <p className="text-white font-mono text-2xl font-bold">{params.orderId}</p>
            </div>

            <div className="space-y-4 mb-8 text-left">
              <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl">
                <Mail className="w-6 h-6 text-purple-300 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Confirmation Email Sent</h3>
                  <p className="text-purple-200/70 text-sm">
                    We've sent an order confirmation to {customer?.email || 'your email address'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl">
                <Package className="w-6 h-6 text-purple-300 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-white font-semibold mb-1">What's Next?</h3>
                  <p className="text-purple-200/70 text-sm">
                    Your order is being prepared for shipment. You'll receive a tracking number once it ships.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={`/order/${params.orderId}`} className="flex-1">
                <Button
                  variant="outline"
                  className="w-full border-white/30 text-white bg-white/5 hover:bg-white/10 hover:border-white/40"
                >
                  View Order Details
                </Button>
              </Link>

              <Link href="/" className="flex-1">
                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                  Continue Shopping
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10">
              <p className="text-purple-200/70 text-sm">
                Questions about your order?{' '}
                <Link href="/support" className="text-purple-300 hover:text-white underline">
                  Contact Support
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 text-center">
              <h4 className="text-white font-semibold mb-2">Sacred Care</h4>
              <p className="text-purple-200/70 text-sm">
                Items curated with spiritual respect
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 text-center">
              <h4 className="text-white font-semibold mb-2">Secure Packaging</h4>
              <p className="text-purple-200/70 text-sm">
                Carefully packed for safe delivery
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 text-center">
              <h4 className="text-white font-semibold mb-2">Expert Support</h4>
              <p className="text-purple-200/70 text-sm">
                Here to help with any questions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
