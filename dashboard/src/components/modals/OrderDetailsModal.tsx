import { X, Package, User, MapPin, CreditCard, Tag, Plus } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Order } from '../../types';
import { useLabels } from '../../hooks/useLabels';
import { useOrderLabels } from '../../hooks/useOrderLabels';

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
  onUpdateStatus: (status: string) => void;
  onNavigateToLabels?: () => void;
}

export function OrderDetailsModal({ order, onClose, onUpdateStatus, onNavigateToLabels }: OrderDetailsModalProps) {
  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  const { labels, loading: labelsLoading } = useLabels();
  const { labelIds, addLabelToOrder, removeLabelFromOrder } = useOrderLabels(order.id);
  const [showLabelMenu, setShowLabelMenu] = useState(false);
  const labelMenuRef = useRef<HTMLDivElement>(null);

  const availableLabels = labels.filter((label) => !labelIds.includes(label.id));
  const assignedLabels = labels.filter((label) => labelIds.includes(label.id));

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (labelMenuRef.current && !labelMenuRef.current.contains(event.target as Node)) {
        setShowLabelMenu(false);
      }
    }

    if (showLabelMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showLabelMenu]);

  const handleAddLabel = async (labelId: string) => {
    try {
      await addLabelToOrder(labelId);
      setShowLabelMenu(false);
    } catch (error) {
      console.error('Failed to add label:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
            <p className="text-gray-600 mt-1">{order.order_number}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gradient-to-br from-sufi-light to-purple-100 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Order Status</h3>
              <span className="text-sm text-gray-600">
                {new Date(order.created_at).toLocaleDateString()}
              </span>
            </div>
            <select
              value={order.status}
              onChange={(e) => onUpdateStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30 focus:border-sufi-purple transition-all bg-white font-medium"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900">Customer Information</h3>
              </div>
              <div className="space-y-2">
                <p className="text-gray-900 font-medium">
                  {order.customer_display_name || order.customer_name}
                </p>
                {order.proxy_email && (
                  <p className="text-sm text-gray-600" title="Marketplace proxy email - forwards to customer">
                    {order.proxy_email}
                  </p>
                )}
                {order.customer_phone && (
                  <p className="text-sm text-gray-600">{order.customer_phone}</p>
                )}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <CreditCard className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900">Payment Information</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Method:</span>
                  <span className="font-medium">{order.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${
                    order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-50 rounded-lg">
                <MapPin className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900">Shipping Address</h3>
            </div>
            <p className="text-gray-600">
              {typeof order.shipping_address === 'object' && order.shipping_address !== null
                ? JSON.stringify(order.shipping_address)
                : 'No shipping address provided'}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Package className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="font-bold text-gray-900">Order Summary</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax:</span>
                <span className="font-medium">${order.tax_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping:</span>
                <span className="font-medium">${order.shipping_cost.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="text-gray-900 font-bold">Total:</span>
                <span className="text-xl font-bold text-gray-900">
                  ${order.total_amount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sufi-light/30 rounded-lg">
                  <Tag className="w-5 h-5 text-sufi-purple" />
                </div>
                <h3 className="font-bold text-gray-900">Shipping Labels</h3>
              </div>
              <button
                onClick={onNavigateToLabels}
                className="px-4 py-2 bg-gradient-to-r from-sufi-purple to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Create Shipping Label
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Create a shipping label for this order with pre-filled information
            </p>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">Order Tags</h4>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">Add custom tags to organize orders</span>
                <div className="relative" ref={labelMenuRef}>
                  <button
                    onClick={() => setShowLabelMenu(!showLabelMenu)}
                    disabled={labelsLoading}
                    className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Tag className="w-3.5 h-3.5" />
                    Add Tag
                  </button>
                  {showLabelMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-64 overflow-y-auto">
                      {availableLabels.length > 0 ? (
                        availableLabels.map((label) => (
                          <button
                            key={label.id}
                            onClick={() => handleAddLabel(label.id)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 border-b border-gray-100 last:border-0"
                          >
                            <div
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: label.color }}
                            />
                            <span className="text-sm font-medium text-gray-900">{label.name}</span>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                          {labels.length === 0 ? 'No labels created yet' : 'All labels assigned'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {assignedLabels.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {assignedLabels.map((label) => (
                    <div
                      key={label.id}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium group"
                      style={{ backgroundColor: `${label.color}20`, color: label.color }}
                    >
                      <Tag className="w-3.5 h-3.5" />
                      {label.name}
                      <button
                        onClick={() => removeLabelFromOrder(label.id)}
                        className="ml-1 hover:bg-white/50 rounded p-0.5 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No tags assigned</p>
              )}
            </div>
          </div>

          {order.notes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
              <h3 className="font-bold text-gray-900 mb-2">Notes</h3>
              <p className="text-gray-700">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
