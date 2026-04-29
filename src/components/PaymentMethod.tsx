import React, { useState } from 'react';
import { CreditCard, Plus, Check, ArrowRight, ArrowLeft, Lock, Smartphone, DollarSign } from 'lucide-react';

interface PaymentCard {
  id: string;
  type: 'card';
  brand: string;
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
}

interface CartItem {
  id: string;
  price: number;
  quantity: number;
  bundleId?: string;
  bundleDiscount?: number;
}

interface PaymentMethodProps {
  cart: CartItem[];
  onContinue: (paymentMethod: PaymentCard | { type: string }) => void;
  onBack: () => void;
}

export default function PaymentMethod({ cart, onContinue, onBack }: PaymentMethodProps) {
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
  const [savedCards] = useState<PaymentCard[]>([
    {
      id: '1',
      type: 'card',
      brand: 'Visa',
      last4: '4242',
      expiryMonth: '12',
      expiryYear: '25',
      isDefault: true,
    },
    {
      id: '2',
      type: 'card',
      brand: 'Mastercard',
      last4: '8888',
      expiryMonth: '08',
      expiryYear: '26',
      isDefault: false,
    },
  ]);

  const [selectedPaymentId, setSelectedPaymentId] = useState<string>(
    savedCards.find(c => c.isDefault)?.id || savedCards[0]?.id || ''
  );
  const [selectedPaymentType, setSelectedPaymentType] = useState<'saved' | 'new' | 'paypal' | 'installment'>('saved');
  const [showNewCardForm, setShowNewCardForm] = useState(false);
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  const handleContinue = () => {
    if (selectedPaymentType === 'saved') {
      const card = savedCards.find(c => c.id === selectedPaymentId);
      if (card) {
        onContinue(card);
      }
    } else if (selectedPaymentType === 'paypal') {
      onContinue({ type: 'paypal' });
    } else if (selectedPaymentType === 'installment') {
      onContinue({ type: 'installment' });
    }
  };

  const getCardBrandColor = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return 'bg-blue-600';
      case 'mastercard':
        return 'bg-red-600';
      case 'amex':
        return 'bg-blue-700';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-secondary hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Shipping
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Payment Method</h1>
          <p className="text-secondary">How would you like to pay?</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {savedCards.length > 0 && !showNewCardForm && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-primary">Saved Payment Methods</h2>
                {savedCards.map((card) => (
                  <div
                    key={card.id}
                    onClick={() => {
                      setSelectedPaymentId(card.id);
                      setSelectedPaymentType('saved');
                    }}
                    className={`relative bg-surface border-2 rounded-2xl p-6 cursor-pointer transition-all ${
                      selectedPaymentType === 'saved' && selectedPaymentId === card.id
                        ? 'border-purple-600 dark:border-purple-500 shadow-theme-lg ring-4 ring-purple-100 dark:ring-purple-900/30'
                        : 'border-default hover:border-purple-300 dark:hover:border-purple-700 shadow-theme-md hover:shadow-theme-lg'
                    }`}
                  >
                    {selectedPaymentType === 'saved' && selectedPaymentId === card.id && (
                      <div className="absolute top-4 right-4 bg-purple-600 dark:bg-purple-700 text-white rounded-full p-1.5">
                        <Check className="w-5 h-5" />
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      <div className={`${getCardBrandColor(card.brand)} text-white rounded-xl p-3`}>
                        <CreditCard className="w-6 h-6" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg text-primary">{card.brand}</h3>
                          {card.isDefault && (
                            <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full font-semibold">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-secondary">
                          •••• •••• •••• {card.last4} | Expires {card.expiryMonth}/{card.expiryYear}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div
              onClick={() => {
                setShowNewCardForm(true);
                setSelectedPaymentType('new');
              }}
              className={`border-2 ${
                showNewCardForm
                  ? 'border-purple-600 dark:border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-dashed border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/10 hover:bg-purple-100 dark:hover:bg-purple-900/20'
              } rounded-2xl p-6 cursor-pointer transition-all group`}
            >
              <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-lg">Add New Card</span>
              </div>
            </div>

            {showNewCardForm && (
              <div className="bg-surface border border-default rounded-2xl shadow-theme-lg p-8">
                <h3 className="text-xl font-bold text-primary mb-6">Card Details</h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-primary mb-2">Card Number</label>
                    <input
                      type="text"
                      value={newCard.cardNumber}
                      onChange={(e) => setNewCard({ ...newCard, cardNumber: e.target.value })}
                      className="w-full px-4 py-3 bg-background border border-default rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-primary mb-2">Cardholder Name</label>
                    <input
                      type="text"
                      value={newCard.cardName}
                      onChange={(e) => setNewCard({ ...newCard, cardName: e.target.value })}
                      className="w-full px-4 py-3 bg-background border border-default rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600"
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-primary mb-2">Expiry Date</label>
                      <input
                        type="text"
                        value={newCard.expiryDate}
                        onChange={(e) => setNewCard({ ...newCard, expiryDate: e.target.value })}
                        className="w-full px-4 py-3 bg-background border border-default rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600"
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-primary mb-2">CVV</label>
                      <input
                        type="text"
                        value={newCard.cvv}
                        onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value })}
                        className="w-full px-4 py-3 bg-background border border-default rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600"
                        placeholder="123"
                        maxLength={4}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4 pt-4">
              <h2 className="text-lg font-bold text-primary">Other Payment Options</h2>

              <div
                onClick={() => setSelectedPaymentType('paypal')}
                className={`relative bg-surface border-2 rounded-2xl p-6 cursor-pointer transition-all ${
                  selectedPaymentType === 'paypal'
                    ? 'border-purple-600 dark:border-purple-500 shadow-theme-lg ring-4 ring-purple-100 dark:ring-purple-900/30'
                    : 'border-default hover:border-purple-300 dark:hover:border-purple-700 shadow-theme-md hover:shadow-theme-lg'
                }`}
              >
                {selectedPaymentType === 'paypal' && (
                  <div className="absolute top-4 right-4 bg-purple-600 dark:bg-purple-700 text-white rounded-full p-1.5">
                    <Check className="w-5 h-5" />
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div className="bg-blue-600 text-white rounded-xl p-3">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-primary">PayPal</h3>
                    <p className="text-sm text-secondary">Secure payment via PayPal</p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => setSelectedPaymentType('installment')}
                className={`relative bg-surface border-2 rounded-2xl p-6 cursor-pointer transition-all ${
                  selectedPaymentType === 'installment'
                    ? 'border-purple-600 dark:border-purple-500 shadow-theme-lg ring-4 ring-purple-100 dark:ring-purple-900/30'
                    : 'border-default hover:border-purple-300 dark:hover:border-purple-700 shadow-theme-md hover:shadow-theme-lg'
                }`}
              >
                {selectedPaymentType === 'installment' && (
                  <div className="absolute top-4 right-4 bg-purple-600 dark:bg-purple-700 text-white rounded-full p-1.5">
                    <Check className="w-5 h-5" />
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div className="bg-green-600 text-white rounded-xl p-3">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-primary">Payment Plan</h3>
                    <p className="text-sm text-secondary">Split into 4 interest-free payments of ${(total / 4).toFixed(2)}</p>
                  </div>
                </div>
              </div>
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
              </div>

              <div className="flex justify-between items-center mb-8">
                <span className="text-lg font-bold text-primary">Total</span>
                <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">${total.toFixed(2)}</span>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3 text-sm">
                  <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <div className="text-secondary">
                    <p className="font-semibold text-primary mb-1">Secure Payment</p>
                    <p>Your payment information is encrypted with 256-bit SSL security.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleContinue}
                disabled={!selectedPaymentType || (selectedPaymentType === 'saved' && !selectedPaymentId)}
                className={`w-full py-4 rounded-xl font-bold transition-all shadow-theme-lg flex items-center justify-center gap-2 ${
                  (selectedPaymentType && (selectedPaymentType !== 'saved' || selectedPaymentId))
                    ? 'gradient-purple-soul text-white hover:opacity-90'
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
              >
                Continue to Review
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
