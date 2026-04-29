import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, User, Phone, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCheckout, CheckoutCustomer as CheckoutCustomerType } from '../contexts/CheckoutContext';
import CheckoutStepper from './CheckoutStepper';

export default function CheckoutCustomer() {
  const navigate = useNavigate();
  const { customer, setCustomer } = useCheckout();

  const [formData, setFormData] = useState<CheckoutCustomerType>({
    firstName: customer?.firstName ?? '',
    lastName: customer?.lastName ?? '',
    email: customer?.email ?? '',
    phone: customer?.phone ?? '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutCustomerType, string>>>({});

  useEffect(() => {
    if (customer) {
      setFormData({
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
      });
    }
  }, [customer]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CheckoutCustomerType, string>> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setCustomer(formData);
      navigate('/checkout?step=address');
    }
  };

  const handleChange = (field: keyof CheckoutCustomerType, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-page py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <CheckoutStepper currentStep="customer" />

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-surface rounded-xl shadow-theme-sm p-6">
              <h1 className="text-2xl font-bold text-primary mb-6">Customer Information</h1>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg bg-surface text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.email ? 'border-red-500' : 'border-default'
                    }`}
                    placeholder="your@email.com"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg bg-surface text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.firstName ? 'border-red-500' : 'border-default'
                      }`}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg bg-surface text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.lastName ? 'border-red-500' : 'border-default'
                      }`}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Phone (optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-default rounded-lg bg-surface text-primary focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate('/cart')}
                    className="flex items-center justify-center gap-2 flex-1 border-2 border-default text-secondary py-4 rounded-xl font-semibold hover:bg-surface-deep transition-all"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Cart
                  </button>
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 flex-1 bg-purple-600 text-white py-4 rounded-xl font-semibold hover:bg-purple-700 transition-all"
                  >
                    Continue to Address
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-surface rounded-xl shadow-theme-sm p-6 sticky top-24">
              <h2 className="text-lg font-bold text-primary mb-4">Order Summary</h2>
              <p className="text-sm text-muted">Continue checkout to see order details.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
