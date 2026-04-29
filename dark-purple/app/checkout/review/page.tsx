'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CheckoutStepper } from '@/components/checkout/stepper';
import { useCheckout } from '@/lib/checkout/context';
import { ArrowLeft, Lock, Mail, MapPin, Truck, CreditCard } from 'lucide-react';

export default function CheckoutReviewPage() {
  const router = useRouter();
  const { customer, shippingAddress, billingAddress, shipping, payment, useSameAddress } = useCheckout();

  const [cartItems, setCartItems] = useState<any[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (!customer || !shippingAddress || !shipping) {
      router.push('/checkout/customer');
      return;
    }

    if (!payment) {
      router.push('/checkout/payment');
      return;
    }

    loadCart();
  }, [customer, shippingAddress, shipping, payment, router]);

  const loadCart = async () => {
    try {
      const response = await fetch('/api/cart');
      const data = await response.json();
      setCartItems(data.items || []);
      setSubtotal(data.subtotal || 0);
      setTax((data.subtotal || 0) * 0.08); // 8% tax rate for demo
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  };

  const total = subtotal + (shipping?.price || 0) + tax;

  const handlePlaceOrder = async () => {
    setPlacing(true);

    try {
      const orderData = {
        items: cartItems.map(item => ({
          product_id: item.product_id,
          product_name: item.name || item.product_name,
          quantity: item.quantity,
          price: item.price,
        })),
        customer: {
          email: customer?.email,
          name: `${customer?.first_name || ''} ${customer?.last_name || ''}`.trim(),
          phone: customer?.phone,
        },
        shipping_address: {
          street: shippingAddress?.street,
          city: shippingAddress?.city,
          state: shippingAddress?.state,
          postal_code: shippingAddress?.postal_code,
          country: shippingAddress?.country,
        },
        billing_address: useSameAddress ? shippingAddress : {
          street: billingAddress?.street,
          city: billingAddress?.city,
          state: billingAddress?.state,
          postal_code: billingAddress?.postal_code,
          country: billingAddress?.country,
        },
        shipping_method: shipping?.name || 'standard',
        shipping_cost: shipping?.price || 0,
        payment_method: payment?.method || 'credit_card',
        notes: payment?.notes,
      };

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create order');
      }

      // Redirect to order confirmation with real order number
      router.push(`/order/confirmation/${result.order.order_number}`);
    } catch (error) {
      console.error('Failed to place order:', error);
      alert('Failed to place order. Please try again.');
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2D1B4E] to-[#1a0b2e]">
      <CheckoutStepper />

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/20">
              <h1 className="text-3xl font-bold text-white mb-6">Review Your Order</h1>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-purple-300 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">Contact Information</h3>
                    <p className="text-purple-200/70">{customer?.email}</p>
                    {customer?.phone && (
                      <p className="text-purple-200/70">{customer.phone}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/checkout/customer')}
                    className="text-purple-300 hover:text-white"
                  >
                    Edit
                  </Button>
                </div>

                <div className="h-px bg-white/10" />

                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-purple-300 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">Shipping Address</h3>
                    <p className="text-purple-200/70">
                      {shippingAddress?.firstName} {shippingAddress?.lastName}
                    </p>
                    <p className="text-purple-200/70">{shippingAddress?.addressLine1}</p>
                    {shippingAddress?.addressLine2 && (
                      <p className="text-purple-200/70">{shippingAddress.addressLine2}</p>
                    )}
                    <p className="text-purple-200/70">
                      {shippingAddress?.city}, {shippingAddress?.stateProvince} {shippingAddress?.postalCode}
                    </p>
                    <p className="text-purple-200/70">{shippingAddress?.country}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/checkout/address')}
                    className="text-purple-300 hover:text-white"
                  >
                    Edit
                  </Button>
                </div>

                {!useSameAddress && billingAddress && (
                  <>
                    <div className="h-px bg-white/10" />
                    <div className="flex items-start gap-4">
                      <CreditCard className="w-6 h-6 text-purple-300 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-1">Billing Address</h3>
                        <p className="text-purple-200/70">
                          {billingAddress.firstName} {billingAddress.lastName}
                        </p>
                        <p className="text-purple-200/70">{billingAddress.addressLine1}</p>
                        {billingAddress.addressLine2 && (
                          <p className="text-purple-200/70">{billingAddress.addressLine2}</p>
                        )}
                        <p className="text-purple-200/70">
                          {billingAddress.city}, {billingAddress.stateProvince} {billingAddress.postalCode}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/checkout/address')}
                        className="text-purple-300 hover:text-white"
                      >
                        Edit
                      </Button>
                    </div>
                  </>
                )}

                <div className="h-px bg-white/10" />

                <div className="flex items-start gap-4">
                  <Truck className="w-6 h-6 text-purple-300 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">Delivery Method</h3>
                    <p className="text-purple-200/70">{shipping?.methodName}</p>
                    {shipping?.estimatedDays && (
                      <p className="text-purple-200/70 text-sm">
                        Estimated delivery: {shipping.estimatedDays}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/checkout/delivery')}
                    className="text-purple-300 hover:text-white"
                  >
                    Edit
                  </Button>
                </div>

                <div className="h-px bg-white/10" />

                <div className="flex items-start gap-4">
                  <CreditCard className="w-6 h-6 text-purple-300 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">Payment Method</h3>
                    <p className="text-purple-200/70">{payment?.methodLabel}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/checkout/payment')}
                    className="text-purple-300 hover:text-white"
                  >
                    Edit
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">Order Items</h2>

              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                      {item.product?.images?.[0] ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/30">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-white font-medium">{item.product?.title}</h3>
                      <p className="text-purple-200/70 text-sm">Quantity: {item.quantity}</p>
                    </div>

                    <div className="text-white font-semibold">
                      ${(item.price_at_addition * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 sticky top-24">
              <h2 className="text-2xl font-bold text-white mb-6">Order Total</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-purple-200">
                  <span>Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-purple-200">
                  <span>Shipping</span>
                  <span className="font-semibold">
                    {shipping?.price === 0 ? 'FREE' : `$${shipping?.price.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between text-purple-200">
                  <span>Tax</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>

                <div className="border-t border-white/20 pt-3">
                  <div className="flex justify-between text-white text-xl font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handlePlaceOrder}
                  disabled={placing}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-6 text-lg"
                >
                  <Lock className="w-5 h-5 mr-2" />
                  {placing ? 'Processing...' : 'Place Order'}
                </Button>

                <Button
                  onClick={() => router.push('/checkout/payment')}
                  variant="ghost"
                  className="w-full text-purple-200 hover:text-white hover:bg-white/5"
                  disabled={placing}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Payment
                </Button>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10 text-xs text-purple-200/70 text-center">
                <p>
                  By placing this order, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
