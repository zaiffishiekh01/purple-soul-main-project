import { useState, useEffect } from 'react';
import { Tag, Search, Download, Eye, XCircle, Printer, Package } from 'lucide-react';
import { dashboardClient } from '../../lib/data-client';
import { loadShippingLabelsWithOrdersAndVendors } from '../../lib/dashboard-relational-loaders';

interface ShippingLabel {
  id: string;
  order_id: string;
  vendor_id: string;
  shipment_id: string;
  label_url: string;
  tracking_number: string;
  carrier: string;
  service_type: string;
  cost: number;
  created_at: string;
  orders?: {
    order_number: string;
    customer_name: string;
  };
  vendors?: {
    business_name: string;
  };
}

export default function AdminLabels() {
  const [labels, setLabels] = useState<ShippingLabel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [carrierFilter, setCarrierFilter] = useState<string>('all');
  const [selectedLabel, setSelectedLabel] = useState<ShippingLabel | null>(null);

  useEffect(() => {
    fetchLabels();
  }, [carrierFilter]);

  const fetchLabels = async () => {
    try {
      setLoading(true);
      const data = await loadShippingLabelsWithOrdersAndVendors({
        carrierEq: carrierFilter,
      });
      setLabels((data || []) as ShippingLabel[]);
    } catch (error) {
      console.error('Error fetching labels:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadLabel = (labelUrl: string, trackingNumber: string) => {
    window.open(labelUrl, '_blank');
  };

  const filteredLabels = labels.filter(label =>
    label.tracking_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    label.orders?.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    label.vendors?.business_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const carriers = ['USPS', 'FedEx', 'UPS', 'DHL'];

  const stats = {
    total: labels.length,
    totalCost: labels.reduce((sum, l) => sum + (l.cost || 0), 0),
    byCarrier: carriers.reduce((acc, carrier) => {
      acc[carrier] = labels.filter(l => l.carrier === carrier).length;
      return acc;
    }, {} as Record<string, number>),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Shipping Labels Management</h2>
          <p className="text-gray-600 mt-1">Monitor and manage all shipping labels across vendors</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Labels</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Tag className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">USPS</p>
              <p className="text-3xl font-bold text-blue-600">{stats.byCarrier['USPS'] || 0}</p>
            </div>
            <Package className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">FedEx</p>
              <p className="text-3xl font-bold text-purple-600">{stats.byCarrier['FedEx'] || 0}</p>
            </div>
            <Package className="w-10 h-10 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">UPS</p>
              <p className="text-3xl font-bold text-amber-600">{stats.byCarrier['UPS'] || 0}</p>
            </div>
            <Package className="w-10 h-10 text-amber-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Cost</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalCost.toFixed(2)}</p>
            </div>
            <Download className="w-10 h-10 text-green-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by tracking number, order, or vendor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setCarrierFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                carrierFilter === 'all'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {carriers.map(carrier => (
              <button
                key={carrier}
                onClick={() => setCarrierFilter(carrier)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  carrierFilter === carrier
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {carrier}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Tracking Number</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Order</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Vendor</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Carrier</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Service</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Cost</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Created</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    Loading labels...
                  </td>
                </tr>
              ) : filteredLabels.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    No labels found
                  </td>
                </tr>
              ) : (
                filteredLabels.map((label) => (
                  <tr key={label.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm">{label.tracking_number}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium">{label.orders?.order_number}</div>
                      <div className="text-sm text-gray-500">{label.orders?.customer_name}</div>
                    </td>
                    <td className="py-3 px-4 text-sm">{label.vendors?.business_name}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        label.carrier === 'USPS'
                          ? 'bg-blue-100 text-blue-700'
                          : label.carrier === 'FedEx'
                          ? 'bg-purple-100 text-purple-700'
                          : label.carrier === 'UPS'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {label.carrier}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">{label.service_type}</td>
                    <td className="py-3 px-4 font-medium">${label.cost?.toFixed(2)}</td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(label.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedLabel(label)}
                          className="text-emerald-600 hover:text-emerald-700"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => downloadLabel(label.label_url, label.tracking_number)}
                          className="text-blue-600 hover:text-blue-700"
                          title="Download Label"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedLabel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Label Details</h3>
                <button
                  onClick={() => setSelectedLabel(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Tracking Number</label>
                  <p className="mt-1 font-mono text-sm">{selectedLabel.tracking_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Order Number</label>
                  <p className="mt-1">{selectedLabel.orders?.order_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Carrier</label>
                  <p className="mt-1">{selectedLabel.carrier}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Service Type</label>
                  <p className="mt-1">{selectedLabel.service_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Label Cost</label>
                  <p className="mt-1 font-bold">${selectedLabel.cost?.toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Vendor</label>
                  <p className="mt-1">{selectedLabel.vendors?.business_name}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Actions</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => downloadLabel(selectedLabel.label_url, selectedLabel.tracking_number)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    <Download className="w-4 h-4" />
                    Download Label
                  </button>
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    <Printer className="w-4 h-4" />
                    Print Label
                  </button>
                </div>
              </div>

              {selectedLabel.label_url && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Label Preview</label>
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <iframe
                      src={selectedLabel.label_url}
                      className="w-full h-96 border-0"
                      title="Shipping Label"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
