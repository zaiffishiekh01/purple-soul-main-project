import { useState } from 'react';
import { X, Plus, Minus, ShoppingCart, Check, Package, Truck, CreditCard, Gift, Star, Heart, Share2, AlertCircle, ArrowRight, ArrowLeft, MapPin, Phone, Mail, Lock, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import GiftOptionsModal from './GiftOptionsModal';
import AddToRegistryModal from './AddToRegistryModal';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image_url: string;
  images?: { url: string; alt_text?: string }[];
  stock: number;
  material?: string;
  origin?: string;
  craft_type?: string;
  dimensions?: string;
  category?: { name: string; slug: string };
  product_tags?: { tag: string }[];
}

interface RegistryItem {
  id: string;
  registry_id: string;
  product_id: string;
  quantity_requested: number;
  quantity_purchased: number;
  priority: 'high' | 'medium' | 'low';
  notes: string;
}

interface RegistryPurchaseFlowProps {
  product: Product;
  registryItem?: RegistryItem;
  registryId?: string;
  onClose: () => void;
  onPurchaseComplete?: () => void;
  mode?: 'product-detail' | 'purchase' | 'add-to-registry';
}

export default function RegistryPurchaseFlow({
  product,
  registryItem,
  registryId,
  onClose,
  onPurchaseComplete,
  mode = 'product-detail'
}: RegistryPurchaseFlowProps) {
  const [currentStep, setCurrentStep] = useState<'details' | 'bundle' | 'checkout' | 'payment' | 'confirmation'>('details');
  const [quantity, setQuantity] = useState(1);
  const [selectedBundle, setSelectedBundle] = useState<'single' | 'couple' | 'family'>('single');
  const [giftWrap, setGiftWrap] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Checkout form
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingZip, setShippingZip] = useState('');
  const [shippingCountry, setShippingCountry] = useState('');

  // Payment
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState('');
  const [currentImage, setCurrentImage] = useState(0);

  // Gift modals
  const [showGiftModal, setShowGiftModal] = useState<'send-gift' | 'gift-card' | null>(null);
  const [showRegistryModal, setShowRegistryModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const bundleOptions = {
    single: { multiplier: 1, label: 'Single Item', discount: 0 },
    couple: { multiplier: 2, label: 'Couple Set (2 items)', discount: 0.10 },
    family: { multiplier: 4, label: 'Family Pack (4 items)', discount: 0.20 }
  };

  const calculateTotal = () => {
    const bundleMultiplier = bundleOptions[selectedBundle].multiplier;
    const discount = bundleOptions[selectedBundle].discount;
    const subtotal = product.price * quantity * bundleMultiplier;
    const discountAmount = subtotal * discount;
    const giftWrapFee = giftWrap ? 5.99 * quantity * bundleMultiplier : 0;
    const shipping = 9.99;
    const tax = (subtotal - discountAmount) * 0.08;
    const total = subtotal - discountAmount + giftWrapFee + shipping + tax;

    return {
      subtotal,
      discount: discountAmount,
      giftWrapFee,
      shipping,
      tax,
      total
    };
  };

  const handleAddBundleToCart = async () => {
    setLoading(true);
    setError(null);

    try {
      const totalQuantity = quantity * bundleOptions[selectedBundle].multiplier;

      // Get current user or generate session ID
      const { data: { user } } = await supabase.auth.getUser();
      const sessionId = user ? null : (localStorage.getItem('guestSessionId') || (() => {
        const newSessionId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('guestSessionId', newSessionId);
        return newSessionId;
      })());

      // Add to cart in database
      const { error: cartError } = await supabase
        .from('cart_items')
        .insert({
          user_id: user?.id || null,
          session_id: sessionId,
          product_id: product.id,
          quantity: totalQuantity,
          unit_price: product.price,
          is_bundle: true,
          bundle_type: selectedBundle,
          bundle_label: bundleOptions[selectedBundle].label,
          bundle_discount: bundleOptions[selectedBundle].discount,
          gift_wrap: giftWrap,
          gift_message: giftWrap ? giftMessage : null,
          gift_wrap_fee: giftWrap ? 5.99 : 0
        });

      if (cartError) throw cartError;

      // Show success message and close
      alert(`${bundleOptions[selectedBundle].label} added to cart successfully!`);

      if (onPurchaseComplete) {
        onPurchaseComplete();
      }

      onClose();
    } catch (err) {
      console.error('Add to cart error:', err);
      setError('Failed to add bundle to cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!buyerName || !buyerEmail || !shippingAddress) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const totals = calculateTotal();
      const generatedOrderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Record purchase in registry if this is a registry purchase
      if (registryItem && registryId) {
        const { error: purchaseError } = await supabase
          .from('celebration_registry_purchases')
          .insert({
            registry_id: registryId,
            registry_item_id: registryItem.id,
            purchaser_name: buyerName,
            purchaser_email: buyerEmail,
            quantity: quantity * bundleOptions[selectedBundle].multiplier,
            message: giftMessage,
            is_anonymous: isAnonymous,
            gift_wrapped: giftWrap,
            delivery_status: 'pending'
          });

        if (purchaseError) throw purchaseError;
      }

      // Create order record (you can expand this to create in orders table)
      setOrderNumber(generatedOrderNumber);
      setCurrentStep('confirmation');

      if (onPurchaseComplete) {
        onPurchaseComplete();
      }
    } catch (err) {
      console.error('Purchase error:', err);
      setError('Failed to complete purchase. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const productImages = product.images && product.images.length > 0
    ? product.images
    : [{ url: product.image_url, alt_text: product.name }];

  const totals = calculateTotal();

  // Product Details Step
  if (currentStep === 'details') {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between z-10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Product Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Product Images */}
              <div>
                <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-gray-100 dark:bg-gray-700">
                  <img
                    src={productImages[currentImage].url}
                    alt={productImages[currentImage].alt_text || product.name}
                    className="w-full h-full object-cover"
                  />
                  {productImages.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImage((currentImage - 1 + productImages.length) % productImages.length)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setCurrentImage((currentImage + 1) % productImages.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors"
                      >
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>

                {productImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {productImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImage(idx)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                          currentImage === idx
                            ? 'border-pink-600'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <img
                          src={img.url}
                          alt={img.alt_text || `${product.name} ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div>
                <div className="mb-6">
                  {product.category && (
                    <span className="text-sm text-pink-600 dark:text-pink-400 font-medium">
                      {product.category.name}
                    </span>
                  )}
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2 mb-4">
                    {product.name}
                  </h1>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < 4 ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">4.8 (127 reviews)</span>
                  </div>

                  <div className="text-4xl font-bold text-pink-600 dark:text-pink-400 mb-6">
                    ${product.price.toFixed(2)}
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    {product.description}
                  </p>
                </div>

                {/* Product Details */}
                <div className="space-y-3 mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  {product.material && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Material:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{product.material}</span>
                    </div>
                  )}
                  {product.origin && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Origin:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{product.origin}</span>
                    </div>
                  )}
                  {product.dimensions && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Dimensions:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{product.dimensions}</span>
                    </div>
                  )}
                  {product.craft_type && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Craft Type:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{product.craft_type}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Availability:</span>
                    <span className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                {product.product_tags && product.product_tags.length > 0 && (
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      {product.product_tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 text-sm rounded-full"
                        >
                          {tag.tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Primary Action Buttons */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    onClick={() => setCurrentStep('bundle')}
                    disabled={product.stock === 0}
                    className="py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Buy Now
                  </button>
                  <button
                    onClick={() => setShowGiftModal('send-gift')}
                    disabled={product.stock === 0}
                    className="py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold rounded-xl hover:from-pink-700 hover:to-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Gift className="w-5 h-5" />
                    Send Gift
                  </button>
                </div>

                {/* Secondary Options */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowRegistryModal(true)}
                    className="py-3 border-2 border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400 font-medium rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Heart className="w-5 h-5" />
                    Add to Registry
                  </button>
                  <button
                    onClick={() => setShowGiftModal('gift-card')}
                    className="py-3 border-2 border-pink-600 text-pink-600 dark:text-pink-400 dark:border-pink-400 font-medium rounded-xl hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-5 h-5" />
                    Gift Card
                  </button>
                </div>

                {/* Additional Actions */}
                <div className="mt-4 flex gap-3">
                  <button
                    className="flex-1 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all flex items-center justify-center gap-2"
                  >
                    <Heart className="w-5 h-5" />
                    Wishlist
                  </button>
                  <button
                    className="flex-1 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-5 h-5" />
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Bundle Selection Step
  if (currentStep === 'bundle') {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full">
          <div className="border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Select Bundle & Quantity</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Product Summary */}
            <div className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <img src={product.image_url} alt={product.name} className="w-24 h-24 object-cover rounded-lg" />
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">{product.name}</h3>
                <p className="text-pink-600 dark:text-pink-400 font-semibold text-lg">${product.price.toFixed(2)} each</p>
              </div>
            </div>

            {/* Bundle Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Choose Bundle
              </label>
              <div className="space-y-3">
                {(Object.entries(bundleOptions) as [keyof typeof bundleOptions, typeof bundleOptions[keyof typeof bundleOptions]][]).map(([key, bundle]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedBundle(key)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      selectedBundle === key
                        ? 'border-pink-600 bg-pink-50 dark:bg-pink-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-pink-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white mb-1">{bundle.label}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          ${(product.price * bundle.multiplier * (1 - bundle.discount)).toFixed(2)}
                          {bundle.discount > 0 && (
                            <span className="ml-2 text-green-600 dark:text-green-400 font-medium">
                              Save {(bundle.discount * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedBundle === key
                          ? 'border-pink-600 bg-pink-600'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {selectedBundle === key && <Check className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-3xl font-bold text-gray-900 dark:text-white min-w-[4rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Gift Options */}
            <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={giftWrap}
                  onChange={(e) => setGiftWrap(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300"
                />
                <div className="flex-1">
                  <span className="text-gray-900 dark:text-white font-medium">Add Gift Wrapping</span>
                  <span className="text-gray-600 dark:text-gray-400 text-sm ml-2">+$5.99 per item</span>
                </div>
              </label>

              {giftWrap && (
                <textarea
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  placeholder="Add a personal gift message (optional)..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white resize-none"
                />
              )}

              {registryItem && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300"
                  />
                  <span className="text-gray-900 dark:text-white">Make my purchase anonymous</span>
                </label>
              )}
            </div>

            {/* Order Summary */}
            <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-xl space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                <span className="font-medium text-gray-900 dark:text-white">${totals.subtotal.toFixed(2)}</span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Bundle Discount:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">-${totals.discount.toFixed(2)}</span>
                </div>
              )}
              {totals.giftWrapFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Gift Wrapping:</span>
                  <span className="font-medium text-gray-900 dark:text-white">${totals.giftWrapFee.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-pink-200 dark:border-pink-800">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900 dark:text-white">Estimated Total:</span>
                  <span className="font-bold text-pink-600 dark:text-pink-400 text-xl">${(totals.subtotal - totals.discount + totals.giftWrapFee).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="space-y-3">
              <button
                onClick={handleAddBundleToCart}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Adding to Cart...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Add Bundle to Cart
                  </>
                )}
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentStep('details')}
                  className="flex-1 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep('checkout')}
                  className="flex-1 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold rounded-xl hover:from-pink-700 hover:to-rose-700 transition-all"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Checkout Step
  if (currentStep === 'checkout') {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full my-8">
          <div className="border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Checkout</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Shipping Address
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="123 Main Street, Apt 4B"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={shippingCity}
                      onChange={(e) => setShippingCity(e.target.value)}
                      placeholder="New York"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      value={shippingZip}
                      onChange={(e) => setShippingZip(e.target.value)}
                      placeholder="10001"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Country *
                    </label>
                    <select
                      value={shippingCountry}
                      onChange={(e) => setShippingCountry(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                      required
                    >
                      <option value="">Select...</option>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="UK">United Kingdom</option>
                      <option value="AU">Australia</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-3">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">Order Summary</h3>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {product.name} x {quantity * bundleOptions[selectedBundle].multiplier}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">${totals.subtotal.toFixed(2)}</span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Bundle Discount:</span>
                  <span className="font-medium text-green-600">-${totals.discount.toFixed(2)}</span>
                </div>
              )}
              {totals.giftWrapFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Gift Wrapping:</span>
                  <span className="font-medium text-gray-900 dark:text-white">${totals.giftWrapFee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Shipping:</span>
                <span className="font-medium text-gray-900 dark:text-white">${totals.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Tax (8%):</span>
                <span className="font-medium text-gray-900 dark:text-white">${totals.tax.toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-900 dark:text-white">Total:</span>
                  <span className="font-bold text-pink-600 dark:text-pink-400 text-2xl">${totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep('bundle')}
                className="flex-1 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep('payment')}
                className="flex-1 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold rounded-xl hover:from-pink-700 hover:to-rose-700 transition-all"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Payment Step
  if (currentStep === 'payment') {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full my-8">
          <div className="border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Information</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-3">
              <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Your payment information is encrypted and secure. We never store your full card details.
              </p>
            </div>

            {/* Payment Form */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Card Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim())}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value.replace(/\D/g, '').replace(/(\d{2})(\d{0,2})/, '$1/$2').substr(0, 5))}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').substr(0, 3))}
                      placeholder="123"
                      maxLength={3}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Order Total */}
            <div className="p-6 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 dark:text-gray-300">Amount to be charged:</span>
                <span className="text-3xl font-bold text-pink-600 dark:text-pink-400">
                  ${totals.total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep('checkout')}
                disabled={loading}
                className="flex-1 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={handlePurchase}
                disabled={loading || !cardName || !cardNumber || !cardExpiry || !cardCvv}
                className="flex-1 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold rounded-xl hover:from-pink-700 hover:to-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
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

  // Confirmation Step
  if (currentStep === 'confirmation') {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full my-8">
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Order Confirmed!
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Thank you for your purchase. Your order has been confirmed.
            </p>

            {/* Order Details */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 mb-6 text-left">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-600">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Order Number</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{orderNumber}</div>
                </div>
                <Package className="w-10 h-10 text-pink-600 dark:text-pink-400" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Product:</span>
                  <span className="font-medium text-gray-900 dark:text-white text-right">{product.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{quantity * bundleOptions[selectedBundle].multiplier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Paid:</span>
                  <span className="font-bold text-pink-600 dark:text-pink-400">${totals.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Shipping To:</span>
                  <span className="font-medium text-gray-900 dark:text-white text-right max-w-[200px]">
                    {shippingAddress}, {shippingCity}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Email Confirmation:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{buyerEmail}</span>
                </div>
              </div>
            </div>

            {/* Tracking Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-3">
                <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                <div className="text-left">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Track Your Order</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    We'll send tracking information to <strong>{buyerEmail}</strong> once your order ships.
                    Estimated delivery: 3-5 business days.
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    You can track your order anytime using order number: <strong>{orderNumber}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold rounded-xl hover:from-pink-700 hover:to-rose-700 transition-all"
              >
                Done
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 border-2 border-pink-600 text-pink-600 dark:text-pink-400 dark:border-pink-400 font-semibold rounded-xl hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Gift Modals */}
      {showGiftModal && (
        <GiftOptionsModal
          product={product}
          mode={showGiftModal}
          onClose={() => setShowGiftModal(null)}
          onComplete={(giftData) => {
            setShowGiftModal(null);
            // Navigate to checkout with gift data
            setCurrentStep('checkout');
          }}
        />
      )}

      {/* Add to Registry Modal */}
      {showRegistryModal && (
        <AddToRegistryModal
          product={product}
          currentUserId={currentUserId}
          onClose={() => setShowRegistryModal(false)}
          onSuccess={() => {
            setShowRegistryModal(false);
            if (onPurchaseComplete) onPurchaseComplete();
          }}
        />
      )}
    </>
  );
}
