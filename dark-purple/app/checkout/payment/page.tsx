'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckoutStepper } from '@/components/checkout/stepper';
import { useCheckout } from '@/lib/checkout/context';
import { ArrowRight, ArrowLeft, CreditCard, Lock } from 'lucide-react';

type PaymentMethod = 'card' | 'paypal' | 'googlepay';

export default function CheckoutPaymentPage() {
  const router = useRouter();
  const { shipping, payment, setPayment } = useCheckout();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(payment?.method || 'card');

  useEffect(() => {
    if (!shipping) {
      router.push('/checkout/delivery');
    }
  }, [shipping, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const methodLabels = {
      card: 'Credit or Debit Card',
      paypal: 'PayPal',
      googlepay: 'Google Pay'
    };

    setPayment({
      method: selectedMethod,
      methodLabel: methodLabels[selectedMethod]
    });

    router.push('/checkout/review');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2D1B4E] to-[#1a0b2e]">
      <CheckoutStepper />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6 text-purple-300" />
              <h1 className="text-3xl font-bold text-white">Secure Payment</h1>
            </div>

            <div className="mb-8 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
              <p className="text-green-200 text-sm">
                Your payment information is encrypted and secure. We never store your card details.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-white font-semibold text-lg mb-4">Payment Method</h3>

                <label
                  className={`
                    block cursor-pointer rounded-xl p-6 transition-all
                    ${selectedMethod === 'card'
                      ? 'bg-white/5 border-2 border-purple-400'
                      : 'bg-white/5 border-2 border-white/10 hover:border-white/20'
                    }
                  `}
                  onClick={() => setSelectedMethod('card')}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={selectedMethod === 'card'}
                      onChange={() => setSelectedMethod('card')}
                      className="w-5 h-5 accent-purple-500"
                    />
                    <CreditCard className="w-6 h-6 text-purple-300" />
                    <span className="text-white font-semibold">Credit or Debit Card</span>
                  </div>

                  {selectedMethod === 'card' && (
                    <>
                      <div className="flex gap-2 mb-6 ml-8">
                        <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center text-white/70 text-xs font-semibold">
                          VISA
                        </div>
                        <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center text-white/70 text-xs font-semibold">
                          MC
                        </div>
                        <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center text-white/70 text-xs font-semibold">
                          AMEX
                        </div>
                        <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center text-white/70 text-xs font-semibold">
                          DISC
                        </div>
                      </div>

                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 ml-8">
                        <p className="text-blue-200 text-sm text-center">
                          <Lock className="w-4 h-4 inline mr-2" />
                          Stripe Payment Integration
                        </p>
                        <p className="text-blue-200/70 text-xs text-center mt-2">
                          Payment processing will be handled securely by Stripe
                        </p>
                      </div>
                    </>
                  )}
                </label>

                <label
                  className={`
                    block cursor-pointer rounded-xl p-6 transition-all
                    ${selectedMethod === 'paypal'
                      ? 'bg-white/5 border-2 border-purple-400'
                      : 'bg-white/5 border-2 border-white/10 hover:border-white/20'
                    }
                  `}
                  onClick={() => setSelectedMethod('paypal')}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={selectedMethod === 'paypal'}
                      onChange={() => setSelectedMethod('paypal')}
                      className="w-5 h-5 accent-purple-500"
                    />
                    <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">PayPal</span>
                    </div>
                    <span className="text-white font-semibold">PayPal</span>
                  </div>
                  {selectedMethod === 'paypal' && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 ml-8 mt-4">
                      <p className="text-blue-200 text-sm text-center">
                        <Lock className="w-4 h-4 inline mr-2" />
                        Secure PayPal Checkout
                      </p>
                      <p className="text-blue-200/70 text-xs text-center mt-2">
                        You will be redirected to PayPal to complete your purchase
                      </p>
                    </div>
                  )}
                </label>

                <label
                  className={`
                    block cursor-pointer rounded-xl p-6 transition-all
                    ${selectedMethod === 'googlepay'
                      ? 'bg-white/5 border-2 border-purple-400'
                      : 'bg-white/5 border-2 border-white/10 hover:border-white/20'
                    }
                  `}
                  onClick={() => setSelectedMethod('googlepay')}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="googlepay"
                      checked={selectedMethod === 'googlepay'}
                      onChange={() => setSelectedMethod('googlepay')}
                      className="w-5 h-5 accent-purple-500"
                    />
                    <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">G Pay</span>
                    </div>
                    <span className="text-white font-semibold">Google Pay</span>
                  </div>
                  {selectedMethod === 'googlepay' && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 ml-8 mt-4">
                      <p className="text-blue-200 text-sm text-center">
                        <Lock className="w-4 h-4 inline mr-2" />
                        Quick & Secure Google Pay
                      </p>
                      <p className="text-blue-200/70 text-xs text-center mt-2">
                        Pay quickly using your saved Google Pay information
                      </p>
                    </div>
                  )}
                </label>
              </div>

              <div className="pt-6 border-t border-white/20">
                <div className="flex items-start gap-3 mb-6">
                  <Lock className="w-5 h-5 text-purple-300 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-purple-200/70">
                    <p className="font-semibold text-white mb-1">256-bit SSL Encryption</p>
                    <p>Your payment information is transmitted securely and is never stored on our servers.</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  onClick={() => router.push('/checkout/delivery')}
                  variant="outline"
                  className="flex-1 border-white/30 text-white bg-white/5 hover:bg-white/10 hover:border-white/40"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  Review Order
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
