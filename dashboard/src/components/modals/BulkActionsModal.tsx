import { useState } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

interface BulkActionsModalProps {
  selectedCount: number;
  entityType: 'products' | 'orders' | 'inventory';
  onClose: () => void;
  onAction: (action: string, value?: any) => Promise<{ success: number; failed: number }>;
}

export function BulkActionsModal({
  selectedCount,
  entityType,
  onClose,
  onAction,
}: BulkActionsModalProps) {
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [actionValue, setActionValue] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);

  const actions = {
    products: [
      { value: 'activate', label: 'Set Status to Active' },
      { value: 'deactivate', label: 'Set Status to Archived' },
      { value: 'delete', label: 'Delete Selected Products' },
      { value: 'price-increase', label: 'Increase Prices By $', requiresInput: true },
      { value: 'price-decrease', label: 'Decrease Prices By $', requiresInput: true },
    ],
    orders: [
      { value: 'mark-processing', label: 'Mark as Processing' },
      { value: 'mark-shipped', label: 'Mark as Shipped' },
      { value: 'mark-delivered', label: 'Mark as Delivered' },
      { value: 'cancel', label: 'Cancel Orders' },
    ],
    inventory: [
      { value: 'restock', label: 'Add Quantity', requiresInput: true },
    ],
  };

  const handleSubmit = async () => {
    if (!selectedAction) return;

    setLoading(true);
    try {
      const value = actionValue ? parseFloat(actionValue) : undefined;
      const res = await onAction(selectedAction, value);
      setResult(res);
    } catch (error) {
      console.error('Bulk action failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentActions = actions[entityType];
  const requiresInput = currentActions.find((a) => a.value === selectedAction)?.requiresInput;

  if (result) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Bulk Action Complete</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            {result.success > 0 && (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">
                    {result.success} {entityType} updated successfully
                  </p>
                </div>
              </div>
            )}

            {result.failed > 0 && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <div>
                  <p className="font-semibold text-red-900">
                    {result.failed} {entityType} failed to update
                  </p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-sufi-purple to-sufi-dark text-white rounded-xl hover:shadow-lg transition-all font-medium"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Bulk Actions</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600">
            Performing action on <strong>{selectedCount}</strong> selected {entityType}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Action
            </label>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30 focus:border-sufi-purple transition-all"
            >
              <option value="">Choose an action...</option>
              {currentActions.map((action) => (
                <option key={action.value} value={action.value}>
                  {action.label}
                </option>
              ))}
            </select>
          </div>

          {requiresInput && selectedAction && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Value
              </label>
              <input
                type="number"
                step="0.01"
                value={actionValue}
                onChange={(e) => setActionValue(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30 focus:border-sufi-purple transition-all"
                placeholder="Enter value"
              />
            </div>
          )}
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedAction || loading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-sufi-purple to-sufi-dark text-white rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  );
}
