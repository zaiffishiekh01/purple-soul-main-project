import React, { useState } from 'react';
import { Package, Truck, CheckCircle, MapPin, Calendar, Clock, ArrowLeft } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface OrderTrackingProps {
  orderNumber?: string;
  orderItems?: CartItem[];
  onBack?: () => void;
}

export default function OrderTracking({ orderNumber = 'ORD-20260315-7821', orderItems = [], onBack }: OrderTrackingProps) {
  const [trackingSteps] = useState([
    {
      id: 1,
      status: 'completed',
      title: 'Order Placed',
      description: 'Your order has been confirmed',
      timestamp: 'March 15, 2026 at 2:30 PM',
      icon: CheckCircle,
    },
    {
      id: 2,
      status: 'completed',
      title: 'Processing',
      description: 'Artisan partners are preparing your items',
      timestamp: 'March 15, 2026 at 3:15 PM',
      icon: Package,
    },
    {
      id: 3,
      status: 'in-progress',
      title: 'Shipped',
      description: 'Your package is on its way',
      timestamp: 'March 16, 2026 at 9:00 AM',
      icon: Truck,
    },
    {
      id: 4,
      status: 'pending',
      title: 'Out for Delivery',
      description: 'Package is out for delivery',
      timestamp: 'Estimated: March 20, 2026',
      icon: MapPin,
    },
    {
      id: 5,
      status: 'pending',
      title: 'Delivered',
      description: 'Package has been delivered',
      timestamp: 'Estimated: March 20, 2026',
      icon: CheckCircle,
    },
  ]);

  const trackingNumber = 'TRK1234567890';
  const carrier = 'UPS Ground';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'in-progress':
        return 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30';
      default:
        return 'text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-800/30';
    }
  };

  const getLineColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600 dark:bg-green-400';
      case 'in-progress':
        return 'bg-gradient-to-b from-green-600 to-gray-300 dark:from-green-400 dark:to-gray-700';
      default:
        return 'bg-gray-300 dark:bg-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-secondary hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Order Confirmation
          </button>
        )}

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Track Your Order</h1>
          <p className="text-secondary">Order #{orderNumber}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface border border-default rounded-2xl shadow-theme-md p-8">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold text-primary">Shipment Status</h2>
                  <span className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-full text-sm font-bold">
                    <Truck className="w-4 h-4" />
                    In Transit
                  </span>
                </div>
                <p className="text-secondary">Tracking Number: <span className="font-semibold text-primary">{trackingNumber}</span></p>
                <p className="text-sm text-secondary">Carrier: {carrier}</p>
              </div>

              <div className="relative">
                {trackingSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isLast = index === trackingSteps.length - 1;

                  return (
                    <div key={step.id} className="relative">
                      <div className="flex gap-6 pb-8">
                        <div className="relative flex flex-col items-center">
                          <div className={`flex items-center justify-center w-14 h-14 rounded-full ${getStatusColor(step.status)} z-10`}>
                            <Icon className="w-7 h-7" />
                          </div>
                          {!isLast && (
                            <div className={`absolute top-14 w-1 h-full ${getLineColor(step.status)}`} />
                          )}
                        </div>

                        <div className="flex-1 pt-2">
                          <h3 className={`text-lg font-bold mb-1 ${
                            step.status === 'pending' ? 'text-muted' : 'text-primary'
                          }`}>
                            {step.title}
                          </h3>
                          <p className={`text-sm mb-2 ${
                            step.status === 'pending' ? 'text-muted' : 'text-secondary'
                          }`}>
                            {step.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{step.timestamp}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-surface border border-default rounded-2xl shadow-theme-md p-6">
              <h2 className="text-xl font-bold text-primary mb-6">Order Items</h2>
              <div className="space-y-4">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-default last:border-0 last:pb-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg border border-default"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-primary mb-1">{item.name}</h3>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-secondary">Qty: {item.quantity}</p>
                        <span className="font-bold text-purple-600 dark:text-purple-400">${item.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-surface border border-default rounded-2xl shadow-theme-md p-6 sticky top-6">
              <h2 className="text-xl font-bold text-primary mb-6">Delivery Information</h2>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-primary mb-1">Shipping Address</p>
                    <div className="text-sm text-secondary space-y-0.5">
                      <p>Sarah Johnson</p>
                      <p>123 Main Street, Apt 4B</p>
                      <p>New York, NY 10001</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-primary mb-1">Estimated Delivery</p>
                    <p className="text-sm text-secondary">Friday, March 20, 2026</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-primary mb-1">Carrier</p>
                    <p className="text-sm text-secondary">{carrier}</p>
                    <p className="text-xs text-muted mt-1">Tracking: {trackingNumber}</p>
                  </div>
                </div>
              </div>

              <button className="w-full gradient-purple-soul text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-theme-lg">
                Track on Carrier Website
              </button>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-2 border-purple-200 dark:border-purple-800/50 rounded-2xl p-6">
              <h3 className="font-bold text-primary mb-3">Need Help?</h3>
              <p className="text-sm text-secondary mb-4">
                Have questions about your order or delivery?
              </p>
              <button className="w-full bg-surface border-2 border-purple-300 dark:border-purple-700 text-primary py-3 rounded-xl font-bold hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
