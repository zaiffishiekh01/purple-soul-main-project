import { useState } from 'react';
import { X } from 'lucide-react';

interface PayoutSettings {
  payout_frequency: string;
  payout_day: string;
  payout_method: string;
  bank_account_last4: string;
  bank_name: string;
  minimum_payout: number;
  auto_payout_enabled: boolean;
}

interface PayoutSettingsModalProps {
  settings: PayoutSettings;
  onClose: () => void;
  onSave: (settings: Partial<PayoutSettings>) => Promise<void>;
}

export function PayoutSettingsModal({ settings, onClose, onSave }: PayoutSettingsModalProps) {
  const [formData, setFormData] = useState<PayoutSettings>(settings);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving payout settings:', error);
      alert('Failed to save payout settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' },
  ];

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const monthDays = Array.from({ length: 28 }, (_, i) => (i + 1).toString());

  const payoutMethodOptions = [
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'stripe', label: 'Stripe' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Payout Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payout Frequency
              </label>
              <select
                value={formData.payout_frequency}
                onChange={(e) =>
                  setFormData({ ...formData, payout_frequency: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple"
              >
                {frequencyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payout Day
              </label>
              <select
                value={formData.payout_day}
                onChange={(e) => setFormData({ ...formData, payout_day: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple"
              >
                {(formData.payout_frequency === 'weekly' ||
                formData.payout_frequency === 'biweekly'
                  ? weekDays
                  : monthDays
                ).map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Payout Method
            </label>
            <select
              value={formData.payout_method}
              onChange={(e) => setFormData({ ...formData, payout_method: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple"
            >
              {payoutMethodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {formData.payout_method === 'bank_transfer' && (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={formData.bank_name}
                  onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                  placeholder="Chase Bank"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Account Last 4 Digits
                </label>
                <input
                  type="text"
                  value={formData.bank_account_last4}
                  onChange={(e) =>
                    setFormData({ ...formData, bank_account_last4: e.target.value })
                  }
                  placeholder="4532"
                  maxLength={4}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Minimum Payout Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={formData.minimum_payout}
                onChange={(e) =>
                  setFormData({ ...formData, minimum_payout: parseFloat(e.target.value) })
                }
                min="0"
                step="0.01"
                className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Payouts will only be processed when your balance exceeds this amount
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="auto_payout"
              checked={formData.auto_payout_enabled}
              onChange={(e) =>
                setFormData({ ...formData, auto_payout_enabled: e.target.checked })
              }
              className="w-5 h-5 text-sufi-purple rounded focus:ring-2 focus:ring-sufi-purple"
            />
            <label htmlFor="auto_payout" className="text-sm font-medium text-gray-700">
              Enable automatic payouts
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-sufi-purple to-sufi-dark text-white rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
