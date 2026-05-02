import { useState, useEffect } from 'react';
import {
  Warehouse,
  Package,
  TruckIcon,
  CheckCircle,
  XCircle,
  Clock,
  Info,
  Plus,
  BarChart3,
  Upload,
  MapPin,
  Calendar,
  Box,
  QrCode,
  FileUp,
  ExternalLink,
  AlertTriangle,
  Truck,
  FileText,
  Download
} from 'lucide-react';
import { dashboardClient } from '../lib/data-client';
import { WarehouseRequest, WarehouseRequestType } from '../types';

interface VendorWarehouseSupportProps {
  vendorId: string;
}

type ViewMode = 'overview' | 'requests' | 'shipments' | 'inventory' | 'metrics';

export function VendorWarehouseSupportEnhanced({ vendorId }: VendorWarehouseSupportProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<WarehouseRequest[]>([]);
  const [inboundShipments, setInboundShipments] = useState<any[]>([]);
  const [warehouseInventory, setWarehouseInventory] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showASNForm, setShowASNForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<WarehouseRequest | null>(null);

  useEffect(() => {
    loadData();
  }, [vendorId, viewMode]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchRequests(),
        viewMode === 'shipments' && fetchInboundShipments(),
        viewMode === 'inventory' && fetchWarehouseInventory(),
        viewMode === 'metrics' && fetchMetrics()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    const { data, error } = await dashboardClient
      .from('warehouse_requests')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (!error) setRequests(data || []);
  };

  const fetchInboundShipments = async () => {
    const { data, error } = await dashboardClient
      .from('warehouse_inbound_shipments')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('expected_arrival_date', { ascending: false });

    if (!error) setInboundShipments(data || []);
  };

  const fetchWarehouseInventory = async () => {
    const { data, error } = await dashboardClient
      .from('warehouse_inventory')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false});

    if (!error) setWarehouseInventory(data || []);
  };

  const fetchMetrics = async () => {
    const { data, error } = await dashboardClient
      .from('warehouse_performance_metrics')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('metric_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error) setMetrics(data);
  };

  const getApprovedRequests = () => requests.filter(r => r.status === 'approved' || r.status === 'active');

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Warehouse className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">US Warehouse Management</h2>
            <p className="text-blue-50 mb-4">
              Track your inventory, manage shipments, and monitor performance with real-time visibility into warehouse operations.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-2xl font-bold">{requests.length}</div>
                <div className="text-xs text-blue-100">Total Requests</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-2xl font-bold">{inboundShipments.length}</div>
                <div className="text-xs text-blue-100">Active Shipments</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-2xl font-bold">{warehouseInventory.length}</div>
                <div className="text-xs text-blue-100">SKUs Stored</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-2xl font-bold">{metrics?.overall_health_score || 'N/A'}</div>
                <div className="text-xs text-blue-100">Health Score</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-100">
          <div className="flex overflow-x-auto">
            {[
              { key: 'overview', label: 'Overview', icon: Info },
              { key: 'requests', label: 'Storage Requests', icon: FileText },
              { key: 'shipments', label: 'Inbound Shipments', icon: TruckIcon },
              { key: 'inventory', label: 'Warehouse Inventory', icon: Package },
              { key: 'metrics', label: 'Performance', icon: BarChart3 }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setViewMode(tab.key as ViewMode)}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  viewMode === tab.key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {viewMode === 'overview' && <OverviewTab requests={requests} shipments={inboundShipments} inventory={warehouseInventory} metrics={metrics} />}
              {viewMode === 'requests' && (
                <RequestsTab
                  requests={requests}
                  vendorId={vendorId}
                  showRequestForm={showRequestForm}
                  setShowRequestForm={setShowRequestForm}
                  onRequestCreated={loadData}
                />
              )}
              {viewMode === 'shipments' && (
                <ShipmentsTab
                  shipments={inboundShipments}
                  requests={getApprovedRequests()}
                  vendorId={vendorId}
                  showASNForm={showASNForm}
                  setShowASNForm={setShowASNForm}
                  onShipmentCreated={loadData}
                />
              )}
              {viewMode === 'inventory' && <InventoryTab inventory={warehouseInventory} />}
              {viewMode === 'metrics' && <MetricsTab metrics={metrics} vendorId={vendorId} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ requests, shipments, inventory, metrics }: any) {
  const activeRequests = requests.filter((r: any) => r.status === 'approved' || r.status === 'active');
  const pendingShipments = shipments.filter((s: any) => s.status === 'in_transit' || s.status === 'scheduled');

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-green-900">Active Storage</h3>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-900">{activeRequests.length}</div>
          <div className="text-sm text-green-700">Active warehouse requests</div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-blue-900">In Transit</h3>
            <Truck className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-blue-900">{pendingShipments.length}</div>
          <div className="text-sm text-blue-700">Shipments on the way</div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">Stored SKUs</h3>
            <Package className="w-5 h-5 text-gray-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{inventory.length}</div>
          <div className="text-sm text-gray-700">Items in warehouse</div>
        </div>
      </div>

      {metrics && (
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-4">Latest Performance Metrics</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <MetricCard label="Health Score" value={metrics.overall_health_score} suffix="/100" />
            <MetricCard label="Total Value" value={`$${metrics.total_value_stored?.toLocaleString() || 0}`} />
            <MetricCard label="Turnover Ratio" value={metrics.inventory_turnover_ratio?.toFixed(2) || '0'} />
            <MetricCard label="On-Time %" value={`${metrics.on_time_shipment_percentage || 0}%`} />
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-900 mb-1">Free Storage Program</p>
            <p className="text-sm text-blue-800">
              Store your inventory in our US warehouse at no cost. You only pay for shipping TO and FROM the warehouse.
              Submit a storage request to get started.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, suffix = '' }: { label: string; value: any; suffix?: string }) {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="text-2xl font-bold text-gray-900">{value}{suffix}</div>
      <div className="text-xs text-gray-600 mt-1">{label}</div>
    </div>
  );
}

interface RequestsTabProps {
  requests: WarehouseRequest[];
  vendorId: string;
  showRequestForm: boolean;
  setShowRequestForm: (show: boolean) => void;
  onRequestCreated: () => void;
}

function RequestsTab({ requests, vendorId, showRequestForm, setShowRequestForm, onRequestCreated }: RequestsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900">Your Storage Requests</h3>
        {!showRequestForm && (
          <button
            onClick={() => setShowRequestForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            New Request
          </button>
        )}
      </div>

      {showRequestForm ? (
        <RequestFormPlaceholder
          vendorId={vendorId}
          onCancel={() => setShowRequestForm(false)}
          onSuccess={() => {
            setShowRequestForm(false);
            onRequestCreated();
          }}
        />
      ) : requests.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Warehouse className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium mb-2">No warehouse requests yet</p>
          <p className="text-sm mb-4">Submit your first request to start storing inventory in our US warehouse</p>
          <button
            onClick={() => setShowRequestForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Create First Request
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <RequestCardEnhanced key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  );
}

function RequestCardEnhanced({ request }: { request: WarehouseRequest }) {
  const getStatusBadge = () => {
    const statusConfig = {
      pending: { color: 'yellow', icon: Clock, label: 'Pending Review' },
      approved: { color: 'green', icon: CheckCircle, label: 'Approved' },
      active: { color: 'blue', icon: CheckCircle, label: 'Active' },
      rejected: { color: 'red', icon: XCircle, label: 'Rejected' },
      completed: { color: 'gray', icon: CheckCircle, label: 'Completed' },
      cancelled: { color: 'gray', icon: XCircle, label: 'Cancelled' }
    };

    const config = statusConfig[request.status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-${config.color}-100 text-${config.color}-700 border border-${config.color}-200`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="p-5 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all bg-white">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="font-semibold text-gray-900">
              {request.request_type.replace('_', ' ')} Request
            </h4>
            {getStatusBadge()}
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>{request.expected_sku_count}</strong> SKUs · <strong>${request.expected_inventory_value.toLocaleString()}</strong> value</p>
            <p>Duration: <strong>{request.campaign_duration_months} months</strong></p>
            {request.product_categories && request.product_categories.length > 0 && (
              <p>Categories: {Array.isArray(request.product_categories) ? request.product_categories.join(', ') : request.product_categories}</p>
            )}
          </div>
        </div>
      </div>

      {(request.status === 'approved' || request.status === 'active') && request.warehouse_address && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-2 mb-2">
            <MapPin className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-green-900 text-sm mb-1">Ship to this address:</p>
              <p className="text-sm text-green-800 whitespace-pre-line">{request.warehouse_address}</p>
            </div>
          </div>
          {request.warehouse_contact_email && (
            <p className="text-sm text-green-800 mt-2">Contact: {request.warehouse_contact_email}</p>
          )}
          {request.arrival_deadline && (
            <div className="flex items-center gap-2 mt-2 text-sm text-green-800">
              <Calendar className="w-4 h-4" />
              <span>Arrival Deadline: {new Date(request.arrival_deadline).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      )}

      {request.status === 'rejected' && request.rejection_reason && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
          <p className="font-semibold text-red-900 mb-1">Rejection Reason:</p>
          <p className="text-red-800">{request.rejection_reason}</p>
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500">
        Submitted: {new Date(request.created_at).toLocaleDateString()}
      </div>
    </div>
  );
}

function ShipmentsTab({ shipments, requests, vendorId, showASNForm, setShowASNForm, onShipmentCreated }: any) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900">Inbound Shipments</h3>
        {requests.length > 0 && !showASNForm && (
          <button
            onClick={() => setShowASNForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Create ASN
          </button>
        )}
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12 bg-yellow-50 border border-yellow-200 rounded-xl">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-yellow-600" />
          <p className="text-yellow-900 font-medium">No approved storage requests</p>
          <p className="text-sm text-yellow-700 mt-1">You need an approved storage request before creating shipments</p>
        </div>
      ) : showASNForm ? (
        <ASNFormPlaceholder
          vendorId={vendorId}
          requests={requests}
          onCancel={() => setShowASNForm(false)}
          onSuccess={() => {
            setShowASNForm(false);
            onShipmentCreated();
          }}
        />
      ) : shipments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <TruckIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium mb-2">No inbound shipments</p>
          <p className="text-sm mb-4">Create an Advanced Shipping Notice (ASN) when you ship inventory to the warehouse</p>
          <button
            onClick={() => setShowASNForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Create First ASN
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {shipments.map((shipment: any) => (
            <ShipmentCard key={shipment.id} shipment={shipment} />
          ))}
        </div>
      )}
    </div>
  );
}

function ShipmentCard({ shipment }: any) {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: 'gray',
      in_transit: 'blue',
      arrived: 'green',
      receiving: 'yellow',
      received: 'green',
      rejected: 'red',
      cancelled: 'gray'
    };
    return colors[status] || 'gray';
  };

  const color = getStatusColor(shipment.status);

  return (
    <div className="p-5 border border-gray-200 rounded-xl bg-white hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="font-semibold text-gray-900">ASN: {shipment.asn_number}</h4>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-${color}-100 text-${color}-700`}>
              {shipment.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            {shipment.carrier && <p>Carrier: <strong>{shipment.carrier}</strong></p>}
            {shipment.tracking_number && (
              <p className="flex items-center gap-2">
                Tracking: <strong>{shipment.tracking_number}</strong>
                {shipment.carrier_tracking_url && (
                  <a href={shipment.carrier_tracking_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </p>
            )}
            <p>Expected: <strong>{new Date(shipment.expected_arrival_date).toLocaleDateString()}</strong></p>
            {shipment.actual_arrival_date && (
              <p>Arrived: <strong>{new Date(shipment.actual_arrival_date).toLocaleDateString()}</strong></p>
            )}
            <p>{shipment.total_boxes} boxes · {shipment.total_weight_lbs || 'N/A'} lbs</p>
          </div>
        </div>
        {shipment.qr_code && (
          <div className="p-2 bg-gray-100 rounded-lg">
            <QrCode className="w-12 h-12 text-gray-600" />
          </div>
        )}
      </div>

      {(shipment.hazmat_included || shipment.temperature_controlled || shipment.fragile_items) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {shipment.hazmat_included && (
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">HAZMAT</span>
          )}
          {shipment.temperature_controlled && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">Climate Control</span>
          )}
          {shipment.fragile_items && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">Fragile</span>
          )}
        </div>
      )}
    </div>
  );
}

function InventoryTab({ inventory }: any) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-gray-900">Warehouse Inventory</h3>

      {inventory.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Box className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium mb-2">No inventory stored</p>
          <p className="text-sm">Your inventory will appear here once received at the warehouse</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">SKU</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Product</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Received</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Sold</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Remaining</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {inventory.map((item: any) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.sku}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.product_name}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-700">{item.quantity_received}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-700">{item.quantity_sold}</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{item.quantity_remaining}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.location_in_warehouse || 'Pending'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function MetricsTab({ metrics, vendorId }: any) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-gray-900">Performance Metrics</h3>

      {!metrics ? (
        <div className="text-center py-12 text-gray-500">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium mb-2">No metrics available yet</p>
          <p className="text-sm">Performance data will be generated once you have active warehouse operations</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-semibold text-blue-900 mb-3">Inventory Overview</h4>
              <div className="space-y-2">
                <MetricRow label="Total SKUs" value={metrics.total_skus_stored} />
                <MetricRow label="Total Units" value={metrics.total_units_stored} />
                <MetricRow label="Total Value" value={`$${metrics.total_value_stored?.toLocaleString() || 0}`} />
                <MetricRow label="Space Used" value={`${metrics.space_utilized_sqft || 0} sq ft`} />
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h4 className="font-semibold text-green-900 mb-3">Accuracy Metrics</h4>
              <div className="space-y-2">
                <MetricRow label="Receiving Accuracy" value={`${metrics.receiving_accuracy_percentage || 0}%`} />
                <MetricRow label="Order Accuracy" value={`${metrics.order_accuracy_percentage || 0}%`} />
                <MetricRow label="Damage Rate" value={`${metrics.damage_rate_percentage || 0}%`} />
                <MetricRow label="On-Time Shipment" value={`${metrics.on_time_shipment_percentage || 0}%`} />
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Cost Breakdown</h4>
              <div className="space-y-2">
                <MetricRow label="Storage Cost" value={`$${metrics.storage_cost || 0}`} />
                <MetricRow label="Handling Cost" value={`$${metrics.handling_cost || 0}`} />
                <MetricRow label="Inbound Shipping" value={`$${metrics.shipping_cost_to_warehouse || 0}`} />
                <MetricRow label="Return Shipping" value={`$${metrics.return_shipping_cost || 0}`} />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-gray-900">Overall Health Score</h4>
              <div className="text-3xl font-bold text-blue-600">{metrics.overall_health_score}/100</div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all"
                style={{ width: `${metrics.overall_health_score}%` }}
              ></div>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            Metrics calculated on: {new Date(metrics.metric_date).toLocaleDateString()}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-700">{label}:</span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
}

function RequestFormPlaceholder({ vendorId, onCancel, onSuccess }: any) {
  return (
    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
      <p className="text-gray-600">Request form implementation (use existing VendorWarehouseSupport RequestForm component)</p>
      <div className="mt-4 flex gap-3 justify-center">
        <button onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg">Cancel</button>
        <button onClick={onSuccess} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Simulate Submit</button>
      </div>
    </div>
  );
}

function ASNFormPlaceholder({ vendorId, requests, onCancel, onSuccess }: any) {
  return (
    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
      <p className="text-gray-600">ASN form implementation (create shipment with tracking, documents, etc.)</p>
      <div className="mt-4 flex gap-3 justify-center">
        <button onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg">Cancel</button>
        <button onClick={onSuccess} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Simulate Submit</button>
      </div>
    </div>
  );
}
