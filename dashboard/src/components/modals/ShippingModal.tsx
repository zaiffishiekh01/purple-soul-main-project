import { useState, useEffect } from 'react';
import { X, Save, Truck, Package, Calendar, Zap } from 'lucide-react';
import { Shipment } from '../../hooks/useShipments';
import { useOrders } from '../../hooks/useOrders';
import { useVendorContext } from '../../contexts/VendorContext';
import { getActiveCarriers, createShippingLabel, getShippingRates } from '../../lib/carrier-integration';
import type { CarrierIntegration, ShippingRate } from '../../lib/carrier-integration';

interface ShippingModalProps {
  shipment: Shipment | null;
  onClose: () => void;
  onSave: (shipment: Partial<Shipment>) => Promise<void>;
}

// Marketplace carriers are now loaded dynamically from the database

const MANUAL_CARRIERS = [
  'USPS',
  'FedEx',
  'UPS',
  'DHL',
  'OnTrac',
  'Canada Post',
  'Royal Mail',
  'Other',
];

const SHIPPING_METHODS = ['Standard', 'Express', 'Overnight', 'Two-Day', 'Economy'];

export function ShippingModal({ shipment, onClose, onSave }: ShippingModalProps) {
  const { vendor } = useVendorContext();
  const { orders } = useOrders(vendor?.id);
  const [shippingType, setShippingType] = useState<'marketplace' | 'manual'>('manual');
  const [formData, setFormData] = useState({
    order_id: '',
    tracking_number: '',
    carrier: '',
    shipping_method: 'Standard',
    status: 'pending',
    shipped_at: '',
    estimated_delivery: '',
  });
  const [loading, setLoading] = useState(false);
  const [showCustomCarrier, setShowCustomCarrier] = useState(false);
  const [customCarrier, setCustomCarrier] = useState('');
  const [marketplaceCarriers, setMarketplaceCarriers] = useState<CarrierIntegration[]>([]);
  const [availableRates, setAvailableRates] = useState<ShippingRate[]>([]);
  const [loadingRates, setLoadingRates] = useState(false);
  const [selectedCarrierCode, setSelectedCarrierCode] = useState('');

  useEffect(() => {
    loadCarriers();
  }, []);

  useEffect(() => {
    if (shipment) {
      const isCustomCarrier = shipment.carrier && !MANUAL_CARRIERS.includes(shipment.carrier) && !marketplaceCarriers.some(c => c.carrier_name === shipment.carrier);

      setFormData({
        order_id: shipment.order_id,
        tracking_number: shipment.tracking_number,
        carrier: isCustomCarrier ? 'Custom' : shipment.carrier,
        shipping_method: shipment.shipping_method,
        status: shipment.status,
        shipped_at: shipment.shipped_at ? new Date(shipment.shipped_at).toISOString().split('T')[0] : '',
        estimated_delivery: shipment.estimated_delivery ? new Date(shipment.estimated_delivery).toISOString().split('T')[0] : '',
      });

      if (isCustomCarrier) {
        setShowCustomCarrier(true);
        setCustomCarrier(shipment.carrier);
      }
    }
  }, [shipment, marketplaceCarriers]);

  const loadCarriers = async () => {
    try {
      const carriers = await getActiveCarriers();
      setMarketplaceCarriers(carriers);
    } catch (error) {
      console.error('Error loading carriers:', error);
    }
  };

  const handleCarrierChange = (value: string) => {
    if (value === 'Custom') {
      setShowCustomCarrier(true);
      setFormData({ ...formData, carrier: '' });
    } else {
      setShowCustomCarrier(false);
      setCustomCarrier('');
      setFormData({ ...formData, carrier: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const finalCarrier = showCustomCarrier ? customCarrier : formData.carrier;
      const dataToSave = {
        ...formData,
        carrier: finalCarrier,
        shipped_at: formData.shipped_at ? new Date(formData.shipped_at).toISOString() : null,
        estimated_delivery: formData.estimated_delivery ? new Date(formData.estimated_delivery).toISOString() : null,
      };
      await onSave(dataToSave);
      onClose();
    } catch (error) {
      console.error('Error saving shipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const unshippedOrders = orders.filter(order =>
    order.status !== 'cancelled' && order.status !== 'delivered'
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b border-gray-200 p-6 flex items-center justify-between sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {shipment ? 'Update Shipment' : 'Create New Shipment'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {!shipment && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Shipping Method</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setShippingType('marketplace')}
                  className={`p-4 border-2 rounded-xl transition-all ${
                    shippingType === 'marketplace'
                      ? 'border-sufi-purple bg-sufi-light/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Package className="w-6 h-6 mx-auto mb-2 text-sufi-purple" />
                  <p className="font-semibold text-gray-900">Marketplace Shipping</p>
                  <p className="text-xs text-gray-600 mt-1">Use platform carriers</p>
                </button>
                <button
                  type="button"
                  onClick={() => setShippingType('manual')}
                  className={`p-4 border-2 rounded-xl transition-all ${
                    shippingType === 'manual'
                      ? 'border-sufi-purple bg-sufi-light/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Truck className="w-6 h-6 mx-auto mb-2 text-sufi-purple" />
                  <p className="font-semibold text-gray-900">Manual Shipping</p>
                  <p className="text-xs text-gray-600 mt-1">Your own carrier</p>
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Order</label>
            <select
              value={formData.order_id}
              onChange={(e) => setFormData({ ...formData, order_id: e.target.value })}
              required
              disabled={!!shipment}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30 focus:border-sufi-purple transition-all disabled:bg-gray-100"
            >
              <option value="">Choose an order...</option>
              {unshippedOrders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.order_number} - {order.customer_name}
                </option>
              ))}
            </select>
          </div>

          {shippingType === 'marketplace' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-sufi-purple" />
                Integrated Carriers (Live Rates & Labels)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {marketplaceCarriers.map((carrier) => (
                  <button
                    key={carrier.id}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, carrier: carrier.carrier_name });
                      setSelectedCarrierCode(carrier.carrier_code);
                    }}
                    className={`p-3 border-2 rounded-xl transition-all text-left ${
                      formData.carrier === carrier.carrier_name
                        ? 'border-sufi-purple bg-sufi-light/20'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-medium text-gray-900">{carrier.carrier_name}</p>
                    <div className="flex gap-1 mt-1">
                      {carrier.supports_rates && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Rates</span>
                      )}
                      {carrier.supports_labels && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Labels</span>
                      )}
                      {carrier.supports_tracking && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Tracking</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              {marketplaceCarriers.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">Loading carriers...</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Carrier</label>
              <select
                value={showCustomCarrier ? 'Custom' : formData.carrier}
                onChange={(e) => handleCarrierChange(e.target.value)}
                required={!showCustomCarrier}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30 focus:border-sufi-purple transition-all"
              >
                <option value="">Select a carrier...</option>
                {MANUAL_CARRIERS.map((carrier) => (
                  <option key={carrier} value={carrier}>
                    {carrier}
                  </option>
                ))}
                <option value="Custom">Custom Carrier...</option>
              </select>

              {showCustomCarrier && (
                <div className="animate-fadeIn">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Custom Carrier Name</label>
                  <input
                    type="text"
                    value={customCarrier}
                    onChange={(e) => setCustomCarrier(e.target.value)}
                    required
                    placeholder="Enter carrier name..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30 focus:border-sufi-purple transition-all"
                  />
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Number</label>
            <input
              type="text"
              value={formData.tracking_number}
              onChange={(e) => setFormData({ ...formData, tracking_number: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30 focus:border-sufi-purple transition-all"
              placeholder="Enter tracking number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Method</label>
            <select
              value={formData.shipping_method}
              onChange={(e) => setFormData({ ...formData, shipping_method: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30 focus:border-sufi-purple transition-all"
            >
              {SHIPPING_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Shipped Date
              </label>
              <input
                type="date"
                value={formData.shipped_at}
                onChange={(e) => setFormData({ ...formData, shipped_at: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30 focus:border-sufi-purple transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Estimated Delivery
              </label>
              <input
                type="date"
                value={formData.estimated_delivery}
                onChange={(e) => setFormData({ ...formData, estimated_delivery: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30 focus:border-sufi-purple transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30 focus:border-sufi-purple transition-all"
            >
              <option value="pending">Pending</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-sufi-purple to-sufi-dark text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Saving...' : shipment ? 'Update Shipment' : 'Create Shipment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
