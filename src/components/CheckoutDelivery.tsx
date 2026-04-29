import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Package, Zap, Plane, ArrowRight, ArrowLeft, MapPin } from 'lucide-react';
import { useCheckout, CheckoutShipping } from '../contexts/CheckoutContext';
import CheckoutStepper from './CheckoutStepper';

const shippingOptions: CheckoutShipping[] = [
  { method: 'Free Standard', carrier: 'USPS', cost: 0, estimatedDays: '7-10 business days' },
  { method: 'Standard', carrier: 'USPS', cost: 9.99, estimatedDays: '5-7 business days' },
  { method: 'Express', carrier: 'FedEx', cost: 19.99, estimatedDays: '2-3 business days' },
  { method: 'Overnight', carrier: 'FedEx', cost: 39.99, estimatedDays: '1 business day' },
];

const optionIcons: Record<string, typeof Truck> = {
  'Free Standard': Package,
  Standard: Truck,
  Express: Zap,
  Overnight: Plane,
};

export default function CheckoutDelivery() {
  const navigate = useNavigate();
  const { customer, shippingAddress, shipping, setShipping } = useCheckout();
  const [selected, setSelected] = useState<string>(shipping?.method ?? 'Free Standard');

  useEffect(() => {
    if (!customer) {
      navigate('/checkout?step=customer');
    } else if (!shippingAddress) {
      navigate('/checkout?step=address');
    }
  }, [customer, shippingAddress, navigate]);

  useEffect(() => {
    if (shipping) {
      setSelected(shipping.method);
    }
  }, [shipping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const option = shippingOptions.find((o) => o.method === selected);
    if (option) {
      setShipping(option);
      navigate('/checkout?step=payment');
    }
  };

  const destination = shippingAddress
    ? [shippingAddress.city, shippingAddress.state, shippingAddress.postalCode].filter(Boolean).join(', ')
    : '';

  return (
    <div className="min-h-screen bg-page py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <CheckoutStepper currentStep="delivery" />

        <div className="bg-surface rounded-xl shadow-theme-sm p-6">
          <h1 className="text-2xl font-bold text-primary mb-2 flex items-center gap-2">
            <Truck className="w-6 h-6 text-purple-600" />
            Shipping Method
          </h1>
          {destination && (
            <p className="text-sm text-secondary mb-6 flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              Shipping to: {destination}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4">
              {shippingOptions.map((option) => {
                const Icon = optionIcons[option.method] ?? Truck;
                const isSelected = selected === option.method;
                return (
                  <button
                    key={option.method}
                    type="button"
                    onClick={() => setSelected(option.method)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-purple-600 bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                        : 'border-default bg-surface hover:border-hover'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            isSelected ? 'bg-white/20' : 'bg-surface-deep'
                          }`}
                        >
                          <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-purple-600'}`} />
                        </div>
                        <div>
                          <p className={`font-semibold ${isSelected ? 'text-white' : 'text-primary'}`}>
                            {option.method}
                          </p>
                          <p className={`text-sm ${isSelected ? 'text-white/80' : 'text-muted'}`}>
                            {option.carrier} &middot; {option.estimatedDays}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-lg ${isSelected ? 'text-white' : 'text-primary'}`}>
                          {option.cost === 0 ? 'FREE' : `$${option.cost.toFixed(2)}`}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/checkout?step=address')}
                className="flex items-center justify-center gap-2 flex-1 border-2 border-default text-secondary py-4 rounded-xl font-semibold hover:bg-surface-deep transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <button
                type="submit"
                className="flex items-center justify-center gap-2 flex-1 bg-purple-600 text-white py-4 rounded-xl font-semibold hover:bg-purple-700 transition-all"
              >
                Continue to Payment
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
