import { useState } from 'react';
import { X, Gift, CreditCard, Heart, Calendar, Mail, User, MessageSquare, Package, Sparkles, Check, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface GiftOptionsModalProps {
  product: any;
  onClose: () => void;
  onComplete: (data: any) => void;
  mode: 'send-gift' | 'gift-card';
}

export default function GiftOptionsModal({ product, onClose, onComplete, mode }: GiftOptionsModalProps) {
  const [step, setStep] = useState<'options' | 'details' | 'message' | 'checkout'>('options');

  // Gift options
  const [giftAmount, setGiftAmount] = useState(mode === 'gift-card' ? 50 : product?.price || 50);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedDesign, setSelectedDesign] = useState('classic');

  // Recipient info
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');

  // Gift message
  const [giftMessage, setGiftMessage] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [sendNow, setSendNow] = useState(true);

  // Gift wrapping
  const [giftWrap, setGiftWrap] = useState(true);
  const [includeReceipt, setIncludeReceipt] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const giftCardDesigns = [
    { id: 'classic', name: 'Classic Gold', preview: 'bg-gradient-to-br from-amber-400 to-yellow-600' },
    { id: 'celebration', name: 'Celebration', preview: 'bg-gradient-to-br from-purple-500 to-pink-500' },
    { id: 'spiritual', name: 'Spiritual', preview: 'bg-gradient-to-br from-blue-500 to-teal-500' },
    { id: 'elegant', name: 'Elegant', preview: 'bg-gradient-to-br from-gray-800 to-gray-600' }
  ];

  const presetAmounts = mode === 'gift-card'
    ? [25, 50, 100, 150, 200, 500]
    : [product?.price || 50];

  const handleComplete = async () => {
    if (!recipientName || !recipientEmail || !senderName || !senderEmail) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const giftData = {
        type: mode,
        product_id: mode === 'send-gift' ? product.id : null,
        amount: mode === 'gift-card' ? (customAmount ? parseFloat(customAmount) : giftAmount) : product.price,
        recipient_name: recipientName,
        recipient_email: recipientEmail,
        sender_name: senderName,
        sender_email: senderEmail,
        message: giftMessage,
        delivery_date: sendNow ? new Date().toISOString() : deliveryDate,
        gift_wrap: giftWrap,
        include_receipt: includeReceipt,
        design: mode === 'gift-card' ? selectedDesign : null,
        status: 'pending_payment'
      };

      // Store gift order in database
      const { data, error: dbError } = await supabase
        .from('gift_orders')
        .insert(giftData)
        .select()
        .single();

      if (dbError) throw dbError;

      onComplete({ ...giftData, id: data.id });
    } catch (err) {
      console.error('Error creating gift:', err);
      setError('Failed to create gift order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Options Step
  if (step === 'options') {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full">
          <div className="border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {mode === 'gift-card' ? (
                <CreditCard className="w-6 h-6 text-purple-600" />
              ) : (
                <Gift className="w-6 h-6 text-pink-600" />
              )}
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {mode === 'gift-card' ? 'Purchase Gift Card' : 'Send as Gift'}
              </h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            {mode === 'send-gift' && product && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl flex gap-4">
                <img src={product.image_url} alt={product.name} className="w-20 h-20 object-cover rounded-lg" />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">{product.name}</h3>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">${product.price.toFixed(2)}</p>
                </div>
              </div>
            )}

            {mode === 'gift-card' && (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Select Amount
                  </label>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {presetAmounts.map(amount => (
                      <button
                        key={amount}
                        onClick={() => {
                          setGiftAmount(amount);
                          setCustomAmount('');
                        }}
                        className={`py-3 px-4 rounded-lg border-2 font-semibold transition-all ${
                          giftAmount === amount && !customAmount
                            ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                            : 'border-gray-300 dark:border-gray-600 hover:border-purple-300'
                        }`}
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Custom Amount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={customAmount}
                        onChange={(e) => {
                          setCustomAmount(e.target.value);
                          setGiftAmount(0);
                        }}
                        placeholder="Enter custom amount"
                        min="10"
                        max="1000"
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Choose Design
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {giftCardDesigns.map(design => (
                      <button
                        key={design.id}
                        onClick={() => setSelectedDesign(design.id)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          selectedDesign === design.id
                            ? 'border-purple-600'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        <div className={`w-full h-24 ${design.preview} rounded-lg mb-2 flex items-center justify-center`}>
                          <CreditCard className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{design.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {mode === 'send-gift' && (
              <div className="mb-6">
                <label className="flex items-center gap-3 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-purple-400 transition-colors">
                  <input
                    type="checkbox"
                    checked={giftWrap}
                    onChange={(e) => setGiftWrap(e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white">Add Premium Gift Wrapping</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Beautiful presentation with ribbon and card</div>
                  </div>
                  <span className="text-purple-600 dark:text-purple-400 font-bold">+$5.99</span>
                </label>
              </div>
            )}

            <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl mb-6">
              <span className="text-gray-700 dark:text-gray-300 font-medium">Total Amount:</span>
              <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                ${(
                  mode === 'gift-card'
                    ? (customAmount ? parseFloat(customAmount) : giftAmount)
                    : (product?.price || 0) + (giftWrap ? 5.99 : 0)
                ).toFixed(2)}
              </span>
            </div>

            <button
              onClick={() => setStep('details')}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Details Step
  if (step === 'details') {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between z-10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gift Details</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
                {error}
              </div>
            )}

            {/* Recipient Information */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                Recipient Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Recipient Name *
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Recipient Email *
                  </label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Sender Information */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-purple-600" />
                Your Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Jane Smith"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Email *
                  </label>
                  <input
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Options */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Delivery Options
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-purple-400 transition-colors">
                  <input
                    type="radio"
                    checked={sendNow}
                    onChange={() => setSendNow(true)}
                    className="w-5 h-5"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white">Send Immediately</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Gift will be sent right after payment</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-purple-400 transition-colors">
                  <input
                    type="radio"
                    checked={!sendNow}
                    onChange={() => setSendNow(false)}
                    className="w-5 h-5"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white">Schedule Delivery</div>
                    {!sendNow && (
                      <input
                        type="date"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                    )}
                  </div>
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('options')}
                className="flex-1 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
              >
                Back
              </button>
              <button
                onClick={() => setStep('message')}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Message Step
  if (step === 'message') {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full">
          <div className="border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add Personal Message</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Gift Message (Optional)
              </label>
              <textarea
                value={giftMessage}
                onChange={(e) => setGiftMessage(e.target.value)}
                placeholder="Write a heartfelt message to your recipient..."
                rows={6}
                maxLength={500}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white resize-none"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {giftMessage.length}/500 characters
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={includeReceipt}
                  onChange={(e) => setIncludeReceipt(e.target.checked)}
                  className="w-5 h-5 rounded"
                />
                <span className="text-gray-700 dark:text-gray-300">Include receipt with gift</span>
              </label>
            </div>

            {/* Preview Card */}
            <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <h3 className="font-bold text-gray-900 dark:text-white">Gift Preview</h3>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">To: {recipientName || 'Recipient'}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">From: {senderName || 'Sender'}</p>
                {giftMessage && (
                  <p className="text-gray-700 dark:text-gray-300 italic border-l-4 border-purple-600 pl-4">
                    "{giftMessage}"
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('details')}
                className="flex-1 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
              >
                Back
              </button>
              <button
                onClick={handleComplete}
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Complete Purchase
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
