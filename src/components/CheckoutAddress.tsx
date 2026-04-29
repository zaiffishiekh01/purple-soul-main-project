import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCheckout, CheckoutAddress as CheckoutAddressType } from '../contexts/CheckoutContext';
import CheckoutStepper from './CheckoutStepper';

const defaultAddress = {
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  firstName: '',
  lastName: '',
  company: '',
  phone: '',
};

interface AddressFieldsProps {
  prefix: string;
  data: typeof defaultAddress;
  update: (field: string, value: string) => void;
  errPrefix: string;
  errors: Record<string, string>;
}

function AddressFields({ data, update, errPrefix, errors }: AddressFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="First Name *" value={data.firstName} onChange={(v) => update('firstName', v)} error={errors[`${errPrefix}firstName`]} />
        <Field label="Last Name *" value={data.lastName} onChange={(v) => update('lastName', v)} error={errors[`${errPrefix}lastName`]} />
      </div>
      <Field label="Company" value={data.company} onChange={(v) => update('company', v)} />
      <Field label="Address Line 1 *" value={data.line1} onChange={(v) => update('line1', v)} error={errors[`${errPrefix}line1`]} />
      <Field label="Address Line 2" value={data.line2} onChange={(v) => update('line2', v)} />
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="City *" value={data.city} onChange={(v) => update('city', v)} error={errors[`${errPrefix}city`]} />
        <Field label="State/Province *" value={data.state} onChange={(v) => update('state', v)} error={errors[`${errPrefix}state`]} />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Postal Code *" value={data.postalCode} onChange={(v) => update('postalCode', v)} error={errors[`${errPrefix}postalCode`]} />
        <Field label="Country *" value={data.country} onChange={(v) => update('country', v)} error={errors[`${errPrefix}country`]} />
      </div>
      <Field label="Phone" value={data.phone} onChange={(v) => update('phone', v)} />
    </div>
  );
}

export default function CheckoutAddress() {
  const navigate = useNavigate();
  const { customer, shippingAddress, billingAddress, setShippingAddress, setBillingAddress, useSameAddress, setUseSameAddress } = useCheckout();

  const [shipping, setShipping] = useState(defaultAddress);
  const [billing, setBilling] = useState(defaultAddress);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!customer) {
      navigate('/checkout?step=customer');
      return;
    }
    if (shippingAddress) {
      setShipping({
        firstName: (shippingAddress as Record<string, unknown>).firstName as string ?? '',
        lastName: (shippingAddress as Record<string, unknown>).lastName as string ?? '',
        company: (shippingAddress as Record<string, unknown>).company as string ?? '',
        line1: shippingAddress.line1,
        line2: shippingAddress.line2 ?? '',
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
        phone: (shippingAddress as Record<string, unknown>).phone as string ?? '',
      });
    } else {
      setShipping((prev) => ({
        ...prev,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
      }));
    }
    if (billingAddress && !useSameAddress) {
      setBilling({
        firstName: (billingAddress as Record<string, unknown>).firstName as string ?? '',
        lastName: (billingAddress as Record<string, unknown>).lastName as string ?? '',
        company: (billingAddress as Record<string, unknown>).company as string ?? '',
        line1: billingAddress.line1,
        line2: billingAddress.line2 ?? '',
        city: billingAddress.city,
        state: billingAddress.state,
        postalCode: billingAddress.postalCode,
        country: billingAddress.country,
        phone: (billingAddress as Record<string, unknown>).phone as string ?? '',
      });
    }
  }, [customer, shippingAddress, billingAddress, useSameAddress, navigate]);

  const validate = (addr: typeof shipping): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!addr.firstName.trim()) errs.firstName = 'Required';
    if (!addr.lastName.trim()) errs.lastName = 'Required';
    if (!addr.line1.trim()) errs.line1 = 'Required';
    if (!addr.city.trim()) errs.city = 'Required';
    if (!addr.state.trim()) errs.state = 'Required';
    if (!addr.postalCode.trim()) errs.postalCode = 'Required';
    if (!addr.country.trim()) errs.country = 'Required';
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const shipErrors = validate(shipping);
    if (useSameAddress) {
      if (Object.keys(shipErrors).length > 0) {
        setErrors(shipErrors);
        return;
      }
      const { firstName, lastName, company, phone, ...core } = shipping;
      setShippingAddress(core as CheckoutAddressType);
      setBillingAddress(core as CheckoutAddressType);
      navigate('/checkout?step=delivery');
    } else {
      const billErrors = validate(billing);
      const allErrors = { ...shipErrors, ...billErrors };
      if (Object.keys(allErrors).length > 0) {
        setErrors(allErrors);
        return;
      }
      const { firstName: sf, lastName: sl, company: sc, phone: sp, ...shipCore } = shipping;
      const { firstName: bf, lastName: bl, company: bc, phone: bp, ...billCore } = billing;
      setShippingAddress(shipCore as CheckoutAddressType);
      setBillingAddress(billCore as CheckoutAddressType);
      navigate('/checkout?step=delivery');
    }
  };

  const updateShipping = (field: string, value: string) => {
    setShipping((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const updateBilling = (field: string, value: string) => {
    setBilling((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  return (
    <div className="min-h-screen bg-page py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <CheckoutStepper currentStep="address" />

        <div className="bg-surface rounded-xl shadow-theme-sm p-6">
          <h1 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-purple-600" />
            Shipping & Billing Address
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold text-primary mb-4">Shipping Address</h2>
              <AddressFields prefix="shipping" data={shipping} update={updateShipping} errPrefix="" errors={errors} />
            </div>

            <div className="border-t border-default pt-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useSameAddress}
                  onChange={(e) => setUseSameAddress(e.target.checked)}
                  className="w-5 h-5 rounded border-default text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-secondary">Billing address same as shipping</span>
              </label>
            </div>

            {!useSameAddress && (
              <div>
                <h2 className="text-lg font-semibold text-primary mb-4">Billing Address</h2>
                <AddressFields prefix="billing" data={billing} update={updateBilling} errPrefix="" errors={errors} />
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/checkout?step=customer')}
                className="flex items-center justify-center gap-2 flex-1 border-2 border-default text-secondary py-4 rounded-xl font-semibold hover:bg-surface-deep transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <button
                type="submit"
                className="flex items-center justify-center gap-2 flex-1 bg-purple-600 text-white py-4 rounded-xl font-semibold hover:bg-purple-700 transition-all"
              >
                Continue to Delivery
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, error }: {
  label: string; value: string; onChange: (v: string) => void; error?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-secondary mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-3 border rounded-lg bg-surface text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 ${
          error ? 'border-red-500' : 'border-default'
        }`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
