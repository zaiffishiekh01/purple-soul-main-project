import { X, AlertCircle, CheckCircle, Package, DollarSign } from 'lucide-react';
import { useState } from 'react';

interface ReturnItem {
  product_name: string;
  quantity: number;
  price: number;
  reason: string;
}

interface ReturnActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  returnData: {
    id: string;
    return_number: string;
    order_number: string;
    customer_name: string;
    customer_email: string;
    reason: string;
    notes: string;
    return_amount: number;
    restocking_fee: number;
    refund_method: string;
    items: ReturnItem[];
    status: string;
  } | null;
  actionType: 'approve' | 'reject' | 'receive' | 'refund';
  onConfirm: (data: any) => Promise<void>;
  loading: boolean;
}

export function ReturnActionModal({
  isOpen,
  onClose,
  returnData,
  actionType,
  onConfirm,
  loading,
}: ReturnActionModalProps) {
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [refundMethod, setRefundMethod] = useState(returnData?.refund_method || 'original_payment');
  const [refundAmount, setRefundAmount] = useState(returnData?.return_amount || 0);
  const [applyRestockingFee, setApplyRestockingFee] = useState(false);

  if (!isOpen || !returnData) return null;

  const calculateFinalRefund = () => {
    const baseAmount = returnData.return_amount;
    const restockingFee = applyRestockingFee ? returnData.restocking_fee || 0 : 0;
    return baseAmount - restockingFee;
  };

  const handleSubmit = async () => {
    const data: any = {
      returnId: returnData.id,
      notes,
    };

    switch (actionType) {
      case 'approve':
        data.status = 'approved';
        data.approved_at = new Date().toISOString();
        break;
      case 'reject':
        data.status = 'rejected';
        data.rejection_reason = rejectionReason;
        data.processed_at = new Date().toISOString();
        break;
      case 'receive':
        data.status = 'received';
        data.received_at = new Date().toISOString();
        break;
      case 'refund':
        data.status = 'completed';
        data.refund_method = refundMethod;
        data.refund_amount = calculateFinalRefund();
        data.refunded_at = new Date().toISOString();
        data.processed_at = new Date().toISOString();
        break;
    }

    await onConfirm(data);
    onClose();
  };

  const getModalConfig = () => {
    switch (actionType) {
      case 'approve':
        return {
          title: 'Approve Return Request',
          icon: CheckCircle,
          iconColor: 'text-green-600',
          bgColor: 'bg-green-50',
          buttonColor: 'bg-green-600 hover:bg-green-700',
          buttonText: 'Approve Return',
        };
      case 'reject':
        return {
          title: 'Reject Return Request',
          icon: AlertCircle,
          iconColor: 'text-red-600',
          bgColor: 'bg-red-50',
          buttonColor: 'bg-red-600 hover:bg-red-700',
          buttonText: 'Reject Return',
        };
      case 'receive':
        return {
          title: 'Mark Return as Received',
          icon: Package,
          iconColor: 'text-blue-600',
          bgColor: 'bg-blue-50',
          buttonColor: 'bg-blue-600 hover:bg-blue-700',
          buttonText: 'Mark as Received',
        };
      case 'refund':
        return {
          title: 'Process Refund',
          icon: DollarSign,
          iconColor: 'text-purple-600',
          bgColor: 'bg-purple-50',
          buttonColor: 'bg-purple-600 hover:bg-purple-700',
          buttonText: 'Process Refund',
        };
    }
  };

  const config = getModalConfig();
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${config.bgColor}`}>
              <Icon className={`w-6 h-6 ${config.iconColor}`} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{config.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Return Details */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Return Number</p>
                <p className="font-semibold text-gray-900">{returnData.return_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Order Number</p>
                <p className="font-semibold text-gray-900">{returnData.order_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Customer</p>
                <p className="font-semibold text-gray-900">{returnData.customer_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-gray-900">{returnData.customer_email}</p>
              </div>
            </div>
          </div>

          {/* Return Reason */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Return Reason
            </label>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm font-medium text-yellow-900 capitalize">
                {returnData.reason.replace(/_/g, ' ')}
              </p>
              {returnData.notes && (
                <p className="text-sm text-yellow-700 mt-2">{returnData.notes}</p>
              )}
            </div>
          </div>

          {/* Items */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Items to Return
            </label>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">
                      Product
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">
                      Qty
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {returnData.items?.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm text-gray-900">{item.product_name}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-right">{item.quantity}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-right">
                        ${item.price?.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Reject Reason Input */}
          {actionType === 'reject' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <select
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              >
                <option value="">Select reason...</option>
                <option value="outside_return_window">Outside Return Window</option>
                <option value="item_used_damaged">Item Used or Damaged by Customer</option>
                <option value="missing_parts">Missing Parts or Accessories</option>
                <option value="no_original_packaging">No Original Packaging</option>
                <option value="fraudulent_claim">Fraudulent Claim</option>
                <option value="policy_violation">Violates Return Policy</option>
                <option value="other">Other Reason</option>
              </select>
            </div>
          )}

          {/* Refund Details */}
          {actionType === 'refund' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Refund Method
                </label>
                <select
                  value={refundMethod}
                  onChange={(e) => setRefundMethod(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="original_payment">Original Payment Method</option>
                  <option value="store_credit">Store Credit</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>

              {returnData.restocking_fee > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={applyRestockingFee}
                      onChange={(e) => setApplyRestockingFee(e.target.checked)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-900">
                        Apply Restocking Fee
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Deduct ${returnData.restocking_fee.toFixed(2)} restocking fee from refund
                      </p>
                    </div>
                  </label>
                </div>
              )}

              <div className="bg-purple-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Original Amount:</span>
                  <span className="font-semibold text-gray-900">
                    ${returnData.return_amount.toFixed(2)}
                  </span>
                </div>
                {applyRestockingFee && returnData.restocking_fee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Restocking Fee:</span>
                    <span className="font-semibold text-red-600">
                      -${returnData.restocking_fee.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-base border-t border-purple-200 pt-2">
                  <span className="font-semibold text-gray-900">Refund Amount:</span>
                  <span className="font-bold text-purple-600">
                    ${calculateFinalRefund().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {actionType !== 'reject' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Additional Notes {actionType === 'approve' && '(Optional)'}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder={
                  actionType === 'approve'
                    ? 'Add instructions for customer (e.g., return shipping details)...'
                    : actionType === 'receive'
                    ? 'Add inspection notes...'
                    : 'Add any notes about the refund...'
                }
              />
            </div>
          )}

          {/* Warning Messages */}
          {actionType === 'approve' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-semibold mb-1">Action Required</p>
                  <p>
                    Customer will be notified to ship the item back. Ensure you provide clear
                    return instructions.
                  </p>
                </div>
              </div>
            </div>
          )}

          {actionType === 'reject' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-semibold mb-1">Warning</p>
                  <p>
                    This action cannot be undone. Customer will be notified of the rejection.
                  </p>
                </div>
              </div>
            </div>
          )}

          {actionType === 'refund' && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-purple-800">
                  <p className="font-semibold mb-1">Refund Processing</p>
                  <p>
                    Refund will be processed immediately. This action cannot be undone. Customer
                    will receive confirmation email.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex gap-3 justify-end border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              loading ||
              (actionType === 'reject' && !rejectionReason)
            }
            className={`px-6 py-2.5 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed ${config.buttonColor}`}
          >
            {loading ? 'Processing...' : config.buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
