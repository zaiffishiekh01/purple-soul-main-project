import { Truck, MapPin, Clock, CheckCircle, XCircle, Plus, Edit, Info, Printer, Package } from 'lucide-react';
import { Shipment } from '../hooks/useShipments';

type ShippingProgram = {
  id: string;
  name: string;
  carrier: string;
  vendorRate: number;
  supportsReturns: boolean;
};

const mockMarketplaceShippingPrograms: ShippingProgram[] = [
  {
    id: '1',
    name: 'Marketplace Standard',
    carrier: 'DHL',
    vendorRate: 10.50,
    supportsReturns: true
  },
  {
    id: '2',
    name: 'Marketplace Express',
    carrier: 'UPS',
    vendorRate: 18.50,
    supportsReturns: true
  },
  {
    id: '3',
    name: 'Economy Shipping',
    carrier: 'USPS',
    vendorRate: 7.50,
    supportsReturns: false
  },
  {
    id: '4',
    name: 'International Standard',
    carrier: 'FedEx',
    vendorRate: 30.00,
    supportsReturns: true
  }
];

interface ShippingManagementProps {
  shipments: Shipment[];
  onCreateShipment: () => void;
  onEditShipment: (shipmentId: string) => void;
}

export function ShippingManagement({ shipments, onCreateShipment, onEditShipment }: ShippingManagementProps) {
  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Pending' },
      in_transit: { icon: Truck, color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'In Transit' },
      delivered: { icon: CheckCircle, color: 'bg-green-100 text-green-700 border-green-200', label: 'Delivered' },
      failed: { icon: XCircle, color: 'bg-red-100 text-red-700 border-red-200', label: 'Failed' },
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const statusCounts = {
    pending: shipments.filter((s) => s.status === 'pending').length,
    in_transit: shipments.filter((s) => s.status === 'in_transit').length,
    delivered: shipments.filter((s) => s.status === 'delivered').length,
  };

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Info className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-green-900 mb-1">About Shipment Tracking</h4>
            <p className="text-sm text-green-800 leading-relaxed">
              Track and manage shipment status, delivery progress, and carrier information.
              <span className="font-medium"> Shipments are automatically created when you generate a shipping label.</span>
            </p>
            <div className="mt-2 text-xs text-green-700">
              <span className="font-medium">Use this when:</span> You need to monitor shipment progress or update delivery status
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Marketplace Shipping Plans Available to You</h3>
            <p className="text-sm text-gray-600">Pre-negotiated rates with carrier partners</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Program Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Carrier
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Your Rate
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supports Returns
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockMarketplaceShippingPrograms.map((program) => (
                <tr key={program.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{program.name}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">{program.carrier}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-gray-900">${program.vendorRate.toFixed(2)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      program.supportsReturns
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {program.supportsReturns ? 'Yes' : 'No'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-800">
            These marketplace-managed shipping programs offer competitive rates and simplified logistics.
            Use them when creating shipping labels to take advantage of bulk discounts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 shadow-lg inline-block mb-4">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-2">Pending Shipments</h3>
          <p className="text-3xl font-bold text-gray-900">{statusCounts.pending}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg inline-block mb-4">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-2">In Transit</h3>
          <p className="text-3xl font-bold text-gray-900">{statusCounts.in_transit}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg inline-block mb-4">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-2">Delivered</h3>
          <p className="text-3xl font-bold text-gray-900">{statusCounts.delivered}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">All Shipments</h3>
          <button
            onClick={onCreateShipment}
            className="px-4 py-2 bg-gradient-to-r from-sufi-purple to-sufi-dark text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 font-medium"
          >
            <Plus className="w-5 h-5" />
            Create Shipment
          </button>
        </div>

        <div className="divide-y divide-gray-200">
          {shipments.map((shipment) => {
            const statusConfig = getStatusConfig(shipment.status);
            const StatusIcon = statusConfig.icon;

            return (
              <div key={shipment.id} className="p-6 hover:bg-sufi-light/10 transition-colors">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">Order {shipment.order_number}</h4>
                        <p className="text-sm text-gray-600">{shipment.customer_name}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${statusConfig.color}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="p-2 bg-sufi-light/20 rounded-lg">
                          <Truck className="w-4 h-4 text-sufi-dark" />
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Carrier</p>
                          <p className="font-medium text-gray-900">{shipment.carrier || 'Not assigned'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-sm">
                        <div className="p-2 bg-sufi-light/20 rounded-lg">
                          <MapPin className="w-4 h-4 text-sufi-dark" />
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Tracking Number</p>
                          <p className="font-medium text-gray-900">
                            {shipment.tracking_number || 'Not available'}
                          </p>
                        </div>
                      </div>

                      {shipment.shipped_at && (
                        <div className="flex items-center gap-3 text-sm">
                          <div className="p-2 bg-green-50 rounded-lg">
                            <Clock className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">Shipped On</p>
                            <p className="font-medium text-gray-900">
                              {new Date(shipment.shipped_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      )}

                      {shipment.estimated_delivery && (
                        <div className="flex items-center gap-3 text-sm">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <Clock className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">Estimated Delivery</p>
                            <p className="font-medium text-gray-900">
                              {new Date(shipment.estimated_delivery).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex lg:flex-col gap-2">
                    {shipment.has_label && (
                      <div className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-blue-200">
                        <Printer className="w-3.5 h-3.5" />
                        Label Available
                      </div>
                    )}
                    <button
                      onClick={() => onEditShipment(shipment.id)}
                      className="px-4 py-2 bg-sufi-light/30 text-sufi-dark rounded-lg hover:bg-sufi-light/50 transition-colors text-sm font-medium whitespace-nowrap flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Shipment
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {shipments.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-gray-500">No shipments found</p>
          </div>
        )}
      </div>
    </div>
  );
}
