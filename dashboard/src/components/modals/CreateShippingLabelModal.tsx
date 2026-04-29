import { useState, useEffect, useMemo } from 'react';
import { X, Save, Package, User, MapPin, Truck, Box, Globe, FileText, Printer, CheckCircle } from 'lucide-react';
import { ShippingLabel } from '../../hooks/useShippingLabels';
import { useOrders } from '../../hooks/useOrders';
import { useProducts } from '../../hooks/useProducts';
import { useVendor } from '../../hooks/useVendor';

interface CreateShippingLabelModalProps {
  label: ShippingLabel | null;
  orderData?: any;
  onClose: () => void;
  onSave: (label: Partial<ShippingLabel>) => Promise<void>;
  generateAWB: () => string;
  generateTracking: () => string;
}

const COURIER_PARTNERS = [
  'DTDC', 'Delhivery', 'Bluedart', 'UPS', 'USPS', 'FedEx', 'DHL', 'Aramex',
  'India Post', 'Ecom Express', 'Xpressbees', 'Shadowfax'
];

const SHIPPING_METHODS = ['Standard', 'Express', 'Economy', 'Same Day', 'International'];
const PACKAGE_TYPES = ['Box', 'Polybag', 'Envelope', 'Pallet'];
const CUSTOMS_CATEGORIES = ['Commercial', 'Gift', 'Sample', 'Documents', 'Return'];

export function CreateShippingLabelModal({ label, orderData, onClose, onSave, generateAWB, generateTracking }: CreateShippingLabelModalProps) {
  const { vendor } = useVendor();
  const { orders } = useOrders(vendor?.id);
  const { products } = useProducts();

  const vendorData = useMemo(() => {
    if (!vendor) return null;
    const vendorAddr = vendor.address as any;
    return {
      business_name: vendor.business_name || '',
      contact_person: vendor.contact_person || '',
      address: typeof vendorAddr === 'object'
        ? (vendorAddr?.street || vendorAddr?.address || '')
        : (vendorAddr || ''),
      phone: vendor.phone || vendor.contact_phone || '',
      email: vendor.email || vendor.contact_email || '',
      city: typeof vendorAddr === 'object' ? (vendorAddr?.city || '') : '',
      state: typeof vendorAddr === 'object' ? (vendorAddr?.state || '') : '',
      pincode: typeof vendorAddr === 'object' ? (vendorAddr?.pincode || vendorAddr?.zip || '') : '',
      country: typeof vendorAddr === 'object' ? (vendorAddr?.country || '') : '',
    };
  }, [vendor?.id, vendor?.business_name, vendor?.contact_person, vendor?.phone, vendor?.email]);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<ShippingLabel>>({
    order_id: '',
    order_date: new Date().toISOString(),
    product_names: '',
    sku: '',
    quantity: 1,
    product_weight: 0,
    product_length: 0,
    product_width: 0,
    product_height: 0,
    product_category: '',

    vendor_name: vendor?.business_name || '',
    pickup_name: vendor?.contact_person || '',
    pickup_address: vendor?.address || '',
    pickup_phone: vendor?.phone || '',
    pickup_email: vendor?.email || '',
    pickup_city: '',
    pickup_state: '',
    pickup_pincode: '',
    pickup_country: '',

    customer_name: '',
    shipping_address: '',
    shipping_landmark: '',
    shipping_city: '',
    shipping_state: '',
    shipping_pincode: '',
    shipping_country: '',
    customer_phone: '',
    customer_email: '',

    courier_partner: '',
    shipping_method: 'Standard',
    tracking_preference: 'auto_generated',
    pickup_date: null,
    pickup_slot: '',

    package_weight: 0,
    package_length: 0,
    package_width: 0,
    package_height: 0,
    number_of_packages: 1,
    package_type: 'Box',

    hsn_code: '',
    hts_code: '',
    country_of_origin: '',
    item_description: '',
    customs_value: 0,
    customs_category: 'Commercial',
    invoice_number: '',
    export_reason: '',

    awb_number: '',
    tracking_number: '',
    status: 'draft',
  });

  useEffect(() => {
    if (label) {
      setFormData(label);
    } else if (vendorData) {
      setFormData(prev => ({
        ...prev,
        vendor_name: vendorData.business_name,
        pickup_name: vendorData.contact_person,
        pickup_address: vendorData.address,
        pickup_phone: vendorData.phone,
        pickup_email: vendorData.email,
        pickup_city: vendorData.city,
        pickup_state: vendorData.state,
        pickup_pincode: vendorData.pincode,
        pickup_country: vendorData.country,
      }));
    }
  }, [label, vendorData]);

  // Pre-fill from order data if provided
  useEffect(() => {
    if (orderData) {
      const shippingAddr = orderData.shippingAddress as any;

      setFormData(prev => ({
        ...prev,
        order_id: orderData.orderId || '',
        customer_name: orderData.customerName || '',
        customer_email: orderData.customerEmail || '',
        customer_phone: orderData.customerPhone || '',
        shipping_address: shippingAddr?.street || shippingAddr?.address || '',
        shipping_city: shippingAddr?.city || '',
        shipping_state: shippingAddr?.state || '',
        shipping_pincode: shippingAddr?.pincode || shippingAddr?.zip || '',
        shipping_country: shippingAddr?.country || 'USA',
        payment_method: orderData.paymentStatus === 'paid' ? 'Prepaid' : 'COD',
        invoice_value: orderData.totalAmount || 0,
        customs_value: orderData.totalAmount || 0,
      }));

      // Auto-advance to step 2 since order is pre-selected
      setCurrentStep(2);
    }
  }, [orderData]);

  const handleOrderSelect = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      const orderItems = (order as any).order_items || [];
      const firstItem = orderItems[0];
      const product = firstItem?.products;

      const productNames = orderItems.map((item: any) => item.products?.name).filter(Boolean).join(', ');
      const totalQty = orderItems.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);

      const shippingAddr = order.shipping_address as any;

      setFormData(prev => ({
        ...prev,
        order_id: orderId,
        order_date: order.created_at,
        product_names: productNames || '',
        sku: product?.sku || '',
        quantity: totalQty || 1,
        product_category: product?.category || '',
        customer_name: order.customer_name || '',
        customer_email: order.customer_email || '',
        customer_phone: order.customer_phone || '',
        shipping_address: shippingAddr?.street || shippingAddr?.address || '',
        shipping_city: shippingAddr?.city || '',
        shipping_state: shippingAddr?.state || '',
        shipping_pincode: shippingAddr?.pincode || shippingAddr?.zip || '',
        shipping_country: shippingAddr?.country || '',
      }));
    }
  };

  const handleNextStep = () => {
    // Validate Step 1: Order must be selected
    if (currentStep === 1 && !formData.order_id) {
      alert('Please select an order from the list to continue');
      return;
    }

    // Validate Step 3: Customer info must be complete
    if (currentStep === 3 && (!formData.customer_name || !formData.shipping_city)) {
      alert('Please provide complete customer shipping information (name and city are required)');
      return;
    }

    // Validate Step 4: Shipping details must be selected
    if (currentStep === 4) {
      if (!formData.courier_partner) {
        alert('Please select a courier partner to proceed with shipping');
        return;
      }
      if (!formData.shipping_method) {
        alert('Please select a shipping method (Standard, Express, etc.)');
        return;
      }
    }

    // Validate Step 5: Package details must be entered
    if (currentStep === 5) {
      if (!formData.package_weight || formData.package_weight <= 0) {
        alert('Please enter a valid package weight (must be greater than 0)');
        return;
      }
      if (!formData.package_type) {
        alert('Please select the package type for this shipment');
        return;
      }
    }

    // Move to next step
    setCurrentStep(currentStep + 1);
  };

  const handleSubmit = async () => {
    // Step 1: Order validation
    if (!formData.order_id) {
      alert('Please select an order in Step 1');
      setCurrentStep(1);
      return;
    }

    // Step 3: Customer validation
    if (!formData.customer_name || !formData.shipping_city) {
      alert('Please complete customer information in Step 3');
      setCurrentStep(3);
      return;
    }

    // Step 4: Shipping validation
    if (!formData.courier_partner) {
      alert('Please select a courier partner in Step 4 (Shipping)');
      setCurrentStep(4);
      return;
    }

    if (!formData.shipping_method) {
      alert('Please select a shipping method in Step 4 (Shipping)');
      setCurrentStep(4);
      return;
    }

    // Step 5: Package validation
    if (!formData.package_weight || formData.package_weight <= 0) {
      alert('Please enter a valid package weight greater than 0 in Step 5 (Packaging)');
      setCurrentStep(5);
      return;
    }

    if (!formData.package_type) {
      alert('Please select a package type in Step 5 (Packaging)');
      setCurrentStep(5);
      return;
    }

    setLoading(true);

    try {
      const dataToSave = {
        ...formData,
        awb_number: formData.tracking_preference === 'auto_generated' ? generateAWB() : formData.awb_number,
        tracking_number: formData.tracking_preference === 'auto_generated' ? generateTracking() : formData.tracking_number,
        status: 'ready',
      };
      await onSave(dataToSave);
      onClose();
    } catch (error) {
      console.error('Error saving label:', error);
      alert('Error saving label. Please check all required fields.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, title: 'Order & Product', icon: Package },
    { num: 2, title: 'Vendor Info', icon: User },
    { num: 3, title: 'Customer Info', icon: MapPin },
    { num: 4, title: 'Shipping', icon: Truck },
    { num: 5, title: 'Packaging', icon: Box },
    { num: 6, title: 'Customs', icon: Globe },
    { num: 7, title: 'Review', icon: FileText },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Printer className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {label ? 'Edit Shipping Label' : 'Create Shipping Label'}
              </h2>
              <p className="text-sm text-gray-600">
                Step {currentStep} of {steps.length}
                {orderData && (
                  <span className="ml-2 text-green-600 font-semibold">
                    • Pre-filled from Order {orderData.orderNumber}
                  </span>
                )}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {steps.map((step) => {
              const StepIcon = step.icon;
              const canNavigate = step.num === 1 || (step.num === 2 && formData.order_id) || (step.num > 2 && formData.order_id);
              return (
                <button
                  key={step.num}
                  onClick={() => canNavigate && setCurrentStep(step.num)}
                  disabled={!canNavigate}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                    currentStep === step.num
                      ? 'bg-sufi-purple text-white'
                      : currentStep > step.num
                      ? 'bg-green-100 text-green-700 cursor-pointer'
                      : !canNavigate
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                      : 'bg-gray-100 text-gray-600 cursor-pointer'
                  }`}
                >
                  <StepIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">{step.title}</span>
                </button>
              );
            })}
          </div>

          <div className="space-y-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order & Product Information
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Order *</label>
                  <select
                    value={formData.order_id}
                    onChange={(e) => handleOrderSelect(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30"
                  >
                    <option value="">Choose an order...</option>
                    {orders.map((order) => (
                      <option key={order.id} value={order.id}>
                        {order.order_number} - {order.customer_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Name(s) *</label>
                    <input
                      type="text"
                      value={formData.product_names}
                      onChange={(e) => setFormData({...formData, product_names: e.target.value})}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SKU *</label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({...formData, sku: e.target.value})}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                      required
                      min="1"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.product_weight}
                      onChange={(e) => setFormData({...formData, product_weight: parseFloat(e.target.value)})}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dimensions (cm) *</label>
                  <div className="grid grid-cols-3 gap-4">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Length"
                      value={formData.product_length}
                      onChange={(e) => setFormData({...formData, product_length: parseFloat(e.target.value)})}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Width"
                      value={formData.product_width}
                      onChange={(e) => setFormData({...formData, product_width: parseFloat(e.target.value)})}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Height"
                      value={formData.product_height}
                      onChange={(e) => setFormData({...formData, product_height: parseFloat(e.target.value)})}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Category</label>
                  <input
                    type="text"
                    value={formData.product_category}
                    onChange={(e) => setFormData({...formData, product_category: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30"
                    placeholder="e.g., Electronics, Clothing, Books"
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Vendor / Shipper Information
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vendor/Store Name *</label>
                    <input
                      type="text"
                      value={formData.vendor_name}
                      onChange={(e) => setFormData({...formData, vendor_name: e.target.value})}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Contact Name *</label>
                    <input
                      type="text"
                      value={formData.pickup_name}
                      onChange={(e) => setFormData({...formData, pickup_name: e.target.value})}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Address *</label>
                  <textarea
                    value={formData.pickup_address}
                    onChange={(e) => setFormData({...formData, pickup_address: e.target.value})}
                    required
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      value={formData.pickup_phone}
                      onChange={(e) => setFormData({...formData, pickup_phone: e.target.value})}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={formData.pickup_email}
                      onChange={(e) => setFormData({...formData, pickup_email: e.target.value})}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <input
                      type="text"
                      value={formData.pickup_city}
                      onChange={(e) => setFormData({...formData, pickup_city: e.target.value})}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State/Province *</label>
                    <input
                      type="text"
                      value={formData.pickup_state}
                      onChange={(e) => setFormData({...formData, pickup_state: e.target.value})}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">PIN/ZIP Code *</label>
                    <input
                      type="text"
                      value={formData.pickup_pincode}
                      onChange={(e) => setFormData({...formData, pickup_pincode: e.target.value})}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                    <input
                      type="text"
                      value={formData.pickup_country}
                      onChange={(e) => setFormData({...formData, pickup_country: e.target.value})}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Customer / Receiver Information
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name *</label>
                  <input
                    type="text"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Address *</label>
                  <textarea
                    value={formData.shipping_address}
                    onChange={(e) => setFormData({...formData, shipping_address: e.target.value})}
                    required
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Landmark (Optional)</label>
                  <input
                    type="text"
                    value={formData.shipping_landmark}
                    onChange={(e) => setFormData({...formData, shipping_landmark: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30"
                    placeholder="Near..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <input
                      type="text"
                      value={formData.shipping_city}
                      onChange={(e) => setFormData({...formData, shipping_city: e.target.value})}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State/Province *</label>
                    <input
                      type="text"
                      value={formData.shipping_state}
                      onChange={(e) => setFormData({...formData, shipping_state: e.target.value})}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">PIN/ZIP Code *</label>
                    <input
                      type="text"
                      value={formData.shipping_pincode}
                      onChange={(e) => setFormData({...formData, shipping_pincode: e.target.value})}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                    <input
                      type="text"
                      value={formData.shipping_country}
                      onChange={(e) => setFormData({...formData, shipping_country: e.target.value})}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {vendor?.can_view_customer_phone ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.customer_phone}
                        onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 italic">
                        Contact admin for access to customer phone numbers
                      </div>
                    </div>
                  )}
                  {vendor?.can_view_customer_email ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.customer_email}
                        onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 italic">
                        Contact admin for access to customer email addresses
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Shipping Information
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Courier Partner *</label>
                  <select
                    value={formData.courier_partner}
                    onChange={(e) => setFormData({...formData, courier_partner: e.target.value})}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30"
                  >
                    <option value="">Select courier...</option>
                    {COURIER_PARTNERS.map((courier) => (
                      <option key={courier} value={courier}>{courier}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Method *</label>
                  <div className="grid grid-cols-3 gap-3">
                    {SHIPPING_METHODS.map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setFormData({...formData, shipping_method: method})}
                        className={`p-3 border-2 rounded-xl transition-all ${
                          formData.shipping_method === method
                            ? 'border-sufi-purple bg-sufi-light/20'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="font-medium text-sm">{method}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Preference *</label>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-xs text-blue-800">
                      <span className="font-semibold">Platform-generated labels:</span> System creates AWB and printable label for you.
                      <br />
                      <span className="font-semibold">Vendor-supplied labels:</span> You already have a label from your courier - just enter the tracking details.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, tracking_preference: 'auto_generated'})}
                      className={`p-4 border-2 rounded-xl transition-all ${
                        formData.tracking_preference === 'auto_generated'
                          ? 'border-sufi-purple bg-sufi-light/20'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-semibold">Platform-generated</p>
                      <p className="text-xs text-gray-600 mt-1">Auto-generated AWB</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, tracking_preference: 'vendor_supplied'})}
                      className={`p-4 border-2 rounded-xl transition-all ${
                        formData.tracking_preference === 'vendor_supplied'
                          ? 'border-sufi-purple bg-sufi-light/20'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-semibold">Vendor-supplied</p>
                      <p className="text-xs text-gray-600 mt-1">Enter your own AWB</p>
                    </button>
                  </div>
                </div>

                {formData.tracking_preference === 'vendor_supplied' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">AWB Number *</label>
                      <input
                        type="text"
                        value={formData.awb_number}
                        onChange={(e) => setFormData({...formData, awb_number: e.target.value})}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Number *</label>
                      <input
                        type="text"
                        value={formData.tracking_number}
                        onChange={(e) => setFormData({...formData, tracking_number: e.target.value})}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Date</label>
                    <input
                      type="date"
                      value={formData.pickup_date || ''}
                      onChange={(e) => setFormData({...formData, pickup_date: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Slot</label>
                    <input
                      type="text"
                      value={formData.pickup_slot}
                      onChange={(e) => setFormData({...formData, pickup_slot: e.target.value})}
                      placeholder="e.g., 9AM-12PM"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Box className="w-5 h-5" />
                  Packaging Details
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Package Weight (kg) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.package_weight}
                      onChange={(e) => setFormData({...formData, package_weight: parseFloat(e.target.value)})}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of Packages *</label>
                    <input
                      type="number"
                      value={formData.number_of_packages}
                      onChange={(e) => setFormData({...formData, number_of_packages: parseInt(e.target.value)})}
                      required
                      min="1"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Package Dimensions (cm) *</label>
                  <div className="grid grid-cols-3 gap-4">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Length"
                      value={formData.package_length}
                      onChange={(e) => setFormData({...formData, package_length: parseFloat(e.target.value)})}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Width"
                      value={formData.package_width}
                      onChange={(e) => setFormData({...formData, package_width: parseFloat(e.target.value)})}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Height"
                      value={formData.package_height}
                      onChange={(e) => setFormData({...formData, package_height: parseFloat(e.target.value)})}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Package Type *</label>
                  <div className="grid grid-cols-4 gap-3">
                    {PACKAGE_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({...formData, package_type: type})}
                        className={`p-3 border-2 rounded-xl transition-all ${
                          formData.package_type === type
                            ? 'border-sufi-purple bg-sufi-light/20'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="font-medium text-sm">{type}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 6 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Customs Information
                  <span className="text-sm font-normal text-gray-600">(For International Shipping)</span>
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">HSN Code</label>
                    <input
                      type="text"
                      value={formData.hsn_code}
                      onChange={(e) => setFormData({...formData, hsn_code: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">HTS Code</label>
                    <input
                      type="text"
                      value={formData.hts_code}
                      onChange={(e) => setFormData({...formData, hts_code: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country of Origin</label>
                  <input
                    type="text"
                    value={formData.country_of_origin}
                    onChange={(e) => setFormData({...formData, country_of_origin: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Item Description (Export-friendly)</label>
                  <textarea
                    value={formData.item_description}
                    onChange={(e) => setFormData({...formData, item_description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30"
                    placeholder="Detailed description for customs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Customs Value</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.customs_value}
                      onChange={(e) => setFormData({...formData, customs_value: parseFloat(e.target.value)})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Number</label>
                    <input
                      type="text"
                      value={formData.invoice_number}
                      onChange={(e) => setFormData({...formData, invoice_number: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customs Category</label>
                  <div className="grid grid-cols-3 gap-3">
                    {CUSTOMS_CATEGORIES.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setFormData({...formData, customs_category: category})}
                        className={`p-3 border-2 rounded-xl transition-all ${
                          formData.customs_category === category
                            ? 'border-sufi-purple bg-sufi-light/20'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="font-medium text-sm">{category}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Export Reason</label>
                  <input
                    type="text"
                    value={formData.export_reason}
                    onChange={(e) => setFormData({...formData, export_reason: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30"
                    placeholder="e.g., Sale, Gift, Repair"
                  />
                </div>
              </div>
            )}

            {currentStep === 7 ? (
              <div className="space-y-4 min-h-[400px]">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Review Label Information
                </h3>
                <p className="text-sm text-gray-600">Review all the information below before creating the shipping label.</p>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-green-100 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-green-900">Automatic Shipment Tracking</h4>
                      <p className="text-xs text-green-800 mt-1">
                        When you create this label, a shipment record will be automatically created
                        in the Shippings page for tracking and delivery status management.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Order & Product</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><span className="font-medium">Product:</span> {String(formData.product_names || 'Not provided')}</p>
                      <p><span className="font-medium">SKU:</span> {String(formData.sku || 'Not provided')}</p>
                      <p><span className="font-medium">Quantity:</span> {String(formData.quantity || 0)}</p>
                      <p><span className="font-medium">Weight:</span> {String(formData.product_weight || 0)} kg</p>
                      <p><span className="font-medium">Dimensions:</span> {String(formData.product_length || 0)} × {String(formData.product_width || 0)} × {String(formData.product_height || 0)} cm</p>
                      {formData.product_category && <p><span className="font-medium">Category:</span> {String(formData.product_category)}</p>}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Vendor Information</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><span className="font-medium">Business:</span> {String(formData.vendor_name || 'Not provided')}</p>
                      <p><span className="font-medium">Contact:</span> {String(formData.pickup_name || 'Not provided')}</p>
                      <p><span className="font-medium">Address:</span> {String(
                        typeof formData.pickup_address === 'object' && formData.pickup_address !== null
                          ? (formData.pickup_address as any).street || (formData.pickup_address as any).address || 'Not provided'
                          : formData.pickup_address || 'Not provided'
                      )}</p>
                      <p><span className="font-medium">City/State:</span> {String(formData.pickup_city || '')}, {String(formData.pickup_state || '')} {String(formData.pickup_pincode || '')}</p>
                      <p><span className="font-medium">Country:</span> {String(formData.pickup_country || 'Not provided')}</p>
                      <p><span className="font-medium">Phone:</span> {String(formData.pickup_phone || 'Not provided')}</p>
                      <p><span className="font-medium">Email:</span> {String(formData.pickup_email || 'Not provided')}</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Customer Information</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><span className="font-medium">Name:</span> {String(formData.customer_name || 'Not provided')}</p>
                      <p><span className="font-medium">Address:</span> {String(
                        typeof formData.shipping_address === 'object' && formData.shipping_address !== null
                          ? (formData.shipping_address as any).street || (formData.shipping_address as any).address || 'Not provided'
                          : formData.shipping_address || 'Not provided'
                      )}</p>
                      {formData.shipping_landmark && <p><span className="font-medium">Landmark:</span> {String(formData.shipping_landmark)}</p>}
                      <p><span className="font-medium">City/State:</span> {String(formData.shipping_city || '')}, {String(formData.shipping_state || '')} {String(formData.shipping_pincode || '')}</p>
                      <p><span className="font-medium">Country:</span> {String(formData.shipping_country || 'Not provided')}</p>
                      {vendor?.can_view_customer_phone && formData.customer_phone && <p><span className="font-medium">Phone:</span> {String(formData.customer_phone)}</p>}
                      {vendor?.can_view_customer_email && formData.customer_email && <p><span className="font-medium">Email:</span> {String(formData.customer_email)}</p>}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Shipping Details</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><span className="font-medium">Courier:</span> {String(formData.courier_partner || 'Not selected')}</p>
                      <p><span className="font-medium">Method:</span> {String(formData.shipping_method || 'Standard')}</p>
                      <p><span className="font-medium">Tracking:</span> {formData.tracking_preference === 'auto_generated' ? 'Auto-generated' : 'Vendor-supplied'}</p>
                      {formData.tracking_preference === 'vendor_supplied' && formData.awb_number && (
                        <p><span className="font-medium">AWB Number:</span> {String(formData.awb_number)}</p>
                      )}
                      {formData.tracking_preference === 'vendor_supplied' && formData.tracking_number && (
                        <p><span className="font-medium">Tracking Number:</span> {String(formData.tracking_number)}</p>
                      )}
                      {formData.pickup_date && <p><span className="font-medium">Pickup Date:</span> {String(formData.pickup_date)}</p>}
                      {formData.pickup_slot && <p><span className="font-medium">Pickup Slot:</span> {String(formData.pickup_slot)}</p>}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Package Details</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><span className="font-medium">Package Type:</span> {String(formData.package_type || 'Box')}</p>
                      <p><span className="font-medium">Weight:</span> {String(formData.package_weight || 0)} kg</p>
                      <p><span className="font-medium">Dimensions:</span> {String(formData.package_length || 0)} × {String(formData.package_width || 0)} × {String(formData.package_height || 0)} cm</p>
                      <p><span className="font-medium">Number of Packages:</span> {String(formData.number_of_packages || 1)}</p>
                    </div>
                  </div>

                  {(formData.hsn_code || formData.hts_code || formData.country_of_origin || formData.customs_value) && (
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Customs Information</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        {formData.hsn_code && <p><span className="font-medium">HSN Code:</span> {String(formData.hsn_code)}</p>}
                        {formData.hts_code && <p><span className="font-medium">HTS Code:</span> {String(formData.hts_code)}</p>}
                        {formData.country_of_origin && <p><span className="font-medium">Country of Origin:</span> {String(formData.country_of_origin)}</p>}
                        {formData.customs_value && <p><span className="font-medium">Customs Value:</span> ${String(formData.customs_value)}</p>}
                        {formData.customs_category && <p><span className="font-medium">Category:</span> {String(formData.customs_category)}</p>}
                        {formData.invoice_number && <p><span className="font-medium">Invoice Number:</span> {String(formData.invoice_number)}</p>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            <div className="flex gap-4 pt-6 border-t border-gray-200">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Previous
                </button>
              )}
              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-sufi-purple to-sufi-dark text-white rounded-xl hover:shadow-lg transition-all font-medium"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-sufi-purple to-sufi-dark text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {loading ? 'Creating Label...' : 'Create Label'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
