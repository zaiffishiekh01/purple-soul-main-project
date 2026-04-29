import { useState } from 'react';
import { X, Truck } from 'lucide-react';

interface ShippingProgram {
  name: string;
  carrier: string;
  maxWeightKg: number;
  baseRate: number;
  vendorRate: number;
  supportsReturns: boolean;
}

interface AddShippingProgramModalProps {
  onClose: () => void;
  onSave: (program: ShippingProgram) => void;
}

export function AddShippingProgramModal({ onClose, onSave }: AddShippingProgramModalProps) {
  const [formData, setFormData] = useState<ShippingProgram>({
    name: '',
    carrier: 'DHL',
    maxWeightKg: 30,
    baseRate: 0,
    vendorRate: 0,
    supportsReturns: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || formData.baseRate <= 0 || formData.vendorRate <= 0) {
      alert('Please fill in all required fields with valid values');
      return;
    }

    if (formData.vendorRate < formData.baseRate) {
      alert('Vendor rate must be equal to or greater than base rate');
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
              <Truck className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Add Shipping Program</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Program Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="e.g., Marketplace Standard"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Carrier *
            </label>
            <select
              value={formData.carrier}
              onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="DHL">DHL</option>
              <option value="UPS">UPS</option>
              <option value="USPS">USPS</option>
              <option value="FedEx">FedEx</option>
              <option value="Canada Post">Canada Post</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Weight (kg) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={formData.maxWeightKg}
                onChange={(e) => setFormData({ ...formData, maxWeightKg: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.supportsReturns}
                  onChange={(e) => setFormData({ ...formData, supportsReturns: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <span className="text-sm font-medium text-gray-700">Supports Returns</span>
              </label>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Rate ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.baseRate}
                onChange={(e) => setFormData({ ...formData, baseRate: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="0.00"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Cost to marketplace</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor Rate ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.vendorRate}
                onChange={(e) => setFormData({ ...formData, vendorRate: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="0.00"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Charged to vendor (includes markup)
              </p>
            </div>
          </div>

          {formData.baseRate > 0 && formData.vendorRate > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Markup Amount</span>
                <span className="font-semibold text-gray-900">
                  ${(formData.vendorRate - formData.baseRate).toFixed(2)}
                </span>
              </div>
            </div>
          )}

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
              Add Program
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
