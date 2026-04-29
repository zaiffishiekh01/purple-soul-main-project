import { useState } from 'react';
import { X, Mail, CreditCard, Calendar, Gift, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface GiftCardModalProps {
  onClose: () => void;
  onSuccess?: (giftCardData: any) => void;
  currentUserId?: string;
}

export default function GiftCardModal({ onClose, onSuccess, currentUserId }: GiftCardModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const predefinedAmounts = [50, 100, 150, 200, 300, 500];

  const getAmount = () => {
    if (customAmount) return parseFloat(customAmount);
    return selectedAmount || 0;
  };

  const handleSendGiftCard = async () => {
    setError(null);

    if (!currentUserId) {
      setError('Please sign in to send gift cards');
      return;
    }

    const amount = getAmount();
    if (amount <= 0) {
      setError('Please select or enter a valid amount');
      return;
    }

    if (!recipientEmail || !recipientName) {
      setError('Please enter recipient name and email');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setSaving(true);

    try {
      const giftCardCode = `GC-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

      const { data, error: dbError } = await supabase
        .from('gift_cards')
        .insert({
          code: giftCardCode,
          amount: amount,
          balance: amount,
          purchaser_id: currentUserId,
          recipient_email: recipientEmail,
          recipient_name: recipientName,
          message: message || null,
          delivery_date: deliveryDate || new Date().toISOString().split('T')[0],
          status: 'active'
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setSuccess(true);

      setTimeout(() => {
        if (onSuccess) {
          onSuccess(data);
        }
        onClose();
      }, 2000);

    } catch (err) {
      console.error('Error creating gift card:', err);
      setError('Failed to create gift card. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full shadow-2xl border border-gray-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Send Gift Card</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Gift Card Sent!</h4>
            <p className="text-gray-600 dark:text-gray-400">
              Your gift card will be delivered to {recipientEmail}
              {deliveryDate && ` on ${new Date(deliveryDate).toLocaleDateString()}`}
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                <CreditCard className="w-4 h-4 inline mr-2" />
                Gift Card Amount
              </label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {predefinedAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => {
                      setSelectedAmount(amount);
                      setCustomAmount('');
                    }}
                    className={`px-4 py-3 border-2 rounded-xl font-semibold transition-all ${
                      selectedAmount === amount && !customAmount
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white hover:border-purple-300 dark:hover:border-purple-700'
                    }`}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
              <input
                type="number"
                placeholder="Custom amount"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(null);
                }}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900/30 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Recipient Name
              </label>
              <input
                type="text"
                placeholder="Enter recipient's name"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900/30 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Recipient Email
              </label>
              <input
                type="email"
                placeholder="recipient@email.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900/30 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Personal Message (Optional)
              </label>
              <textarea
                placeholder="Write your message..."
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900/30 text-gray-900 dark:text-white resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Delivery Date (Optional)
              </label>
              <input
                type="date"
                min={minDate}
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900/30 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Leave empty to send immediately</p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSendGiftCard}
                disabled={saving}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Gift className="w-5 h-5" />
                    Send Gift Card ${getAmount()}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
