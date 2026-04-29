import { useState, useEffect } from 'react';
import { Warehouse, Package, DollarSign, Plus, CreditCard as Edit2, Trash2, Check, X, Search, Filter, Calendar, Truck as TruckIcon, BarChart3, FileText, Clock, CheckCircle, XCircle, Users, Box } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type ViewMode = 'plans' | 'requests' | 'shipments' | 'inventory' | 'metrics';

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
  is_active: boolean;
  display_order: number;
}

interface WarehouseRequest {
  id: string;
  vendor_id: string;
  request_type: string;
  expected_inventory_value: number;
  expected_sku_count: number;
  product_categories: string[];
  estimated_arrival_date: string;
  campaign_duration_months: number;
  return_shipping_option: string;
  status: string;
  storage_plan_id: string;
  estimated_monthly_storage_cost: number;
  estimated_space_cubic_feet: number;
  estimated_pallet_count: number;
  warehouse_address?: string;
  warehouse_contact_email?: string;
  warehouse_contact_phone?: string;
  arrival_deadline?: string;
  vendor_notes?: string;
  admin_notes?: string;
  rejection_reason?: string;
  created_at: string;
  vendors?: any;
  warehouse_storage_plans?: any;
}

export function AdminWarehouseManagement() {
  const [viewMode, setViewMode] = useState<ViewMode>('plans');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [storagePlans, setStoragePlans] = useState<StoragePlan[]>([]);
  const [requests, setRequests] = useState<WarehouseRequest[]>([]);
  const [inboundShipments, setInboundShipments] = useState<any[]>([]);
  const [warehouseInventory, setWarehouseInventory] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);

  const [showPlanForm, setShowPlanForm] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<StoragePlan | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<WarehouseRequest | null>(null);

  const [planFormData, setPlanFormData] = useState({
    plan_name: '',
    plan_code: '',
    description: '',
    min_cubic_feet: '',
    max_cubic_feet: '',
    min_pallet_spaces: '',
    max_pallet_spaces: '',
    storage_fee_per_cubic_foot_monthly: '',
    storage_fee_per_pallet_monthly: '',
    receiving_fee_per_pallet: '',
    receiving_fee_per_unit: '',
    pick_pack_fee_per_item: '',
    handling_fee_percentage: '',
    minimum_monthly_fee: '',
    includes_insurance: true,
    includes_inventory_management: true,
    includes_reporting: true,
    priority_processing: false,
    dedicated_account_manager: false,
    is_active: true,
    display_order: 0
  });

  const [requestFormData, setRequestFormData] = useState({
    vendor_id: '',
    request_type: 'SEASONAL' as const,
    expected_inventory_value: '',
    expected_sku_count: '',
    product_categories: '',
    estimated_arrival_date: '',
    campaign_duration_months: '3',
    return_shipping_option: 'RETURN_TO_ME' as const,
    storage_plan_id: '',
    estimated_space_cubic_feet: '',
    estimated_pallet_count: '',
    warehouse_address: '',
    warehouse_contact_email: '',
    warehouse_contact_phone: '',
    arrival_deadline: '',
    vendor_notes: '',
    admin_notes: '',
    status: 'pending' as const
  });

  useEffect(() => {
    loadData();
  }, [viewMode, statusFilter]);

  useEffect(() => {
    loadVendors();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      if (viewMode === 'plans') await fetchStoragePlans();
      if (viewMode === 'requests') await fetchRequests();
      if (viewMode === 'shipments') await fetchInboundShipments();
      if (viewMode === 'inventory') await fetchWarehouseInventory();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVendors = async () => {
    const { data, error } = await supabase
      .from('vendors')
      .select('id, business_name, contact_email')
      .in('status', ['active', 'approved'])
      .order('business_name');

    if (!error && data) setVendors(data);
  };

  const fetchStoragePlans = async () => {
    const { data, error } = await supabase
      .from('warehouse_storage_plans')
      .select('*')
      .order('display_order');

    if (!error && data) setStoragePlans(data);
  };

  const fetchRequests = async () => {
    let query = supabase
      .from('warehouse_requests')
      .select('*, vendors(business_name, contact_email), warehouse_storage_plans(plan_name)')
      .order('created_at', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;
    if (!error && data) setRequests(data);
  };

  const fetchInboundShipments = async () => {
    const { data, error } = await supabase
      .from('warehouse_inbound_shipments')
      .select('*, vendors(business_name), warehouse_requests(request_type)')
      .order('expected_arrival_date', { ascending: false });

    if (!error && data) setInboundShipments(data);
  };

  const fetchWarehouseInventory = async () => {
    const { data, error } = await supabase
      .from('warehouse_inventory')
      .select('*, vendors(business_name)')
      .order('created_at', { ascending: false });

    if (!error && data) setWarehouseInventory(data);
  };

  const calculateEstimatedCost = (planId: string, cubicFeet: number, pallets: number): number => {
    const plan = storagePlans.find(p => p.id === planId);
    if (!plan) return 0;

    let monthlyCost = 0;
    if (cubicFeet > 0 && plan.storage_fee_per_cubic_foot_monthly > 0) {
      monthlyCost += cubicFeet * plan.storage_fee_per_cubic_foot_monthly;
    }
    if (pallets > 0) {
      monthlyCost += pallets * plan.storage_fee_per_pallet_monthly;
    }

    return Math.max(monthlyCost, plan.minimum_monthly_fee);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();

    const planData = {
      plan_name: planFormData.plan_name,
      plan_code: planFormData.plan_code.toUpperCase(),
      description: planFormData.description,
      min_cubic_feet: planFormData.min_cubic_feet ? parseFloat(planFormData.min_cubic_feet) : null,
      max_cubic_feet: planFormData.max_cubic_feet ? parseFloat(planFormData.max_cubic_feet) : null,
      min_pallet_spaces: planFormData.min_pallet_spaces ? parseInt(planFormData.min_pallet_spaces) : null,
      max_pallet_spaces: planFormData.max_pallet_spaces ? parseInt(planFormData.max_pallet_spaces) : null,
      storage_fee_per_cubic_foot_monthly: parseFloat(planFormData.storage_fee_per_cubic_foot_monthly),
      storage_fee_per_pallet_monthly: parseFloat(planFormData.storage_fee_per_pallet_monthly),
      receiving_fee_per_pallet: parseFloat(planFormData.receiving_fee_per_pallet),
      receiving_fee_per_unit: parseFloat(planFormData.receiving_fee_per_unit),
      pick_pack_fee_per_item: parseFloat(planFormData.pick_pack_fee_per_item),
      handling_fee_percentage: parseFloat(planFormData.handling_fee_percentage),
      minimum_monthly_fee: parseFloat(planFormData.minimum_monthly_fee),
      includes_insurance: planFormData.includes_insurance,
      includes_inventory_management: planFormData.includes_inventory_management,
      includes_reporting: planFormData.includes_reporting,
      priority_processing: planFormData.priority_processing,
      dedicated_account_manager: planFormData.dedicated_account_manager,
      is_active: planFormData.is_active,
      display_order: parseInt(String(planFormData.display_order))
    };

    let error;
    if (editingPlan) {
      const result = await supabase
        .from('warehouse_storage_plans')
        .update(planData)
        .eq('id', editingPlan.id);
      error = result.error;
    } else {
      const result = await supabase
        .from('warehouse_storage_plans')
        .insert(planData);
      error = result.error;
    }

    if (!error) {
      setShowPlanForm(false);
      setEditingPlan(null);
      resetPlanForm();
      fetchStoragePlans();
      alert(editingPlan ? 'Plan updated successfully!' : 'Plan created successfully!');
    } else {
      alert('Error saving plan: ' + error.message);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;

    const { error } = await supabase
      .from('warehouse_storage_plans')
      .delete()
      .eq('id', planId);

    if (!error) {
      fetchStoragePlans();
      alert('Plan deleted successfully!');
    } else {
      alert('Error deleting plan: ' + error.message);
    }
  };

  const handleEditPlan = (plan: StoragePlan) => {
    setEditingPlan(plan);
    setPlanFormData({
      plan_name: plan.plan_name,
      plan_code: plan.plan_code,
      description: plan.description || '',
      min_cubic_feet: plan.min_cubic_feet?.toString() || '',
      max_cubic_feet: plan.max_cubic_feet?.toString() || '',
      min_pallet_spaces: plan.min_pallet_spaces?.toString() || '',
      max_pallet_spaces: plan.max_pallet_spaces?.toString() || '',
      storage_fee_per_cubic_foot_monthly: plan.storage_fee_per_cubic_foot_monthly.toString(),
      storage_fee_per_pallet_monthly: plan.storage_fee_per_pallet_monthly.toString(),
      receiving_fee_per_pallet: plan.receiving_fee_per_pallet.toString(),
      receiving_fee_per_unit: plan.receiving_fee_per_unit.toString(),
      pick_pack_fee_per_item: plan.pick_pack_fee_per_item.toString(),
      handling_fee_percentage: plan.handling_fee_percentage.toString(),
      minimum_monthly_fee: plan.minimum_monthly_fee.toString(),
      includes_insurance: plan.includes_insurance,
      includes_inventory_management: plan.includes_inventory_management,
      includes_reporting: plan.includes_reporting,
      priority_processing: plan.priority_processing,
      dedicated_account_manager: plan.dedicated_account_manager,
      is_active: plan.is_active,
      display_order: plan.display_order
    });
    setShowPlanForm(true);
  };

  const resetPlanForm = () => {
    setPlanFormData({
      plan_name: '',
      plan_code: '',
      description: '',
      min_cubic_feet: '',
      max_cubic_feet: '',
      min_pallet_spaces: '',
      max_pallet_spaces: '',
      storage_fee_per_cubic_foot_monthly: '',
      storage_fee_per_pallet_monthly: '',
      receiving_fee_per_pallet: '',
      receiving_fee_per_unit: '',
      pick_pack_fee_per_item: '',
      handling_fee_percentage: '',
      minimum_monthly_fee: '',
      includes_insurance: true,
      includes_inventory_management: true,
      includes_reporting: true,
      priority_processing: false,
      dedicated_account_manager: false,
      is_active: true,
      display_order: 0
    });
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    const cubicFeet = parseFloat(requestFormData.estimated_space_cubic_feet) || 0;
    const pallets = parseInt(requestFormData.estimated_pallet_count) || 0;
    const estimatedCost = calculateEstimatedCost(requestFormData.storage_plan_id, cubicFeet, pallets);

    const categories = requestFormData.product_categories
      .split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0);

    const { error } = await supabase
      .from('warehouse_requests')
      .insert({
        vendor_id: requestFormData.vendor_id,
        request_type: requestFormData.request_type,
        expected_inventory_value: parseFloat(requestFormData.expected_inventory_value),
        expected_sku_count: parseInt(requestFormData.expected_sku_count),
        product_categories: categories,
        estimated_arrival_date: requestFormData.estimated_arrival_date,
        campaign_duration_months: parseInt(requestFormData.campaign_duration_months),
        return_shipping_option: requestFormData.return_shipping_option,
        storage_plan_id: requestFormData.storage_plan_id,
        estimated_space_cubic_feet: cubicFeet,
        estimated_pallet_count: pallets,
        estimated_monthly_storage_cost: estimatedCost,
        warehouse_address: requestFormData.warehouse_address || null,
        warehouse_contact_email: requestFormData.warehouse_contact_email || null,
        warehouse_contact_phone: requestFormData.warehouse_contact_phone || null,
        arrival_deadline: requestFormData.arrival_deadline || null,
        vendor_notes: requestFormData.vendor_notes || null,
        admin_notes: requestFormData.admin_notes || null,
        status: requestFormData.status,
        shipping_acknowledgment: true,
        shipping_to_warehouse_paid: true,
        priority_level: 'standard'
      });

    if (!error) {
      setShowRequestForm(false);
      setRequestFormData({
        vendor_id: '',
        request_type: 'SEASONAL',
        expected_inventory_value: '',
        expected_sku_count: '',
        product_categories: '',
        estimated_arrival_date: '',
        campaign_duration_months: '3',
        return_shipping_option: 'RETURN_TO_ME',
        storage_plan_id: '',
        estimated_space_cubic_feet: '',
        estimated_pallet_count: '',
        warehouse_address: '',
        warehouse_contact_email: '',
        warehouse_contact_phone: '',
        arrival_deadline: '',
        vendor_notes: '',
        admin_notes: '',
        status: 'pending'
      });
      fetchRequests();
      alert('Warehouse request created successfully!');
    } else {
      alert('Error creating request: ' + error.message);
    }
  };

  const handleUpdateRequestStatus = async (
    requestId: string,
    status: string,
    warehouseAddress?: string,
    contactEmail?: string,
    contactPhone?: string,
    arrivalDeadline?: string,
    rejectionReason?: string
  ) => {
    const updateData: any = { status };

    if (status === 'approved') {
      updateData.warehouse_address = warehouseAddress;
      updateData.warehouse_contact_email = contactEmail;
      updateData.warehouse_contact_phone = contactPhone;
      updateData.arrival_deadline = arrivalDeadline;
    } else if (status === 'rejected') {
      updateData.rejection_reason = rejectionReason;
    }

    const { error } = await supabase
      .from('warehouse_requests')
      .update(updateData)
      .eq('id', requestId);

    if (!error) {
      fetchRequests();
      setSelectedRequest(null);
      alert(`Request ${status} successfully!`);
    } else {
      alert('Error updating request: ' + error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, any> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
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

  const renderPlansManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Storage Plans</h3>
          <p className="text-sm text-gray-600">Manage warehouse storage pricing plans</p>
        </div>
        <button
          onClick={() => {
            setEditingPlan(null);
            resetPlanForm();
            setShowPlanForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Create Plan
        </button>
      </div>

      {showPlanForm && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="text-lg font-semibold mb-4">
            {editingPlan ? 'Edit Storage Plan' : 'Create Storage Plan'}
          </h4>
          <form onSubmit={handleSavePlan} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name *</label>
                <input
                  type="text"
                  value={planFormData.plan_name}
                  onChange={(e) => setPlanFormData({ ...planFormData, plan_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan Code *</label>
                <input
                  type="text"
                  value={planFormData.plan_code}
                  onChange={(e) => setPlanFormData({ ...planFormData, plan_code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., STANDARD"
                  required
                  disabled={!!editingPlan}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={planFormData.description}
                  onChange={(e) => setPlanFormData({ ...planFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Cubic Feet</label>
                <input
                  type="number"
                  step="0.1"
                  value={planFormData.min_cubic_feet}
                  onChange={(e) => setPlanFormData({ ...planFormData, min_cubic_feet: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Cubic Feet</label>
                <input
                  type="number"
                  step="0.1"
                  value={planFormData.max_cubic_feet}
                  onChange={(e) => setPlanFormData({ ...planFormData, max_cubic_feet: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Pallet Spaces</label>
                <input
                  type="number"
                  value={planFormData.min_pallet_spaces}
                  onChange={(e) => setPlanFormData({ ...planFormData, min_pallet_spaces: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Pallet Spaces</label>
                <input
                  type="number"
                  value={planFormData.max_pallet_spaces}
                  onChange={(e) => setPlanFormData({ ...planFormData, max_pallet_spaces: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Storage Fee (per cu ft/month) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={planFormData.storage_fee_per_cubic_foot_monthly}
                  onChange={(e) => setPlanFormData({ ...planFormData, storage_fee_per_cubic_foot_monthly: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Storage Fee (per pallet/month) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={planFormData.storage_fee_per_pallet_monthly}
                  onChange={(e) => setPlanFormData({ ...planFormData, storage_fee_per_pallet_monthly: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Receiving Fee (per pallet) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={planFormData.receiving_fee_per_pallet}
                  onChange={(e) => setPlanFormData({ ...planFormData, receiving_fee_per_pallet: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Receiving Fee (per unit) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={planFormData.receiving_fee_per_unit}
                  onChange={(e) => setPlanFormData({ ...planFormData, receiving_fee_per_unit: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pick & Pack Fee (per item) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={planFormData.pick_pack_fee_per_item}
                  onChange={(e) => setPlanFormData({ ...planFormData, pick_pack_fee_per_item: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Handling Fee (%) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={planFormData.handling_fee_percentage}
                  onChange={(e) => setPlanFormData({ ...planFormData, handling_fee_percentage: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Monthly Fee *</label>
                <input
                  type="number"
                  step="0.01"
                  value={planFormData.minimum_monthly_fee}
                  onChange={(e) => setPlanFormData({ ...planFormData, minimum_monthly_fee: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                <input
                  type="number"
                  value={planFormData.display_order}
                  onChange={(e) => setPlanFormData({ ...planFormData, display_order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={planFormData.includes_insurance}
                  onChange={(e) => setPlanFormData({ ...planFormData, includes_insurance: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Insurance</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={planFormData.includes_inventory_management}
                  onChange={(e) => setPlanFormData({ ...planFormData, includes_inventory_management: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Inventory Management</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={planFormData.includes_reporting}
                  onChange={(e) => setPlanFormData({ ...planFormData, includes_reporting: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Reporting</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={planFormData.priority_processing}
                  onChange={(e) => setPlanFormData({ ...planFormData, priority_processing: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Priority Processing</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={planFormData.dedicated_account_manager}
                  onChange={(e) => setPlanFormData({ ...planFormData, dedicated_account_manager: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Account Manager</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={planFormData.is_active}
                  onChange={(e) => setPlanFormData({ ...planFormData, is_active: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Active</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowPlanForm(false);
                  setEditingPlan(null);
                  resetPlanForm();
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingPlan ? 'Update Plan' : 'Create Plan'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {storagePlans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-lg font-semibold">{plan.plan_name}</h4>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${plan.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {plan.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{plan.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditPlan(plan)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeletePlan(plan.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Storage (per cu ft/month):</span>
                <span className="font-semibold">${plan.storage_fee_per_cubic_foot_monthly.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Storage (per pallet/month):</span>
                <span className="font-semibold">${plan.storage_fee_per_pallet_monthly.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Receiving (per pallet):</span>
                <span className="font-semibold">${plan.receiving_fee_per_pallet.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pick & Pack (per item):</span>
                <span className="font-semibold">${plan.pick_pack_fee_per_item.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Minimum Monthly Fee:</span>
                <span className="font-semibold text-green-700">${plan.minimum_monthly_fee.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
              {plan.includes_insurance && (
                <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">Insurance</span>
              )}
              {plan.priority_processing && (
                <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded">Priority</span>
              )}
              {plan.dedicated_account_manager && (
                <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded">Account Manager</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {storagePlans.length === 0 && !showPlanForm && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No storage plans created yet</p>
          <button
            onClick={() => setShowPlanForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create First Plan
          </button>
        </div>
      )}
    </div>
  );

  const renderRequestsManagement = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold">Warehouse Requests</h3>
          <p className="text-sm text-gray-600">Manage vendor storage requests</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
          <button
            onClick={() => setShowRequestForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create Request
          </button>
        </div>
      </div>

      {showRequestForm && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="text-lg font-semibold mb-4">Create Warehouse Request for Vendor</h4>
          <form onSubmit={handleCreateRequest} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Vendor *</label>
                <select
                  value={requestFormData.vendor_id}
                  onChange={(e) => setRequestFormData({ ...requestFormData, vendor_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">Choose vendor...</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.business_name} ({vendor.contact_email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Storage Plan *</label>
                <select
                  value={requestFormData.storage_plan_id}
                  onChange={(e) => setRequestFormData({ ...requestFormData, storage_plan_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">Choose plan...</option>
                  {storagePlans.filter(p => p.is_active).map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.plan_name} (${plan.minimum_monthly_fee}/mo minimum)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Request Type *</label>
                <select
                  value={requestFormData.request_type}
                  onChange={(e) => setRequestFormData({ ...requestFormData, request_type: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="SEASONAL">Seasonal (3-6 months)</option>
                  <option value="YEAR_ROUND">Year Round (12+ months)</option>
                  <option value="TRIAL">Trial (1-2 months)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                <select
                  value={requestFormData.status}
                  onChange={(e) => setRequestFormData({ ...requestFormData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="active">Active</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected SKU Count *</label>
                <input
                  type="number"
                  value={requestFormData.expected_sku_count}
                  onChange={(e) => setRequestFormData({ ...requestFormData, expected_sku_count: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Inventory Value ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={requestFormData.expected_inventory_value}
                  onChange={(e) => setRequestFormData({ ...requestFormData, expected_inventory_value: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Space (cubic feet) *</label>
                <input
                  type="number"
                  step="0.1"
                  value={requestFormData.estimated_space_cubic_feet}
                  onChange={(e) => setRequestFormData({ ...requestFormData, estimated_space_cubic_feet: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Pallet Count</label>
                <input
                  type="number"
                  value={requestFormData.estimated_pallet_count}
                  onChange={(e) => setRequestFormData({ ...requestFormData, estimated_pallet_count: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Duration (months) *</label>
                <input
                  type="number"
                  value={requestFormData.campaign_duration_months}
                  onChange={(e) => setRequestFormData({ ...requestFormData, campaign_duration_months: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Arrival Date *</label>
                <input
                  type="date"
                  value={requestFormData.estimated_arrival_date}
                  onChange={(e) => setRequestFormData({ ...requestFormData, estimated_arrival_date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Deadline</label>
                <input
                  type="date"
                  value={requestFormData.arrival_deadline}
                  onChange={(e) => setRequestFormData({ ...requestFormData, arrival_deadline: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Return Shipping Option *</label>
                <select
                  value={requestFormData.return_shipping_option}
                  onChange={(e) => setRequestFormData({ ...requestFormData, return_shipping_option: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="RETURN_TO_ME">Return to Vendor</option>
                  <option value="LIQUIDATE">Liquidate</option>
                  <option value="DONATE">Donate</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Categories (comma-separated) *</label>
                <input
                  type="text"
                  value={requestFormData.product_categories}
                  onChange={(e) => setRequestFormData({ ...requestFormData, product_categories: e.target.value })}
                  placeholder="e.g., Electronics, Accessories, Tools"
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              {requestFormData.status === 'approved' && (
                <>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse Address</label>
                    <input
                      type="text"
                      value={requestFormData.warehouse_address}
                      onChange={(e) => setRequestFormData({ ...requestFormData, warehouse_address: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="123 Warehouse St, City, State, ZIP"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse Contact Email</label>
                    <input
                      type="email"
                      value={requestFormData.warehouse_contact_email}
                      onChange={(e) => setRequestFormData({ ...requestFormData, warehouse_contact_email: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse Contact Phone</label>
                    <input
                      type="tel"
                      value={requestFormData.warehouse_contact_phone}
                      onChange={(e) => setRequestFormData({ ...requestFormData, warehouse_contact_phone: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Notes</label>
                <textarea
                  value={requestFormData.vendor_notes}
                  onChange={(e) => setRequestFormData({ ...requestFormData, vendor_notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
                <textarea
                  value={requestFormData.admin_notes}
                  onChange={(e) => setRequestFormData({ ...requestFormData, admin_notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                />
              </div>
            </div>

            {requestFormData.storage_plan_id && requestFormData.estimated_space_cubic_feet && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Estimated Monthly Cost:</span>
                  <span className="text-2xl font-bold text-green-700">
                    ${calculateEstimatedCost(
                      requestFormData.storage_plan_id,
                      parseFloat(requestFormData.estimated_space_cubic_feet) || 0,
                      parseInt(requestFormData.estimated_pallet_count) || 0
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

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
                Create Request
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {requests.map((request) => (
          <div key={request.id} className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-lg font-semibold">
                    {request.vendors?.business_name || 'Unknown Vendor'}
                  </h4>
                  {getStatusBadge(request.status)}
                </div>
                <p className="text-sm text-gray-600">
                  {request.request_type} • {request.expected_sku_count} SKUs • ${request.expected_inventory_value.toLocaleString()}
                </p>
                {request.warehouse_storage_plans && (
                  <p className="text-sm text-blue-600 font-medium mt-1">
                    Plan: {request.warehouse_storage_plans.plan_name}
                  </p>
                )}
              </div>
              {request.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedRequest(request)}
                    className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Rejection reason:');
                      if (reason) handleUpdateRequestStatus(request.id, 'rejected', undefined, undefined, undefined, undefined, reason);
                    }}
                    className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500">Space</p>
                <p className="text-sm font-medium">{request.estimated_space_cubic_feet} cu ft</p>
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

            {request.warehouse_address && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-sm font-semibold text-green-800 mb-1">Warehouse Details:</p>
                <p className="text-sm text-green-700">{request.warehouse_address}</p>
                <p className="text-sm text-green-700">{request.warehouse_contact_email}</p>
                <p className="text-sm text-green-700">{request.warehouse_contact_phone}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {requests.length === 0 && !showRequestForm && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No warehouse requests yet</p>
          <button
            onClick={() => setShowRequestForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create First Request
          </button>
        </div>
      )}

      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Approve Warehouse Request</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleUpdateRequestStatus(
                  selectedRequest.id,
                  'approved',
                  formData.get('warehouse_address') as string,
                  formData.get('warehouse_contact_email') as string,
                  formData.get('warehouse_contact_phone') as string,
                  formData.get('arrival_deadline') as string
                );
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse Address *</label>
                <input
                  type="text"
                  name="warehouse_address"
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="123 Warehouse St, City, State, ZIP"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse Contact Email *</label>
                <input
                  type="email"
                  name="warehouse_contact_email"
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse Contact Phone *</label>
                <input
                  type="tel"
                  name="warehouse_contact_phone"
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Deadline</label>
                <input
                  type="date"
                  name="arrival_deadline"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Approve Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading warehouse management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-lg shadow-lg p-8 mb-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Warehouse className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Warehouse Management</h1>
        </div>
        <p className="text-blue-100">
          Manage storage plans, vendor requests, and warehouse operations
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex overflow-x-auto">
          <button
            onClick={() => setViewMode('plans')}
            className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 whitespace-nowrap ${
              viewMode === 'plans'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <DollarSign className="h-5 w-5" />
            Storage Plans
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
            Requests
            {requests.filter(r => r.status === 'pending').length > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
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
            <Box className="h-5 w-5" />
            Inventory
          </button>
        </div>
      </div>

      <div>
        {viewMode === 'plans' && renderPlansManagement()}
        {viewMode === 'requests' && renderRequestsManagement()}
      </div>
    </div>
  );
}
