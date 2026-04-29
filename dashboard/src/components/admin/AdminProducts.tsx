import { useState } from 'react';
import { Package, Search, Eye, CreditCard as Edit2, X as XIcon, Check, CheckCircle, XCircle, AlertCircle, Power, Clock, ChevronDown } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

type ApprovalFilter = 'all' | 'pending_review' | 'approved' | 'rejected' | 'deactivated';

const APPROVAL_COLORS: Record<string, string> = {
  pending_review: 'bg-amber-100 text-amber-700 border-amber-200',
  approved: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  deactivated: 'bg-gray-100 text-gray-500 border-gray-200',
};

const APPROVAL_LABELS: Record<string, string> = {
  pending_review: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
  deactivated: 'Deactivated',
};

export function AdminProducts() {
  const { products, loading, updateProduct, refetch } = useProducts();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [approvalFilter, setApprovalFilter] = useState<ApprovalFilter>('all');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<'markup' | 'discount' | null>(null);
  const [adjustmentValue, setAdjustmentValue] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<'amount' | 'percent'>('percent');

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [deactivateModal, setDeactivateModal] = useState<{ product: any } | null>(null);
  const [deactivateReason, setDeactivateReason] = useState('');

  const [rejectModal, setRejectModal] = useState<{ product: any } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.sku ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesApproval = approvalFilter === 'all' || (product as any).approval_status === approvalFilter;
    return matchesSearch && matchesCategory && matchesApproval;
  });

  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  const stats = {
    total: products.length,
    pending: products.filter(p => (p as any).approval_status === 'pending_review').length,
    approved: products.filter(p => (p as any).approval_status === 'approved').length,
    deactivated: products.filter(p => (p as any).approval_status === 'deactivated').length,
  };

  const sendVendorNotification = async (vendorId: string, title: string, message: string, type: string) => {
    try {
      await supabase.from('notifications').insert({
        vendor_id: vendorId,
        title,
        message,
        type,
        is_read: false,
      });
    } catch (e) {
      console.warn('Could not send notification:', e);
    }
  };

  const handleApprove = async (product: any) => {
    setActionLoading(product.id);
    try {
      await updateProduct(product.id, {
        approval_status: 'approved',
        status: 'active',
        approved_by: user?.id,
        approved_at: new Date().toISOString(),
        rejection_reason: null,
        deactivation_reason: null,
      } as any);
      await sendVendorNotification(
        product.vendor_id,
        'Product Approved',
        `Your product "${product.name}" has been approved and is now live on the marketplace.`,
        'product_approved'
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    const { product } = rejectModal;
    setActionLoading(product.id);
    try {
      await updateProduct(product.id, {
        approval_status: 'rejected',
        status: 'draft',
        rejection_reason: rejectReason || null,
      } as any);
      await sendVendorNotification(
        product.vendor_id,
        'Product Rejected',
        `Your product "${product.name}" was not approved.${rejectReason ? ` Reason: ${rejectReason}` : ''}`,
        'product_rejected'
      );
      setRejectModal(null);
      setRejectReason('');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateModal) return;
    const { product } = deactivateModal;
    setActionLoading(product.id);
    try {
      await updateProduct(product.id, {
        approval_status: 'deactivated',
        status: 'archived',
        deactivation_reason: deactivateReason || null,
      } as any);
      await sendVendorNotification(
        product.vendor_id,
        'Product Deactivated',
        `Your product "${product.name}" has been deactivated by an admin.${deactivateReason ? ` Reason: ${deactivateReason}` : ''}`,
        'product_deactivated'
      );
      setDeactivateModal(null);
      setDeactivateReason('');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivate = async (product: any) => {
    setActionLoading(product.id);
    try {
      await updateProduct(product.id, {
        approval_status: 'approved',
        status: 'active',
        deactivation_reason: null,
      } as any);
      await sendVendorNotification(
        product.vendor_id,
        'Product Reactivated',
        `Your product "${product.name}" has been reactivated and is live on the marketplace.`,
        'product_approved'
      );
    } finally {
      setActionLoading(null);
    }
  };

  const calculateFinalPrice = (product: any, markupAmount: number, markupType: string, discountAmount: number, discountType: string) => {
    const cost = product.cost || 0;
    let price = cost;
    if (markupAmount > 0) {
      price = markupType === 'percent' ? cost + (cost * markupAmount / 100) : cost + markupAmount;
    }
    if (discountAmount > 0) {
      price = discountType === 'percent' ? price - (price * discountAmount / 100) : price - discountAmount;
    }
    return Math.max(0, price);
  };

  const handleAdjustment = async (productId: string, product: any, field: 'markup' | 'discount') => {
    const value = parseFloat(adjustmentValue);
    if (isNaN(value) || value < 0) return;
    const updates: any = {};
    if (field === 'markup') {
      updates.markup_amount = value;
      updates.markup_type = adjustmentType;
    } else {
      updates.discount_amount = value;
      updates.discount_type = adjustmentType;
    }
    const mA = field === 'markup' ? value : (product.markup_amount || 0);
    const mT = field === 'markup' ? adjustmentType : (product.markup_type || 'percent');
    const dA = field === 'discount' ? value : (product.discount_amount || 0);
    const dT = field === 'discount' ? adjustmentType : (product.discount_type || 'percent');
    updates.final_price = calculateFinalPrice(product, mA, mT, dA, dT);
    updates.price = updates.final_price;
    try {
      await updateProduct(productId, updates);
      setEditingProductId(null);
      setEditingField(null);
      setAdjustmentValue('');
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Package className="w-8 h-8 text-emerald-600" />
            All Products
          </h1>
          <p className="text-gray-600 mt-1">Review, approve, and manage all platform products</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => setApprovalFilter('all')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${approvalFilter === 'all' ? 'ring-2 ring-gray-400' : ''} bg-white shadow-sm border-gray-200`}
        >
          <div className="text-sm text-gray-600">Total</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
        </div>
        <div
          onClick={() => setApprovalFilter('pending_review')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${approvalFilter === 'pending_review' ? 'ring-2 ring-amber-400' : ''} bg-amber-50 border-amber-200`}
        >
          <div className="text-sm text-amber-700">Pending Review</div>
          <div className="text-2xl font-bold text-amber-900 mt-1">{stats.pending}</div>
        </div>
        <div
          onClick={() => setApprovalFilter('approved')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${approvalFilter === 'approved' ? 'ring-2 ring-green-400' : ''} bg-green-50 border-green-200`}
        >
          <div className="text-sm text-green-700">Approved</div>
          <div className="text-2xl font-bold text-green-900 mt-1">{stats.approved}</div>
        </div>
        <div
          onClick={() => setApprovalFilter('deactivated')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${approvalFilter === 'deactivated' ? 'ring-2 ring-gray-400' : ''} bg-gray-50 border-gray-200`}
        >
          <div className="text-sm text-gray-600">Deactivated</div>
          <div className="text-2xl font-bold text-gray-700 mt-1">{stats.deactivated}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select
            value={approvalFilter}
            onChange={e => setApprovalFilter(e.target.value as ApprovalFilter)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="pending_review">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="deactivated">Deactivated</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="py-3 px-3 font-semibold text-gray-700 text-sm">Product</th>
                <th className="py-3 px-3 font-semibold text-gray-700 text-sm">SKU</th>
                <th className="py-3 px-3 font-semibold text-gray-700 text-sm">Category</th>
                <th className="py-3 px-3 font-semibold text-gray-700 text-sm">Cost</th>
                <th className="py-3 px-3 font-semibold text-gray-700 text-sm">Markup</th>
                <th className="py-3 px-3 font-semibold text-gray-700 text-sm">Discount</th>
                <th className="py-3 px-3 font-semibold text-gray-700 text-sm">Price</th>
                <th className="py-3 px-3 font-semibold text-gray-700 text-sm">Stock</th>
                <th className="py-3 px-3 font-semibold text-gray-700 text-sm">Approval</th>
                <th className="py-3 px-3 font-semibold text-gray-700 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => {
                const ap = (product as any).approval_status ?? 'pending_review';
                const isLoading = actionLoading === product.id;
                return (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <Package className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 text-sm truncate max-w-[160px]">{product.name}</div>
                          <div className="text-xs text-gray-500 truncate max-w-[160px]">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono text-xs text-gray-600">{product.sku}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-sm text-gray-700">{product.category}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-sm text-gray-700">${(product.cost || 0).toFixed(2)}</span>
                    </td>
                    <td className="py-3 px-3">
                      {editingProductId === product.id && editingField === 'markup' ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number" step="0.01" min="0" value={adjustmentValue}
                            onChange={e => setAdjustmentValue(e.target.value)}
                            className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
                            autoFocus
                          />
                          <select value={adjustmentType} onChange={e => setAdjustmentType(e.target.value as any)} className="px-1 py-1 text-xs border border-gray-300 rounded">
                            <option value="percent">%</option>
                            <option value="amount">$</option>
                          </select>
                          <button onClick={() => handleAdjustment(product.id, product, 'markup')} className="p-1 bg-green-600 text-white rounded">
                            <Check className="w-3 h-3" />
                          </button>
                          <button onClick={() => { setEditingProductId(null); setEditingField(null); }} className="p-1 bg-gray-400 text-white rounded">
                            <XIcon className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-green-600 font-medium">
                            {(product as any).markup_amount > 0 ? `+${(product as any).markup_type === 'percent' ? (product as any).markup_amount + '%' : '$' + (product as any).markup_amount?.toFixed(2)}` : '—'}
                          </span>
                          <button onClick={() => { setEditingProductId(product.id); setEditingField('markup'); setAdjustmentValue(''); setAdjustmentType('percent'); }} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600">
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {editingProductId === product.id && editingField === 'discount' ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number" step="0.01" min="0" value={adjustmentValue}
                            onChange={e => setAdjustmentValue(e.target.value)}
                            className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
                            autoFocus
                          />
                          <select value={adjustmentType} onChange={e => setAdjustmentType(e.target.value as any)} className="px-1 py-1 text-xs border border-gray-300 rounded">
                            <option value="percent">%</option>
                            <option value="amount">$</option>
                          </select>
                          <button onClick={() => handleAdjustment(product.id, product, 'discount')} className="p-1 bg-green-600 text-white rounded">
                            <Check className="w-3 h-3" />
                          </button>
                          <button onClick={() => { setEditingProductId(null); setEditingField(null); }} className="p-1 bg-gray-400 text-white rounded">
                            <XIcon className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-red-500 font-medium">
                            {(product as any).discount_amount > 0 ? `-${(product as any).discount_type === 'percent' ? (product as any).discount_amount + '%' : '$' + (product as any).discount_amount?.toFixed(2)}` : '—'}
                          </span>
                          <button onClick={() => { setEditingProductId(product.id); setEditingField('discount'); setAdjustmentValue(''); setAdjustmentType('percent'); }} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600">
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-sm font-semibold text-gray-900">${((product as any).final_price || product.price || 0).toFixed(2)}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-sm font-medium ${product.stock_quantity === 0 ? 'text-red-600' : product.stock_quantity < 10 ? 'text-amber-600' : 'text-gray-700'}`}>
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${APPROVAL_COLORS[ap] ?? APPROVAL_COLORS.pending_review}`}>
                        {ap === 'pending_review' && <Clock className="w-3 h-3 mr-1" />}
                        {ap === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {ap === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                        {ap === 'deactivated' && <Power className="w-3 h-3 mr-1" />}
                        {APPROVAL_LABELS[ap] ?? ap}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-600 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {ap === 'pending_review' && (
                          <>
                            <button
                              onClick={() => handleApprove(product)}
                              disabled={isLoading}
                              className="p-1.5 hover:bg-green-50 rounded-lg text-green-600 transition-colors disabled:opacity-40"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => { setRejectModal({ product }); setRejectReason(''); }}
                              disabled={isLoading}
                              className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors disabled:opacity-40"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {ap === 'approved' && (
                          <button
                            onClick={() => { setDeactivateModal({ product }); setDeactivateReason(''); }}
                            disabled={isLoading}
                            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors disabled:opacity-40"
                            title="Deactivate"
                          >
                            <Power className="w-4 h-4" />
                          </button>
                        )}
                        {ap === 'deactivated' && (
                          <button
                            onClick={() => handleReactivate(product)}
                            disabled={isLoading}
                            className="p-1.5 hover:bg-green-50 rounded-lg text-green-600 transition-colors disabled:opacity-40"
                            title="Reactivate"
                          >
                            <Power className="w-4 h-4" />
                          </button>
                        )}
                        {ap === 'rejected' && (
                          <button
                            onClick={() => handleApprove(product)}
                            disabled={isLoading}
                            className="p-1.5 hover:bg-green-50 rounded-lg text-green-600 transition-colors disabled:opacity-40"
                            title="Approve anyway"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-gray-500">No products match your filters</div>
          )}
        </div>
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Product Details</h2>
              <button onClick={() => setSelectedProduct(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {selectedProduct.images?.[0] && (
                <img src={selectedProduct.images[0]} alt={selectedProduct.name} className="w-full h-56 object-cover rounded-lg" />
              )}
              {selectedProduct.images?.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {selectedProduct.images.slice(1).map((img: string, i: number) => (
                    <img key={i} src={img} alt="" className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
                  ))}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ['Name', selectedProduct.name],
                  ['SKU', selectedProduct.sku],
                  ['Category', selectedProduct.category],
                  ['Price', `$${(selectedProduct.price || 0).toFixed(2)}`],
                  ['Cost', `$${(selectedProduct.cost || 0).toFixed(2)}`],
                  ['Stock', selectedProduct.stock_quantity],
                  ['Status', selectedProduct.status],
                  ['Approval', APPROVAL_LABELS[selectedProduct.approval_status] ?? selectedProduct.approval_status],
                  ['Material', selectedProduct.material || '—'],
                  ['Color', selectedProduct.color || '—'],
                  ['Size / Dimensions', selectedProduct.size_dimensions || '—'],
                  ['Shipping Timeline', selectedProduct.shipping_timeline || '—'],
                ].map(([label, val]) => (
                  <div key={label as string} className="flex flex-col gap-0.5">
                    <span className="text-gray-500 text-xs">{label}</span>
                    <span className="font-medium text-gray-900">{val as string}</span>
                  </div>
                ))}
              </div>
              {selectedProduct.description && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Description</p>
                  <p className="text-sm text-gray-700">{selectedProduct.description}</p>
                </div>
              )}
              {selectedProduct.deactivation_reason && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-600 mb-1">Deactivation Reason</p>
                  <p className="text-sm text-gray-700">{selectedProduct.deactivation_reason}</p>
                </div>
              )}
              {selectedProduct.rejection_reason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-red-600 mb-1">Rejection Reason</p>
                  <p className="text-sm text-red-700">{selectedProduct.rejection_reason}</p>
                </div>
              )}
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                {selectedProduct.approval_status === 'pending_review' && (
                  <>
                    <button
                      onClick={() => { handleApprove(selectedProduct); setSelectedProduct(null); }}
                      className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                    <button
                      onClick={() => { setSelectedProduct(null); setRejectModal({ product: selectedProduct }); }}
                      className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </>
                )}
                {selectedProduct.approval_status === 'approved' && (
                  <button
                    onClick={() => { setSelectedProduct(null); setDeactivateModal({ product: selectedProduct }); }}
                    className="flex-1 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <Power className="w-4 h-4" /> Deactivate
                  </button>
                )}
                {selectedProduct.approval_status === 'deactivated' && (
                  <button
                    onClick={() => { handleReactivate(selectedProduct); setSelectedProduct(null); }}
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <Power className="w-4 h-4" /> Reactivate
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {deactivateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Deactivate Product</h3>
            <p className="text-sm text-gray-600 mb-4">
              You are deactivating <strong>{deactivateModal.product.name}</strong>. The vendor will be notified.
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason (required)</label>
            <textarea
              rows={3}
              value={deactivateReason}
              onChange={e => setDeactivateReason(e.target.value)}
              placeholder="Explain why this product is being deactivated..."
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent text-sm resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setDeactivateModal(null)}
                className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivate}
                disabled={!deactivateReason.trim() || actionLoading === deactivateModal.product.id}
                className="flex-1 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Power className="w-4 h-4" /> Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Reject Product</h3>
            <p className="text-sm text-gray-600 mb-4">
              You are rejecting <strong>{rejectModal.product.name}</strong>. The vendor will be notified.
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason (optional)</label>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Explain why this product is being rejected..."
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-300 focus:border-transparent text-sm resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setRejectModal(null)}
                className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading === rejectModal.product.id}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" /> Reject Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
