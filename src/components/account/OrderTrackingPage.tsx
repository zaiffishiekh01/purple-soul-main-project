import { useState } from 'react';
import {
  Truck, Package, Copy, MapPin, Clock, CheckCircle2,
  AlertCircle, Search, ChevronLeft, ChevronRight, Sparkles,
} from 'lucide-react';

interface OrderTrackingPageProps { onBack?: () => void; }

interface Shipment {
  id: string;
  orderNumber: string;
  status: 'label_created' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception';
  carrier: string;
  method: string;
  trackingNumber: string;
  createdAt: string;
  estimatedDelivery: string;
  shippingAddress: { line1: string; line2: string; city: string; state: string; postal: string };
  items: { name: string; quantity: number; image: string }[];
}

const mockShipments: Shipment[] = [
  {
    id: '1', orderNumber: 'ORD-20260310-4532', status: 'in_transit',
    carrier: 'USPS', method: 'Priority Mail', trackingNumber: '9400100000000000000000',
    createdAt: '2026-03-10', estimatedDelivery: '2026-03-22',
    shippingAddress: { line1: '123 Main Street', line2: 'Apt 4B', city: 'New York', state: 'NY', postal: '10001' },
    items: [{ name: 'Islamic Calligraphy Wall Art', quantity: 1, image: 'https://images.pexels.com/photos/6076442/pexels-photo-6076442.jpeg?auto=compress&cs=tinysrgb&w=100' }],
  },
  {
    id: '2', orderNumber: 'ORD-20260315-7821', status: 'delivered',
    carrier: 'FedEx', method: 'Ground', trackingNumber: '1Z999AA10123456784',
    createdAt: '2026-03-15', estimatedDelivery: '2026-03-18',
    shippingAddress: { line1: '123 Main Street', line2: 'Apt 4B', city: 'New York', state: 'NY', postal: '10001' },
    items: [
      { name: 'Hand-Carved Olive Wood Prayer Beads', quantity: 1, image: 'https://images.pexels.com/photos/7363675/pexels-photo-7363675.jpeg?auto=compress&cs=tinysrgb&w=100' },
      { name: 'Handwoven Cotton Prayer Scarf', quantity: 1, image: '' },
    ],
  },
  {
    id: '3', orderNumber: 'ORD-20260220-1111', status: 'out_for_delivery',
    carrier: 'UPS', method: 'Next Day Air', trackingNumber: '1Z999AA10987654321',
    createdAt: '2026-02-20', estimatedDelivery: '2026-03-19',
    shippingAddress: { line1: '456 Business Ave', line2: 'Suite 200', city: 'New York', state: 'NY', postal: '10002' },
    items: [{ name: 'Ceramic Incense Burner', quantity: 2, image: '' }],
  },
];

const statusColors: Record<string, string> = {
  label_created: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  in_transit: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  out_for_delivery: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  delivered: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  exception: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
};

const statusLabels: Record<string, string> = {
  label_created: 'Label Created',
  in_transit: 'In Transit',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  exception: 'Exception',
};

export default function OrderTrackingPage({ onBack }: OrderTrackingPageProps) {
  const [trackingInput, setTrackingInput] = useState('');
  const [tracking, setTracking] = useState(false);
  const [shipments] = useState<Shipment[]>(mockShipments);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [successMessage, setSuccessMessage] = useState('');
  const itemsPerPage = 5;

  const handleTrackOrder = () => {
    if (!trackingInput.trim()) return;
    setTracking(true);
    const found = shipments.find(
      s => s.orderNumber.toLowerCase().includes(trackingInput.toLowerCase()) ||
           s.trackingNumber.includes(trackingInput)
    );
    setTimeout(() => {
      if (found) {
        setSelectedShipment(found);
        setSuccessMessage('Order found');
      } else {
        setSuccessMessage('Order not found');
      }
      setTracking(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    }, 500);
  };

  const copyTrackingNumber = (trackingNumber: string) => {
    navigator.clipboard.writeText(trackingNumber);
    setSuccessMessage('Tracking number copied');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const getTrackingTimeline = (status: string) => {
    const stages = [
      { key: 'label_created', label: 'Label Created' },
      { key: 'in_transit', label: 'In Transit' },
      { key: 'out_for_delivery', label: 'Out for Delivery' },
      { key: 'delivered', label: 'Delivered' },
    ];
    const statusIndex = stages.findIndex(s => s.key === status);
    return stages.map((stage, index) => ({
      ...stage,
      completed: index <= statusIndex,
      current: index === statusIndex,
    }));
  };

  const paginatedShipments = shipments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(shipments.length / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface border border-default rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">Track Your Order</span>
        </div>
        <h2 className="text-2xl font-bold text-primary mb-2">Order Tracking</h2>
        <p className="text-secondary">Track shipments and delivery status</p>
      </div>

      {/* Success/Error Message */}
      {successMessage && (
        <div className={`rounded-xl p-4 flex items-center gap-3 ${
          successMessage === 'Order not found'
            ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
        }`}>
          {successMessage === 'Order not found' ? (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          )}
          <p className={`font-medium ${
            successMessage === 'Order not found'
              ? 'text-red-700 dark:text-red-400'
              : 'text-green-700 dark:text-green-400'
          }`}>{successMessage}</p>
        </div>
      )}

      {/* Track an Order */}
      <div className="bg-surface border border-default rounded-2xl p-6">
        <h3 className="text-lg font-bold text-primary mb-2">Track an Order</h3>
        <p className="text-sm text-secondary mb-4">Enter your order number or tracking number</p>
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Order number or tracking number..."
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTrackOrder()}
              className="w-full pl-10 pr-4 py-3 border border-default rounded-xl bg-surface-elevated text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            onClick={handleTrackOrder}
            disabled={tracking}
            className="gradient-purple-soul text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {tracking ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Truck className="w-4 h-4" />
            )}
            Track
          </button>
        </div>
      </div>

      {/* Selected Shipment Details */}
      {selectedShipment && (
        <div className="bg-surface border border-default rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-primary">Shipment Details</h3>
              <p className="text-sm text-secondary">Order #{selectedShipment.orderNumber}</p>
            </div>
            <button
              onClick={() => setSelectedShipment(null)}
              className="p-2 hover:bg-surface-elevated rounded-lg transition-colors"
            >
              <span className="text-primary text-xl">&times;</span>
            </button>
          </div>

          <div className="space-y-6">
            {/* Tracking Timeline */}
            <div className="relative">
              {getTrackingTimeline(selectedShipment.status).map((stage, index, array) => (
                <div key={stage.key} className="flex items-start gap-4 relative">
                  {index < array.length - 1 && (
                    <div
                      className={`absolute left-[15px] top-[36px] w-0.5 h-12 ${
                        stage.completed ? 'bg-green-500' : 'bg-surface-deep'
                      }`}
                    />
                  )}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center z-10 flex-shrink-0 ${
                      stage.completed
                        ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500'
                        : 'bg-surface-deep border-2 border-default'
                    }`}
                  >
                    {stage.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-muted" />
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <p className={`font-medium ${stage.current ? 'text-primary' : 'text-secondary'}`}>
                      {stage.label}
                    </p>
                    {stage.current && (
                      <p className="text-sm text-muted mt-1">Current status</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Carrier Information */}
            <div className="p-4 bg-surface-elevated border border-default rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <p className="font-semibold text-primary">Carrier Information</p>
              </div>
              <div className="text-sm text-secondary space-y-1">
                <p>Carrier: {selectedShipment.carrier}</p>
                <p>Method: {selectedShipment.method}</p>
                {selectedShipment.trackingNumber && (
                  <div className="flex items-center gap-2 mt-2">
                    <code className="text-sm bg-surface-deep px-2 py-1 rounded">{selectedShipment.trackingNumber}</code>
                    <button
                      onClick={() => copyTrackingNumber(selectedShipment.trackingNumber)}
                      className="p-1 hover:bg-surface rounded transition-colors"
                    >
                      <Copy className="w-3 h-3 text-muted hover:text-primary" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="p-4 bg-surface-elevated border border-default rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <p className="font-semibold text-primary">Delivery Address</p>
              </div>
              <div className="text-sm text-secondary">
                <p>{selectedShipment.shippingAddress.line1}</p>
                {selectedShipment.shippingAddress.line2 && <p>{selectedShipment.shippingAddress.line2}</p>}
                <p>{selectedShipment.shippingAddress.city}, {selectedShipment.shippingAddress.state} {selectedShipment.shippingAddress.postal}</p>
              </div>
            </div>

            {/* Items */}
            {selectedShipment.items.length > 0 && (
              <div className="p-4 bg-surface-elevated border border-default rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <p className="font-semibold text-primary">Items ({selectedShipment.items.length})</p>
                </div>
                <div className="space-y-2">
                  {selectedShipment.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg border border-default bg-surface-deep overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Package className="w-4 h-4 text-muted" /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary truncate">{item.name}</p>
                        <p className="text-xs text-muted">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Help */}
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-700 dark:text-amber-400 text-sm mb-1">Need help with your delivery?</p>
                  <p className="text-amber-600 dark:text-amber-500 text-sm mb-3">
                    If you're experiencing issues with your shipment, our support team is here to help.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Shipments */}
      <div className="bg-surface border border-default rounded-2xl p-6">
        <h3 className="text-lg font-bold text-primary mb-2">Recent Shipments</h3>
        <p className="text-sm text-secondary mb-4">Your recently shipped orders</p>

        {shipments.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-surface-elevated border border-default">
              <Package className="w-10 h-10 text-muted" />
            </div>
            <h4 className="text-xl font-bold text-primary mb-2">No shipments yet</h4>
            <p className="text-secondary">Your shipped orders will appear here</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedShipments.map(shipment => {
                const config = statusColors[shipment.status];
                return (
                  <div
                    key={shipment.id}
                    onClick={() => setSelectedShipment(shipment)}
                    className="p-4 bg-surface-elevated border border-default rounded-xl cursor-pointer hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-primary">Order #{shipment.orderNumber}</p>
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${config}`}>
                            {statusLabels[shipment.status]}
                          </span>
                        </div>
                        <p className="text-sm text-secondary">
                          {shipment.carrier} • {new Date(shipment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted">
                        <Clock className="w-4 h-4" />
                        <span>Est. {new Date(shipment.estimatedDelivery).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {shipment.trackingNumber && (
                      <div className="flex items-center gap-2 mt-2">
                        <code className="text-sm bg-surface-deep px-3 py-1.5 rounded">{shipment.trackingNumber}</code>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyTrackingNumber(shipment.trackingNumber);
                          }}
                          className="p-1.5 hover:bg-surface rounded transition-colors text-muted hover:text-primary"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-default rounded-lg hover:bg-surface-elevated transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4 text-primary" />
                </button>
                <span className="text-sm text-secondary">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-default rounded-lg hover:bg-surface-elevated transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4 text-primary" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
