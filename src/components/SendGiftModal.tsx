import { useState } from 'react';
import { X, Gift, Mail, Package, Calendar, Check, AlertCircle, ShoppingCart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product } from '../App';

interface SendGiftModalProps {
  product: Product;
  selectedColor?: string;
  selectedSize?: string;
  quantity?: number;
  onClose: () => void;
  onSuccess?: (giftData: any) => void;
  onProceedToCheckout?: () => void;
  currentUserId?: string;
}

export default function SendGiftModal({
  product,
  selectedColor,
  selectedSize,
  quantity = 1,
  onClose,
  onSuccess,
  onProceedToCheckout,
  currentUserId
}: SendGiftModalProps) {
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [includeGiftWrap, setIncludeGiftWrap] = useState(false);
  const [hidePrice, setHidePrice] = useState(true);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const giftWrapCost = 5;
  const totalPrice = product.price * quantity + (includeGiftWrap ? giftWrapCost : 0);

  const handleContinue = async () => {
    setError(null);

    if (!currentUserId) {
      setError('Please sign in to send gifts');
      return;
    }

    if (!recipientName.trim() || !recipientEmail.trim()) {
      setError('Please enter recipient name and email');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setSaving(true);

    try {
      const { data: giftData, error: dbError } = await supabase
        .from('gift_orders')
        .insert({
          sender_id: currentUserId,
          product_id: product.id,
          product_name: product.name,
          product_price: product.price,
          product_image: product.image,
          selected_color: selectedColor || null,
          selected_size: selectedSize || null,
          quantity: quantity,
          recipient_name: recipientName,
          recipient_email: recipientEmail,
          gift_message: giftMessage || null,
          include_gift_wrap: includeGiftWrap,
          hide_price: hidePrice,
          delivery_date: deliveryDate || null,
          total_amount: totalPrice,
          status: 'pending'
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setSuccess(true);

      setTimeout(() => {
        if (onSuccess) {
          onSuccess(giftData);
        }
        if (onProceedToCheckout) {
          onProceedToCheckout();
        }
        onClose();
      }, 1500);

    } catch (err) {
      console.error('Error creating gift order:', err);
      setError('Failed to process gift. Please try again.');
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
              <Gift className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Send as a Gift</h3>
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
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Gift Added!</h4>
            <p className="text-gray-600 dark:text-gray-400">
              Proceeding to checkout to complete your gift purchase
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

            <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800/50">
              <img src={product.image} alt={product.name} className="w-16 h-16 rounded-lg object-cover" />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{product.name}</h4>
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  {selectedColor && <span>Color: {selectedColor}</span>}
                  {selectedSize && <span>• Size: {selectedSize}</span>}
                  <span>• Qty: {quantity}</span>
                </div>
                <p className="text-lg font-bold text-purple-600 dark:text-purple-400 mt-1">${product.price}</p>
              </div>
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
                Gift Message (Optional)
              </label>
              <textarea
                placeholder="Write a personal message..."
                rows={3}
                value={giftMessage}
                onChange={(e) => setGiftMessage(e.target.value)}
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
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-300 dark:border-gray-600">
                <input
                  type="checkbox"
                  id="gift-wrap"
                  checked={includeGiftWrap}
                  onChange={(e) => setIncludeGiftWrap(e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="gift-wrap" className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                  <Package className="w-4 h-4 inline mr-1" />
                  Add premium gift wrapping (+${giftWrapCost})
                </label>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-300 dark:border-gray-600">
                <input
                  type="checkbox"
                  id="hide-price"
                  checked={hidePrice}
                  onChange={(e) => setHidePrice(e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="hide-price" className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                  Include gift receipt (hide price)
                </label>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600 dark:text-gray-400">Total Amount</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">${totalPrice.toFixed(2)}</span>
              </div>

              <button
                onClick={handleContinue}
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
                    <ShoppingCart className="w-5 h-5" />
                    Continue to Checkout
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
