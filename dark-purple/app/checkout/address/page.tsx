'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckoutStepper } from '@/components/checkout/stepper';
import { useCheckout } from '@/lib/checkout/context';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export default function CheckoutAddressPage() {
  const router = useRouter();
  const { customer, shippingAddress, billingAddress, useSameAddress, setShippingAddress, setBillingAddress, setUseSameAddress } = useCheckout();

  const [shippingForm, setShippingForm] = useState({
    firstName: shippingAddress?.firstName || customer?.firstName || '',
    lastName: shippingAddress?.lastName || customer?.lastName || '',
    company: shippingAddress?.company || '',
    addressLine1: shippingAddress?.addressLine1 || '',
    addressLine2: shippingAddress?.addressLine2 || '',
    city: shippingAddress?.city || '',
    stateProvince: shippingAddress?.stateProvince || '',
    postalCode: shippingAddress?.postalCode || '',
    country: shippingAddress?.country || 'US',
    phone: shippingAddress?.phone || customer?.phone || ''
  });

  const [billingForm, setBillingForm] = useState({
    firstName: billingAddress?.firstName || customer?.firstName || '',
    lastName: billingAddress?.lastName || customer?.lastName || '',
    company: billingAddress?.company || '',
    addressLine1: billingAddress?.addressLine1 || '',
    addressLine2: billingAddress?.addressLine2 || '',
    city: billingAddress?.city || '',
    stateProvince: billingAddress?.stateProvince || '',
    postalCode: billingAddress?.postalCode || '',
    country: billingAddress?.country || 'US',
    phone: billingAddress?.phone || customer?.phone || ''
  });

  const [sameAddress, setSameAddress] = useState(useSameAddress);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!customer) {
      router.push('/checkout/customer');
    }
  }, [customer, router]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!shippingForm.firstName) newErrors.shippingFirstName = 'Required';
    if (!shippingForm.lastName) newErrors.shippingLastName = 'Required';
    if (!shippingForm.addressLine1) newErrors.shippingAddressLine1 = 'Required';
    if (!shippingForm.city) newErrors.shippingCity = 'Required';
    if (!shippingForm.stateProvince) newErrors.shippingStateProvince = 'Required';
    if (!shippingForm.postalCode) newErrors.shippingPostalCode = 'Required';

    if (!sameAddress) {
      if (!billingForm.firstName) newErrors.billingFirstName = 'Required';
      if (!billingForm.lastName) newErrors.billingLastName = 'Required';
      if (!billingForm.addressLine1) newErrors.billingAddressLine1 = 'Required';
      if (!billingForm.city) newErrors.billingCity = 'Required';
      if (!billingForm.stateProvince) newErrors.billingStateProvince = 'Required';
      if (!billingForm.postalCode) newErrors.billingPostalCode = 'Required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setShippingAddress(shippingForm);
    setBillingAddress(sameAddress ? shippingForm : billingForm);
    setUseSameAddress(sameAddress);

    router.push('/checkout/delivery');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2D1B4E] to-[#1a0b2e]">
      <CheckoutStepper />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/20">
            <h1 className="text-3xl font-bold text-white mb-6">Shipping Address</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="shippingFirstName" className="text-white mb-2">First Name</Label>
                  <Input
                    id="shippingFirstName"
                    value={shippingForm.firstName}
                    onChange={(e) => setShippingForm({ ...shippingForm, firstName: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                  />
                  {errors.shippingFirstName && <p className="text-red-300 text-sm mt-1">{errors.shippingFirstName}</p>}
                </div>

                <div>
                  <Label htmlFor="shippingLastName" className="text-white mb-2">Last Name</Label>
                  <Input
                    id="shippingLastName"
                    value={shippingForm.lastName}
                    onChange={(e) => setShippingForm({ ...shippingForm, lastName: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                  />
                  {errors.shippingLastName && <p className="text-red-300 text-sm mt-1">{errors.shippingLastName}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="shippingCompany" className="text-white mb-2">Company (Optional)</Label>
                <Input
                  id="shippingCompany"
                  value={shippingForm.company}
                  onChange={(e) => setShippingForm({ ...shippingForm, company: e.target.value })}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>

              <div>
                <Label htmlFor="shippingAddressLine1" className="text-white mb-2">Address Line 1</Label>
                <Input
                  id="shippingAddressLine1"
                  value={shippingForm.addressLine1}
                  onChange={(e) => setShippingForm({ ...shippingForm, addressLine1: e.target.value })}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="Street address"
                />
                {errors.shippingAddressLine1 && <p className="text-red-300 text-sm mt-1">{errors.shippingAddressLine1}</p>}
              </div>

              <div>
                <Label htmlFor="shippingAddressLine2" className="text-white mb-2">Address Line 2 (Optional)</Label>
                <Input
                  id="shippingAddressLine2"
                  value={shippingForm.addressLine2}
                  onChange={(e) => setShippingForm({ ...shippingForm, addressLine2: e.target.value })}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="Apt, suite, unit, etc."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="shippingCity" className="text-white mb-2">City</Label>
                  <Input
                    id="shippingCity"
                    value={shippingForm.city}
                    onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                  />
                  {errors.shippingCity && <p className="text-red-300 text-sm mt-1">{errors.shippingCity}</p>}
                </div>

                <div>
                  <Label htmlFor="shippingStateProvince" className="text-white mb-2">State</Label>
                  <Input
                    id="shippingStateProvince"
                    value={shippingForm.stateProvince}
                    onChange={(e) => setShippingForm({ ...shippingForm, stateProvince: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="CA"
                  />
                  {errors.shippingStateProvince && <p className="text-red-300 text-sm mt-1">{errors.shippingStateProvince}</p>}
                </div>

                <div>
                  <Label htmlFor="shippingPostalCode" className="text-white mb-2">ZIP Code</Label>
                  <Input
                    id="shippingPostalCode"
                    value={shippingForm.postalCode}
                    onChange={(e) => setShippingForm({ ...shippingForm, postalCode: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="90210"
                  />
                  {errors.shippingPostalCode && <p className="text-red-300 text-sm mt-1">{errors.shippingPostalCode}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="shippingPhone" className="text-white mb-2">Phone (Optional)</Label>
                <Input
                  id="shippingPhone"
                  type="tel"
                  value={shippingForm.phone}
                  onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>

              <div className="flex items-center space-x-2 py-4">
                <Checkbox
                  id="sameAddress"
                  checked={sameAddress}
                  onCheckedChange={(checked) => setSameAddress(checked as boolean)}
                />
                <label
                  htmlFor="sameAddress"
                  className="text-white text-sm font-medium cursor-pointer"
                >
                  Billing address same as shipping
                </label>
              </div>

              {!sameAddress && (
                <div className="space-y-6 pt-6 border-t border-white/20">
                  <h2 className="text-2xl font-bold text-white">Billing Address</h2>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="billingFirstName" className="text-white mb-2">First Name</Label>
                      <Input
                        id="billingFirstName"
                        value={billingForm.firstName}
                        onChange={(e) => setBillingForm({ ...billingForm, firstName: e.target.value })}
                        className="bg-white/5 border-white/20 text-white"
                      />
                      {errors.billingFirstName && <p className="text-red-300 text-sm mt-1">{errors.billingFirstName}</p>}
                    </div>

                    <div>
                      <Label htmlFor="billingLastName" className="text-white mb-2">Last Name</Label>
                      <Input
                        id="billingLastName"
                        value={billingForm.lastName}
                        onChange={(e) => setBillingForm({ ...billingForm, lastName: e.target.value })}
                        className="bg-white/5 border-white/20 text-white"
                      />
                      {errors.billingLastName && <p className="text-red-300 text-sm mt-1">{errors.billingLastName}</p>}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="billingAddressLine1" className="text-white mb-2">Address Line 1</Label>
                    <Input
                      id="billingAddressLine1"
                      value={billingForm.addressLine1}
                      onChange={(e) => setBillingForm({ ...billingForm, addressLine1: e.target.value })}
                      className="bg-white/5 border-white/20 text-white"
                    />
                    {errors.billingAddressLine1 && <p className="text-red-300 text-sm mt-1">{errors.billingAddressLine1}</p>}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="billingCity" className="text-white mb-2">City</Label>
                      <Input
                        id="billingCity"
                        value={billingForm.city}
                        onChange={(e) => setBillingForm({ ...billingForm, city: e.target.value })}
                        className="bg-white/5 border-white/20 text-white"
                      />
                      {errors.billingCity && <p className="text-red-300 text-sm mt-1">{errors.billingCity}</p>}
                    </div>

                    <div>
                      <Label htmlFor="billingStateProvince" className="text-white mb-2">State</Label>
                      <Input
                        id="billingStateProvince"
                        value={billingForm.stateProvince}
                        onChange={(e) => setBillingForm({ ...billingForm, stateProvince: e.target.value })}
                        className="bg-white/5 border-white/20 text-white"
                      />
                      {errors.billingStateProvince && <p className="text-red-300 text-sm mt-1">{errors.billingStateProvince}</p>}
                    </div>

                    <div>
                      <Label htmlFor="billingPostalCode" className="text-white mb-2">ZIP Code</Label>
                      <Input
                        id="billingPostalCode"
                        value={billingForm.postalCode}
                        onChange={(e) => setBillingForm({ ...billingForm, postalCode: e.target.value })}
                        className="bg-white/5 border-white/20 text-white"
                      />
                      {errors.billingPostalCode && <p className="text-red-300 text-sm mt-1">{errors.billingPostalCode}</p>}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  onClick={() => router.push('/checkout/customer')}
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
                  Continue to Delivery
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
