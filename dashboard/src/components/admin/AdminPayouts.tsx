import { useState, useEffect } from 'react';
import { DollarSign, CheckCircle, XCircle, Clock, Settings, MessageSquare, Zap, RotateCcw, FileText, Download, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { NEXT_PUBLIC_SUPABASE_URL } from '../../lib/env';

interface PayoutRequest {
  id: string;
  vendor_id: string;
  amount: number;
  platform_fee: number;
  net_amount: number;
  status: string;
  request_date: string;
  processed_date?: string;
  transfer_initiated_date?: string;
  transfer_completed_date?: string;
  bank_transfer_id?: string;
  failure_reason?: string;
  rejection_reason?: string;
  retry_count?: number;
  transaction_id?: string;
  notes?: string;
  vendors?: {
    business_name: string;
    contact_email: string;
  };
}

interface PlatformFee {
  id: string;
  vendor_id: string;
  fee_percentage: number;
  fee_type: string;
  vendors?: {
    business_name: string;
  };
}

export function AdminPayouts() {
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [platformFees, setPlatformFees] = useState<PlatformFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'requests' | 'fees'>('requests');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<PayoutRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [failureReason, setFailureReason] = useState('');
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [feePercentage, setFeePercentage] = useState('');
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [workflowStep, setWorkflowStep] = useState(1);
  const [useAutomaticPayout, setUseAutomaticPayout] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (force = false) => {
    if (force) {
      setLoading(true);
    }
    try {
      const [payoutsRes, feesRes] = await Promise.all([
        supabase
          .from('payout_requests')
          .select(`
            *,
            vendors (
              business_name,
              contact_email
            )
          `)
          .order('request_date', { ascending: false }),
        supabase
          .from('platform_fees')
          .select(`
            *,
            vendors (
              business_name
            )
          `)
      ]);

      if (payoutsRes.data) setPayoutRequests(payoutsRes.data);
      if (feesRes.data) setPlatformFees(feesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    setProcessingAction(requestId);
    try {
      const { error } = await supabase
        .from('payout_requests')
        .update({
          status: 'approved',
          processed_date: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) throw error;

      const request = payoutRequests.find(r => r.id === requestId);
      if (request?.vendors) {
        await supabase.from('notifications').insert({
          vendor_id: request.vendor_id,
          type: 'payment',
          title: 'Payout Approved',
          message: `Your payout request of $${request.net_amount.toFixed(2)} has been approved and will be processed shortly.`,
          is_read: false,
        });
      }

      setSuccessMessage('✅ Payout approved! Status changed to APPROVED.');
      setTimeout(() => setSuccessMessage(null), 3000);
      await fetchData(true);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error approving payout:', error);
      alert('Failed to approve payout. Please try again.');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleReject = async (requestId: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      const { error } = await supabase
        .from('payout_requests')
        .update({
          status: 'rejected',
          processed_date: new Date().toISOString(),
          rejection_reason: rejectionReason,
        })
        .eq('id', requestId);

      if (error) throw error;

      const request = payoutRequests.find(r => r.id === requestId);
      if (request?.vendors) {
        await supabase.from('notifications').insert({
          vendor_id: request.vendor_id,
          type: 'payment',
          title: 'Payout Rejected',
          message: `Your payout request has been rejected. Reason: ${rejectionReason}`,
          is_read: false,
        });
      }

      await fetchData(true);
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting payout:', error);
    }
  };

  const handleProcessTransfer = async (requestId: string, useStripe = false) => {
    setProcessingAction(requestId);
    try {
      const request = payoutRequests.find(r => r.id === requestId);
      if (!request) throw new Error('Payout request not found');

      if (useStripe) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Not authenticated');

        const response = await fetch(
          `${NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-automatic-payout`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              payoutRequestId: requestId,
              vendorId: request.vendor_id,
              amount: request.net_amount,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to process automatic payout');
        }

        const result = await response.json();

        setSuccessMessage(`✅ Automatic payout completed via Stripe! Transfer ID: ${result.transferId}`);
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        const transferId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const { error } = await supabase
          .from('payout_requests')
          .update({
            status: 'processing',
            transfer_initiated_date: new Date().toISOString(),
            bank_transfer_id: transferId,
            auto_payout_enabled: false,
          })
          .eq('id', requestId);

        if (error) throw error;

        if (request?.vendors) {
          await supabase.from('notifications').insert({
            vendor_id: request.vendor_id,
            type: 'payment',
            title: 'Payout Processing',
            message: `Your payout of $${request.net_amount.toFixed(2)} is being processed by the bank. Transfer ID: ${transferId}`,
            is_read: false,
          });
        }

        setSuccessMessage('⚡ Bank transfer initiated! Status changed to PROCESSING.');
        setTimeout(() => setSuccessMessage(null), 3000);
      }

      await fetchData(true);
    } catch (error: any) {
      console.error('Error processing transfer:', error);
      alert(`Failed to process transfer: ${error.message || 'Please try again.'}`);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleMarkCompleted = async (requestId: string) => {
    setProcessingAction(requestId);
    try {
      const request = payoutRequests.find(r => r.id === requestId);
      if (!request) {
        throw new Error('Payout request not found');
      }

      const { data: updatedRequest, error: updateError } = await supabase
        .from('payout_requests')
        .update({
          status: 'completed',
          transfer_completed_date: new Date().toISOString(),
        })
        .eq('id', requestId)
        .select()
        .single();

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      const transactionId = `PAYOUT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          vendor_id: request.vendor_id,
          type: 'payout',
          amount: request.net_amount,
          status: 'completed',
          description: `Payout completed - Transfer ID: ${request.bank_transfer_id}`,
          reference_id: transactionId,
        });

      if (transactionError) {
        console.error('Transaction creation error:', transactionError);
      }

      const { error: notificationError } = await supabase.from('notifications').insert({
        vendor_id: request.vendor_id,
        type: 'payment',
        title: 'Payout Completed',
        message: `Your payout of $${request.net_amount.toFixed(2)} has been completed successfully. Funds are now available in your account. Transaction ID: ${transactionId}`,
        is_read: false,
      });

      if (notificationError) {
        console.error('Notification error:', notificationError);
      }

      setSuccessMessage('✅ Payout completed! Transaction record created. Status changed to COMPLETED.');
      setTimeout(() => setSuccessMessage(null), 4000);
      await fetchData(true);
    } catch (error: any) {
      console.error('Error completing payout:', error);
      alert(`Failed to complete payout: ${error.message || 'Please try again.'}`);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleMarkFailed = async (requestId: string) => {
    if (!failureReason.trim()) {
      alert('Please provide a failure reason');
      return;
    }

    try {
      const { error } = await supabase
        .from('payout_requests')
        .update({
          status: 'failed',
          failure_reason: failureReason,
        })
        .eq('id', requestId);

      if (error) throw error;

      const request = payoutRequests.find(r => r.id === requestId);
      if (request?.vendors) {
        await supabase.from('notifications').insert({
          vendor_id: request.vendor_id,
          type: 'payment',
          title: 'Payout Failed',
          message: `Your payout transfer failed. Reason: ${failureReason}. Please update your bank details or contact support.`,
          is_read: false,
        });
      }

      await fetchData(true);
      setShowFailModal(false);
      setSelectedRequest(null);
      setFailureReason('');
    } catch (error) {
      console.error('Error marking as failed:', error);
    }
  };

  const handleRetryTransfer = async (requestId: string) => {
    setProcessingAction(requestId);
    try {
      const request = payoutRequests.find(r => r.id === requestId);
      const newTransferId = `TXN-RETRY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newRetryCount = (request?.retry_count || 0) + 1;

      const { error } = await supabase
        .from('payout_requests')
        .update({
          status: 'processing',
          transfer_initiated_date: new Date().toISOString(),
          bank_transfer_id: newTransferId,
          retry_count: newRetryCount,
          failure_reason: null,
        })
        .eq('id', requestId);

      if (error) throw error;

      if (request?.vendors) {
        await supabase.from('notifications').insert({
          vendor_id: request.vendor_id,
          type: 'payment',
          title: 'Payout Retry Initiated',
          message: `Retry attempt #${newRetryCount} for your payout of $${request.net_amount.toFixed(2)} has been initiated.`,
          is_read: false,
        });
      }

      setSuccessMessage(`🔄 Retry #${newRetryCount} initiated! Status changed to PROCESSING.`);
      setTimeout(() => setSuccessMessage(null), 3000);
      await fetchData(true);
    } catch (error) {
      console.error('Error retrying transfer:', error);
      alert('Failed to retry transfer. Please try again.');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleUpdateFee = async () => {
    if (!selectedVendor || !feePercentage) return;

    const fee = parseFloat(feePercentage);
    if (isNaN(fee) || fee < 0 || fee > 100) {
      alert('Please enter a valid percentage between 0 and 100');
      return;
    }

    try {
      const existingFee = platformFees.find(f => f.vendor_id === selectedVendor.id);

      if (existingFee) {
        await supabase
          .from('platform_fees')
          .update({ fee_percentage: fee, updated_at: new Date().toISOString() })
          .eq('id', existingFee.id);
      } else {
        await supabase
          .from('platform_fees')
          .insert({
            vendor_id: selectedVendor.id,
            fee_percentage: fee,
            fee_type: 'percentage',
          });
      }

      await supabase.from('notifications').insert({
        vendor_id: selectedVendor.id,
        type: 'system',
        title: 'Platform Fee Updated',
        message: `Your platform fee has been ${existingFee ? 'updated to' : 'set at'} ${fee}%`,
        is_read: false,
      });

      fetchData();
      setShowFeeModal(false);
      setSelectedVendor(null);
      setFeePercentage('');
    } catch (error) {
      console.error('Error updating platform fee:', error);
    }
  };

  const filteredRequests = payoutRequests.filter(req =>
    statusFilter === 'all' || req.status === statusFilter
  );

  const stats = {
    pending: payoutRequests.filter(r => r.status === 'pending').length,
    approved: payoutRequests.filter(r => r.status === 'approved').length,
    processing: payoutRequests.filter(r => r.status === 'processing').length,
    completed: payoutRequests.filter(r => r.status === 'completed').length,
    failed: payoutRequests.filter(r => r.status === 'failed').length,
    rejected: payoutRequests.filter(r => r.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-emerald-600" />
            Payout Management
          </h1>
          <p className="text-gray-600 mt-1">Manage vendor payouts and platform fees</p>
        </div>
      </div>

      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg shadow-sm animate-pulse">
          <div className="flex items-center gap-2 text-green-800 font-medium">
            <CheckCircle className="w-5 h-5" />
            {successMessage}
          </div>
        </div>
      )}

      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'requests'
              ? 'text-emerald-600 border-b-2 border-emerald-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Payout Requests
        </button>
        <button
          onClick={() => setActiveTab('fees')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'fees'
              ? 'text-emerald-600 border-b-2 border-emerald-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Platform Fees
        </button>
      </div>

      {activeTab === 'requests' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-yellow-50 p-4 rounded-xl shadow-sm border border-yellow-200">
              <div className="text-sm text-yellow-700">Pending</div>
              <div className="text-2xl font-bold text-yellow-900 mt-1">{stats.pending}</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl shadow-sm border border-blue-200">
              <div className="text-sm text-blue-700">Approved</div>
              <div className="text-2xl font-bold text-blue-900 mt-1">{stats.approved}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl shadow-sm border border-purple-200">
              <div className="text-sm text-purple-700">Processing</div>
              <div className="text-2xl font-bold text-purple-900 mt-1">{stats.processing}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-xl shadow-sm border border-green-200">
              <div className="text-sm text-green-700">Completed</div>
              <div className="text-2xl font-bold text-green-900 mt-1">{stats.completed}</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-xl shadow-sm border border-orange-200">
              <div className="text-sm text-orange-700">Failed</div>
              <div className="text-2xl font-bold text-orange-900 mt-1">{stats.failed}</div>
            </div>
            <div className="bg-red-50 p-4 rounded-xl shadow-sm border border-red-200">
              <div className="text-sm text-red-700">Rejected</div>
              <div className="text-2xl font-bold text-red-900 mt-1">{stats.rejected}</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">All Payout Requests</h2>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Vendor</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Platform Fee</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Net Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Request Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">{request.vendors?.business_name}</div>
                        <div className="text-sm text-gray-600">{request.vendors?.contact_email}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-gray-900">${request.amount.toFixed(2)}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-red-600">-${request.platform_fee.toFixed(2)}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-green-600">${request.net_amount.toFixed(2)}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                          request.status === 'approved' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                          request.status === 'processing' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                          request.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' :
                          request.status === 'failed' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                          'bg-red-100 text-red-700 border-red-200'
                        }`}>
                          {request.status === 'pending' && <Clock className="w-3 h-3" />}
                          {request.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                          {request.status === 'processing' && <Zap className="w-3 h-3" />}
                          {request.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                          {request.status === 'failed' && <XCircle className="w-3 h-3" />}
                          {request.status === 'rejected' && <XCircle className="w-3 h-3" />}
                          {request.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-600">
                          {new Date(request.request_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {request.status === 'pending' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowApprovalModal(true);
                                  setWorkflowStep(1);
                                }}
                                disabled={processingAction === request.id}
                                className="px-3 py-1.5 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-green-600 text-sm font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Approve"
                              >
                                {processingAction === request.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowRejectModal(true);
                                }}
                                disabled={processingAction === request.id}
                                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-red-600 text-sm font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                                Reject
                              </button>
                            </>
                          )}
                          {request.status === 'approved' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowProcessModal(true);
                                  setWorkflowStep(2);
                                }}
                                disabled={processingAction === request.id}
                                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-blue-600 text-sm font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Process Transfer"
                              >
                                {processingAction === request.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                ) : (
                                  <Zap className="w-4 h-4" />
                                )}
                                Process
                              </button>
                            </>
                          )}
                          {request.status === 'processing' && (
                            <>
                              <button
                                onClick={() => {
                                  console.log('Complete button clicked!', request);
                                  setSelectedRequest(request);
                                  setShowCompleteModal(true);
                                  setWorkflowStep(3);
                                  console.log('Modal should open now - showCompleteModal set to true');
                                }}
                                disabled={processingAction === request.id}
                                className="px-3 py-1.5 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-green-600 text-sm font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Mark as Completed"
                              >
                                {processingAction === request.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                                Complete
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowFailModal(true);
                                }}
                                disabled={processingAction === request.id}
                                className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-orange-600 text-sm font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Mark as Failed"
                              >
                                <XCircle className="w-4 h-4" />
                                Fail
                              </button>
                            </>
                          )}
                          {request.status === 'completed' && (
                            <>
                              <button
                                className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 text-sm font-medium flex items-center gap-1"
                                title="View Transaction"
                              >
                                <FileText className="w-4 h-4" />
                                Transaction
                              </button>
                            </>
                          )}
                          {request.status === 'failed' && (
                            <>
                              <button
                                onClick={() => handleRetryTransfer(request.id)}
                                disabled={processingAction === request.id}
                                className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-orange-600 text-sm font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Retry Transfer"
                              >
                                {processingAction === request.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                                ) : (
                                  <RotateCcw className="w-4 h-4" />
                                )}
                                Retry {request.retry_count ? `(${request.retry_count})` : ''}
                              </button>
                            </>
                          )}
                          {request.status === 'rejected' && (
                            <span className="text-xs text-gray-500">No actions</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'fees' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Platform Fees by Vendor</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Vendor</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Fee Percentage</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Fee Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {platformFees.map((fee) => (
                  <tr key={fee.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">{fee.vendors?.business_name}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-gray-900">{fee.fee_percentage}%</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-600 capitalize">{fee.fee_type}</div>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => {
                          setSelectedVendor({ id: fee.vendor_id, business_name: fee.vendors?.business_name });
                          setFeePercentage(fee.fee_percentage.toString());
                          setShowFeeModal(true);
                        }}
                        className="p-2 hover:bg-emerald-50 rounded-lg transition-colors text-emerald-600"
                        title="Update Fee"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Reject Payout Request</h2>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedRequest(null);
                  setRejectionReason('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor: {selectedRequest.vendors?.business_name}
                </label>
                <div className="text-sm text-gray-600">
                  Amount: ${selectedRequest.net_amount.toFixed(2)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Explain why this payout is being rejected..."
                  required
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedRequest(null);
                    setRejectionReason('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(selectedRequest.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Reject Payout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showFailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Mark Transfer as Failed</h2>
              <button
                onClick={() => {
                  setShowFailModal(false);
                  setSelectedRequest(null);
                  setFailureReason('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor: {selectedRequest.vendors?.business_name}
                </label>
                <div className="text-sm text-gray-600">
                  Amount: ${selectedRequest.net_amount.toFixed(2)}
                </div>
                {selectedRequest.bank_transfer_id && (
                  <div className="text-sm text-gray-600">
                    Transfer ID: {selectedRequest.bank_transfer_id}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Failure Reason *
                </label>
                <textarea
                  value={failureReason}
                  onChange={(e) => setFailureReason(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Explain why the bank transfer failed (e.g., Invalid account, Insufficient funds)..."
                  required
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowFailModal(false);
                    setSelectedRequest(null);
                    setFailureReason('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleMarkFailed(selectedRequest.id)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Mark as Failed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showFeeModal && selectedVendor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Update Platform Fee</h2>
              <button
                onClick={() => {
                  setShowFeeModal(false);
                  setSelectedVendor(null);
                  setFeePercentage('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor: {selectedVendor.business_name}
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fee Percentage (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={feePercentage}
                  onChange={(e) => setFeePercentage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter fee percentage (e.g., 5.5)"
                />
                <p className="text-sm text-gray-500 mt-1">
                  This percentage will be deducted from vendor payouts
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowFeeModal(false);
                    setSelectedVendor(null);
                    setFeePercentage('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateFee}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Update Fee
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showApprovalModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Approve Payout Request</h2>
                  <p className="text-sm text-gray-500 mt-1">Step 1 of 3 - Review and Approve</p>
                </div>
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setSelectedRequest(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <div className="flex-1 h-2 bg-emerald-500 rounded"></div>
                <div className="flex-1 h-2 bg-gray-200 rounded"></div>
                <div className="flex-1 h-2 bg-gray-200 rounded"></div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900">Payout Summary</h3>
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Vendor:</span>
                        <span className="font-medium">{selectedRequest.vendors?.business_name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{selectedRequest.vendors?.contact_email}</span>
                      </div>
                      <div className="border-t border-blue-200 my-2"></div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Gross Amount:</span>
                        <span className="font-medium">${selectedRequest.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-red-600">Platform Fee:</span>
                        <span className="font-medium text-red-600">-${selectedRequest.platform_fee.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-blue-200 my-2"></div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-900">Net Payout:</span>
                        <span className="font-bold text-emerald-600 text-lg">${selectedRequest.net_amount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-yellow-600">⚠️</div>
                  <div>
                    <h4 className="font-semibold text-yellow-900 mb-1">Important Notice</h4>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      <li>• This action will mark the payout as approved</li>
                      <li>• A notification will be sent to the vendor</li>
                      <li>• Next step will be to process the bank transfer</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setSelectedRequest(null);
                  }}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await handleApprove(selectedRequest.id);
                    setShowApprovalModal(false);
                  }}
                  disabled={processingAction === selectedRequest.id}
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 font-medium disabled:opacity-50"
                >
                  {processingAction === selectedRequest.id ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Approve & Continue to Step 2
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showProcessModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Process Bank Transfer</h2>
                  <p className="text-sm text-gray-500 mt-1">Step 2 of 3 - Initiate Transfer</p>
                </div>
                <button
                  onClick={() => {
                    setShowProcessModal(false);
                    setSelectedRequest(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <div className="flex-1 h-2 bg-emerald-500 rounded"></div>
                <div className="flex-1 h-2 bg-blue-500 rounded"></div>
                <div className="flex-1 h-2 bg-gray-200 rounded"></div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Zap className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900">Transfer Details</h3>
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Vendor:</span>
                        <span className="font-medium">{selectedRequest.vendors?.business_name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Transfer Amount:</span>
                        <span className="font-bold text-emerald-600 text-lg">${selectedRequest.net_amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Status:</span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                          <CheckCircle className="w-3 h-3" />
                          Approved
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Approved On:</span>
                        <span className="font-medium">{new Date(selectedRequest.processed_date || '').toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="text-purple-600">⚡</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-purple-900 mb-2">Choose Transfer Method</h4>

                      <div className="space-y-3">
                        <label className="flex items-start gap-3 p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition-colors">
                          <input
                            type="radio"
                            name="transfer-method"
                            checked={!useAutomaticPayout}
                            onChange={() => setUseAutomaticPayout(false)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 mb-1">Manual Bank Transfer</div>
                            <p className="text-sm text-gray-600">Process transfer manually through your bank. You'll need to mark it as completed later.</p>
                          </div>
                        </label>

                        <label className="flex items-start gap-3 p-3 bg-white rounded-lg border-2 border-emerald-200 hover:border-emerald-300 cursor-pointer transition-colors">
                          <input
                            type="radio"
                            name="transfer-method"
                            checked={useAutomaticPayout}
                            onChange={() => setUseAutomaticPayout(true)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900">Automatic Stripe Transfer</span>
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">Instant</span>
                            </div>
                            <p className="text-sm text-gray-600">Transfer funds instantly via Stripe Connect. Automatically completes the entire workflow!</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {useAutomaticPayout && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-emerald-800">
                        <strong>Instant Transfer:</strong> Funds will be transferred immediately to the vendor's connected Stripe account. No manual completion needed!
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowProcessModal(false);
                    setSelectedRequest(null);
                    setUseAutomaticPayout(false);
                  }}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await handleProcessTransfer(selectedRequest.id, useAutomaticPayout);
                    setShowProcessModal(false);

                    if (!useAutomaticPayout) {
                      setStatusFilter('processing');
                      setTimeout(() => {
                        setSelectedRequest(selectedRequest);
                        setShowCompleteModal(true);
                        setWorkflowStep(3);
                      }, 500);
                    }

                    setUseAutomaticPayout(false);
                  }}
                  disabled={processingAction === selectedRequest.id}
                  className={`px-6 py-2.5 text-white rounded-lg transition-colors flex items-center gap-2 font-medium disabled:opacity-50 ${
                    useAutomaticPayout
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {processingAction === selectedRequest.id ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      {useAutomaticPayout ? 'Process Instant Transfer' : 'Process Transfer & Continue to Step 3'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCompleteModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Complete Payout</h2>
                  <p className="text-sm text-gray-500 mt-1">Step 3 of 3 - Finalize & Confirm</p>
                </div>
                <button
                  onClick={() => {
                    setShowCompleteModal(false);
                    setSelectedRequest(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <div className="flex-1 h-2 bg-emerald-500 rounded"></div>
                <div className="flex-1 h-2 bg-emerald-500 rounded"></div>
                <div className="flex-1 h-2 bg-emerald-500 rounded"></div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-900">Transfer Summary</h3>
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Vendor:</span>
                        <span className="font-medium">{selectedRequest.vendors?.business_name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Transfer Amount:</span>
                        <span className="font-bold text-emerald-600 text-lg">${selectedRequest.net_amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Transfer ID:</span>
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{selectedRequest.bank_transfer_id || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Status:</span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                          <Zap className="w-3 h-3" />
                          Processing
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Initiated On:</span>
                        <span className="font-medium">{new Date(selectedRequest.transfer_initiated_date || '').toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-emerald-600">✅</div>
                  <div>
                    <h4 className="font-semibold text-emerald-900 mb-1">Final Step - Completion</h4>
                    <ul className="text-sm text-emerald-800 space-y-1">
                      <li>• A transaction record will be automatically created</li>
                      <li>• Vendor will receive a completion notification</li>
                      <li>• Funds will be marked as available in vendor account</li>
                      <li>• This payout will be moved to completed status</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <span className="text-amber-600">⚠️</span>
                  <p className="text-sm text-amber-800">
                    <strong>Important:</strong> Only mark as completed after confirming the funds have been successfully transferred to the vendor's bank account.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowCompleteModal(false);
                    setSelectedRequest(null);
                  }}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await handleMarkCompleted(selectedRequest.id);
                    setShowCompleteModal(false);
                  }}
                  disabled={processingAction === selectedRequest.id}
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 font-medium disabled:opacity-50"
                >
                  {processingAction === selectedRequest.id ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Completing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Complete Payout - Workflow Finished
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
