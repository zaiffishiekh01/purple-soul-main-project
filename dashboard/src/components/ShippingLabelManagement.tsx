import { Plus, Printer, Eye, Edit, Trash2, Truck, Package, MapPin, Info } from 'lucide-react';
import { ShippingLabel } from '../hooks/useShippingLabels';

interface ShippingLabelManagementProps {
  labels: ShippingLabel[];
  onCreateLabel: () => void;
  onEditLabel: (labelId: string) => void;
  onDeleteLabel: (labelId: string) => void;
  onPrintLabel: (labelId: string) => void;
}

export function ShippingLabelManagement({
  labels,
  onCreateLabel,
  onEditLabel,
  onDeleteLabel,
  onPrintLabel,
}: ShippingLabelManagementProps) {
  const getStatusConfig = (status: string) => {
    const configs = {
      draft: { color: 'bg-gray-100 text-gray-700 border-gray-200', label: 'Draft' },
      ready: { color: 'bg-green-100 text-green-700 border-green-200', label: 'Ready to Print' },
      printed: { color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Printed' },
      shipped: { color: 'bg-purple-100 text-purple-700 border-purple-200', label: 'Shipped' },
    };
    return configs[status as keyof typeof configs] || configs.draft;
  };

  const statusCounts = {
    draft: labels.filter((l) => l.status === 'draft').length,
    ready: labels.filter((l) => l.status === 'ready').length,
    printed: labels.filter((l) => l.status === 'printed').length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="p-3 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 shadow-lg inline-block mb-4">
            <Package className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-2">Draft Labels</h3>
          <p className="text-3xl font-bold text-gray-900">{statusCounts.draft}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg inline-block mb-4">
            <Printer className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-2">Ready to Print</h3>
          <p className="text-3xl font-bold text-gray-900">{statusCounts.ready}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg inline-block mb-4">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-2">Printed Labels</h3>
          <p className="text-3xl font-bold text-gray-900">{statusCounts.printed}</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Info className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 mb-1">About Shipping Labels</h4>
            <p className="text-sm text-blue-800 leading-relaxed">
              Generate and print physical shipping labels with AWB/tracking numbers, barcodes, and package details.
              <span className="font-medium"> When you create a label, a shipment record is automatically created for tracking.</span>
            </p>
            <div className="mt-2 text-xs text-blue-700">
              <span className="font-medium">Use this when:</span> You need to print a physical label for a package
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Shipping Labels</h3>
            <p className="text-sm text-gray-600 mt-1">Create and manage ready-to-print shipping labels</p>
          </div>
          <button
            onClick={onCreateLabel}
            className="px-6 py-3 bg-gradient-to-r from-sufi-purple to-sufi-dark text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 font-medium"
          >
            <Plus className="w-5 h-5" />
            Create Label
          </button>
        </div>

        <div className="divide-y divide-gray-200">
          {labels.map((label) => {
            const statusConfig = getStatusConfig(label.status);

            return (
              <div key={label.id} className="p-6 hover:bg-sufi-light/10 transition-colors">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">{label.product_names}</h4>
                        <p className="text-sm text-gray-600">SKU: {label.sku}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.color}`}
                      >
                        {statusConfig.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <Package className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">From</p>
                          <p className="font-medium text-gray-900">{label.vendor_name}</p>
                          <p className="text-xs text-gray-600">{label.pickup_city}, {label.pickup_state}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-sm">
                        <div className="p-2 bg-green-50 rounded-lg">
                          <MapPin className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">To</p>
                          <p className="font-medium text-gray-900">{label.customer_name}</p>
                          <p className="text-xs text-gray-600">{label.shipping_city}, {label.shipping_state}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-sm">
                        <div className="p-2 bg-purple-50 rounded-lg">
                          <Truck className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Courier</p>
                          <p className="font-medium text-gray-900">{label.courier_partner || 'Not assigned'}</p>
                          <p className="text-xs text-gray-600">{label.shipping_method}</p>
                        </div>
                      </div>
                    </div>

                    {label.awb_number && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between text-sm">
                          <div>
                            <span className="text-gray-600">AWB:</span>{' '}
                            <span className="font-mono font-semibold text-gray-900">{label.awb_number}</span>
                          </div>
                          {label.tracking_number && (
                            <div>
                              <span className="text-gray-600">Tracking:</span>{' '}
                              <span className="font-mono font-semibold text-gray-900">
                                {label.tracking_number}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                      <span>Weight: {label.package_weight} kg</span>
                      <span>•</span>
                      <span>
                        Dimensions: {label.package_length} × {label.package_width} × {label.package_height} cm
                      </span>
                      <span>•</span>
                      <span>Packages: {label.number_of_packages}</span>
                    </div>
                  </div>

                  <div className="flex lg:flex-col gap-2">
                    {(label.status === 'ready' || label.status === 'printed') && (
                      <button
                        onClick={() => onPrintLabel(label.id)}
                        className="px-4 py-2 bg-gradient-to-r from-sufi-purple to-sufi-dark text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium whitespace-nowrap flex items-center gap-2"
                      >
                        <Printer className="w-4 h-4" />
                        Print Label
                      </button>
                    )}
                    <button
                      onClick={() => onEditLabel(label.id)}
                      className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium whitespace-nowrap flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => onDeleteLabel(label.id)}
                      className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium whitespace-nowrap flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {labels.length === 0 && (
          <div className="py-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No shipping labels created yet</p>
            <button
              onClick={onCreateLabel}
              className="px-6 py-3 bg-gradient-to-r from-sufi-purple to-sufi-dark text-white rounded-xl hover:shadow-lg transition-all inline-flex items-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" />
              Create Your First Label
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
