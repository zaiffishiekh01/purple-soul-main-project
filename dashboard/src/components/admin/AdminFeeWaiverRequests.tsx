import { useState, useEffect } from 'react';
import { FileText, CheckCircle, XCircle, Clock, Eye, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { FeeWaiverRequest, FeeWaiverStatus, FeeWaiverType } from '../../types';

interface AdminFeeWaiverRequestsProps {
  // Can pass additional props if needed
}

export function AdminFeeWaiverRequests({}: AdminFeeWaiverRequestsProps) {
  const [requests, setRequests] = useState<FeeWaiverRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<FeeWaiverStatus | 'ALL'>('ALL');
  const [selectedRequest, setSelectedRequest] = useState<FeeWaiverRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [vendorDetails, setVendorDetails] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('fee_waiver_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'ALL') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setRequests(data || []);

      if (data && data.length > 0) {
        const vendorIds = [...new Set(data.map((r) => r.vendor_id))];
        const { data: vendors } = await supabase
          .from('vendors')
          .select('id, business_name, contact_email, address')
          .in('id', vendorIds);

        if (vendors) {
          const vendorMap: Record<string, any> = {};
          vendors.forEach((v) => {
            vendorMap[v.id] = v;
          });
          setVendorDetails(vendorMap);
        }
      }
    } catch (error) {
      console.error('Error fetching fee waiver requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const openDetailModal = (request: FeeWaiverRequest) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedRequest(null);
  };

  const getStatusBadge = (status: FeeWaiverStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
            <CheckCircle className="w-3 h-3" />
            Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'BPL_CARD':
        return 'Poverty-line Certificate';
      case 'INCOME_CERTIFICATE':
        return 'Income Certificate';
      case 'OTHER':
        return 'Other Document';
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const statusCounts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === 'PENDING').length,
    approved: requests.filter((r) => r.status === 'APPROVED').length,
    rejected: requests.filter((r) => r.status === 'REJECTED').length,
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Fee Waiver Requests</h2>
            <p className="text-sm text-gray-600 mt-1">Review and manage vendor fee support requests</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`p-4 rounded-xl text-left transition-all ${
              statusFilter === 'ALL'
                ? 'bg-blue-50 border-2 border-blue-500'
                : 'bg-gray-50 border border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-sm text-gray-600 mb-1">All Requests</div>
            <div className="text-2xl font-bold text-gray-900">{statusCounts.all}</div>
          </button>

          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`p-4 rounded-xl text-left transition-all ${
              statusFilter === 'PENDING'
                ? 'bg-yellow-50 border-2 border-yellow-500'
                : 'bg-gray-50 border border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-sm text-gray-600 mb-1">Pending</div>
            <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</div>
          </button>

          <button
            onClick={() => setStatusFilter('APPROVED')}
            className={`p-4 rounded-xl text-left transition-all ${
              statusFilter === 'APPROVED'
                ? 'bg-green-50 border-2 border-green-500'
                : 'bg-gray-50 border border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-sm text-gray-600 mb-1">Approved</div>
            <div className="text-2xl font-bold text-green-600">{statusCounts.approved}</div>
          </button>

          <button
            onClick={() => setStatusFilter('REJECTED')}
            className={`p-4 rounded-xl text-left transition-all ${
              statusFilter === 'REJECTED'
                ? 'bg-red-50 border-2 border-red-500'
                : 'bg-gray-50 border border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-sm text-gray-600 mb-1">Rejected</div>
            <div className="text-2xl font-bold text-red-600">{statusCounts.rejected}</div>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Document Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Waiver Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Valid Until
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.map((request) => {
                  const vendor = vendorDetails[request.vendor_id];
                  return (
                    <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {vendor?.business_name || 'Unknown Vendor'}
                          </div>
                          <div className="text-sm text-gray-600">{vendor?.contact_email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {getDocumentTypeLabel(request.document_type)}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(request.status)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(request.created_at)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {request.waiver_type
                          ? request.waiver_type === 'FULL_FEE_WAIVER'
                            ? 'Full Waiver'
                            : 'Reduced'
                          : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {request.valid_until ? formatDate(request.valid_until) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openDetailModal(request)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium inline-flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {requests.length === 0 && (
              <div className="py-12 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No fee waiver requests found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showDetailModal && selectedRequest && (
        <FeeWaiverDetailModal
          request={selectedRequest}
          vendor={vendorDetails[selectedRequest.vendor_id]}
          onClose={closeDetailModal}
          onUpdate={fetchRequests}
        />
      )}
    </div>
  );
}

interface FeeWaiverDetailModalProps {
  request: FeeWaiverRequest;
  vendor: any;
  onClose: () => void;
  onUpdate: () => void;
}

function FeeWaiverDetailModal({ request, vendor, onClose, onUpdate }: FeeWaiverDetailModalProps) {
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [waiverType, setWaiverType] = useState<FeeWaiverType>('FULL_FEE_WAIVER');
  const [commissionRate, setCommissionRate] = useState<string>('0');
  const [validUntilDate, setValidUntilDate] = useState<string>('');
  const [adminNote, setAdminNote] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [loadingDocument, setLoadingDocument] = useState(false);

  useEffect(() => {
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
    setValidUntilDate(sixMonthsFromNow.toISOString().split('T')[0]);
  }, []);

  const viewDocument = async () => {
    setLoadingDocument(true);
    try {
      const { data, error } = await supabase.storage
        .from('fee-waiver-docs')
        .createSignedUrl(request.document_url, 3600);

      if (error) throw error;

      if (data) {
        setDocumentUrl(data.signedUrl);
        window.open(data.signedUrl, '_blank');
      }
    } catch (error) {
      console.error('Error viewing document:', error);
      alert('Failed to load document');
    } finally {
      setLoadingDocument(false);
    }
  };

  const handleSubmit = async () => {
    if (!decision) {
      alert('Please select a decision');
      return;
    }

    if (decision === 'APPROVED' && !validUntilDate) {
      alert('Please set a valid until date for approved requests');
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('Not authenticated');

      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      const updates: Partial<FeeWaiverRequest> = {
        status: decision,
        note_from_admin: adminNote || null,
        reviewed_by_admin_id: adminUser?.id || null,
        reviewed_at: new Date().toISOString(),
      };

      if (decision === 'APPROVED') {
        updates.waiver_type = waiverType;
        updates.commission_rate = parseFloat(commissionRate) / 100;
        updates.valid_from = new Date().toISOString();
        updates.valid_until = new Date(validUntilDate).toISOString();
      }

      const { error } = await supabase
        .from('fee_waiver_requests')
        .update(updates)
        .eq('id', request.id);

      if (error) throw error;

      alert('Fee waiver request updated successfully');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating fee waiver request:', error);
      alert('Failed to update request');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'BPL_CARD':
        return 'Poverty-line Certificate';
      case 'INCOME_CERTIFICATE':
        return 'Income Certificate';
      case 'OTHER':
        return 'Other Document';
      default:
        return type;
    }
  };

  const isPending = request.status === 'PENDING';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Fee Waiver Request Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Vendor Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Business Name:</span>
                <p className="font-medium text-gray-900">{vendor?.business_name || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <p className="font-medium text-gray-900">{vendor?.contact_email || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Request Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Document Type:</span>
                <span className="font-medium text-gray-900">{getDocumentTypeLabel(request.document_type)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Submitted:</span>
                <span className="font-medium text-gray-900">{formatDate(request.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Current Status:</span>
                <span className="font-medium text-gray-900">{request.status}</span>
              </div>
              {request.note_from_vendor && (
                <div className="pt-3 border-t border-gray-200">
                  <span className="text-gray-600 block mb-2">Vendor's Note:</span>
                  <p className="text-gray-900 bg-white rounded p-3">{request.note_from_vendor}</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <button
              onClick={viewDocument}
              disabled={loadingDocument}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5" />
              {loadingDocument ? 'Loading Document...' : 'View Uploaded Document'}
            </button>
          </div>

          {isPending && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 space-y-6">
              <h3 className="font-semibold text-gray-900 text-lg">Make Decision</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Decision *</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setDecision('APPROVED')}
                      className={`px-4 py-3 rounded-lg font-medium transition-all ${
                        decision === 'APPROVED'
                          ? 'bg-green-600 text-white'
                          : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-green-600'
                      }`}
                    >
                      <CheckCircle className="w-5 h-5 inline mr-2" />
                      Approve
                    </button>
                    <button
                      onClick={() => setDecision('REJECTED')}
                      className={`px-4 py-3 rounded-lg font-medium transition-all ${
                        decision === 'REJECTED'
                          ? 'bg-red-600 text-white'
                          : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-red-600'
                      }`}
                    >
                      <XCircle className="w-5 h-5 inline mr-2" />
                      Reject
                    </button>
                  </div>
                </div>

                {decision === 'APPROVED' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Waiver Type *</label>
                      <select
                        value={waiverType}
                        onChange={(e) => setWaiverType(e.target.value as FeeWaiverType)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="FULL_FEE_WAIVER">Full Fee Waiver (0%)</option>
                        <option value="REDUCED_COMMISSION">Reduced Commission</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Commission Rate (%) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={commissionRate}
                        onChange={(e) => setCommissionRate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 0 or 2"
                      />
                      <p className="mt-1 text-xs text-gray-500">Enter 0 for full waiver, or a reduced rate like 2%</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Valid Until *</label>
                      <input
                        type="date"
                        value={validUntilDate}
                        onChange={(e) => setValidUntilDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {decision === 'REJECTED' ? 'Rejection Reason *' : 'Admin Note (Optional)'}
                  </label>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={
                      decision === 'REJECTED'
                        ? 'Explain why the request was rejected...'
                        : 'Add any notes for the vendor...'
                    }
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting || !decision}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Decision'}
                </button>
              </div>
            </div>
          )}

          {!isPending && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Decision History</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-gray-900">{request.status}</span>
                </div>
                {request.waiver_type && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Waiver Type:</span>
                    <span className="font-medium text-gray-900">
                      {request.waiver_type === 'FULL_FEE_WAIVER' ? 'Full Fee Waiver' : 'Reduced Commission'}
                    </span>
                  </div>
                )}
                {request.commission_rate !== null && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Commission Rate:</span>
                    <span className="font-medium text-gray-900">{(request.commission_rate * 100).toFixed(1)}%</span>
                  </div>
                )}
                {request.valid_until && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Valid Until:</span>
                    <span className="font-medium text-gray-900">{formatDate(request.valid_until)}</span>
                  </div>
                )}
                {request.reviewed_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reviewed At:</span>
                    <span className="font-medium text-gray-900">{formatDate(request.reviewed_at)}</span>
                  </div>
                )}
                {request.note_from_admin && (
                  <div className="pt-3 border-t border-gray-200">
                    <span className="text-gray-600 block mb-2">Admin Note:</span>
                    <p className="text-gray-900 bg-white rounded p-3">{request.note_from_admin}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
