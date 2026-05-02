import { useState, useEffect } from 'react';
import { Package, Truck, Search, Plus, CreditCard as Edit2, Trash2, CheckCircle, XCircle, Settings, Eye } from 'lucide-react';
import { dashboardClient } from '../../lib/data-client';
import { loadAdminShipmentsWithRelations } from '../../lib/dashboard-relational-loaders';

interface Shipment {
  id: string;
  order_id: string;
  vendor_id: string;
  tracking_number: string;
  carrier: string;
  status: string;
  shipped_at: string;
  estimated_delivery: string;
  delivered_at: string | null;
  created_at: string;
  orders?: {
    order_number: string;
    customer_name: string;
    total_amount: number;
  };
  vendors?: {
    business_name: string;
  };
}

interface CarrierIntegration {
  id: string;
  carrier_name: string;
  carrier_code: string;
  api_endpoint: string;
  is_active: boolean;
  supports_rates: boolean;
  supports_labels: boolean;
  supports_tracking: boolean;
  configuration: any;
  created_at: string;
  updated_at: string;
}

export default function AdminShipping() {
  const [activeTab, setActiveTab] = useState<'shipments' | 'carriers'>('shipments');
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [carriers, setCarriers] = useState<CarrierIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [selectedCarrier, setSelectedCarrier] = useState<CarrierIntegration | null>(null);
  const [showCarrierModal, setShowCarrierModal] = useState(false);
  const [editingCarrier, setEditingCarrier] = useState<CarrierIntegration | null>(null);

  useEffect(() => {
    if (activeTab === 'shipments') {
      fetchShipments();
    } else {
      fetchCarriers();
    }
  }, [activeTab, statusFilter]);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const data = await loadAdminShipmentsWithRelations({
        statusEq: statusFilter,
      });
      setShipments((data || []) as Shipment[]);
    } catch (error) {
      console.error('Error fetching shipments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCarriers = async () => {
    try {
      setLoading(true);
      const { data, error } = await dashboardClient
        .from('carrier_integrations')
        .select('*')
        .order('carrier_name');

      if (error) throw error;
      setCarriers(data || []);
    } catch (error) {
      console.error('Error fetching carriers:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateShipmentStatus = async (shipmentId: string, newStatus: string) => {
    try {
      const { error } = await dashboardClient
        .from('shipments')
        .update({
          status: newStatus,
          delivered_at: newStatus === 'delivered' ? new Date().toISOString() : null
        })
        .eq('id', shipmentId);

      if (error) throw error;
      fetchShipments();
      setSelectedShipment(null);
    } catch (error) {
      console.error('Error updating shipment:', error);
    }
  };

  const saveCarrier = async (carrierData: Partial<CarrierIntegration>) => {
    try {
      if (editingCarrier) {
        const { error } = await dashboardClient
          .from('carrier_integrations')
          .update({
            ...carrierData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCarrier.id);

        if (error) throw error;
      } else {
        const { error } = await dashboardClient
          .from('carrier_integrations')
          .insert([carrierData]);

        if (error) throw error;
      }

      setShowCarrierModal(false);
      setEditingCarrier(null);
      fetchCarriers();
    } catch (error) {
      console.error('Error saving carrier:', error);
      alert('Failed to save carrier. Please try again.');
    }
  };

  const deleteCarrier = async (carrierId: string) => {
    if (!confirm('Are you sure you want to delete this carrier? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await dashboardClient
        .from('carrier_integrations')
        .delete()
        .eq('id', carrierId);

      if (error) throw error;
      fetchCarriers();
    } catch (error) {
      console.error('Error deleting carrier:', error);
      alert('Failed to delete carrier. Please try again.');
    }
  };

  const toggleCarrierStatus = async (carrierId: string, currentStatus: boolean) => {
    try {
      const { error } = await dashboardClient
        .from('carrier_integrations')
        .update({ is_active: !currentStatus })
        .eq('id', carrierId);

      if (error) throw error;
      fetchCarriers();
    } catch (error) {
      console.error('Error updating carrier status:', error);
    }
  };

  const filteredShipments = shipments.filter(shipment =>
    shipment.tracking_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipment.orders?.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipment.vendors?.business_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCarriers = carriers.filter(carrier =>
    carrier.carrier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    carrier.carrier_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: shipments.length,
    in_transit: shipments.filter(s => s.status === 'in_transit').length,
    delivered: shipments.filter(s => s.status === 'delivered').length,
    delayed: shipments.filter(s => s.status === 'delayed').length,
  };

  const carrierStats = {
    total: carriers.length,
    active: carriers.filter(c => c.is_active).length,
    withRates: carriers.filter(c => c.supports_rates).length,
    withLabels: carriers.filter(c => c.supports_labels).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Shipping Management</h2>
          <p className="text-gray-600 mt-1">Manage shipments and carrier integrations</p>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('shipments')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'shipments'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Shipments
          </button>
          <button
            onClick={() => setActiveTab('carriers')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'carriers'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Carrier Services
          </button>
        </nav>
      </div>

      {activeTab === 'shipments' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Shipments</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Package className="w-10 h-10 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">In Transit</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.in_transit}</p>
                </div>
                <Truck className="w-10 h-10 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Delivered</p>
                  <p className="text-3xl font-bold text-green-600">{stats.delivered}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Delayed</p>
                  <p className="text-3xl font-bold text-red-600">{stats.delayed}</p>
                </div>
                <XCircle className="w-10 h-10 text-red-500" />
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
                  onClick={() => setStatusFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    statusFilter === 'all'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter('in_transit')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    statusFilter === 'in_transit'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  In Transit
                </button>
                <button
                  onClick={() => setStatusFilter('delivered')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    statusFilter === 'delivered'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Delivered
                </button>
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
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Shipped Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-500">
                        Loading shipments...
                      </td>
                    </tr>
                  ) : filteredShipments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-500">
                        No shipments found
                      </td>
                    </tr>
                  ) : (
                    filteredShipments.map((shipment) => (
                      <tr key={shipment.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-sm">{shipment.tracking_number}</td>
                        <td className="py-3 px-4">
                          <div className="font-medium">{shipment.orders?.order_number}</div>
                          <div className="text-sm text-gray-500">{shipment.orders?.customer_name}</div>
                        </td>
                        <td className="py-3 px-4 text-sm">{shipment.vendors?.business_name}</td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-medium">{shipment.carrier}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                            shipment.status === 'delivered'
                              ? 'bg-green-100 text-green-700'
                              : shipment.status === 'in_transit'
                              ? 'bg-blue-100 text-blue-700'
                              : shipment.status === 'delayed'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {shipment.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {new Date(shipment.shipped_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => setSelectedShipment(shipment)}
                            className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Carriers</p>
                  <p className="text-3xl font-bold text-gray-900">{carrierStats.total}</p>
                </div>
                <Truck className="w-10 h-10 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active</p>
                  <p className="text-3xl font-bold text-green-600">{carrierStats.active}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">With Rates</p>
                  <p className="text-3xl font-bold text-blue-600">{carrierStats.withRates}</p>
                </div>
                <Package className="w-10 h-10 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">With Labels</p>
                  <p className="text-3xl font-bold text-purple-600">{carrierStats.withLabels}</p>
                </div>
                <Settings className="w-10 h-10 text-purple-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search carriers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={() => {
                  setEditingCarrier(null);
                  setShowCarrierModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Carrier
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                <div className="col-span-full text-center py-8 text-gray-500">
                  Loading carriers...
                </div>
              ) : filteredCarriers.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No carriers found
                </div>
              ) : (
                filteredCarriers.map((carrier) => (
                  <div
                    key={carrier.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{carrier.carrier_name}</h3>
                        <p className="text-sm text-gray-500 font-mono">{carrier.carrier_code}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        carrier.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {carrier.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <span className={`w-2 h-2 rounded-full ${carrier.supports_rates ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        <span className="text-gray-700">Live Rates</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className={`w-2 h-2 rounded-full ${carrier.supports_labels ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        <span className="text-gray-700">Label Generation</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className={`w-2 h-2 rounded-full ${carrier.supports_tracking ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        <span className="text-gray-700">Tracking</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => toggleCarrierStatus(carrier.id, carrier.is_active)}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          carrier.is_active
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        }`}
                      >
                        {carrier.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingCarrier(carrier);
                          setShowCarrierModal(true);
                        }}
                        className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteCarrier(carrier.id)}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {selectedShipment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Shipment Details</h3>
                <button
                  onClick={() => setSelectedShipment(null)}
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
                  <p className="mt-1 font-mono text-sm">{selectedShipment.tracking_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Order Number</label>
                  <p className="mt-1">{selectedShipment.orders?.order_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Carrier</label>
                  <p className="mt-1">{selectedShipment.carrier}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Current Status</label>
                  <p className="mt-1 capitalize">{selectedShipment.status}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Update Status</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateShipmentStatus(selectedShipment.id, 'in_transit')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Mark In Transit
                  </button>
                  <button
                    onClick={() => updateShipmentStatus(selectedShipment.id, 'delivered')}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Mark Delivered
                  </button>
                  <button
                    onClick={() => updateShipmentStatus(selectedShipment.id, 'delayed')}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Mark Delayed
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCarrierModal && (
        <CarrierModal
          carrier={editingCarrier}
          onClose={() => {
            setShowCarrierModal(false);
            setEditingCarrier(null);
          }}
          onSave={saveCarrier}
        />
      )}
    </div>
  );
}

interface CarrierModalProps {
  carrier: CarrierIntegration | null;
  onClose: () => void;
  onSave: (carrier: Partial<CarrierIntegration>) => void;
}

function CarrierModal({ carrier, onClose, onSave }: CarrierModalProps) {
  const [formData, setFormData] = useState<Partial<CarrierIntegration>>({
    carrier_name: carrier?.carrier_name || '',
    carrier_code: carrier?.carrier_code || '',
    api_endpoint: carrier?.api_endpoint || '',
    is_active: carrier?.is_active ?? true,
    supports_rates: carrier?.supports_rates ?? true,
    supports_labels: carrier?.supports_labels ?? true,
    supports_tracking: carrier?.supports_tracking ?? true,
    configuration: carrier?.configuration || {},
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">
              {carrier ? 'Edit Carrier' : 'Add New Carrier'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Carrier Name *
              </label>
              <input
                type="text"
                required
                value={formData.carrier_name}
                onChange={(e) => setFormData({ ...formData, carrier_name: e.target.value })}
                placeholder="e.g., DHL Express"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Carrier Code *
              </label>
              <input
                type="text"
                required
                value={formData.carrier_code}
                onChange={(e) => setFormData({ ...formData, carrier_code: e.target.value.toLowerCase() })}
                placeholder="e.g., dhl"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Endpoint
            </label>
            <input
              type="url"
              value={formData.api_endpoint}
              onChange={(e) => setFormData({ ...formData, api_endpoint: e.target.value })}
              placeholder="https://api.carrier.com/v1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Features</label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-5 h-5 text-emerald-500 rounded focus:ring-emerald-500"
              />
              <span className="text-sm text-gray-700">Active (Available to vendors)</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.supports_rates}
                onChange={(e) => setFormData({ ...formData, supports_rates: e.target.checked })}
                className="w-5 h-5 text-emerald-500 rounded focus:ring-emerald-500"
              />
              <span className="text-sm text-gray-700">Supports Live Rates</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.supports_labels}
                onChange={(e) => setFormData({ ...formData, supports_labels: e.target.checked })}
                className="w-5 h-5 text-emerald-500 rounded focus:ring-emerald-500"
              />
              <span className="text-sm text-gray-700">Supports Label Generation</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.supports_tracking}
                onChange={(e) => setFormData({ ...formData, supports_tracking: e.target.checked })}
                className="w-5 h-5 text-emerald-500 rounded focus:ring-emerald-500"
              />
              <span className="text-sm text-gray-700">Supports Tracking</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              {carrier ? 'Update Carrier' : 'Add Carrier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
