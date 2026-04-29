import { RotateCcw, CheckCircle, XCircle, Clock, Package, Info } from 'lucide-react';
import { Return } from '../hooks/useReturns';

interface ReturnManagementProps {
  returns: Return[];
  onApprove: (returnId: string) => void;
  onReject: (returnId: string) => void;
  onMarkReceived: (returnId: string) => void;
  onProcessRefund: (returnId: string) => void;
  actionLoading: string | null;
}

export function ReturnManagement({ returns, onApprove, onReject, onMarkReceived, onProcessRefund, actionLoading }: ReturnManagementProps) {
  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Pending' },
      requested: { icon: Clock, color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Requested' },
      approved: { icon: CheckCircle, color: 'bg-green-100 text-green-700 border-green-200', label: 'Approved' },
      rejected: { icon: XCircle, color: 'bg-red-100 text-red-700 border-red-200', label: 'Rejected' },
      in_transit: { icon: RotateCcw, color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'In Transit' },
      received: { icon: Package, color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Received' },
      completed: { icon: CheckCircle, color: 'bg-purple-100 text-purple-700 border-purple-200', label: 'Completed' },
      refunded: { icon: CheckCircle, color: 'bg-purple-100 text-purple-700 border-purple-200', label: 'Refunded' },
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const statusCounts = {
    pending: returns.filter((r) => r.status === 'pending' || r.status === 'requested').length,
    approved: returns.filter((r) => r.status === 'approved').length,
    received: returns.filter((r) => r.status === 'received').length,
    completed: returns.filter((r) => r.status === 'completed' || r.status === 'refunded').length,
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Info className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-blue-900 mb-3">Return Policy Summary</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="text-sm text-gray-700">Return Window</span>
                  <span className="font-semibold text-gray-900">30 days</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="text-sm text-gray-700">Return Shipping Paid By</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    Marketplace
                  </span>
                </div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-sm text-gray-700 leading-relaxed">
                  <span className="font-semibold">Policy Details:</span> Customers can return items within 30 days of delivery.
                  The marketplace covers return shipping costs for your products. You will be notified when a return is requested
                  and must approve or reject within 2 business days.
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-xs text-blue-800">
                <span className="font-semibold">Category-Specific Rules:</span> Some categories may have different return windows.
                Electronics: 14 days | Clothing: 60 days | Food & Beverages: 7 days
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 shadow-lg inline-block mb-4">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-2">Pending Review</h3>
          <p className="text-3xl font-bold text-gray-900">{statusCounts.pending}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg inline-block mb-4">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-2">Approved</h3>
          <p className="text-3xl font-bold text-gray-900">{statusCounts.approved}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg inline-block mb-4">
            <RotateCcw className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-2">Received</h3>
          <p className="text-3xl font-bold text-gray-900">{statusCounts.received}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg inline-block mb-4">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-2">Completed</h3>
          <p className="text-3xl font-bold text-gray-900">{statusCounts.completed}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Return Requests</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Return #
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Order #
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Requested
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {returns.map((returnItem) => {
                const statusConfig = getStatusConfig(returnItem.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <tr key={returnItem.id} className="hover:bg-sufi-light/10 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-gray-900">{returnItem.return_number}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {returnItem.order_number}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{returnItem.customer_name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{returnItem.reason}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-gray-900">
                        ${returnItem.return_amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border inline-flex items-center gap-1 ${statusConfig.color}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(returnItem.requested_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        {(returnItem.status === 'requested' || returnItem.status === 'pending') && (
                          <>
                            <button
                              onClick={() => onApprove(returnItem.id)}
                              disabled={actionLoading === returnItem.id}
                              className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionLoading === returnItem.id ? 'Processing...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => onReject(returnItem.id)}
                              disabled={actionLoading === returnItem.id}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionLoading === returnItem.id ? 'Processing...' : 'Reject'}
                            </button>
                          </>
                        )}
                        {returnItem.status === 'approved' && (
                          <button
                            onClick={() => onMarkReceived(returnItem.id)}
                            disabled={actionLoading === returnItem.id}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading === returnItem.id ? 'Processing...' : 'Mark Received'}
                          </button>
                        )}
                        {returnItem.status === 'received' && (
                          <button
                            onClick={() => onProcessRefund(returnItem.id)}
                            disabled={actionLoading === returnItem.id}
                            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading === returnItem.id ? 'Processing...' : 'Process Refund'}
                          </button>
                        )}
                        {(returnItem.status === 'completed' || returnItem.status === 'refunded') && (
                          <span className="px-3 py-1 text-sm text-gray-500">No actions</span>
                        )}
                        {returnItem.status === 'rejected' && (
                          <span className="px-3 py-1 text-sm text-gray-500">Rejected</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {returns.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-gray-500">No return requests found</p>
          </div>
        )}
      </div>
    </div>
  );
}
