import { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Star, Truck, Shield, RotateCcw, ChevronLeft, Check, ZoomIn, ChevronRight, Award, Package, Clock, MapPin, User, X, ShoppingBag, Gift, Sparkles, TrendingUp, ChevronDown, Eye, BadgeCheck, CreditCard, Globe, BookmarkPlus, Mail, CreditCard as Edit } from 'lucide-react';
import { Product } from '../App';
import { mockProducts } from '../data/products';
import { supabase } from '../lib/supabase';
import ReviewManager from './ReviewManager';
import AddToRegistryModal from './AddToRegistryModal';
import SendGiftModal from './SendGiftModal';
import GiftCardModal from './GiftCardModal';

interface CartItem {
  id: string;
  selectedColor?: string;
  selectedSize?: string;
}

interface ProductDetailProps {
  product: Product;
  cart: CartItem[];
  onAddToCart: (product: Product, color?: string, size?: string, bundleId?: string, bundleDiscount?: number) => void;
  onBack: () => void;
  isInWishlist: boolean;
  onToggleWishlist: (id: string) => void;
  onBuyNow?: (product: Product, color?: string, size?: string, quantity?: number) => void;
}

interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  verified: boolean;
  title: string;
  content: string;
  helpful: number;
}

export default function ProductDetail({
  product,
  cart,
  onAddToCart,
  onBack,
  isInWishlist,
  onToggleWishlist,
  onBuyNow,
}: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0]);
  const [quantity, setQuantity] = useState(1);
  const [showZoom, setShowZoom] = useState(false);
  const [activeTab, setActiveTab] = useState<'about' | 'craft' | 'technique' | 'origin' | 'tradition' | 'verification' | 'shipping' | 'reviews'>('about');
  const [stickyPurchaseBox, setStickyPurchaseBox] = useState(false);
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>('description');
  const [selectedBundleItems, setSelectedBundleItems] = useState<Set<string>>(new Set());
  const [showRegistryModal, setShowRegistryModal] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showGiftCardModal, setShowGiftCardModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [userReview, setUserReview] = useState<any>(null);
  const [approvedReviews, setApprovedReviews] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const relatedProducts = mockProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 6);

  const bundleProducts = mockProducts
    .filter(p => p.id !== product.id && p.tags.some(tag => product.tags.includes(tag)))
    .slice(0, 3);

  const frequentlyBoughtTogether = mockProducts
    .filter(p => p.id !== product.id)
    .slice(0, 2);

  const isProductInCart = cart.some(item =>
    item.id === product.id &&
    item.selectedColor === selectedColor &&
    item.selectedSize === selectedSize
  );

  useEffect(() => {
    const handleScroll = () => {
      const shouldShowSticky = window.scrollY > 600 && !isProductInCart;
      setStickyPurchaseBox(shouldShowSticky);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isProductInCart]);

  useEffect(() => {
    fetchCurrentUser();
    fetchReviews();
  }, [product.id]);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);

    if (user?.id) {
      const { data } = await supabase
        .from('product_reviews_moderated')
        .select('*')
        .eq('product_id', product.id)
        .eq('user_id', user.id)
        .maybeSingle();

      setUserReview(data);
    }
  };

  const fetchReviews = async () => {
    setReviewsLoading(true);
    const { data, error } = await supabase
      .from('product_reviews_moderated')
      .select('*')
      .eq('product_id', product.id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && data) {
      setApprovedReviews(data);
    }
    setReviewsLoading(false);
  };

  const handleReviewSuccess = () => {
    fetchCurrentUser();
    fetchReviews();
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      onAddToCart(product, selectedColor, selectedSize);
    }
  };

  const handleBuyNow = () => {
    if (onBuyNow) {
      onBuyNow(product, selectedColor, selectedSize, quantity);
    }
  };

  const handleAddBundleToCart = () => {
    if (selectedBundleCount === 0) return;

    const bundleId = `bundle-${Date.now()}`;
    const bundleDiscountPercent = bundleSavingsPercent;

    selectedBundleProducts.forEach(bundleProduct => {
      onAddToCart(bundleProduct, undefined, undefined, bundleId, bundleDiscountPercent);
    });

    setSelectedBundleItems(new Set());
  };

  const mockReviews: Review[] = [
    {
      id: '1',
      author: 'Sarah M.',
      rating: 5,
      date: '2024-02-15',
      verified: true,
      title: 'Absolutely Beautiful Craftsmanship',
      content: 'This piece exceeded my expectations. The attention to detail is remarkable, and you can truly feel the care put into creating it. Perfect addition to our prayer space.',
      helpful: 24
    },
    {
      id: '2',
      author: 'David L.',
      rating: 5,
      date: '2024-02-10',
      verified: true,
      title: 'A Meaningful Gift',
      content: 'Purchased as a wedding gift and the couple was absolutely delighted. The quality is outstanding and the presentation was beautiful. Highly recommend!',
      helpful: 18
    },
    {
      id: '3',
      author: 'Fatima A.',
      rating: 4,
      date: '2024-02-05',
      verified: true,
      title: 'Beautiful, Worth the Price',
      content: 'Gorgeous piece with authentic craftsmanship. Took a bit longer to arrive but the quality makes it worth the wait. Will definitely shop here again.',
      helpful: 12
    }
  ];

  const estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const toggleBundleItem = (productId: string) => {
    setSelectedBundleItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const selectedBundleProducts = bundleProducts.filter(p => selectedBundleItems.has(p.id));
  const selectedBundleCount = selectedBundleItems.size;

  const calculateBundleSavings = (count: number) => {
    if (count === 0) return 0;
    if (count === 1) return 0.02; // 2%
    if (count === 2) return 0.08; // 8%
    return 0.15; // 15% for 3+
  };

  const bundleOriginalPrice = selectedBundleProducts.reduce((sum, p) => sum + p.price, 0);
  const bundleSavingsPercent = calculateBundleSavings(selectedBundleCount);
  const bundleSavingsAmount = Math.round(bundleOriginalPrice * bundleSavingsPercent);
  const bundleTotalPrice = bundleOriginalPrice - bundleSavingsAmount;

  const getBundleCTAText = () => {
    if (selectedBundleCount === 0) return 'Select Items to Add';
    if (selectedBundleCount === 1) return 'Add Selected Item';
    if (selectedBundleCount === bundleProducts.length) return 'Add Complete Collection';
    return 'Add Selected Bundle';
  };

  const getWhyItPairs = (bundleProduct: Product) => {
    const commonTags = bundleProduct.tags.filter(tag => product.tags.includes(tag));
    if (commonTags.includes('spiritual')) return 'Enhances spiritual practice';
    if (commonTags.includes('handmade')) return 'Matching artisan craftsmanship';
    if (commonTags.includes('decorative')) return 'Completes the aesthetic';
    if (commonTags.includes('ceremonial')) return 'Perfect for ceremonies together';
    return 'Thoughtfully curated pairing';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-page">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-secondary hover:text-purple-600 mb-6 transition-colors group"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back to products</span>
      </button>

      <div className="grid lg:grid-cols-12 gap-8 mb-12">
        <div className="lg:col-span-7">
          <div className="sticky top-4">
            <div className="relative bg-surface rounded-2xl overflow-hidden mb-4 group shadow-theme-lg border border-default">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full aspect-square object-cover cursor-zoom-in"
                onClick={() => setShowZoom(true)}
              />
              <button
                onClick={() => setShowZoom(true)}
                className="absolute top-4 right-4 bg-surface/95 backdrop-blur-sm rounded-xl px-4 py-3 opacity-0 group-hover:opacity-100 transition-all shadow-theme-md hover:shadow-theme-lg border border-default"
              >
                <div className="flex items-center gap-2">
                  <ZoomIn className="w-5 h-5 icon-default" />
                  <span className="text-sm font-medium text-primary">View Fullscreen</span>
                </div>
              </button>

              {product.trending && (
                <div className="absolute top-4 left-4 gradient-purple-soul text-white px-4 py-2 rounded-xl font-semibold text-sm shadow-theme-lg flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Trending
                </div>
              )}

              {selectedImage > 0 && (
                <button
                  onClick={() => setSelectedImage(selectedImage - 1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-surface/95 backdrop-blur-sm rounded-full p-3 shadow-theme-lg hover:shadow-theme-xl transition-all border border-default"
                >
                  <ChevronLeft className="w-5 h-5 icon-default" />
                </button>
              )}

              {selectedImage < product.images.length - 1 && (
                <button
                  onClick={() => setSelectedImage(selectedImage + 1)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-surface/95 backdrop-blur-sm rounded-full p-3 shadow-theme-lg hover:shadow-theme-xl transition-all border border-default"
                >
                  <ChevronRight className="w-5 h-5 icon-default" />
                </button>
              )}
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? 'border-purple-600 ring-2 ring-purple-200 shadow-theme-md scale-105'
                      : 'border-default hover:border-purple-300 hover:shadow-theme-sm'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800/50">
              <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
              <div className="text-sm text-secondary">
                <span className="font-semibold text-purple-700 dark:text-purple-300">{product.viewCount || 142}</span> people are viewing this item •
                <span className="font-semibold text-purple-700 dark:text-purple-300 ml-1">{product.purchaseCount || 89}</span> purchased recently
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl font-bold text-primary leading-tight mb-3">{product.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 rounded-lg border border-yellow-200 dark:border-yellow-800/50">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-primary">{product.rating}</span>
                </div>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className="text-purple-600 hover:text-purple-700 font-medium text-sm hover:underline"
                >
                  {product.reviews.toLocaleString()} reviews
                </button>
              </div>
            </div>
            <button
              onClick={() => onToggleWishlist(product.id)}
              className="p-3 rounded-full bg-surface border border-default hover:border-purple-300 hover:bg-purple-50 transition-all shadow-theme-sm hover:shadow-theme-md"
            >
              <Heart
                className={`w-6 h-6 ${
                  isInWishlist ? 'fill-red-500 text-red-500' : 'icon-default'
                }`}
              />
            </button>
          </div>

          <div className="bg-surface border-2 border-purple-200 dark:border-purple-800/50 rounded-2xl p-6 mb-6 shadow-theme-lg">
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-5xl font-bold text-purple-600 dark:text-purple-400">${product.price}</span>
              {product.originalPrice && (
                <>
                  <span className="text-2xl text-muted line-through">
                    ${product.originalPrice}
                  </span>
                  <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm font-bold">
                    Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </span>
                </>
              )}
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 text-sm">
                <Package className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="font-semibold text-green-700 dark:text-green-400">In Stock - Ready to Ship</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Truck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <div>
                  <span className="font-medium text-primary">Free Shipping</span>
                  <span className="text-secondary"> on orders over $50</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <div>
                  <span className="font-medium text-primary">Estimated Delivery: </span>
                  <span className="text-secondary">{estimatedDelivery}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-secondary">Ships from our trusted artisan partners</span>
              </div>
            </div>

            {product.colors && (
              <div className="mb-6">
                <h3 className="font-bold text-primary mb-3 text-sm uppercase tracking-wide">Color: <span className="text-purple-600 dark:text-purple-400">{selectedColor}</span></h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-5 py-3 rounded-xl border-2 transition-all font-medium text-sm ${
                        selectedColor === color
                          ? 'border-purple-600 dark:border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 shadow-theme-md'
                          : 'border-default hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-theme-sm text-secondary'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.sizes && (
              <div className="mb-6">
                <h3 className="font-bold text-primary mb-3 text-sm uppercase tracking-wide">Size: <span className="text-purple-600 dark:text-purple-400">{selectedSize}</span></h3>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-5 py-3 rounded-xl border-2 transition-all font-medium text-sm ${
                        selectedSize === size
                          ? 'border-purple-600 dark:border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 shadow-theme-md'
                          : 'border-default hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-theme-sm text-secondary'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="font-bold text-primary mb-3 text-sm uppercase tracking-wide">Quantity</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 rounded-xl border-2 border-default hover:border-purple-600 hover:bg-purple-50 transition-all font-bold text-lg"
                >
                  -
                </button>
                <span className="text-2xl font-bold w-16 text-center text-primary">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 rounded-xl border-2 border-default hover:border-purple-600 hover:bg-purple-50 transition-all font-bold text-lg"
                >
                  +
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  className="w-full gradient-purple-soul text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-theme-lg hover:shadow-theme-xl flex items-center justify-center gap-3"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="w-full bg-purple-600 dark:bg-purple-700 text-white py-4 rounded-xl font-bold text-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-all shadow-theme-md hover:shadow-theme-lg"
                >
                  Buy Now
                </button>
              </div>

              <div className="pt-3 border-t border-default">
                <p className="text-xs font-medium text-secondary mb-3 text-center">More Options</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onToggleWishlist(product.id)}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                      isInWishlist
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50'
                        : 'bg-surface-elevated dark:bg-surface-deep text-secondary hover:text-purple-600 dark:hover:text-purple-400 border border-default hover:border-purple-300 dark:hover:border-purple-700'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
                    <span>{isInWishlist ? 'Saved' : 'Wishlist'}</span>
                  </button>

                  <button
                    onClick={() => setShowRegistryModal(true)}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm bg-surface-elevated dark:bg-surface-deep text-secondary hover:text-purple-600 dark:hover:text-purple-400 border border-default hover:border-purple-300 dark:hover:border-purple-700 transition-all"
                  >
                    <BookmarkPlus className="w-4 h-4" />
                    <span>Registry</span>
                  </button>

                  <button
                    onClick={() => setShowGiftModal(true)}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm bg-surface-elevated dark:bg-surface-deep text-secondary hover:text-purple-600 dark:hover:text-purple-400 border border-default hover:border-purple-300 dark:hover:border-purple-700 transition-all"
                  >
                    <Gift className="w-4 h-4" />
                    <span>Send Gift</span>
                  </button>

                  <button
                    onClick={() => setShowGiftCardModal(true)}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm bg-surface-elevated dark:bg-surface-deep text-secondary hover:text-purple-600 dark:hover:text-purple-400 border border-default hover:border-purple-300 dark:hover:border-purple-700 transition-all"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Gift Card</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-600 dark:bg-emerald-700 rounded-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-lg text-primary">Verification & Traceability</h3>
            </div>
            <div className="space-y-3 text-sm mb-4">
              <div className="flex items-center justify-between">
                <span className="text-secondary">GI Status</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <BadgeCheck className="w-4 h-4" />
                  Verified
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary">Vendor Status</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">Verified Vendor</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary">Repository Status</span>
                <span className="font-semibold text-primary">Listed in Craftlore</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary">Sustainability Insight</span>
                <span className="font-semibold text-primary">Available</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 bg-emerald-600 dark:bg-emerald-700 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all">
                Verify on Craftlore
              </button>
              <button className="flex-1 bg-surface-elevated dark:bg-surface-deep border border-default text-primary py-2.5 rounded-lg font-semibold text-sm hover:border-emerald-300 dark:hover:border-emerald-700 transition-all">
                View Details
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800/50 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-600 dark:bg-purple-700 rounded-lg">
                <BadgeCheck className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-lg text-primary">Authenticity Guaranteed</h3>
            </div>
            <ul className="space-y-2 text-sm text-secondary">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                <span>Handcrafted by verified artisan partners</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                <span>Certificate of authenticity included</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                <span>Direct from cultural artisan communities</span>
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-surface border border-default rounded-xl hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-theme-sm transition-all">
              <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-primary mb-1">Secure Payment</p>
              <p className="text-xs text-secondary">100% protected</p>
            </div>
            <div className="text-center p-4 bg-surface border border-default rounded-xl hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-theme-sm transition-all">
              <RotateCcw className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-primary mb-1">Easy Returns</p>
              <p className="text-xs text-secondary">30-day guarantee</p>
            </div>
            <div className="text-center p-4 bg-surface border border-default rounded-xl hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-theme-sm transition-all">
              <Award className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-primary mb-1">Premium Quality</p>
              <p className="text-xs text-secondary">Artisan-verified</p>
            </div>
          </div>
        </div>
      </div>

      {stickyPurchaseBox && (
        <div className="fixed bottom-0 left-0 right-0 bg-surface/95 dark:bg-surface/98 backdrop-blur-lg border-t-2 border-purple-200 dark:border-purple-800/50 shadow-theme-2xl z-40 py-4 px-6 animate-slide-up">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img src={product.image} alt={product.name} className="w-16 h-16 rounded-lg object-cover border border-default" />
              <div>
                <h3 className="font-bold text-primary line-clamp-1">{product.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">${product.price}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted line-through">${product.originalPrice}</span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={handleAddToCart}
              className="gradient-purple-soul text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-theme-lg flex items-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>
          </div>
        </div>
      )}

      {showZoom && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-8"
          onClick={() => setShowZoom(false)}
        >
          <button
            className="absolute top-6 right-6 bg-white/10 backdrop-blur-sm rounded-full p-3 hover:bg-white/20 transition-all"
            onClick={() => setShowZoom(false)}
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <img
            src={product.images[selectedImage]}
            alt={product.name}
            className="max-w-full max-h-full object-contain"
          />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {product.images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(index);
                }}
                className={`w-3 h-3 rounded-full transition-all ${
                  selectedImage === index ? 'bg-white w-8' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {bundleProducts.length >= 2 && (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-2 border-purple-200 dark:border-purple-800/50 rounded-2xl p-8 mb-12 shadow-theme-lg">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-purple-600 dark:bg-purple-700 rounded-xl">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-primary">Complete Your Collection</h2>
                <p className="text-secondary">Curate your set — save more as you add</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-3 py-1.5 rounded-lg font-medium">
                <Sparkles className="w-4 h-4" />
                <span>1 item: 2% off</span>
              </div>
              <div className="flex items-center gap-1.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-3 py-1.5 rounded-lg font-medium">
                <Sparkles className="w-4 h-4" />
                <span>2 items: 8% off</span>
              </div>
              <div className="flex items-center gap-1.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-3 py-1.5 rounded-lg font-medium">
                <Sparkles className="w-4 h-4" />
                <span>3+ items: 15% off</span>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
            {bundleProducts.map((bp) => {
              const isSelected = selectedBundleItems.has(bp.id);
              return (
                <div
                  key={bp.id}
                  className={`relative bg-surface rounded-xl overflow-hidden transition-all cursor-pointer group ${
                    isSelected
                      ? 'border-2 border-purple-600 dark:border-purple-500 shadow-theme-lg ring-4 ring-purple-100 dark:ring-purple-900/30'
                      : 'border-2 border-purple-200 dark:border-purple-800/50 hover:border-purple-400 dark:hover:border-purple-600 shadow-theme-md hover:shadow-theme-lg'
                  }`}
                  onClick={() => toggleBundleItem(bp.id)}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 z-10 bg-purple-600 dark:bg-purple-700 text-white rounded-full p-1.5 shadow-theme-md">
                      <Check className="w-5 h-5" />
                    </div>
                  )}

                  <div className="relative">
                    <img src={bp.image} alt={bp.name} className="w-full aspect-square object-cover" />
                    <div className={`absolute inset-0 transition-opacity ${isSelected ? 'bg-purple-600/10' : 'bg-black/0 group-hover:bg-black/5'}`} />
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-sm text-primary mb-1 line-clamp-2 min-h-[2.5rem]">
                      {bp.name}
                    </h3>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(bp.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted'
                          }`}
                        />
                      ))}
                      <span className="text-xs text-secondary ml-1">({bp.reviews})</span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-purple-600 dark:text-purple-400">${bp.price}</span>
                      <button
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-purple-600 dark:bg-purple-700 text-white'
                            : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800/40'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBundleItem(bp.id);
                        }}
                      >
                        {isSelected ? 'Selected' : 'Add'}
                      </button>
                    </div>
                    <div className="flex items-start gap-1.5 text-xs text-secondary bg-surface-elevated dark:bg-surface-deep px-2 py-1.5 rounded-lg">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>{getWhyItPairs(bp)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-surface border-2 border-purple-300 dark:border-purple-700 rounded-xl p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="text-sm text-secondary mb-2">
                  {selectedBundleCount === 0 ? (
                    'Select items to see your bundle price'
                  ) : (
                    <>Selected: <span className="font-semibold text-primary">{selectedBundleCount} {selectedBundleCount === 1 ? 'item' : 'items'}</span></>
                  )}
                </div>
                {selectedBundleCount > 0 && (
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">${bundleTotalPrice}</span>
                    {bundleSavingsAmount > 0 && (
                      <>
                        <span className="text-xl text-muted line-through">${bundleOriginalPrice}</span>
                        <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          Save ${bundleSavingsAmount} ({Math.round(bundleSavingsPercent * 100)}%)
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={handleAddBundleToCart}
                disabled={selectedBundleCount === 0}
                className={`px-8 py-4 rounded-xl font-bold transition-all shadow-theme-lg flex items-center gap-2 whitespace-nowrap ${
                  selectedBundleCount === 0
                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'gradient-purple-soul text-white hover:opacity-90'
                }`}
              >
                <ShoppingBag className="w-5 h-5" />
                {getBundleCTAText()}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-surface border border-default rounded-2xl shadow-theme-lg mb-12 overflow-hidden">
        <div className="border-b border-default">
          <div className="flex overflow-x-auto">
            {([
              { key: 'about', label: 'About This Piece' },
              { key: 'craft', label: 'Craft Process' },
              { key: 'technique', label: 'Technique & Materials' },
              { key: 'origin', label: 'Origin & Artisan' },
              { key: 'tradition', label: 'Tradition & Meaning' },
              { key: 'verification', label: 'Verification & Traceability' },
              { key: 'shipping', label: 'Shipping & Returns' },
              { key: 'reviews', label: 'Reviews' }
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-4 font-bold transition-all border-b-3 whitespace-nowrap text-sm ${
                  activeTab === tab.key
                    ? 'border-purple-600 dark:border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-transparent text-secondary hover:text-primary hover:bg-surface-elevated'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-8">
          {activeTab === 'about' && (
            <div className="max-w-none">
              <p className="text-secondary leading-relaxed mb-8 text-lg">{product.description}</p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-surface-elevated dark:bg-surface-deep rounded-xl p-6 border border-default">
                  <h4 className="font-bold text-primary mb-4 flex items-center gap-2 text-lg">
                    <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    Key Features
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-secondary">
                      <Check className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Handcrafted from ancient olive wood</span>
                    </li>
                    <li className="flex items-start gap-3 text-secondary">
                      <Check className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Sourced from the Holy Land</span>
                    </li>
                    <li className="flex items-start gap-3 text-secondary">
                      <Check className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Natural grain patterns - each unique</span>
                    </li>
                    <li className="flex items-start gap-3 text-secondary">
                      <Check className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Traditional craftsmanship methods</span>
                    </li>
                    <li className="flex items-start gap-3 text-secondary">
                      <Check className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Certificate of authenticity included</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-surface-elevated dark:bg-surface-deep rounded-xl p-6 border border-default">
                  <h4 className="font-bold text-primary mb-4 flex items-center gap-2 text-lg">
                    <Gift className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    Perfect For
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-secondary">
                      <Check className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Religious ceremonies and celebrations</span>
                    </li>
                    <li className="flex items-start gap-3 text-secondary">
                      <Check className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Meaningful gift giving</span>
                    </li>
                    <li className="flex items-start gap-3 text-secondary">
                      <Check className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Home blessing and decoration</span>
                    </li>
                    <li className="flex items-start gap-3 text-secondary">
                      <Check className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Personal spiritual practice</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'craft' && (
            <div>
              <p className="text-secondary leading-relaxed mb-8 text-lg">
                Each piece is meticulously handcrafted using centuries-old techniques passed down through generations of artisan families.
              </p>

              <div className="mb-8">
                <h4 className="font-bold text-primary mb-5 text-lg">Crafting Steps</h4>
                <div className="space-y-4">
                  {[
                    { step: 1, title: 'Wood Selection', desc: 'Ancient olive wood is carefully sourced and selected for quality grain patterns' },
                    { step: 2, title: 'Hand Carving', desc: 'Master artisans hand-carve each bead using traditional tools' },
                    { step: 3, title: 'Smoothing & Shaping', desc: 'Each piece is meticulously smoothed to perfect roundness' },
                    { step: 4, title: 'Natural Polishing', desc: 'Beads are polished using natural oils to enhance the grain' },
                    { step: 5, title: 'Assembly', desc: 'Skilled hands string and assemble with attention to balance' },
                    { step: 6, title: 'Quality Inspection', desc: 'Final review ensures authenticity and craftsmanship standards' }
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4 p-4 bg-surface-elevated dark:bg-surface-deep rounded-xl border border-default">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                        <span className="font-bold text-purple-600 dark:text-purple-400">{item.step}</span>
                      </div>
                      <div className="flex-1">
                        <h5 className="font-bold text-primary mb-1">{item.title}</h5>
                        <p className="text-sm text-secondary">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-bold text-primary mb-1">Handmade Variations</h5>
                    <p className="text-sm text-secondary">
                      As each piece is handcrafted, slight variations in grain pattern, color, and dimensions are natural and celebrate the unique character of artisan work.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'technique' && (
            <div>
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-surface-elevated dark:bg-surface-deep rounded-xl p-5 border border-default">
                  <h5 className="text-xs uppercase tracking-wide font-bold text-muted mb-2">Material</h5>
                  <p className="text-lg font-semibold text-primary">Ancient Olive Wood</p>
                  <p className="text-sm text-secondary mt-1">Sustainably sourced from the Holy Land</p>
                </div>

                <div className="bg-surface-elevated dark:bg-surface-deep rounded-xl p-5 border border-default">
                  <h5 className="text-xs uppercase tracking-wide font-bold text-muted mb-2">Technique</h5>
                  <p className="text-lg font-semibold text-primary">Hand Carved</p>
                  <p className="text-sm text-secondary mt-1">Traditional artisan methods</p>
                </div>

                <div className="bg-surface-elevated dark:bg-surface-deep rounded-xl p-5 border border-default">
                  <h5 className="text-xs uppercase tracking-wide font-bold text-muted mb-2">Finish</h5>
                  <p className="text-lg font-semibold text-primary">Natural Oil Polish</p>
                  <p className="text-sm text-secondary mt-1">Enhances wood grain beauty</p>
                </div>

                <div className="bg-surface-elevated dark:bg-surface-deep rounded-xl p-5 border border-default">
                  <h5 className="text-xs uppercase tracking-wide font-bold text-muted mb-2">Dimensions</h5>
                  <p className="text-lg font-semibold text-primary">Standard Size</p>
                  <p className="text-sm text-secondary mt-1">Approx. 8mm bead diameter</p>
                </div>
              </div>

              <div className="border border-default rounded-xl p-6 mb-6">
                <h4 className="font-bold text-primary mb-4 text-lg">Care Instructions</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-primary text-sm">Cleaning</p>
                      <p className="text-sm text-secondary">Wipe gently with soft, dry cloth</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-primary text-sm">Storage</p>
                      <p className="text-sm text-secondary">Keep in cool, dry place</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-primary text-sm">Avoid</p>
                      <p className="text-sm text-secondary">Direct sunlight and moisture</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-primary text-sm">Maintenance</p>
                      <p className="text-sm text-secondary">Occasional light oiling preserves beauty</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-bold text-primary mb-1">Natural Variation Notice</h5>
                    <p className="text-sm text-secondary">
                      Wood grain, color tone, and exact dimensions may vary slightly from photos. These natural variations are inherent to authentic handcrafted wood products and make each piece one-of-a-kind.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'origin' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-2 border-purple-200 dark:border-purple-800/50 rounded-xl p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-purple-600 dark:bg-purple-700 rounded-xl">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-primary text-xl mb-2">Origin & Provenance</h4>
                    <p className="text-secondary mb-4">
                      Handcrafted in the Holy Land by artisan families who have perfected their craft over generations. The olive wood used in this piece comes from pruned branches of ancient trees, ensuring sustainability while honoring tradition.
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-surface rounded-xl p-4 border border-default">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <h5 className="font-bold text-primary">Origin</h5>
                    </div>
                    <p className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-1">Bethlehem / Holy Land</p>
                    <p className="text-xs text-secondary">Palestinian Territories</p>
                  </div>

                  <div className="bg-surface rounded-xl p-4 border border-default">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <h5 className="font-bold text-primary">Craft Region</h5>
                    </div>
                    <p className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-1">Bethlehem Craft Cluster</p>
                    <p className="text-xs text-secondary">Historic woodcarving district</p>
                  </div>

                  <div className="bg-surface rounded-xl p-4 border border-default">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <h5 className="font-bold text-primary">Artisan Partner</h5>
                    </div>
                    <p className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-1">Holy Land Collective</p>
                    <p className="text-xs text-secondary flex items-center gap-1">
                      <BadgeCheck className="w-3 h-3" />
                      Verified Craftlore Vendor
                    </p>
                  </div>

                  <div className="bg-surface rounded-xl p-4 border border-default">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <h5 className="font-bold text-primary">Repository Status</h5>
                    </div>
                    <p className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-1">Listed in Craftlore</p>
                    <p className="text-xs text-secondary">ID: CL-HLO-OW-2024-789</p>
                  </div>
                </div>
              </div>

              <div className="border border-default rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-surface-elevated dark:bg-surface-deep rounded-xl">
                    <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-primary text-lg mb-2">Artisan Workshop</h4>
                    <p className="text-secondary mb-4">
                      Created by master craftspeople from the renowned artisan cooperatives of Bethlehem and Jerusalem, where woodcarving traditions date back centuries. These workshops provide fair wages and preserve cultural heritage while supporting local communities.
                    </p>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-surface-elevated dark:bg-surface-deep rounded-lg p-3">
                        <p className="text-xs text-muted mb-1">Workshop</p>
                        <p className="font-semibold text-primary text-sm">Traditional Collective</p>
                      </div>
                      <div className="bg-surface-elevated dark:bg-surface-deep rounded-lg p-3">
                        <p className="text-xs text-muted mb-1">Experience</p>
                        <p className="font-semibold text-primary text-sm">Multi-generational</p>
                      </div>
                      <div className="bg-surface-elevated dark:bg-surface-deep rounded-lg p-3">
                        <p className="text-xs text-muted mb-1">Specialty</p>
                        <p className="font-semibold text-primary text-sm">Religious Items</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <BadgeCheck className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-bold text-primary mb-1">Authenticity Guarantee</h5>
                    <p className="text-sm text-secondary">
                      Every piece includes a certificate of authenticity documenting its origin, artisan workshop, and traditional crafting methods. We work directly with verified artisan communities to ensure ethical sourcing and genuine craftsmanship.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tradition' && (
            <div className="space-y-6">
              <div className="bg-surface-elevated dark:bg-surface-deep border border-default rounded-xl p-6">
                <h4 className="font-bold text-primary text-lg mb-4">Tradition & Cultural Significance</h4>
                <p className="text-secondary mb-4">
                  Prayer beads hold deep significance across Christian, Islamic, and Jewish traditions, serving as tools for meditation, prayer counting, and spiritual focus. Olive wood from the Holy Land carries particular meaning, connecting users to sacred history and ancient spiritual practices.
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-surface rounded-lg p-4 border border-default">
                    <h5 className="font-semibold text-primary mb-2 text-sm">Christian</h5>
                    <p className="text-xs text-secondary">Rosary prayers and meditation</p>
                  </div>
                  <div className="bg-surface rounded-lg p-4 border border-default">
                    <h5 className="font-semibold text-primary mb-2 text-sm">Islamic</h5>
                    <p className="text-xs text-secondary">Dhikr and remembrance practices</p>
                  </div>
                  <div className="bg-surface rounded-lg p-4 border border-default">
                    <h5 className="font-semibold text-primary mb-2 text-sm">Jewish</h5>
                    <p className="text-xs text-secondary">Meditation and contemplation aid</p>
                  </div>
                </div>
              </div>

              <div className="border border-default rounded-xl p-6">
                <h4 className="font-bold text-primary text-lg mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  Symbolic Meaning
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-600 dark:bg-purple-400 mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-primary text-sm mb-1">Olive Wood</p>
                      <p className="text-sm text-secondary">Symbolizes peace, healing, and spiritual connection to sacred lands</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-600 dark:bg-purple-400 mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-primary text-sm mb-1">Circular Form</p>
                      <p className="text-sm text-secondary">Represents the eternal nature of prayer and spiritual continuity</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-600 dark:bg-purple-400 mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-primary text-sm mb-1">Natural Grain</p>
                      <p className="text-sm text-secondary">Each unique pattern reflects individual spiritual journey</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-600 dark:bg-purple-400 mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-primary text-sm mb-1">Handcrafted Touch</p>
                      <p className="text-sm text-secondary">Carries the blessing and intention of the artisan</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-bold text-primary mb-1">Respectful Use</h5>
                    <p className="text-sm text-secondary">
                      We encourage honoring the sacred traditions these items represent. Whether used in prayer, meditation, or as meaningful decorative pieces, treating them with reverence preserves their spiritual significance and cultural heritage.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'verification' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-200 dark:border-emerald-800/50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-emerald-600 dark:bg-emerald-700 rounded-xl">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary text-xl">Craftlore Verification</h4>
                    <p className="text-sm text-secondary">Complete traceability and authentication</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-semibold text-primary mb-3 flex items-center gap-2">
                        <BadgeCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        Geographical Indication (GI)
                      </h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center p-3 bg-surface rounded-lg border border-default">
                          <span className="text-secondary">GI Status</span>
                          <span className="font-bold text-emerald-700 dark:text-emerald-400">Verified</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-surface rounded-lg border border-default">
                          <span className="text-secondary">GI Number</span>
                          <span className="font-mono font-semibold text-primary">GI-2024-HLO-001234</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-surface rounded-lg border border-default">
                          <span className="text-secondary">Authorizer Number</span>
                          <span className="font-mono font-semibold text-primary">AUTH-HLO-5678</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-surface rounded-lg border border-default">
                          <span className="text-secondary">Origin Region</span>
                          <span className="font-semibold text-primary">Bethlehem, Holy Land</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-semibold text-primary mb-3 flex items-center gap-2">
                        <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        Vendor Verification
                      </h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center p-3 bg-surface rounded-lg border border-default">
                          <span className="text-secondary">Status</span>
                          <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                            <Check className="w-4 h-4" />
                            Verified Vendor
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-surface rounded-lg border border-default">
                          <span className="text-secondary">Verification Date</span>
                          <span className="font-semibold text-primary">Jan 15, 2024</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-surface rounded-lg border border-default">
                          <span className="text-secondary">Artisan Network</span>
                          <span className="font-semibold text-primary">Holy Land Collective</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h5 className="font-semibold text-primary mb-3 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        Craftlore Repository
                      </h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center p-3 bg-surface rounded-lg border border-default">
                          <span className="text-secondary">Repository Status</span>
                          <span className="font-bold text-primary">Listed</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-surface rounded-lg border border-default">
                          <span className="text-secondary">Entry ID</span>
                          <span className="font-mono font-semibold text-primary">CL-HLO-OW-2024-789</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-surface rounded-lg border border-default">
                          <span className="text-secondary">Last Updated</span>
                          <span className="font-semibold text-primary">Mar 10, 2024</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-surface rounded-lg border border-default">
                          <span className="text-secondary">Craft Category</span>
                          <span className="font-semibold text-primary">Olive Wood Carving</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-semibold text-primary mb-3 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        Sustainability Insight
                      </h5>
                      <div className="space-y-2 text-sm">
                        <div className="p-3 bg-surface rounded-lg border border-default">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-secondary">Materials Sourcing</span>
                            <span className="font-bold text-emerald-700 dark:text-emerald-400">Sustainable</span>
                          </div>
                          <p className="text-xs text-secondary">Pruned olive wood from managed groves, no tree felling</p>
                        </div>
                        <div className="p-3 bg-surface rounded-lg border border-default">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-secondary">Production Impact</span>
                            <span className="font-bold text-emerald-700 dark:text-emerald-400">Low Carbon</span>
                          </div>
                          <p className="text-xs text-secondary">Traditional hand tools, minimal energy consumption</p>
                        </div>
                        <div className="p-3 bg-surface rounded-lg border border-default">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-secondary">Fair Trade</span>
                            <span className="font-bold text-emerald-700 dark:text-emerald-400">Certified</span>
                          </div>
                          <p className="text-xs text-secondary">Direct artisan compensation ensuring fair living wages</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-surface rounded-xl border border-default">
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h6 className="font-bold text-primary mb-2">Blockchain-Verified Provenance</h6>
                      <p className="text-sm text-secondary mb-3">
                        This product's journey from artisan to your home is permanently recorded on the Craftlore blockchain, ensuring complete transparency and authenticity.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <button className="px-6 py-2.5 bg-emerald-600 dark:bg-emerald-700 text-white rounded-lg font-semibold text-sm hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Verify on Craftlore
                        </button>
                        <button className="px-6 py-2.5 bg-surface-elevated dark:bg-surface-deep border-2 border-emerald-300 dark:border-emerald-700 text-primary rounded-lg font-semibold text-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          View Full Traceability Report
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-bold text-primary mb-1">What This Means For You</h5>
                    <p className="text-sm text-secondary mb-2">
                      Every verified detail on this page has been independently authenticated by Craftlore, ensuring you receive an authentic, ethically-sourced product that supports traditional artisans and sustainable practices.
                    </p>
                    <p className="text-xs text-secondary">
                      Purple Soul partners exclusively with Craftlore-verified artisans to guarantee quality, authenticity, and positive social impact.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30 border-2 border-purple-200 dark:border-purple-800/50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-purple-600 dark:bg-purple-700 rounded-xl">
                      <Truck className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-primary text-lg">Shipping</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-surface/80 dark:bg-surface/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-primary text-sm">Standard</span>
                        <span className="text-green-600 dark:text-green-400 font-bold text-sm">FREE</span>
                      </div>
                      <p className="text-xs text-secondary">5-7 business days • Orders over $50</p>
                    </div>
                    <div className="bg-surface/80 dark:bg-surface/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-primary text-sm">Express</span>
                        <span className="font-bold text-primary text-sm">$19.99</span>
                      </div>
                      <p className="text-xs text-secondary">2-3 business days</p>
                    </div>
                    <div className="bg-surface/80 dark:bg-surface/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-primary text-sm">International</span>
                        <span className="font-bold text-primary text-sm">Varies</span>
                      </div>
                      <p className="text-xs text-secondary">Select countries • Calculated at checkout</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-800/50">
                    <div className="flex items-start gap-2 text-xs text-secondary">
                      <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Orders placed before 2 PM EST ship same day</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 border-2 border-blue-200 dark:border-blue-800/50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-blue-600 dark:bg-blue-700 rounded-xl">
                      <RotateCcw className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-primary text-lg">Returns</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-surface/80 dark:bg-surface/50 rounded-lg p-3">
                      <p className="font-semibold text-primary text-sm mb-1">30-Day Policy</p>
                      <p className="text-xs text-secondary">Full refund for items in original condition</p>
                    </div>
                    <div className="bg-surface/80 dark:bg-surface/50 rounded-lg p-3">
                      <p className="font-semibold text-primary text-sm mb-1">Free Returns</p>
                      <p className="text-xs text-secondary">Prepaid return label included</p>
                    </div>
                    <div className="bg-surface/80 dark:bg-surface/50 rounded-lg p-3">
                      <p className="font-semibold text-primary text-sm mb-1">Easy Exchanges</p>
                      <p className="text-xs text-secondary">Contact support for size/color swaps</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800/50">
                    <div className="flex items-start gap-2 text-xs text-secondary">
                      <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>Items must be unused with original packaging</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800/50 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-600 dark:bg-green-700 rounded-xl">
                    <Gift className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-primary text-lg mb-3">Gift Options Available</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-surface/80 dark:bg-surface/50 rounded-lg p-4">
                        <Package className="w-5 h-5 text-green-600 dark:text-green-400 mb-2" />
                        <p className="font-semibold text-primary text-sm mb-1">Premium Wrapping</p>
                        <p className="text-xs text-secondary">Beautiful presentation • $5</p>
                      </div>
                      <div className="bg-surface/80 dark:bg-surface/50 rounded-lg p-4">
                        <Mail className="w-5 h-5 text-green-600 dark:text-green-400 mb-2" />
                        <p className="font-semibold text-primary text-sm mb-1">Gift Message</p>
                        <p className="text-xs text-secondary">Personalized card • Free</p>
                      </div>
                      <div className="bg-surface/80 dark:bg-surface/50 rounded-lg p-4">
                        <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400 mb-2" />
                        <p className="font-semibold text-primary text-sm mb-1">Gift Receipt</p>
                        <p className="text-xs text-secondary">Price hidden • Free</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-surface-elevated dark:bg-surface-deep border border-default rounded-xl p-5">
                <h4 className="font-bold text-primary mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  Packaging & Protection
                </h4>
                <p className="text-sm text-secondary mb-3">
                  Every item is carefully packaged with eco-friendly materials to ensure safe delivery. Artisan products include care instructions and certificates of authenticity.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full">Eco-Friendly Materials</span>
                  <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full">Certificate Included</span>
                  <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full">Care Instructions</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-primary mb-1">Customer Reviews</h3>
                  <p className="text-sm text-secondary">Real feedback from verified buyers</p>
                </div>
                <div>
                  {!currentUserId ? (
                    <button
                      onClick={() => setShowSignInModal(true)}
                      className="px-6 py-3 border-2 border-purple-600 dark:border-purple-500 text-purple-600 dark:text-purple-400 rounded-xl font-semibold hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
                    >
                      Write a Review
                    </button>
                  ) : userReview ? (
                    <div className="flex items-center gap-3">
                      {userReview.status === 'pending' || userReview.status === 'edited_pending' ? (
                        <span className="flex items-center gap-2 text-sm bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-4 py-2 rounded-full font-medium">
                          <Clock className="w-4 h-4" />
                          Pending Approval
                        </span>
                      ) : userReview.status === 'rejected' ? (
                        <span className="flex items-center gap-2 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-4 py-2 rounded-full font-medium">
                          Needs Revision
                        </span>
                      ) : null}
                      <button
                        onClick={() => setShowReviewModal(true)}
                        className="flex items-center gap-2 px-6 py-3 border-2 border-purple-600 dark:border-purple-500 text-purple-600 dark:text-purple-400 rounded-xl font-semibold hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Your Review
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowReviewModal(true)}
                      className="px-6 py-3 border-2 border-purple-600 dark:border-purple-500 text-purple-600 dark:text-purple-400 rounded-xl font-semibold hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
                    >
                      Write a Review
                    </button>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-12 gap-8 mb-10 pb-8 border-b border-default">
                <div className="md:col-span-4">
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-800/50 rounded-2xl p-6 text-center h-full flex flex-col items-center justify-center">
                    <div className="text-6xl font-bold text-yellow-600 dark:text-yellow-400 mb-3">{product.rating}</div>
                    <div className="flex items-center justify-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-6 h-6 ${
                            i < Math.floor(product.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-yellow-300 dark:text-yellow-700'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-sm font-semibold text-primary mb-1">Outstanding</div>
                    <div className="text-xs text-secondary">Based on {product.reviews.toLocaleString()} reviews</div>
                  </div>
                </div>

                <div className="md:col-span-8 space-y-3">
                  <h4 className="font-bold text-primary mb-4">Rating Distribution</h4>
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const percentage = stars === 5 ? 78 : stars === 4 ? 18 : stars === 3 ? 3 : stars === 2 ? 1 : 0;
                    const count = Math.round((product.reviews * percentage) / 100);
                    return (
                      <div key={stars} className="flex items-center gap-4">
                        <div className="flex items-center gap-1 w-24">
                          <span className="text-sm font-semibold text-primary w-6">{stars}</span>
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        </div>
                        <div className="flex-1 bg-surface-elevated dark:bg-surface-deep rounded-full h-3 overflow-hidden border border-default">
                          <div
                            className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="w-16 text-right">
                          <span className="text-sm font-bold text-primary">{percentage}%</span>
                        </div>
                        <div className="w-20 text-right">
                          <span className="text-xs text-secondary">({count.toLocaleString()})</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-bold text-primary mb-4">
                  {approvedReviews.length > 0 ? 'Featured Reviews' : 'No Reviews Yet'}
                </h4>
                {approvedReviews.length === 0 && (
                  <p className="text-secondary">Be the first to review this product!</p>
                )}
              </div>

              <div className="space-y-5">
                {approvedReviews.map((review) => (
                  <div key={review.id} className="bg-surface border border-default rounded-xl p-6 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-theme-md transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center flex-shrink-0">
                          <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-primary">Anonymous User</span>
                            {review.verified_purchase && (
                              <span className="flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-full font-medium">
                                <BadgeCheck className="w-3.5 h-3.5" />
                                Verified Purchase
                              </span>
                            )}
                            {review.used_for && (
                              <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-full capitalize">
                                {review.used_for}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-secondary">
                            {new Date(review.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1.5 rounded-lg border border-yellow-200 dark:border-yellow-800/50">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <h4 className="font-bold text-primary mb-2 text-lg">{review.title}</h4>
                    <p className="text-secondary leading-relaxed mb-4">{review.content}</p>
                    {review.recommend !== null && (
                      <div className="mb-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full ${
                          review.recommend
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}>
                          {review.recommend ? '✓ Recommends this product' : '✗ Does not recommend'}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-4 pt-4 border-t border-default">
                      <button className="flex items-center gap-2 text-sm text-secondary hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                        <Check className="w-4 h-4" />
                        <span>Helpful ({review.helpful_count || 0})</span>
                      </button>
                      <button className="text-sm text-secondary hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                        Report
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-8">
                <button className="px-10 py-4 border-2 border-default text-secondary rounded-xl font-bold hover:border-purple-600 dark:hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 transition-all shadow-theme-sm hover:shadow-theme-md">
                  Load More Reviews
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-primary">Customers Also Viewed</h2>
            <button className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold flex items-center gap-2 group">
              View All
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {relatedProducts.map(relatedProduct => (
              <div
                key={relatedProduct.id}
                className="group bg-surface rounded-xl overflow-hidden shadow-theme-md hover:shadow-theme-xl transition-all cursor-pointer border border-default hover:border-purple-300"
              >
                <div className="aspect-square bg-surface-deep overflow-hidden relative">
                  <img
                    src={relatedProduct.image}
                    alt={relatedProduct.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {relatedProduct.trending && (
                    <div className="absolute top-2 left-2 bg-purple-600 dark:bg-purple-700 text-white px-2 py-1 rounded-lg text-xs font-bold">
                      Trending
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm text-primary mb-2 line-clamp-2 min-h-[2.5rem]">
                    {relatedProduct.name}
                  </h3>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.floor(relatedProduct.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted'
                        }`}
                      />
                    ))}
                    <span className="text-xs text-secondary ml-1">({relatedProduct.reviews})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-600 dark:text-purple-400 font-bold">${relatedProduct.price}</span>
                    {relatedProduct.originalPrice && (
                      <span className="text-xs text-muted line-through">${relatedProduct.originalPrice}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showReviewModal && (
        <ReviewManager
          productId={product.id}
          userId={currentUserId}
          onClose={() => setShowReviewModal(false)}
          onSuccess={handleReviewSuccess}
          existingReview={userReview}
        />
      )}

      {showRegistryModal && (
        <AddToRegistryModal
          product={product}
          onClose={() => setShowRegistryModal(false)}
          onSuccess={() => {
            setShowRegistryModal(false);
          }}
          currentUserId={currentUserId || undefined}
        />
      )}

      {showGiftModal && (
        <SendGiftModal
          product={product}
          selectedColor={selectedColor}
          selectedSize={selectedSize}
          quantity={quantity}
          onClose={() => setShowGiftModal(false)}
          onSuccess={() => {
            setShowGiftModal(false);
          }}
          onProceedToCheckout={onBuyNow ? () => onBuyNow(product, selectedColor, selectedSize, quantity) : undefined}
          currentUserId={currentUserId || undefined}
        />
      )}

      {showGiftCardModal && (
        <GiftCardModal
          onClose={() => setShowGiftCardModal(false)}
          onSuccess={() => {
            setShowGiftCardModal(false);
          }}
          currentUserId={currentUserId || undefined}
        />
      )}

      {showSignInModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowSignInModal(false)}>
          <div className="bg-surface rounded-2xl max-w-md w-full shadow-theme-2xl border border-default" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-default">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-primary">Sign In Required</h2>
                  <p className="text-sm text-secondary mt-1">Join Purple Soul to write reviews</p>
                </div>
                <button onClick={() => setShowSignInModal(false)} className="p-2 hover:bg-surface-elevated rounded-lg transition-colors">
                  <X className="w-6 h-6 text-secondary" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-purple-800 dark:text-purple-200">
                    <p className="font-semibold mb-1">Why create an account?</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Share your authentic product experiences</li>
                      <li>• Help other shoppers make informed decisions</li>
                      <li>• Edit and update your reviews anytime</li>
                      <li>• Track your orders and wishlists</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button className="w-full gradient-purple-soul text-white py-4 rounded-xl font-bold hover:opacity-90 transition-all shadow-theme-lg flex items-center justify-center gap-2">
                  <User className="w-5 h-5" />
                  Create Account
                </button>
                <button className="w-full px-6 py-4 bg-surface-elevated dark:bg-surface-deep border border-default rounded-xl font-bold text-primary hover:bg-surface hover:border-purple-300 dark:hover:border-purple-700 transition-all">
                  Sign In
                </button>
              </div>

              <p className="text-xs text-secondary text-center mt-6">
                By continuing, you agree to Purple Soul's Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
