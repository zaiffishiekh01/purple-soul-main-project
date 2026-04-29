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
  MapPin,
  Calendar,
  Box,
  QrCode,
  FileText,
  DollarSign,
  Calculator,
  Check
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface VendorWarehouseWithPricingProps {
  vendorId: string;
}

type ViewMode = 'overview' | 'pricing' | 'requests' | 'shipments' | 'inventory' | 'metrics';

interface StoragePlan {
  id: string;
  plan_name: string;
  plan_code: string;
  description: string;
  min_cubic_feet: number | null;
  max_cubic_feet: number | null;
  min_pallet_spaces: number | null;
  max_pallet_spaces: number | null;
  storage_fee_per_cubic_foot_monthly: number;
  storage_fee_per_pallet_monthly: number;
  receiving_fee_per_pallet: number;
  receiving_fee_per_unit: number;
  pick_pack_fee_per_item: number;
  handling_fee_percentage: number;
  minimum_monthly_fee: number;
  includes_insurance: boolean;
  includes_inventory_management: boolean;
  includes_reporting: boolean;
  priority_processing: boolean;
  dedicated_account_manager: boolean;
}

interface WarehouseRequest {
  id: string;
  vendor_id: string;
  request_type: 'SEASONAL' | 'YEAR_ROUND' | 'TRIAL';
  expected_inventory_value: number;
  expected_sku_count: number;
  product_categories: string[];
  estimated_arrival_date: string;
  campaign_duration_months: number;
  return_shipping_option: 'RETURN_TO_ME' | 'LIQUIDATE' | 'DONATE';
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled';
  storage_plan_id?: string;
  estimated_monthly_storage_cost?: number;
  estimated_space_cubic_feet?: number;
  estimated_pallet_count?: number;
  warehouse_address?: string;
  warehouse_contact_email?: string;
  warehouse_contact_phone?: string;
  vendor_notes?: string;
  admin_notes?: string;
  rejection_reason?: string;
  created_at: string;
}

export function VendorWarehouseWithPricing({ vendorId }: VendorWarehouseWithPricingProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [loading, setLoading] = useState(true);
  const [storagePlans, setStoragePlans] = useState<StoragePlan[]>([]);
  const [requests, setRequests] = useState<WarehouseRequest[]>([]);
  const [inboundShipments, setInboundShipments] = useState<any[]>([]);
  const [warehouseInventory, setWarehouseInventory] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<StoragePlan | null>(null);

  const [formData, setFormData] = useState({
    request_type: 'SEASONAL' as const,
    expected_inventory_value: '',
    expected_sku_count: '',
    product_categories: '',
    estimated_arrival_date: '',
    campaign_duration_months: '3',
    return_shipping_option: 'RETURN_TO_ME' as const,
    estimated_space_cubic_feet: '',
    estimated_pallet_count: '',
    storage_plan_id: '',
    vendor_notes: ''
  });

  useEffect(() => {
    loadData();
  }, [vendorId, viewMode]);

  useEffect(() => {
    fetchStoragePlans();
  }, []);

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

  const fetchStoragePlans = async () => {
    const { data, error } = await supabase
      .from('warehouse_storage_plans')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (!error && data) setStoragePlans(data);
  };

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('warehouse_requests')
      .select('*, warehouse_storage_plans(*)')
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
    const { data, error } = await supabase
      .from('warehouse_performance_metrics')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('metric_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) setMetrics(data);
  };

  const calculateEstimatedCost = (plan: StoragePlan, cubicFeet: number, pallets: number): number => {
    let monthlyCost = 0;

    if (cubicFeet > 0 && plan.storage_fee_per_cubic_foot_monthly > 0) {
      monthlyCost += cubicFeet * plan.storage_fee_per_cubic_foot_monthly;
    }

    if (pallets > 0) {
      monthlyCost += pallets * plan.storage_fee_per_pallet_monthly;
    }

    return Math.max(monthlyCost, plan.minimum_monthly_fee);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    const plan = storagePlans.find(p => p.id === formData.storage_plan_id);
    const cubicFeet = parseFloat(formData.estimated_space_cubic_feet) || 0;
    const pallets = parseInt(formData.estimated_pallet_count) || 0;
    const estimatedCost = plan ? calculateEstimatedCost(plan, cubicFeet, pallets) : 0;

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
        storage_plan_id: formData.storage_plan_id,
        estimated_space_cubic_feet: cubicFeet,
        estimated_pallet_count: pallets,
        estimated_monthly_storage_cost: estimatedCost,
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
        estimated_space_cubic_feet: '',
        estimated_pallet_count: '',
        storage_plan_id: '',
        vendor_notes: ''
      });
      setSelectedPlan(null);
      fetchRequests();
      alert('Storage request submitted successfully!');
    } else {
      alert('Error submitting request: ' + error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' },
      active: { color: 'bg-blue-100 text-blue-800', icon: Package, label: 'Active' },
      completed: { color: 'bg-gray-100 text-gray-800', icon: CheckCircle, label: 'Completed' },
      cancelled: { color: 'bg-gray-100 text-gray-600', icon: XCircle, label: 'Cancelled' }
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

  const renderPricingPlans = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <DollarSign className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold">Warehouse Storage Pricing</h3>
            <p className="text-sm text-gray-600">Choose the plan that fits your business needs</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-blue-900 mb-2">What's Included in All Plans:</h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-800">
            <li className="flex items-center gap-2"><Check className="h-4 w-4" /> Climate-controlled storage</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4" /> 24/7 security monitoring</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4" /> Insurance coverage</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4" /> Inventory management</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4" /> Real-time reporting</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4" /> Order fulfillment services</li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {storagePlans.map((plan, index) => (
          <div
            key={plan.id}
            className={`bg-white rounded-lg border-2 overflow-hidden transition-all ${
              index === 1 ? 'border-blue-600 shadow-lg transform scale-105' : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            {index === 1 && (
              <div className="bg-blue-600 text-white text-center py-2 text-sm font-semibold">
                MOST POPULAR
              </div>
            )}

            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{plan.plan_name}</h3>
              <p className="text-sm text-gray-600 mb-4">{plan.description}</p>

              <div className="space-y-3 mb-6">
                {plan.plan_code !== 'PALLET' && (
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-xs text-gray-500 mb-1">Storage Space</div>
                    <div className="font-semibold">
                      {plan.min_cubic_feet !== null && plan.max_cubic_feet !== null
                        ? `${plan.min_cubic_feet} - ${plan.max_cubic_feet} cubic feet`
                        : plan.min_cubic_feet !== null
                        ? `${plan.min_cubic_feet}+ cubic feet`
                        : 'Custom'}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {plan.storage_fee_per_cubic_foot_monthly > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Storage (per cu ft/month)</span>
                      <span className="font-semibold">${plan.storage_fee_per_cubic_foot_monthly.toFixed(2)}</span>
                    </div>
                  )}

                  {plan.storage_fee_per_pallet_monthly > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Pallet storage (per month)</span>
                      <span className="font-semibold">${plan.storage_fee_per_pallet_monthly.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Receiving (per pallet)</span>
                    <span className="font-semibold">${plan.receiving_fee_per_pallet.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Pick & Pack (per item)</span>
                    <span className="font-semibold">${plan.pick_pack_fee_per_item.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Handling Fee</span>
                    <span className="font-semibold">{plan.handling_fee_percentage}%</span>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <div className="text-xs text-blue-600 mb-1">Minimum Monthly Fee</div>
                  <div className="text-2xl font-bold text-blue-900">${plan.minimum_monthly_fee.toFixed(2)}</div>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                {plan.priority_processing && (
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <Check className="h-4 w-4" />
                    <span>Priority Processing</span>
                  </div>
                )}
                {plan.dedicated_account_manager && (
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <Check className="h-4 w-4" />
                    <span>Dedicated Account Manager</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setFormData({ ...formData, storage_plan_id: plan.id });
                  setSelectedPlan(plan);
                  setShowRequestForm(true);
                  setViewMode('requests');
                }}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  index === 1
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                Select Plan
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <Calculator className="h-6 w-6 text-purple-600" />
          <h3 className="text-lg font-semibold">Need Help Choosing?</h3>
        </div>
        <p className="text-gray-600 mb-4">
          Not sure which plan is right for you? Our team can help you estimate your storage needs and recommend the best option.
        </p>
        <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          Contact Storage Specialist
        </button>
      </div>
    </div>
  );

  const renderRequestForm = () => {
    const plan = storagePlans.find(p => p.id === formData.storage_plan_id);
    const cubicFeet = parseFloat(formData.estimated_space_cubic_feet) || 0;
    const pallets = parseInt(formData.estimated_pallet_count) || 0;
    const estimatedCost = plan ? calculateEstimatedCost(plan, cubicFeet, pallets) : 0;

    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h4 className="text-lg font-semibold mb-4">Create Storage Request</h4>

        {plan && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-blue-900">Selected Plan: {plan.plan_name}</p>
                <p className="text-sm text-blue-700">{plan.description}</p>
              </div>
              <button
                type="button"
                onClick={() => setViewMode('pricing')}
                className="text-sm text-blue-600 hover:text-blue-700 underline"
              >
                Change Plan
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmitRequest} className="space-y-4">
          {!plan && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800">Please select a storage plan first</p>
              <button
                type="button"
                onClick={() => setViewMode('pricing')}
                className="mt-2 text-sm text-yellow-900 font-semibold hover:underline"
              >
                View Pricing Plans →
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Request Type</label>
              <select
                value={formData.request_type}
                onChange={(e) => setFormData({ ...formData, request_type: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="SEASONAL">Seasonal (3-6 months)</option>
                <option value="YEAR_ROUND">Year Round (12+ months)</option>
                <option value="TRIAL">Trial (1-2 months)</option>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Inventory Value ($)</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Space (cubic feet)</label>
              <input
                type="number"
                step="0.1"
                value={formData.estimated_space_cubic_feet}
                onChange={(e) => setFormData({ ...formData, estimated_space_cubic_feet: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., 250"
                required={plan?.storage_fee_per_cubic_foot_monthly! > 0}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Pallet Count</label>
              <input
                type="number"
                value={formData.estimated_pallet_count}
                onChange={(e) => setFormData({ ...formData, estimated_pallet_count: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., 5"
                min="0"
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

          {plan && (cubicFeet > 0 || pallets > 0) && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">Estimated Monthly Cost</h4>
                <div className="text-3xl font-bold text-green-700">${estimatedCost.toFixed(2)}</div>
              </div>

              <div className="space-y-2 text-sm text-gray-700">
                {cubicFeet > 0 && plan.storage_fee_per_cubic_foot_monthly > 0 && (
                  <div className="flex justify-between">
                    <span>{cubicFeet} cu ft × ${plan.storage_fee_per_cubic_foot_monthly}/cu ft</span>
                    <span className="font-semibold">${(cubicFeet * plan.storage_fee_per_cubic_foot_monthly).toFixed(2)}</span>
                  </div>
                )}
                {pallets > 0 && (
                  <div className="flex justify-between">
                    <span>{pallets} pallets × ${plan.storage_fee_per_pallet_monthly}/pallet</span>
                    <span className="font-semibold">${(pallets * plan.storage_fee_per_pallet_monthly).toFixed(2)}</span>
                  </div>
                )}
                {estimatedCost === plan.minimum_monthly_fee && (
                  <div className="text-xs text-gray-600 mt-2">
                    * Minimum monthly fee applies
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-600 mt-4">
                This is an estimate. Additional fees may apply for receiving, pick & pack, and special handling.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setShowRequestForm(false);
                setSelectedPlan(null);
              }}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!plan}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderRequests = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Storage Requests</h3>
        <button
          onClick={() => {
            if (storagePlans.length === 0) {
              alert('Loading storage plans...');
              return;
            }
            setShowRequestForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Request
        </button>
      </div>

      {showRequestForm && renderRequestForm()}

      <div className="grid gap-4">
        {requests.map((request: any) => (
          <div key={request.id} className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold">{request.request_type} Storage Request</h4>
                <p className="text-sm text-gray-600">
                  {request.expected_sku_count} SKUs • ${request.expected_inventory_value.toLocaleString()}
                </p>
                {request.warehouse_storage_plans && (
                  <p className="text-sm text-blue-600 font-medium mt-1">
                    Plan: {request.warehouse_storage_plans.plan_name}
                  </p>
                )}
              </div>
              {getStatusBadge(request.status)}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">Estimated Space</p>
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

            {request.status === 'approved' && request.warehouse_address && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-green-800 mb-2">Warehouse Address:</p>
                <p className="text-sm text-green-700">{request.warehouse_address}</p>
                <p className="text-sm text-green-700">{request.warehouse_contact_email}</p>
                <p className="text-sm text-green-700">{request.warehouse_contact_phone}</p>
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
          Professional warehouse storage with flexible pricing plans to fit your business needs
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
            onClick={() => setViewMode('pricing')}
            className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 whitespace-nowrap ${
              viewMode === 'pricing'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <DollarSign className="h-5 w-5" />
            Pricing Plans
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
          </button>
        </div>
      </div>

      <div>
        {viewMode === 'pricing' && renderPricingPlans()}
        {viewMode === 'requests' && renderRequests()}
      </div>
    </div>
  );
}
