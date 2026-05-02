import { useState, useEffect } from 'react';
import {
  Warehouse,
  Package,
  TruckIcon,
  CheckCircle,
  XCircle,
  Clock,
  Info,
  BarChart3,
  MapPin,
  Calendar,
  Box,
  DollarSign,
  FileText,
  AlertCircle
} from 'lucide-react';
import { dashboardClient } from '../lib/data-client';

interface VendorWarehouseViewOnlyProps {
  vendorId: string;
}

type ViewMode = 'overview' | 'requests' | 'shipments' | 'inventory';

interface WarehouseRequest {
  id: string;
  request_type: string;
  expected_inventory_value: number;
  expected_sku_count: number;
  product_categories: string[];
  estimated_arrival_date: string;
  campaign_duration_months: number;
  return_shipping_option: string;
  status: string;
  storage_plan_id?: string;
  estimated_monthly_storage_cost?: number;
  estimated_space_cubic_feet?: number;
  estimated_pallet_count?: number;
  warehouse_address?: string;
  warehouse_contact_email?: string;
  warehouse_contact_phone?: string;
  arrival_deadline?: string;
  vendor_notes?: string;
  admin_notes?: string;
  rejection_reason?: string;
  created_at: string;
  warehouse_storage_plans?: any;
}

export function VendorWarehouseViewOnly({ vendorId }: VendorWarehouseViewOnlyProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<WarehouseRequest[]>([]);
  const [inboundShipments, setInboundShipments] = useState<any[]>([]);
  const [warehouseInventory, setWarehouseInventory] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [vendorId, viewMode]);

  const loadData = async () => {
    setLoading(true);
    try {
      await fetchRequests();
      if (viewMode === 'shipments') await fetchInboundShipments();
      if (viewMode === 'inventory') await fetchWarehouseInventory();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    const { data, error } = await dashboardClient
      .from('warehouse_requests')
      .select('*, warehouse_storage_plans(*)')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (!error && data) setRequests(data);
  };

  const fetchInboundShipments = async () => {
    const { data, error } = await dashboardClient
      .from('warehouse_inbound_shipments')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('expected_arrival_date', { ascending: false });

    if (!error && data) setInboundShipments(data);
  };

  const fetchWarehouseInventory = async () => {
    const { data, error } = await dashboardClient
      .from('warehouse_inventory')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (!error && data) setWarehouseInventory(data);
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, any> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending Review' },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' },
      active: { color: 'bg-blue-100 text-blue-800', icon: Package, label: 'Active' },
      completed: { color: 'bg-gray-100 text-gray-800', icon: CheckCircle, label: 'Completed' },
      cancelled: { color: 'bg-gray-100 text-gray-600', icon: XCircle, label: 'Cancelled' }
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="h-3 w-3" />
        {badge.label}
      </span>
    );
  };

  const renderOverview = () => {
    const activeRequests = requests.filter(r => r.status === 'active');
    const pendingRequests = requests.filter(r => r.status === 'pending');
    const totalEstimatedCost = activeRequests.reduce((sum, r) => sum + (r.estimated_monthly_storage_cost || 0), 0);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Storage</p>
                <p className="text-2xl font-bold">{activeRequests.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold">{pendingRequests.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Monthly Storage Cost</p>
                <p className="text-2xl font-bold">${totalEstimatedCost.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Info className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Warehouse Storage Information</h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p>• All warehouse storage requests are managed by the admin team</p>
                <p>• You will receive notifications when your requests are approved or when action is needed</p>
                <p>• Once approved, you'll see warehouse contact details and shipping instructions</p>
                <p>• For new storage requests, please contact support or your account manager</p>
              </div>
            </div>
          </div>
        </div>

        {activeRequests.length > 0 && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Active Storage Locations</h3>
            <div className="space-y-4">
              {activeRequests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{request.request_type} Storage</h4>
                      <p className="text-sm text-gray-600">
                        {request.expected_sku_count} SKUs • {request.estimated_space_cubic_feet} cu ft
                      </p>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>

                  {request.warehouse_address && (
                    <div className="bg-green-50 border border-green-200 rounded p-3 space-y-1">
                      <div className="flex items-center gap-2 text-sm font-semibold text-green-800">
                        <MapPin className="h-4 w-4" />
                        <span>Warehouse Location</span>
                      </div>
                      <p className="text-sm text-green-700">{request.warehouse_address}</p>
                      <p className="text-sm text-green-700">{request.warehouse_contact_email}</p>
                      <p className="text-sm text-green-700">{request.warehouse_contact_phone}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRequests = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">My Storage Requests</h3>
          <p className="text-sm text-gray-600">View your warehouse storage requests and their status</p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Storage Requests Yet</h3>
          <p className="text-gray-600 mb-4">
            Contact your account manager or support team to request warehouse storage
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <div key={request.id} className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold">{request.request_type} Storage Request</h4>
                    {getStatusBadge(request.status)}
                  </div>
                  <p className="text-sm text-gray-600">
                    {request.expected_sku_count} SKUs • ${request.expected_inventory_value.toLocaleString()}
                  </p>
                  {request.warehouse_storage_plans && (
                    <p className="text-sm text-blue-600 font-medium mt-1">
                      Plan: {request.warehouse_storage_plans.plan_name}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Storage Space</p>
                  <p className="text-sm font-medium">
                    {request.estimated_space_cubic_feet ? `${request.estimated_space_cubic_feet} cu ft` : 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Pallets</p>
                  <p className="text-sm font-medium">{request.estimated_pallet_count || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="text-sm font-medium">{request.campaign_duration_months} months</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Est. Monthly Cost</p>
                  <p className="text-sm font-medium text-green-700">
                    ${request.estimated_monthly_storage_cost?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>

              {request.status === 'pending' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <Clock className="h-4 w-4" />
                    <p className="text-sm font-medium">Request is being reviewed by the admin team</p>
                  </div>
                </div>
              )}

              {request.status === 'approved' && request.warehouse_address && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-sm font-semibold text-green-800 mb-2">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Warehouse Details
                  </p>
                  <div className="space-y-1 text-sm text-green-700">
                    <p><strong>Address:</strong> {request.warehouse_address}</p>
                    <p><strong>Email:</strong> {request.warehouse_contact_email}</p>
                    <p><strong>Phone:</strong> {request.warehouse_contact_phone}</p>
                    {request.arrival_deadline && (
                      <p><strong>Arrival Deadline:</strong> {new Date(request.arrival_deadline).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              )}

              {request.status === 'rejected' && request.rejection_reason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-800">Request Rejected</p>
                      <p className="text-sm text-red-700">{request.rejection_reason}</p>
                    </div>
                  </div>
                </div>
              )}

              {request.vendor_notes && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-gray-500 mb-1">Your Notes:</p>
                  <p className="text-sm text-gray-700">{request.vendor_notes}</p>
                </div>
              )}

              {request.admin_notes && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Admin Notes:</p>
                  <p className="text-sm text-gray-700">{request.admin_notes}</p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  Created: {new Date(request.created_at).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-500">
                  Estimated Arrival: {new Date(request.estimated_arrival_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderShipments = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Inbound Shipments</h3>
      {inboundShipments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <TruckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No inbound shipments</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {inboundShipments.map((shipment) => (
            <div key={shipment.id} className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold">ASN: {shipment.asn_number}</h4>
                  <p className="text-sm text-gray-600">
                    Tracking: {shipment.tracking_number} • {shipment.carrier}
                  </p>
                </div>
                {getStatusBadge(shipment.status)}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Boxes/Pallets</p>
                  <p className="text-sm font-medium">{shipment.total_boxes || 0} / {shipment.total_pallets || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Weight</p>
                  <p className="text-sm font-medium">{shipment.total_weight_lbs} lbs</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Expected Arrival</p>
                  <p className="text-sm font-medium">
                    {new Date(shipment.expected_arrival_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderInventory = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Warehouse Inventory</h3>
      {warehouseInventory.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Box className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No inventory in warehouse</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {warehouseInventory.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold">{item.sku}</h4>
                  <p className="text-sm text-gray-600">{item.product_name}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  item.quantity_available > 10 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {item.quantity_available} units
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="text-sm font-medium">{item.warehouse_location || 'Not assigned'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Received Date</p>
                  <p className="text-sm font-medium">
                    {item.received_date ? new Date(item.received_date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Condition</p>
                  <p className="text-sm font-medium">{item.condition || 'Good'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading warehouse data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-lg p-8 mb-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Warehouse className="h-8 w-8" />
          <h1 className="text-3xl font-bold">US Warehouse Storage</h1>
        </div>
        <p className="text-blue-100">
          View your warehouse storage requests and inventory
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex overflow-x-auto">
          <button
            onClick={() => setViewMode('overview')}
            className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 whitespace-nowrap ${
              viewMode === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Info className="h-5 w-5" />
            Overview
          </button>
          <button
            onClick={() => setViewMode('requests')}
            className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 whitespace-nowrap ${
              viewMode === 'requests'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="h-5 w-5" />
            My Requests
            {requests.filter(r => r.status === 'pending').length > 0 && (
              <span className="bg-yellow-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {requests.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setViewMode('shipments')}
            className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 whitespace-nowrap ${
              viewMode === 'shipments'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <TruckIcon className="h-5 w-5" />
            Shipments
          </button>
          <button
            onClick={() => setViewMode('inventory')}
            className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 whitespace-nowrap ${
              viewMode === 'inventory'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Box className="h-5 w-5" />
            Inventory
          </button>
        </div>
      </div>

      <div>
        {viewMode === 'overview' && renderOverview()}
        {viewMode === 'requests' && renderRequests()}
        {viewMode === 'shipments' && renderShipments()}
        {viewMode === 'inventory' && renderInventory()}
      </div>
    </div>
  );
}
