'use client';

import { Check, Clock, Package, Truck, MapPin, RotateCcw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TimelineItem {
  status: string;
  timestamp: string;
  description: string;
  icon: React.ReactNode;
  isActive: boolean;
  isCompleted: boolean;
}

interface OrderTimelineProps {
  currentStatus: string;
  createdAt: string;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
}

const statusFlow = [
  'created',
  'payment_pending',
  'paid',
  'vendor_confirmed',
  'picking',
  'packed',
  'label_created',
  'shipped',
  'in_transit',
  'delivered'
];

const returnFlow = [
  'return_requested',
  'return_approved',
  'return_in_transit',
  'return_received',
  'refund_pending',
  'refunded'
];

const statusLabels: Record<string, string> = {
  created: 'Order Created',
  payment_pending: 'Payment Pending',
  paid: 'Payment Confirmed',
  vendor_confirmed: 'Vendor Confirmed',
  picking: 'Picking Items',
  packed: 'Order Packed',
  label_created: 'Shipping Label Created',
  shipped: 'Order Shipped',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Order Cancelled',
  return_requested: 'Return Requested',
  return_approved: 'Return Approved',
  return_rejected: 'Return Rejected',
  return_in_transit: 'Return In Transit',
  return_received: 'Return Received',
  refund_pending: 'Refund Pending',
  refunded: 'Refunded'
};

const statusDescriptions: Record<string, string> = {
  created: 'Your order has been placed successfully',
  payment_pending: 'Waiting for payment confirmation',
  paid: 'Payment received and confirmed',
  vendor_confirmed: 'Vendor has confirmed your order',
  picking: 'Items are being picked from inventory',
  packed: 'Your order has been packed and is ready to ship',
  label_created: 'Shipping label has been created',
  shipped: 'Your order has been handed to the carrier',
  in_transit: 'Your order is on its way',
  delivered: 'Your order has been delivered',
  cancelled: 'This order has been cancelled',
  return_requested: 'Return has been requested',
  return_approved: 'Return has been approved',
  return_rejected: 'Return request was rejected',
  return_in_transit: 'Return package is on its way back',
  return_received: 'Return has been received',
  refund_pending: 'Refund is being processed',
  refunded: 'Refund has been completed'
};

export function OrderTimeline({
  currentStatus,
  createdAt,
  shippedAt,
  deliveredAt,
  cancelledAt
}: OrderTimelineProps) {
  const isReturn = returnFlow.includes(currentStatus);
  const isCancelled = currentStatus === 'cancelled';

  const activeFlow = isReturn ? returnFlow : statusFlow;
  const currentIndex = activeFlow.indexOf(currentStatus);

  const getIcon = (status: string) => {
    if (status === 'cancelled') return <RotateCcw className="w-5 h-5" />;
    if (returnFlow.includes(status)) return <RotateCcw className="w-5 h-5" />;
    if (status === 'delivered') return <MapPin className="w-5 h-5" />;
    if (status === 'shipped' || status === 'in_transit') return <Truck className="w-5 h-5" />;
    if (status.includes('pack')) return <Package className="w-5 h-5" />;
    return <Clock className="w-5 h-5" />;
  };

  const getTimestamp = (status: string): string | null => {
    if (status === 'created') return createdAt;
    if (status === 'shipped' && shippedAt) return shippedAt;
    if (status === 'delivered' && deliveredAt) return deliveredAt;
    if (status === 'cancelled' && cancelledAt) return cancelledAt;
    return null;
  };

  const buildTimeline = (): TimelineItem[] => {
    if (isCancelled) {
      return [
        {
          status: 'created',
          timestamp: createdAt,
          description: statusDescriptions['created'],
          icon: getIcon('created'),
          isActive: false,
          isCompleted: true
        },
        {
          status: 'cancelled',
          timestamp: cancelledAt || new Date().toISOString(),
          description: statusDescriptions['cancelled'],
          icon: getIcon('cancelled'),
          isActive: true,
          isCompleted: true
        }
      ];
    }

    const timeline: TimelineItem[] = [];
    const relevantStatuses = isReturn ? returnFlow : statusFlow.slice(0, Math.max(6, currentIndex + 2));

    relevantStatuses.forEach((status, index) => {
      const statusIndex = activeFlow.indexOf(status);
      const timestamp = getTimestamp(status);

      timeline.push({
        status,
        timestamp: timestamp || '',
        description: statusDescriptions[status] || '',
        icon: getIcon(status),
        isActive: statusIndex === currentIndex,
        isCompleted: statusIndex < currentIndex || (statusIndex === currentIndex && timestamp !== null)
      });
    });

    return timeline;
  };

  const timeline = buildTimeline();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-3 h-3 rounded-full ${
          isCancelled ? 'bg-red-500' :
          isReturn ? 'bg-yellow-500' :
          currentStatus === 'delivered' ? 'bg-green-500' :
          'bg-blue-500'
        } animate-pulse`}></div>
        <div>
          <h3 className="text-white font-semibold text-lg">
            {statusLabels[currentStatus] || currentStatus}
          </h3>
          <p className="text-white/60 text-sm">
            {statusDescriptions[currentStatus] || 'Order is being processed'}
          </p>
        </div>
      </div>

      <div className="relative">
        {timeline.map((item, index) => (
          <div key={item.status} className="relative pb-8 last:pb-0">
            {index < timeline.length - 1 && (
              <div
                className={`absolute left-6 top-12 bottom-0 w-0.5 ${
                  item.isCompleted ? 'bg-gradient-to-b from-blue-500 to-blue-500/50' : 'bg-white/10'
                }`}
              />
            )}

            <div className="flex items-start gap-4">
              <div
                className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  item.isCompleted
                    ? 'border-blue-500 bg-gradient-to-br from-blue-500/20 to-blue-600/20 text-blue-400'
                    : item.isActive
                    ? 'border-blue-400 bg-gradient-to-br from-blue-500/10 to-transparent text-blue-300'
                    : 'border-white/20 bg-white/5 text-white/40'
                }`}
              >
                {item.isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  item.icon
                )}
              </div>

              <div className="flex-1 pt-1">
                <h4
                  className={`font-medium mb-1 ${
                    item.isActive || item.isCompleted ? 'text-white' : 'text-white/50'
                  }`}
                >
                  {statusLabels[item.status] || item.status}
                </h4>
                <p
                  className={`text-sm mb-1 ${
                    item.isActive || item.isCompleted ? 'text-white/70' : 'text-white/40'
                  }`}
                >
                  {item.description}
                </p>
                {item.timestamp && (
                  <p className="text-xs text-white/50">
                    {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {currentStatus === 'shipped' && (
        <div className="glass-card p-6 mt-6">
          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-blue-400 mt-1" />
            <div>
              <h4 className="text-white font-medium mb-2">Tracking Information</h4>
              <p className="text-white/70 text-sm mb-3">
                Your order is currently with the carrier and on its way to you.
              </p>
              <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                Track Package →
              </button>
            </div>
          </div>
        </div>
      )}

      {currentStatus === 'delivered' && (
        <div className="glass-card p-6 mt-6 border-green-500/30">
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-400 mt-1" />
            <div>
              <h4 className="text-white font-medium mb-2">Order Delivered</h4>
              <p className="text-white/70 text-sm">
                Your order has been successfully delivered. We hope you enjoy your purchase!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
