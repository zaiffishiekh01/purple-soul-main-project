import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Wallet, Smartphone, Lock, ArrowRight, ArrowLeft, Shield } from 'lucide-react';
import { useCheckout } from '../contexts/CheckoutContext';
import CheckoutStepper from './CheckoutStepper';

type PaymentMethod = 'card' | 'paypal' | 'google_pay';

interface CardDetails {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
}

const methods: { id: PaymentMethod; label: string; icon: typeof CreditCard; description: string }[] = [
  { id: 'card', label: 'Credit Card', icon: CreditCard, description: 'VISA, Mastercard, Amex accepted' },
  { id: 'paypal', label: 'PayPal', icon: Wallet, description: 'Pay securely with your PayPal account' },
  { id: 'google_pay', label: 'Google Pay', icon: Smartphone, description: 'Fast checkout with Google Pay' },
];

export default function CheckoutPayment() {
  const navigate = useNavigate();
  const { customer, shippingAddress, shipping, payment, setPayment } = useCheckout();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(payment?.method ?? 'card');
  const [card, setCard] = useState<CardDetails>({ number: '', name: '', expiry: '', cvv: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!customer) {
      navigate('/checkout?step=customer');
    } else if (!shippingAddress) {
      navigate('/checkout?step=address');
    } else if (!shipping) {
      navigate('/checkout?step=delivery');
    }
  }, [customer, shippingAddress, shipping, navigate]);

  useEffect(() => {
    if (payment) {
      setSelectedMethod(payment.method);
    }
  }, [payment]);

  const validateCard = (): boolean => {
    const errs: Record<string, string> = {};
    if (!card.number.trim() || card.number.replace(/\s/g, '').length < 13) errs.number = 'Valid card number required';
    if (!card.name.trim()) errs.name = 'Cardholder name required';
    if (!card.expiry.trim() || !/^\d{2}\/\d{2}$/.test(card.expiry)) errs.expiry = 'MM/YY format required';
    if (!card.cvv.trim() || card.cvv.length < 3) errs.cvv = 'Valid CVV required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMethod === 'card') {
      if (!validateCard()) return;
      const last4 = card.number.replace(/\s/g, '').slice(-4);
      setPayment({ method: 'card', last4 });
    } else {
      setPayment({ method: selectedMethod });
    }
    navigate('/checkout?step=review');
  };

  const handleCardChange = (field: keyof CardDetails, value: string) => {
    setCard((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  return (
    <div className="min-h-screen bg-page py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <CheckoutStepper currentStep="payment" />

        <div className="bg-surface rounded-xl shadow-theme-sm p-6">
          <h1 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-purple-600" />
            Payment Method
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              {methods.map((m) => {
                const Icon = m.icon;
                const isSelected = selectedMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMethod(m.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-purple-600 bg-gradient-to-br from-purple-600 to-purple-700 text-white'
                        : 'border-default bg-surface hover:border-hover'
                    }`}
                  >
                    <Icon className={`w-8 h-8 mb-2 ${isSelected ? 'text-white' : 'text-purple-600'}`} />
                    <p className={`font-semibold ${isSelected ? 'text-white' : 'text-primary'}`}>{m.label}</p>
                    <p className={`text-xs mt-1 ${isSelected ? 'text-white/80' : 'text-muted'}`}>{m.description}</p>
                  </button>
                );
              })}
            </div>

            {selectedMethod === 'card' && (
              <div className="bg-surface-elevated rounded-xl border border-default p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                  <h2 className="text-lg font-semibold text-primary">Card Details</h2>
                </div>

                <div className="flex items-center gap-2 bg-surface-deep rounded-lg px-3 py-2 mb-4">
                  <span className="text-xs font-semibold text-muted">Accepted:</span>
                  <span className="text-xs text-secondary">VISA</span>
                  <span className="text-xs text-muted">&middot;</span>
                  <span className="text-xs text-secondary">Mastercard</span>
                  <span className="text-xs text-muted">&middot;</span>
                  <span className="text-xs text-secondary">Amex</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Card Number *</label>
                  <input
                    type="text"
                    value={card.number}
                    onChange={(e) => handleCardChange('number', e.target.value.replace(/[^\d\s]/g, ''))}
                    placeholder="1234 5678 9012 3456"
                    className={`w-full px-4 py-3 border rounded-lg bg-surface text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.number ? 'border-red-500' : 'border-default'
                    }`}
                  />
                  {errors.number && <p className="text-red-500 text-xs mt-1">{errors.number}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Cardholder Name *</label>
                  <input
                    type="text"
                    value={card.name}
                    onChange={(e) => handleCardChange('name', e.target.value)}
                    placeholder="John Doe"
                    className={`w-full px-4 py-3 border rounded-lg bg-surface text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.name ? 'border-red-500' : 'border-default'
                    }`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1">Expiry Date *</label>
                    <input
                      type="text"
                      value={card.expiry}
                      onChange={(e) => handleCardChange('expiry', e.target.value)}
                      placeholder="MM/YY"
                      className={`w-full px-4 py-3 border rounded-lg bg-surface text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.expiry ? 'border-red-500' : 'border-default'
                      }`}
                    />
                    {errors.expiry && <p className="text-red-500 text-xs mt-1">{errors.expiry}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1">CVV *</label>
                    <input
                      type="text"
                      value={card.cvv}
                      onChange={(e) => handleCardChange('cvv', e.target.value.replace(/\D/g, ''))}
                      placeholder="123"
                      className={`w-full px-4 py-3 border rounded-lg bg-surface text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.cvv ? 'border-red-500' : 'border-default'
                      }`}
                    />
                    {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-muted bg-surface-deep rounded-lg p-3">
              <Shield className="w-4 h-4 text-green-600" />
              <span>Your payment information is encrypted with 256-bit SSL encryption.</span>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/checkout?step=delivery')}
                className="flex items-center justify-center gap-2 flex-1 border-2 border-default text-secondary py-4 rounded-xl font-semibold hover:bg-surface-deep transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <button
                type="submit"
                className="flex items-center justify-center gap-2 flex-1 bg-purple-600 text-white py-4 rounded-xl font-semibold hover:bg-purple-700 transition-all"
              >
                Review Order
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
