import { useState } from 'react';
import { X, RotateCcw } from 'lucide-react';

interface ReturnRule {
  scope: 'GLOBAL' | 'CATEGORY';
  category?: string;
  returnWindowDays: number;
  returnShippingPaidBy: 'VENDOR' | 'MARKETPLACE' | 'CUSTOMER';
}

interface AddReturnRuleModalProps {
  onClose: () => void;
  onSave: (rule: ReturnRule) => void;
}

const categories = [
  'Electronics',
  'Clothing',
  'Food & Beverages',
  'Home & Garden',
  'Sports & Outdoors',
  'Books & Media',
  'Toys & Games',
  'Health & Beauty',
  'Automotive',
  'Office Supplies',
];

export function AddReturnRuleModal({ onClose, onSave }: AddReturnRuleModalProps) {
  const [formData, setFormData] = useState<ReturnRule>({
    scope: 'CATEGORY',
    category: 'Electronics',
    returnWindowDays: 30,
    returnShippingPaidBy: 'MARKETPLACE',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.scope === 'CATEGORY' && !formData.category) {
      alert('Please select a product category for this return rule');
      return;
    }

    if (formData.returnWindowDays <= 0) {
      alert('Return window must be at least 1 day. Please enter a valid number');
      return;
    }

    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <RotateCcw className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Add Return Rule</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Return rules cascade from specific to general. Category-specific rules
              override global rules. Define rules carefully to maintain consistent customer experience.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rule Scope *
            </label>
            <select
              value={formData.scope}
              onChange={(e) => {
                const scope = e.target.value as 'GLOBAL' | 'CATEGORY';
                setFormData({
                  ...formData,
                  scope,
                  category: scope === 'GLOBAL' ? undefined : formData.category,
                });
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="CATEGORY">Category-Specific</option>
              <option value="GLOBAL">Global (All Categories)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {formData.scope === 'GLOBAL'
                ? 'This rule will apply to all categories without specific rules'
                : 'This rule will only apply to the selected category'}
            </p>
          </div>

          {formData.scope === 'CATEGORY' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Return Window (Days) *
            </label>
            <input
              type="number"
              min="1"
              max="365"
              value={formData.returnWindowDays}
              onChange={(e) => setFormData({ ...formData, returnWindowDays: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Number of days after delivery when customer can initiate a return
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Return Shipping Paid By *
            </label>
            <div className="space-y-3">
              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="paidBy"
                  value="MARKETPLACE"
                  checked={formData.returnShippingPaidBy === 'MARKETPLACE'}
                  onChange={(e) => setFormData({ ...formData, returnShippingPaidBy: e.target.value as any })}
                  className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                />
                <div className="ml-3 flex-1">
                  <div className="font-medium text-gray-900">Marketplace</div>
                  <div className="text-sm text-gray-600">
                    Best customer experience - marketplace absorbs return shipping cost
                  </div>
                </div>
              </label>

              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="paidBy"
                  value="VENDOR"
                  checked={formData.returnShippingPaidBy === 'VENDOR'}
                  onChange={(e) => setFormData({ ...formData, returnShippingPaidBy: e.target.value as any })}
                  className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                />
                <div className="ml-3 flex-1">
                  <div className="font-medium text-gray-900">Vendor</div>
                  <div className="text-sm text-gray-600">
                    Vendor covers return shipping - may affect vendor margins
                  </div>
                </div>
              </label>

              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="paidBy"
                  value="CUSTOMER"
                  checked={formData.returnShippingPaidBy === 'CUSTOMER'}
                  onChange={(e) => setFormData({ ...formData, returnShippingPaidBy: e.target.value as any })}
                  className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                />
                <div className="ml-3 flex-1">
                  <div className="font-medium text-gray-900">Customer</div>
                  <div className="text-sm text-gray-600">
                    Customer pays for return shipping - may reduce return rate
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Add Rule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
