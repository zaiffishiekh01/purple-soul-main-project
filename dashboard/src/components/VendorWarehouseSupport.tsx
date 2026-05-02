import { useState, useEffect } from 'react';
import {
  Warehouse,
  Package,
  TruckIcon,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Info,
  Plus,
  FileText,
  BarChart3,
  Upload,
  MapPin,
  Calendar,
  Box,
  Truck,
  QrCode,
  FileUp,
  ExternalLink
} from 'lucide-react';
import { dashboardClient } from '../lib/data-client';
import { WarehouseRequest, WarehouseRequestType, ReturnShippingOption } from '../types';

interface VendorWarehouseSupportProps {
  vendorId: string;
}

type ViewMode = 'requests' | 'shipments' | 'inventory' | 'documents' | 'metrics';

export function VendorWarehouseSupport({ vendorId }: VendorWarehouseSupportProps) {
  const [requests, setRequests] = useState<WarehouseRequest[]>([]);
  const [inboundShipments, setInboundShipments] = useState<any[]>([]);
  const [warehouseInventory, setWarehouseInventory] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('requests');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showASNForm, setShowASNForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<WarehouseRequest | null>(null);

  useEffect(() => {
    fetchRequests();
  }, [vendorId]);

  const fetchRequests = async () => {
    try {
      const { data, error } = await dashboardClient
        .from('warehouse_requests')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching warehouse requests:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <Warehouse className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">US Warehouse Support (Free Storage)</h2>
            <p className="text-blue-50 mb-4">
              Store your inventory in our US warehouse at no cost. You pay only for shipping your products to the warehouse and any return shipment back to you.
            </p>

            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-start gap-3 mb-3">
                <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold mb-2">Cost Breakdown:</p>
                  <ul className="space-y-1.5">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Storage in USA: <strong>FREE</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <TruckIcon className="w-4 h-4" />
                      <span>Shipping TO US warehouse: <strong>You pay</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <TruckIcon className="w-4 h-4" />
                      <span>Return shipping back to you: <strong>You pay</strong></span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {!showRequestForm && (
              <button
                onClick={() => setShowRequestForm(true)}
                className="mt-4 px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-colors font-semibold shadow-lg"
              >
                Request Warehouse Storage
              </button>
            )}
          </div>
        </div>
      </div>

      {showRequestForm && (
        <RequestForm
          vendorId={vendorId}
          onCancel={() => setShowRequestForm(false)}
          onSuccess={() => {
            setShowRequestForm(false);
            fetchRequests();
          }}
        />
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Your Warehouse Requests</h3>

          {requests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No warehouse requests yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface RequestFormProps {
  vendorId: string;
  onCancel: () => void;
  onSuccess: () => void;
}

function RequestForm({ vendorId, onCancel, onSuccess }: RequestFormProps) {
  const [formData, setFormData] = useState({
    request_type: 'SEASONAL' as WarehouseRequestType,
    expected_inventory_value: '',
    expected_sku_count: '',
    product_categories: [] as string[],
    estimated_arrival_date: '',
    campaign_duration_months: '6',
    vendor_notes: '',
    special_requirements: '',
    shipping_acknowledgment: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await dashboardClient
        .from('category_groups')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.product_categories.length === 0) {
      setError('Please select at least one product category');
      return;
    }

    if (!formData.shipping_acknowledgment) {
      setError('You must acknowledge the shipping cost terms to continue');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await dashboardClient.from('warehouse_requests').insert({
        vendor_id: vendorId,
        request_type: formData.request_type,
        expected_inventory_value: parseFloat(formData.expected_inventory_value),
        expected_sku_count: parseInt(formData.expected_sku_count),
        product_categories: formData.product_categories,
        estimated_arrival_date: formData.estimated_arrival_date || null,
        campaign_duration_months: parseInt(formData.campaign_duration_months),
        vendor_notes: formData.vendor_notes || null,
        special_requirements: formData.special_requirements || null,
        shipping_acknowledgment: formData.shipping_acknowledgment,
        status: 'pending',
      });

      if (error) throw error;

      setSuccess('Warehouse storage request submitted successfully!');
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (error) {
      console.error('Error submitting warehouse request:', error);
      setError('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Request Warehouse Storage</h3>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Request Type</label>
            <select
              value={formData.request_type}
              onChange={(e) => setFormData({ ...formData, request_type: e.target.value as WarehouseRequestType })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="SEASONAL">Seasonal Campaign</option>
              <option value="YEAR_ROUND">Year-Round Storage</option>
              <option value="TRIAL">Trial Period</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Duration (Months)</label>
            <input
              type="number"
              min="1"
              max="24"
              value={formData.campaign_duration_months}
              onChange={(e) => setFormData({ ...formData, campaign_duration_months: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expected Inventory Value ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.expected_inventory_value}
              onChange={(e) => setFormData({ ...formData, expected_inventory_value: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="10000.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Number of SKUs</label>
            <input
              type="number"
              min="1"
              value={formData.expected_sku_count}
              onChange={(e) => setFormData({ ...formData, expected_sku_count: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Categories *</label>
            {loadingCategories ? (
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                Loading categories...
              </div>
            ) : categories.length === 0 ? (
              <div className="w-full px-4 py-2 border border-red-300 rounded-lg bg-red-50 text-red-700">
                No categories available. Please contact admin to create categories first.
              </div>
            ) : (
              <div className="w-full border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto">
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center gap-2 py-2 hover:bg-gray-50 px-2 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.product_categories.includes(category.name)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            product_categories: [...formData.product_categories, category.name]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            product_categories: formData.product_categories.filter(c => c !== category.name)
                          });
                        }
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{category.name}</span>
                  </label>
                ))}
              </div>
            )}
            {formData.product_categories.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.product_categories.map((cat) => (
                  <span key={cat} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {cat}
                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        product_categories: formData.product_categories.filter(c => c !== cat)
                      })}
                      className="hover:text-blue-900"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Arrival Date</label>
            <input
              type="date"
              value={formData.estimated_arrival_date}
              onChange={(e) => setFormData({ ...formData, estimated_arrival_date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
          <textarea
            value={formData.vendor_notes}
            onChange={(e) => setFormData({ ...formData, vendor_notes: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Any additional information about your request..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Special Requirements</label>
          <textarea
            value={formData.special_requirements}
            onChange={(e) => setFormData({ ...formData, special_requirements: e.target.value })}
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Temperature control, fragile items, etc."
          />
        </div>

        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="shipping-agreement"
              checked={formData.shipping_acknowledgment}
              onChange={(e) => setFormData({ ...formData, shipping_acknowledgment: e.target.checked })}
              className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              required
            />
            <label htmlFor="shipping-agreement" className="text-sm text-gray-900 flex-1">
              <p className="font-semibold mb-2">I understand and agree that:</p>
              <ul className="space-y-1.5 list-disc list-inside">
                <li>Storage in the US warehouse is <strong>free</strong></li>
                <li>I will pay for <strong>shipping my inventory TO the US warehouse</strong></li>
                <li>I will pay for <strong>any return shipment</strong> of unsold inventory back to me</li>
                <li>If I do not arrange return shipment within the deadline set by Purple Soul Collective by DKC, I agree that the marketplace may discount, liquidate, or donate the remaining stock according to platform policy</li>
              </ul>
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

interface RequestCardProps {
  request: WarehouseRequest;
}

function RequestCard({ request }: RequestCardProps) {
  const getStatusBadge = () => {
    switch (request.status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
            <Clock className="w-3 h-3" />
            Pending Review
          </span>
        );
      case 'approved':
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            <CheckCircle className="w-3 h-3" />
            {request.status === 'active' ? 'Active' : 'Approved'}
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            <CheckCircle className="w-3 h-3" />
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            <XCircle className="w-3 h-3" />
            Cancelled
          </span>
        );
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all">
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

      {request.status === 'approved' && request.warehouse_address && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
          <p className="font-semibold text-green-900 mb-2">Warehouse Details:</p>
          <p className="text-green-800 whitespace-pre-line">{request.warehouse_address}</p>
          {request.warehouse_contact_email && (
            <p className="text-green-800 mt-1">Email: {request.warehouse_contact_email}</p>
          )}
          {request.arrival_deadline && (
            <p className="text-green-800 mt-1">
              Arrival Deadline: {new Date(request.arrival_deadline).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {request.status === 'rejected' && request.rejection_reason && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
          <p className="font-semibold text-red-900 mb-1">Rejection Reason:</p>
          <p className="text-red-800">{request.rejection_reason}</p>
        </div>
      )}

      {request.admin_notes && request.status !== 'rejected' && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <p className="font-semibold text-blue-900 mb-1">Admin Notes:</p>
          <p className="text-blue-800">{request.admin_notes}</p>
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500">
        Submitted: {new Date(request.created_at).toLocaleDateString()}
      </div>
    </div>
  );
}
