import React, { useState } from 'react';
import { MapPin, Plus, Check, ArrowRight, ArrowLeft, Home, Building2, Package } from 'lucide-react';

interface Address {
  id: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
  type?: 'home' | 'work' | 'other';
}

interface ShippingAddressProps {
  onContinue: (address: Address) => void;
  onBack: () => void;
}

export default function ShippingAddress({ onContinue, onBack }: ShippingAddressProps) {
  const [savedAddresses] = useState<Address[]>([
    {
      id: '1',
      fullName: 'Sarah Johnson',
      addressLine1: '123 Main Street',
      addressLine2: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'United States',
      phone: '(555) 123-4567',
      isDefault: true,
      type: 'home',
    },
    {
      id: '2',
      fullName: 'Sarah Johnson',
      addressLine1: '456 Business Ave',
      city: 'Brooklyn',
      state: 'NY',
      postalCode: '11201',
      country: 'United States',
      phone: '(555) 987-6543',
      isDefault: false,
      type: 'work',
    },
  ]);

  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    savedAddresses.find(a => a.isDefault)?.id || savedAddresses[0]?.id || ''
  );
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    country: 'United States',
  });

  const handleContinue = () => {
    const address = savedAddresses.find(a => a.id === selectedAddressId);
    if (address) {
      onContinue(address);
    }
  };

  const handleSaveNewAddress = () => {
    console.log('Saving new address:', newAddress);
    setShowNewAddressForm(false);
  };

  const getAddressIcon = (type?: string) => {
    switch (type) {
      case 'home':
        return <Home className="w-5 h-5" />;
      case 'work':
        return <Building2 className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
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
          Back to Cart
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Shipping Address</h1>
          <p className="text-secondary">Where should we deliver your order?</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {!showNewAddressForm ? (
              <div className="space-y-4">
                {savedAddresses.map((address) => (
                  <div
                    key={address.id}
                    onClick={() => setSelectedAddressId(address.id)}
                    className={`relative bg-surface border-2 rounded-2xl p-6 cursor-pointer transition-all ${
                      selectedAddressId === address.id
                        ? 'border-purple-600 dark:border-purple-500 shadow-theme-lg ring-4 ring-purple-100 dark:ring-purple-900/30'
                        : 'border-default hover:border-purple-300 dark:hover:border-purple-700 shadow-theme-md hover:shadow-theme-lg'
                    }`}
                  >
                    {selectedAddressId === address.id && (
                      <div className="absolute top-4 right-4 bg-purple-600 dark:bg-purple-700 text-white rounded-full p-1.5">
                        <Check className="w-5 h-5" />
                      </div>
                    )}

                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${
                        selectedAddressId === address.id
                          ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400'
                          : 'bg-surface-elevated dark:bg-surface-deep text-muted'
                      }`}>
                        {getAddressIcon(address.type)}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-lg text-primary">{address.fullName}</h3>
                          {address.isDefault && (
                            <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full font-semibold">
                              Default
                            </span>
                          )}
                          {address.type && (
                            <span className="text-xs bg-surface-elevated dark:bg-surface-deep text-secondary px-2 py-1 rounded-full capitalize">
                              {address.type}
                            </span>
                          )}
                        </div>

                        <div className="text-secondary space-y-1">
                          <p>{address.addressLine1}</p>
                          {address.addressLine2 && <p>{address.addressLine2}</p>}
                          <p>{address.city}, {address.state} {address.postalCode}</p>
                          <p>{address.country}</p>
                          <p className="text-sm mt-2">{address.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => setShowNewAddressForm(true)}
                  className="w-full border-2 border-dashed border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/10 rounded-2xl p-6 hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-all group"
                >
                  <div className="flex items-center justify-center gap-3 text-purple-600 dark:text-purple-400">
                    <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-lg">Add New Address</span>
                  </div>
                </button>
              </div>
            ) : (
              <div className="bg-surface border border-default rounded-2xl shadow-theme-lg p-8">
                <h2 className="text-2xl font-bold text-primary mb-6">New Shipping Address</h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-primary mb-2">Full Name</label>
                    <input
                      type="text"
                      value={newAddress.fullName || ''}
                      onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                      className="w-full px-4 py-3 bg-background border border-default rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600"
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-primary mb-2">Address Line 1</label>
                    <input
                      type="text"
                      value={newAddress.addressLine1 || ''}
                      onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                      className="w-full px-4 py-3 bg-background border border-default rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600"
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-primary mb-2">Address Line 2 (Optional)</label>
                    <input
                      type="text"
                      value={newAddress.addressLine2 || ''}
                      onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                      className="w-full px-4 py-3 bg-background border border-default rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600"
                      placeholder="Apt, Suite, Unit, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-primary mb-2">City</label>
                    <input
                      type="text"
                      value={newAddress.city || ''}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="w-full px-4 py-3 bg-background border border-default rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600"
                      placeholder="New York"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-primary mb-2">State</label>
                    <input
                      type="text"
                      value={newAddress.state || ''}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      className="w-full px-4 py-3 bg-background border border-default rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600"
                      placeholder="NY"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-primary mb-2">Postal Code</label>
                    <input
                      type="text"
                      value={newAddress.postalCode || ''}
                      onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                      className="w-full px-4 py-3 bg-background border border-default rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600"
                      placeholder="10001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-primary mb-2">Phone</label>
                    <input
                      type="tel"
                      value={newAddress.phone || ''}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-background border border-default rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => setShowNewAddressForm(false)}
                    className="flex-1 px-6 py-4 bg-surface-elevated dark:bg-surface-deep border border-default rounded-xl font-bold text-primary hover:bg-surface-elevated dark:hover:bg-surface transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNewAddress}
                    className="flex-1 gradient-purple-soul text-white px-6 py-4 rounded-xl font-bold hover:opacity-90 transition-all shadow-theme-lg"
                  >
                    Save Address
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-surface border border-default rounded-2xl shadow-theme-lg p-6 sticky top-6">
              <h2 className="text-xl font-bold text-primary mb-6">Delivery Options</h2>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3 p-4 bg-surface-elevated dark:bg-surface-deep rounded-xl border-2 border-purple-600 dark:border-purple-500">
                  <input
                    type="radio"
                    name="delivery"
                    checked
                    readOnly
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-primary">Standard Shipping</span>
                      <span className="text-green-600 dark:text-green-400 font-bold">FREE</span>
                    </div>
                    <p className="text-sm text-secondary">5-7 business days</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-surface-elevated dark:bg-surface-deep rounded-xl border border-default opacity-50">
                  <input
                    type="radio"
                    name="delivery"
                    disabled
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-primary">Express Shipping</span>
                      <span className="font-bold text-primary">$19.99</span>
                    </div>
                    <p className="text-sm text-secondary">2-3 business days</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-default">
                <div className="flex items-start gap-3 text-sm text-secondary mb-6">
                  <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <p>Estimated delivery by <strong className="text-primary">Friday, March 20</strong></p>
                </div>

                <button
                  onClick={handleContinue}
                  disabled={!selectedAddressId}
                  className={`w-full py-4 rounded-xl font-bold transition-all shadow-theme-lg flex items-center justify-center gap-2 ${
                    selectedAddressId
                      ? 'gradient-purple-soul text-white hover:opacity-90'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Continue to Payment
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
