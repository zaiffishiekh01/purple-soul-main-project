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
  FileText
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface VendorWarehouseSupportProps {
  vendorId: string;
}

type ViewMode = 'overview' | 'requests' | 'shipments' | 'inventory' | 'metrics';

interface WarehouseRequest {
  id: string;
  vendor_id: string;
  request_type: 'SEASONAL' | 'YEAR_ROUND' | 'TRIAL';
  expected_inventory_value: number;
  expected_sku_count: number;
  product_categories: string[];
  estimated_arrival_date: string;
  campaign_duration_months: number;
  shipping_acknowledgment: boolean;
  shipping_to_warehouse_paid: boolean;
  return_shipping_option: 'RETURN_TO_ME' | 'LIQUIDATE' | 'DONATE';
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled';
  warehouse_address?: string;
  warehouse_contact_email?: string;
  warehouse_contact_phone?: string;
  arrival_deadline?: string;
  vendor_notes?: string;
  admin_notes?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export function VendorWarehouseSupportFixed({ vendorId }: VendorWarehouseSupportProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<WarehouseRequest[]>([]);
  const [inboundShipments, setInboundShipments] = useState<any[]>([]);
  const [warehouseInventory, setWarehouseInventory] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showASNForm, setShowASNForm] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    request_type: 'SEASONAL' as const,
    expected_inventory_value: '',
    expected_sku_count: '',
    product_categories: '',
    estimated_arrival_date: '',
    campaign_duration_months: '3',
    return_shipping_option: 'RETURN_TO_ME' as const,
    vendor_notes: ''
  });

  const [asnFormData, setASNFormData] = useState({
    warehouse_request_id: '',
    asn_number: '',
    tracking_number: '',
    carrier: 'UPS',
    expected_arrival_date: '',
    total_boxes: '',
    total_pallets: '',
    total_weight_lbs: '',
    total_value: '',
    fragile_items: false,
    temperature_controlled: false,
    hazmat_included: false
  });

  useEffect(() => {
    loadData();
  }, [vendorId, viewMode]);

  const loadData = async () => {
    setLoading(true);
    try {
      await fetchRequests();
      if (viewMode === 'shipments') await fetchInboundShipments();
      if (viewMode === 'inventory') await fetchWarehouseInventory();
      if (viewMode === 'metrics') await fetchMetrics();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('warehouse_requests')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (!error && data) setRequests(data);
  };

  const fetchInboundShipments = async () => {
    const { data, error } = await supabase
      .from('warehouse_inbound_shipments')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('expected_arrival_date', { ascending: false });

    if (!error && data) setInboundShipments(data);
  };

  const fetchWarehouseInventory = async () => {
    const { data, error } = await supabase
      .from('warehouse_inventory')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (!error && data) setWarehouseInventory(data);
  };

  const fetchMetrics = async () => {
    const { data, error} = await supabase
      .from('warehouse_performance_metrics')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('metric_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) setMetrics(data);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    const categories = formData.product_categories
      .split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0);

    const { error } = await supabase
      .from('warehouse_requests')
      .insert({
        vendor_id: vendorId,
        request_type: formData.request_type,
        expected_inventory_value: parseFloat(formData.expected_inventory_value),
        expected_sku_count: parseInt(formData.expected_sku_count),
        product_categories: categories,
        estimated_arrival_date: formData.estimated_arrival_date,
        campaign_duration_months: parseInt(formData.campaign_duration_months),
        return_shipping_option: formData.return_shipping_option,
        vendor_notes: formData.vendor_notes,
        shipping_acknowledgment: true,
        shipping_to_warehouse_paid: true,
        status: 'pending',
        priority_level: 'standard'
      });

    if (!error) {
      setShowRequestForm(false);
      setFormData({
        request_type: 'SEASONAL',
        expected_inventory_value: '',
        expected_sku_count: '',
        product_categories: '',
        estimated_arrival_date: '',
        campaign_duration_months: '3',
        return_shipping_option: 'RETURN_TO_ME',
        vendor_notes: ''
      });
      fetchRequests();
      alert('Storage request submitted successfully!');
    } else {
      alert('Error submitting request: ' + error.message);
    }
  };

  const handleSubmitASN = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase
      .from('warehouse_inbound_shipments')
      .insert({
        vendor_id: vendorId,
        warehouse_request_id: asnFormData.warehouse_request_id,
        asn_number: asnFormData.asn_number,
        tracking_number: asnFormData.tracking_number,
        carrier: asnFormData.carrier,
        expected_arrival_date: asnFormData.expected_arrival_date,
        total_boxes: parseInt(asnFormData.total_boxes),
        total_pallets: parseInt(asnFormData.total_pallets),
        total_weight_lbs: parseFloat(asnFormData.total_weight_lbs),
        total_value: parseFloat(asnFormData.total_value),
        fragile_items: asnFormData.fragile_items,
        temperature_controlled: asnFormData.temperature_controlled,
        hazmat_included: asnFormData.hazmat_included,
        status: 'scheduled',
        qr_code: `QR-${asnFormData.asn_number}`,
        sku_list: []
      });

    if (!error) {
      setShowASNForm(false);
      setASNFormData({
        warehouse_request_id: '',
        asn_number: '',
        tracking_number: '',
        carrier: 'UPS',
        expected_arrival_date: '',
        total_boxes: '',
        total_pallets: '',
        total_weight_lbs: '',
        total_value: '',
        fragile_items: false,
        temperature_controlled: false,
        hazmat_included: false
      });
      fetchInboundShipments();
      alert('ASN created successfully!');
    } else {
      alert('Error creating ASN: ' + error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' },
      active: { color: 'bg-blue-100 text-blue-800', icon: Package, label: 'Active' },
      completed: { color: 'bg-gray-100 text-gray-800', icon: CheckCircle, label: 'Completed' },
      cancelled: { color: 'bg-gray-100 text-gray-600', icon: XCircle, label: 'Cancelled' },
      scheduled: { color: 'bg-purple-100 text-purple-800', icon: Calendar, label: 'Scheduled' },
      in_transit: { color: 'bg-blue-100 text-blue-800', icon: TruckIcon, label: 'In Transit' },
      received: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Received' }
    };

    const badge = badges[status as keyof typeof badges] || badges.pending;
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
    const activeShipmentsCount = inboundShipments.filter(s => s.status === 'in_transit' || s.status === 'scheduled').length;
    const totalSKUs = warehouseInventory.length;
    const healthScore = metrics?.overall_health_score || 0;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-3xl font-bold text-gray-900">{requests.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Requests</p>
                <p className="text-3xl font-bold text-gray-900">{activeRequests.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Shipments</p>
                <p className="text-3xl font-bold text-gray-900">{activeShipmentsCount}</p>
              </div>
              <TruckIcon className="h-8 w-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Stored SKUs</p>
                <p className="text-3xl font-bold text-gray-900">{totalSKUs}</p>
              </div>
              <Box className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {healthScore > 0 && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Warehouse Health Score</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                    style={{ width: `${healthScore}%` }}
                  />
                </div>
              </div>
              <span className="text-2xl font-bold text-gray-900">{healthScore}/100</span>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Recent Requests</h3>
          {requests.slice(0, 3).map(request => (
            <div key={request.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
              <div>
                <p className="font-medium">{request.request_type} Storage</p>
                <p className="text-sm text-gray-600">{request.expected_sku_count} SKUs</p>
              </div>
              {getStatusBadge(request.status)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRequests = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Storage Requests</h3>
        <button
          onClick={() => setShowRequestForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Request
        </button>
      </div>

      {showRequestForm && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="text-lg font-semibold mb-4">Create Storage Request</h4>
          <form onSubmit={handleSubmitRequest} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Request Type</label>
                <select
                  value={formData.request_type}
                  onChange={(e) => setFormData({ ...formData, request_type: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="SEASONAL">Seasonal</option>
                  <option value="YEAR_ROUND">Year Round</option>
                  <option value="TRIAL">Trial</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected SKU Count</label>
                <input
                  type="number"
                  value={formData.expected_sku_count}
                  onChange={(e) => setFormData({ ...formData, expected_sku_count: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Inventory Value ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.expected_inventory_value}
                  onChange={(e) => setFormData({ ...formData, expected_inventory_value: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Duration (months)</label>
                <input
                  type="number"
                  value={formData.campaign_duration_months}
                  onChange={(e) => setFormData({ ...formData, campaign_duration_months: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Arrival Date</label>
                <input
                  type="date"
                  value={formData.estimated_arrival_date}
                  onChange={(e) => setFormData({ ...formData, estimated_arrival_date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Return Shipping Option</label>
                <select
                  value={formData.return_shipping_option}
                  onChange={(e) => setFormData({ ...formData, return_shipping_option: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="RETURN_TO_ME">Return to Me</option>
                  <option value="LIQUIDATE">Liquidate</option>
                  <option value="DONATE">Donate</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Categories (comma-separated)</label>
                <input
                  type="text"
                  value={formData.product_categories}
                  onChange={(e) => setFormData({ ...formData, product_categories: e.target.value })}
                  placeholder="e.g., Electronics, Accessories, Tools"
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  value={formData.vendor_notes}
                  onChange={(e) => setFormData({ ...formData, vendor_notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowRequestForm(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {requests.map(request => (
          <div key={request.id} className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold">{request.request_type} Storage Request</h4>
                <p className="text-sm text-gray-600">
                  {request.expected_sku_count} SKUs • ${request.expected_inventory_value.toLocaleString()}
                </p>
              </div>
              {getStatusBadge(request.status)}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">Arrival Date</p>
                <p className="text-sm font-medium">{new Date(request.estimated_arrival_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Duration</p>
                <p className="text-sm font-medium">{request.campaign_duration_months} months</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Return Option</p>
                <p className="text-sm font-medium">{request.return_shipping_option.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Categories</p>
                <p className="text-sm font-medium">{request.product_categories.join(', ')}</p>
              </div>
            </div>

            {request.status === 'approved' && request.warehouse_address && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-green-800 mb-2">Warehouse Address:</p>
                <p className="text-sm text-green-700">{request.warehouse_address}</p>
                <p className="text-sm text-green-700">{request.warehouse_contact_email}</p>
                <p className="text-sm text-green-700">{request.warehouse_contact_phone}</p>
              </div>
            )}

            {request.admin_notes && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-2">
                <p className="text-sm font-semibold text-blue-800 mb-1">Admin Notes:</p>
                <p className="text-sm text-blue-700">{request.admin_notes}</p>
              </div>
            )}

            {request.rejection_reason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-2">
                <p className="text-sm font-semibold text-red-800 mb-1">Rejection Reason:</p>
                <p className="text-sm text-red-700">{request.rejection_reason}</p>
              </div>
            )}
          </div>
        ))}

        {requests.length === 0 && !showRequestForm && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No storage requests yet</p>
            <button
              onClick={() => setShowRequestForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Your First Request
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderShipments = () => {
    const approvedRequests = requests.filter(r => r.status === 'approved' || r.status === 'active');

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Inbound Shipments</h3>
          {approvedRequests.length > 0 && (
            <button
              onClick={() => setShowASNForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create ASN
            </button>
          )}
        </div>

        {showASNForm && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h4 className="text-lg font-semibold mb-4">Create Advanced Shipping Notice (ASN)</h4>
            <form onSubmit={handleSubmitASN} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Storage Request</label>
                  <select
                    value={asnFormData.warehouse_request_id}
                    onChange={(e) => setASNFormData({ ...asnFormData, warehouse_request_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Select a request</option>
                    {approvedRequests.map(req => (
                      <option key={req.id} value={req.id}>
                        {req.request_type} - {req.expected_sku_count} SKUs
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ASN Number</label>
                  <input
                    type="text"
                    value={asnFormData.asn_number}
                    onChange={(e) => setASNFormData({ ...asnFormData, asn_number: e.target.value })}
                    placeholder="ASN-2026-001"
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
                  <input
                    type="text"
                    value={asnFormData.tracking_number}
                    onChange={(e) => setASNFormData({ ...asnFormData, tracking_number: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Carrier</label>
                  <select
                    value={asnFormData.carrier}
                    onChange={(e) => setASNFormData({ ...asnFormData, carrier: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="UPS">UPS</option>
                    <option value="FedEx">FedEx</option>
                    <option value="USPS">USPS</option>
                    <option value="DHL">DHL</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Arrival</label>
                  <input
                    type="date"
                    value={asnFormData.expected_arrival_date}
                    onChange={(e) => setASNFormData({ ...asnFormData, expected_arrival_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Boxes</label>
                  <input
                    type="number"
                    value={asnFormData.total_boxes}
                    onChange={(e) => setASNFormData({ ...asnFormData, total_boxes: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Pallets</label>
                  <input
                    type="number"
                    value={asnFormData.total_pallets}
                    onChange={(e) => setASNFormData({ ...asnFormData, total_pallets: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Weight (lbs)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={asnFormData.total_weight_lbs}
                    onChange={(e) => setASNFormData({ ...asnFormData, total_weight_lbs: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Value ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={asnFormData.total_value}
                    onChange={(e) => setASNFormData({ ...asnFormData, total_value: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                    min="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={asnFormData.fragile_items}
                    onChange={(e) => setASNFormData({ ...asnFormData, fragile_items: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Contains Fragile Items</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={asnFormData.temperature_controlled}
                    onChange={(e) => setASNFormData({ ...asnFormData, temperature_controlled: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Requires Temperature Control</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={asnFormData.hazmat_included}
                    onChange={(e) => setASNFormData({ ...asnFormData, hazmat_included: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Contains Hazardous Materials</span>
                </label>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowASNForm(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create ASN
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid gap-4">
          {inboundShipments.map(shipment => (
            <div key={shipment.id} className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold">ASN: {shipment.asn_number}</h4>
                  <p className="text-sm text-gray-600">Tracking: {shipment.tracking_number}</p>
                </div>
                {getStatusBadge(shipment.status)}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Carrier</p>
                  <p className="text-sm font-medium">{shipment.carrier}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Expected Arrival</p>
                  <p className="text-sm font-medium">
                    {new Date(shipment.expected_arrival_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Boxes/Pallets</p>
                  <p className="text-sm font-medium">{shipment.total_boxes} / {shipment.total_pallets}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Value</p>
                  <p className="text-sm font-medium">${shipment.total_value?.toLocaleString()}</p>
                </div>
              </div>

              {(shipment.fragile_items || shipment.temperature_controlled || shipment.hazmat_included) && (
                <div className="flex gap-2 mt-4">
                  {shipment.fragile_items && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Fragile</span>
                  )}
                  {shipment.temperature_controlled && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Temp Control</span>
                  )}
                  {shipment.hazmat_included && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">HAZMAT</span>
                  )}
                </div>
              )}

              {shipment.qr_code && (
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                  <QrCode className="h-4 w-4" />
                  <span>QR Code: {shipment.qr_code}</span>
                </div>
              )}
            </div>
          ))}

          {inboundShipments.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <TruckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No inbound shipments yet</p>
              {approvedRequests.length > 0 ? (
                <button
                  onClick={() => setShowASNForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Your First ASN
                </button>
              ) : (
                <p className="text-sm text-gray-500">You need an approved storage request first</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderInventory = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Warehouse Inventory</h3>

      {warehouseInventory.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sold</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {warehouseInventory.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.product_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.quantity_received}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.quantity_sold}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {item.quantity_remaining}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        {item.location_in_warehouse}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Box className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No inventory stored yet</p>
          <p className="text-sm text-gray-500 mt-2">Your inventory will appear here once shipments are received</p>
        </div>
      )}
    </div>
  );

  const renderMetrics = () => {
    if (!metrics) {
      return (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No performance metrics available yet</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Performance Metrics</h3>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="font-semibold mb-4">Overall Health Score</h4>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                  style={{ width: `${metrics.overall_health_score}%` }}
                />
              </div>
            </div>
            <span className="text-2xl font-bold">{metrics.overall_health_score}/100</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total SKUs Stored</p>
            <p className="text-2xl font-bold">{metrics.total_skus_stored}</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total Units</p>
            <p className="text-2xl font-bold">{metrics.total_units_stored}</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total Value</p>
            <p className="text-2xl font-bold">${metrics.total_value_stored?.toLocaleString()}</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Inventory Turnover</p>
            <p className="text-2xl font-bold">{metrics.inventory_turnover_ratio}x</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Receiving Accuracy</p>
            <p className="text-2xl font-bold">{metrics.receiving_accuracy_percentage}%</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Order Accuracy</p>
            <p className="text-2xl font-bold">{metrics.order_accuracy_percentage}%</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="font-semibold mb-4">Cost Breakdown</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Storage Cost</span>
              <span className="font-semibold">${metrics.storage_cost?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Handling Cost</span>
              <span className="font-semibold">${metrics.handling_cost?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Shipping to Warehouse</span>
              <span className="font-semibold">${metrics.shipping_cost_to_warehouse?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t">
              <span className="font-semibold">Total Cost</span>
              <span className="text-lg font-bold">
                ${((metrics.storage_cost || 0) + (metrics.handling_cost || 0) + (metrics.shipping_cost_to_warehouse || 0)).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
          <h1 className="text-3xl font-bold">US Warehouse Management</h1>
        </div>
        <p className="text-blue-100">
          Track inventory, manage shipments, and monitor performance for your US warehouse storage
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
            Storage Requests
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
            Inbound Shipments
          </button>
          <button
            onClick={() => setViewMode('inventory')}
            className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 whitespace-nowrap ${
              viewMode === 'inventory'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Package className="h-5 w-5" />
            Warehouse Inventory
          </button>
          <button
            onClick={() => setViewMode('metrics')}
            className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 whitespace-nowrap ${
              viewMode === 'metrics'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="h-5 w-5" />
            Performance
          </button>
        </div>
      </div>

      <div>
        {viewMode === 'overview' && renderOverview()}
        {viewMode === 'requests' && renderRequests()}
        {viewMode === 'shipments' && renderShipments()}
        {viewMode === 'inventory' && renderInventory()}
        {viewMode === 'metrics' && renderMetrics()}
      </div>
    </div>
  );
}
