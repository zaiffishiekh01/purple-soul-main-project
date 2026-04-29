import { useState, useEffect } from 'react';
import { Heart, Share2, QrCode, Lock, Globe, Gift, Calendar, Search, Filter, Star, ShoppingCart, Plus, Minus, Trash2, CreditCard as Edit2, Check, X, Copy, ExternalLink, Users, Package, AlertCircle, ChevronDown, ChevronUp, Mail, User, Eye, EyeOff, Download, Sparkles, Crown, CircleDot, Link as LinkIcon, Baby, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product } from '../App';
import AuthModal from './AuthModal';
import RegistryPurchaseFlow from './RegistryPurchaseFlow';

export type RegistryType = 'wedding' | 'celebration' | 'remembrance' | 'home-blessing' | 'family-gift';
export type FaithTradition = 'muslim' | 'christian' | 'jewish' | 'shared';

interface RegistryConfig {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  dateLabel?: string;
  namePlaceholder1: string;
  namePlaceholder2?: string;
  descriptionPlaceholder: string;
}

const registryConfigs: Record<RegistryType, RegistryConfig> = {
  wedding: {
    title: 'Create Your Wedding Registry',
    subtitle: 'Share your special day with loved ones',
    icon: <Heart className="w-8 h-8" />,
    dateLabel: 'Wedding Date',
    namePlaceholder1: 'First Partner Name',
    namePlaceholder2: 'Second Partner Name',
    descriptionPlaceholder: 'Share your love story...'
  },
  celebration: {
    title: 'Create Your Seasonal Celebration Registry',
    subtitle: 'Celebrate Ramadan, Eid, Christmas, Hanukkah and more with meaningful gifts',
    icon: <Sparkles className="w-8 h-8" />,
    dateLabel: 'Celebration Date',
    namePlaceholder1: 'Your Name or Family Name',
    descriptionPlaceholder: 'Share your celebration traditions and gift wishes...'
  },
  remembrance: {
    title: 'Create Your Remembrance Registry',
    subtitle: 'Honor and remember with meaningful gifts',
    icon: <Crown className="w-8 h-8" />,
    dateLabel: 'Remembrance Date',
    namePlaceholder1: 'Your Name or Event Name',
    descriptionPlaceholder: 'Share your remembrance wishes...'
  },
  'home-blessing': {
    title: 'Create Your Home Blessing Registry',
    subtitle: 'Build your new home with cherished gifts',
    icon: <Gift className="w-8 h-8" />,
    dateLabel: 'Move-in Date',
    namePlaceholder1: 'Your Name or Family Name',
    descriptionPlaceholder: 'Share your new home journey...'
  },
  'family-gift': {
    title: 'Create Your New Birth & Welcome Registry',
    subtitle: 'Welcome your new arrival with thoughtful gifts',
    icon: <Baby className="w-8 h-8" />,
    dateLabel: 'Expected or Birth Date',
    namePlaceholder1: 'Parent Names or Family Name',
    descriptionPlaceholder: 'Share the joy of your growing family...'
  }
};

interface Registry {
  id: string;
  user_id: string;
  registry_type: RegistryType;
  faith_tradition: FaithTradition;
  event_date: string | null;
  primary_name: string;
  secondary_name: string | null;
  registry_url_slug: string;
  privacy_setting: 'public' | 'private' | 'password_protected';
  registry_password: string | null;
  story: string | null;
  cover_image_url: string | null;
  celebration_subtype: string | null;
  location_country: string | null;
  location_city: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

interface RegistryItem {
  id: string;
  registry_id: string;
  product_id: string;
  quantity_requested: number;
  quantity_purchased: number;
  priority: 'high' | 'medium' | 'low';
  notes: string;
  created_at: string;
}

interface RegistryPurchase {
  id: string;
  registry_id: string;
  registry_item_id: string;
  purchaser_name: string;
  purchaser_email: string;
  quantity: number;
  purchase_date: string;
  message: string;
  is_anonymous: boolean;
  gift_wrapped: boolean;
}

interface RegistryStatistics {
  total_items: number;
  total_quantity_requested: number;
  total_quantity_purchased: number;
  total_purchases: number;
  unique_purchasers: number;
  completion_percentage: number;
}

interface UniversalRegistryProps {
  registryType: RegistryType;
  currentUserId?: string;
  availableProducts?: Product[];
  onAddToCart?: (product: Product) => void;
  viewMode?: 'create' | 'manage' | 'guest' | 'browse';
  registrySlug?: string;
}

export default function UniversalRegistry({
  registryType,
  currentUserId,
  availableProducts = [],
  onAddToCart,
  viewMode = 'browse',
  registrySlug
}: UniversalRegistryProps) {
  const config = registryConfigs[registryType];
  const [activeTab, setActiveTab] = useState<'browse' | 'manage' | 'create'>(() => {
    if (viewMode === 'create') return 'create';
    if (viewMode === 'manage' && currentUserId) return 'manage';
    return 'browse';
  });
  const [registries, setRegistries] = useState<Registry[]>([]);
  const [selectedRegistry, setSelectedRegistry] = useState<Registry | null>(null);
  const [registryItems, setRegistryItems] = useState<RegistryItem[]>([]);
  const [registryStats, setRegistryStats] = useState<RegistryStatistics | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [showAddProducts, setShowAddProducts] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [newlyCreatedRegistry, setNewlyCreatedRegistry] = useState<Registry | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFaithFilter, setSelectedFaithFilter] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high' | 'featured'>('featured');
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const [addedProductIds, setAddedProductIds] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [productsLoading, setProductsLoading] = useState(true);
  const [selectedProductForPurchase, setSelectedProductForPurchase] = useState<any | null>(null);
  const [selectedItemForPurchase, setSelectedItemForPurchase] = useState<RegistryItem | null>(null);

  const [formData, setFormData] = useState({
    primaryName: '',
    secondaryName: '',
    eventDate: '',
    story: '',
    faithTradition: 'shared' as FaithTradition,
    privacySetting: 'public' as 'public' | 'private' | 'password_protected',
    password: '',
    urlSlug: '',
    celebrationSubtype: '',
    locationCountry: '',
    locationCity: ''
  });

  useEffect(() => {
    if (viewMode === 'browse') {
      loadPublicRegistries();
    } else if (viewMode === 'manage' && currentUserId) {
      loadUserRegistries();
    } else if (viewMode === 'guest' && registrySlug) {
      loadRegistryBySlug(registrySlug);
    }
    loadProducts();
  }, [viewMode, currentUserId, registrySlug, registryType]);

  const loadProducts = async () => {
    setProductsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories!products_category_id_fkey(name, slug),
          product_tags(tag)
        `)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading products:', error);
        setProductsLoading(false);
        return;
      }

      if (data) {
        setProducts(data);
        console.log(`Loaded ${data.length} products for registry`);
      }
    } catch (err) {
      console.error('Unexpected error loading products:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  const loadPublicRegistries = async () => {
    const { data } = await supabase
      .from('celebration_registries')
      .select('*')
      .eq('registry_type', registryType)
      .eq('privacy_setting', 'public')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (data) setRegistries(data);
  };

  const loadUserRegistries = async () => {
    if (!currentUserId) return;
    const { data } = await supabase
      .from('celebration_registries')
      .select('*')
      .eq('user_id', currentUserId)
      .eq('registry_type', registryType)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (data) setRegistries(data);
  };

  const loadRegistryBySlug = async (slug: string) => {
    const { data } = await supabase
      .from('celebration_registries')
      .select('*')
      .eq('registry_url_slug', slug)
      .eq('registry_type', registryType)
      .eq('is_active', true)
      .maybeSingle();

    if (data) {
      if (data.privacy_setting === 'password_protected') {
        setSelectedRegistry(data);
      } else {
        setSelectedRegistry(data);
        loadRegistryItems(data.id);
      }
    }
  };

  const loadRegistryItems = async (registryId: string) => {
    const { data } = await supabase
      .from('celebration_registry_items')
      .select('*')
      .eq('registry_id', registryId)
      .order('priority', { ascending: true });

    if (data) setRegistryItems(data);
    await loadRegistryStatistics(registryId);
  };

  const loadRegistryStatistics = async (registryId: string) => {
    const { data: items } = await supabase
      .from('celebration_registry_items')
      .select('quantity_requested, quantity_purchased')
      .eq('registry_id', registryId);

    const { data: purchases } = await supabase
      .from('celebration_registry_purchases')
      .select('id, purchaser_email')
      .eq('registry_id', registryId);

    if (items && purchases) {
      const totalRequested = items.reduce((sum, item) => sum + item.quantity_requested, 0);
      const totalPurchased = items.reduce((sum, item) => sum + item.quantity_purchased, 0);
      const uniquePurchasers = new Set(purchases.map(p => p.purchaser_email)).size;

      setRegistryStats({
        total_items: items.length,
        total_quantity_requested: totalRequested,
        total_quantity_purchased: totalPurchased,
        total_purchases: purchases.length,
        unique_purchasers: uniquePurchasers,
        completion_percentage: totalRequested > 0 ? (totalPurchased / totalRequested) * 100 : 0
      });
    }
  };

  const handleCreateRegistry = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    if (!currentUserId) {
      setSubmitError('You must be logged in to create a registry');
      setIsSubmitting(false);
      setShowAuthModal(true);
      return;
    }

    try {
      const urlSlug = formData.urlSlug ||
        `${formData.primaryName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

      const { data, error } = await supabase
        .from('celebration_registries')
        .insert({
          user_id: currentUserId,
          registry_type: registryType,
          faith_tradition: formData.faithTradition,
          primary_name: formData.primaryName,
          secondary_name: formData.secondaryName || null,
          event_date: formData.eventDate || null,
          story: formData.story || null,
          privacy_setting: formData.privacySetting,
          registry_password: formData.privacySetting === 'password_protected' ? formData.password : null,
          registry_url_slug: urlSlug,
          celebration_subtype: formData.celebrationSubtype || null,
          location_country: formData.locationCountry || null,
          location_city: formData.locationCity || null,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Registry creation error:', error);
        setSubmitError(error.message || 'Failed to create registry. Please try again.');
        setIsSubmitting(false);
        return;
      }

      if (data) {
        setSubmitSuccess(true);
        setNewlyCreatedRegistry(data);
        setShowConfirmation(true);
        loadUserRegistries();

        // Reset form
        setFormData({
          primaryName: '',
          secondaryName: '',
          eventDate: '',
          story: '',
          faithTradition: 'shared',
          privacySetting: 'public',
          password: '',
          urlSlug: '',
          celebrationSubtype: '',
          locationCountry: '',
          locationCity: ''
        });
      }
    } catch (err: any) {
      console.error('Unexpected error:', err);
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddProductToRegistry = async (productId: string) => {
    if (!selectedRegistry) {
      console.error('No registry selected');
      return;
    }

    setAddingProductId(productId);

    try {
      // Check if product already exists in registry
      const { data: existingItem } = await supabase
        .from('celebration_registry_items')
        .select('id, quantity_requested')
        .eq('registry_id', selectedRegistry.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (existingItem) {
        // If item exists, increment quantity
        const { error: updateError } = await supabase
          .from('celebration_registry_items')
          .update({ quantity_requested: existingItem.quantity_requested + 1 })
          .eq('id', existingItem.id);

        if (updateError) {
          console.error('Error updating quantity:', updateError);
          setAddingProductId(null);
          return;
        }
      } else {
        // If item doesn't exist, insert new
        const { error: insertError } = await supabase
          .from('celebration_registry_items')
          .insert({
            registry_id: selectedRegistry.id,
            product_id: productId,
            quantity_requested: 1,
            priority: 'medium',
            notes: ''
          });

        if (insertError) {
          console.error('Error adding to registry:', insertError);
          setAddingProductId(null);
          return;
        }
      }

      // Reload registry items after successful add
      await loadRegistryItems(selectedRegistry.id);

      // Show success feedback
      setAddedProductIds(prev => new Set([...prev, productId]));
      setTimeout(() => {
        setAddedProductIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      }, 2000);

      const productName = products.find(p => p.id === productId)?.name || 'Product';
      setToastMessage(`${productName} added to registry!`);
      setTimeout(() => setToastMessage(null), 3000);

    } catch (err) {
      console.error('Unexpected error adding to registry:', err);
    } finally {
      setAddingProductId(null);
    }
  };

  const handleUpdateItemQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    const { error } = await supabase
      .from('celebration_registry_items')
      .update({ quantity_requested: newQuantity })
      .eq('id', itemId);

    if (!error && selectedRegistry) {
      loadRegistryItems(selectedRegistry.id);
    }
  };

  const handleUpdateItemPriority = async (itemId: string, priority: 'high' | 'medium' | 'low') => {
    const { error } = await supabase
      .from('celebration_registry_items')
      .update({ priority })
      .eq('id', itemId);

    if (!error && selectedRegistry) {
      loadRegistryItems(selectedRegistry.id);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    const { error } = await supabase
      .from('celebration_registry_items')
      .delete()
      .eq('id', itemId);

    if (!error && selectedRegistry) {
      loadRegistryItems(selectedRegistry.id);
    }
  };

  const verifyPassword = () => {
    if (selectedRegistry?.registry_password === enteredPassword) {
      setPasswordError(false);
      loadRegistryItems(selectedRegistry.id);
    } else {
      setPasswordError(true);
    }
  };

  const copyRegistryLink = () => {
    const link = `${window.location.origin}/registry/${selectedRegistry?.registry_url_slug}`;
    navigator.clipboard.writeText(link);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const getSmartRecommendations = () => {
    const faithMap: Record<FaithTradition, string[]> = {
      'muslim': ['Islamic', 'Interfaith'],
      'christian': ['Christian', 'Interfaith'],
      'jewish': ['Jewish', 'Interfaith'],
      'shared': ['Islamic', 'Christian', 'Jewish', 'Interfaith']
    };

    const faithTradition = selectedRegistry?.faith_tradition || formData.faithTradition;
    const allowedTags = faithMap[faithTradition] || [];

    return products.filter(product => {
      const tags = product.product_tags?.map((t: any) => t.tag) || [];
      return tags.some((tag: string) => allowedTags.includes(tag));
    });
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = productSearch === '' ||
      product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      product.description?.toLowerCase().includes(productSearch.toLowerCase());

    const matchesCategory = selectedCategory === 'all' ||
      product.category?.slug === selectedCategory;

    const matchesFaith = selectedFaithFilter === 'all' ||
      product.product_tags?.some((t: any) => t.tag.toLowerCase() === selectedFaithFilter.toLowerCase());

    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];

    return matchesSearch && matchesCategory && matchesFaith && matchesPrice;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'price-high':
        return parseFloat(b.price) - parseFloat(a.price);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'featured':
      default:
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    }
  });

  const filteredRegistries = registries.filter(r =>
    r.primary_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.secondary_name && r.secondary_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Main Layout with Tabs
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 dark:bg-pink-900/30 rounded-full mb-4 text-pink-600 dark:text-pink-400">
          {config.icon}
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{config.title}</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">{config.subtitle}</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => {
            setActiveTab('browse');
            setSelectedRegistry(null);
            setShowConfirmation(false);
          }}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'browse'
              ? 'bg-pink-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Browse Registries
        </button>
        <button
          onClick={() => {
            if (!currentUserId) {
              setShowAuthModal(true);
            } else {
              setActiveTab('create');
              setSelectedRegistry(null);
              setShowConfirmation(false);
            }
          }}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'create'
              ? 'bg-pink-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Create Registry
        </button>
        {currentUserId && (
          <button
            onClick={() => {
              setActiveTab('manage');
              setSelectedRegistry(null);
              setShowConfirmation(false);
              loadUserRegistries();
            }}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'manage'
                ? 'bg-pink-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            My Registries
          </button>
        )}
      </div>

      {/* Registry Creation Confirmation View */}
      {showConfirmation && newlyCreatedRegistry && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                <Check className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Registry Created Successfully!</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">Your registry is ready to share with loved ones</p>
            </div>

          <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {newlyCreatedRegistry.primary_name}
              {newlyCreatedRegistry.secondary_name && ` & ${newlyCreatedRegistry.secondary_name}`}
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Sparkles className="w-5 h-5 text-pink-600" />
                <span className="font-medium">Type:</span>
                <span className="capitalize">{newlyCreatedRegistry.registry_type.replace('-', ' ')}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Crown className="w-5 h-5 text-purple-600" />
                <span className="font-medium">Faith Tradition:</span>
                <span className="capitalize">{newlyCreatedRegistry.faith_tradition}</span>
              </div>
              {newlyCreatedRegistry.event_date && (
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Event Date:</span>
                  <span>{new Date(newlyCreatedRegistry.event_date).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                {newlyCreatedRegistry.privacy_setting === 'public' ? (
                  <Globe className="w-5 h-5 text-green-600" />
                ) : newlyCreatedRegistry.privacy_setting === 'private' ? (
                  <Lock className="w-5 h-5 text-gray-600" />
                ) : (
                  <Lock className="w-5 h-5 text-amber-600" />
                )}
                <span className="font-medium">Privacy:</span>
                <span className="capitalize">{newlyCreatedRegistry.privacy_setting.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-blue-600" />
              Share Your Registry
            </h3>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/registry/${newlyCreatedRegistry.registry_url_slug}`}
                className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300"
              />
              <button
                onClick={copyRegistryLink}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {copySuccess ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copySuccess ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Share this link with family and friends so they can view your registry and purchase gifts.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => {
                setSelectedRegistry(newlyCreatedRegistry);
                setShowConfirmation(false);
                setActiveTab('manage');
                loadRegistryItems(newlyCreatedRegistry.id);
              }}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Package className="w-5 h-5" />
              Add Items to Registry
            </button>
            <button
              onClick={() => {
                setShowConfirmation(false);
                setActiveTab('manage');
                setNewlyCreatedRegistry(null);
              }}
              className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              <User className="w-5 h-5" />
              View My Registries
            </button>
          </div>
          </div>
        </div>
      )}

      {/* Password protected view */}
      {!showConfirmation && selectedRegistry && selectedRegistry.privacy_setting === 'password_protected' && registryItems.length === 0 && (
        <div className="max-w-md mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <Lock className="w-12 h-12 mx-auto text-pink-600 dark:text-pink-400 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Protected Registry</h2>
              <p className="text-gray-600 dark:text-gray-400">Enter password to view this registry</p>
            </div>
            <div className="space-y-4">
              <input
                type="password"
                value={enteredPassword}
                onChange={(e) => setEnteredPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter password"
              />
              {passwordError && (
                <p className="text-red-600 text-sm">Incorrect password</p>
              )}
              <button
                onClick={verifyPassword}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Access Registry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Registry Form */}
      {!showConfirmation && activeTab === 'create' && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">

          <form onSubmit={handleCreateRegistry} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Faith Tradition
              </label>
              <select
                value={formData.faithTradition}
                onChange={(e) => setFormData({ ...formData, faithTradition: e.target.value as FaithTradition })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="shared">Shared (All Abrahamic Faiths)</option>
                <option value="muslim">Muslim</option>
                <option value="christian">Christian</option>
                <option value="jewish">Jewish</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {config.namePlaceholder1}
              </label>
              <input
                type="text"
                required
                value={formData.primaryName}
                onChange={(e) => setFormData({ ...formData, primaryName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                placeholder={config.namePlaceholder1}
              />
            </div>

            {config.namePlaceholder2 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {config.namePlaceholder2}
                </label>
                <input
                  type="text"
                  value={formData.secondaryName}
                  onChange={(e) => setFormData({ ...formData, secondaryName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                  placeholder={config.namePlaceholder2}
                />
              </div>
            )}

            {config.dateLabel && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {config.dateLabel}
                </label>
                <input
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Story
              </label>
              <textarea
                rows={4}
                value={formData.story}
                onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                placeholder={config.descriptionPlaceholder}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.locationCountry}
                  onChange={(e) => setFormData({ ...formData, locationCountry: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Country"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={formData.locationCity}
                  onChange={(e) => setFormData({ ...formData, locationCity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                  placeholder="City"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Privacy Setting
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="privacy"
                    value="public"
                    checked={formData.privacySetting === 'public'}
                    onChange={(e) => setFormData({ ...formData, privacySetting: e.target.value as any })}
                    className="mr-2"
                  />
                  <Globe className="w-4 h-4 mr-2" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Public - Anyone can view</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="privacy"
                    value="password_protected"
                    checked={formData.privacySetting === 'password_protected'}
                    onChange={(e) => setFormData({ ...formData, privacySetting: e.target.value as any })}
                    className="mr-2"
                  />
                  <Lock className="w-4 h-4 mr-2" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Password Protected</span>
                </label>
              </div>
            </div>

            {formData.privacySetting === 'password_protected' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Registry Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter password"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Custom URL (optional)
              </label>
              <input
                type="text"
                value={formData.urlSlug}
                onChange={(e) => setFormData({ ...formData, urlSlug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                placeholder="my-special-event"
              />
            </div>

            {submitError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                  <AlertCircle className="w-5 h-5" />
                  <p className="text-sm font-medium">{submitError}</p>
                </div>
              </div>
            )}

            {submitSuccess && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                  <Check className="w-5 h-5" />
                  <p className="text-sm font-medium">Registry created successfully!</p>
                </div>
              </div>
            )}

            {!currentUserId && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                    <AlertCircle className="w-5 h-5" />
                    <p className="text-sm font-medium">Please log in to create a registry</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAuthModal(true)}
                    className="text-sm text-pink-600 dark:text-pink-400 hover:underline font-medium"
                  >
                    Sign In / Create Account
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !currentUserId}
              className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {isSubmitting ? 'Creating Registry...' : 'Create Registry'}
            </button>
          </form>
          </div>
        </div>
      )}

      {/* Manage Registry View - Single Selected Registry */}
      {!showConfirmation && activeTab === 'manage' && selectedRegistry && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {selectedRegistry.primary_name}
                {selectedRegistry.secondary_name && ` & ${selectedRegistry.secondary_name}`}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedRegistry.faith_tradition.charAt(0).toUpperCase() + selectedRegistry.faith_tradition.slice(1)} Registry
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors"
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>
              <button
                onClick={() => {
                  setSelectedRegistry(null);
                  setActiveTab('manage');
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Back
              </button>
            </div>
          </div>

          {registryStats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Items</p>
                <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">{registryStats.total_items}</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Requested</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{registryStats.total_quantity_requested}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Purchased</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{registryStats.total_quantity_purchased}</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Completion</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{registryStats.completion_percentage.toFixed(0)}%</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Guests</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{registryStats.unique_purchasers}</p>
              </div>
            </div>
          )}

          <div className="mb-6">
            <button
              onClick={() => setShowAddProducts(!showAddProducts)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Products
            </button>
          </div>

          {showAddProducts && (
            <div className="mb-8 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
              <div className="mb-6 space-y-4">
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Search products..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white text-sm"
                    >
                      <option value="all">All Categories</option>
                      <option value="wedding-gifts">Wedding Gifts</option>
                      <option value="pilgrimage-essentials">Pilgrimage</option>
                      <option value="birth-welcome">Birth & Welcome</option>
                      <option value="home-blessing">Home Blessing</option>
                      <option value="seasonal-celebrations">Seasonal</option>
                      <option value="remembrance">Remembrance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Faith</label>
                    <select
                      value={selectedFaithFilter}
                      onChange={(e) => setSelectedFaithFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white text-sm"
                    >
                      <option value="all">All Traditions</option>
                      <option value="Islamic">Islamic</option>
                      <option value="Christian">Christian</option>
                      <option value="Jewish">Jewish</option>
                      <option value="Interfaith">Interfaith</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white text-sm"
                    >
                      <option value="featured">Featured</option>
                      <option value="name">Name</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                    </select>
                  </div>
                </div>

                {selectedRegistry && getSmartRecommendations().length > 0 && (
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-pink-200 dark:border-pink-800">
                    <div className="flex items-center gap-2 text-pink-700 dark:text-pink-300 mb-2">
                      <Sparkles className="w-5 h-5" />
                      <span className="font-semibold">Smart Recommendations</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Showing {getSmartRecommendations().length} products curated for your {selectedRegistry.faith_tradition} registry
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {productsLoading ? (
                  <div className="col-span-full text-center py-12">
                    <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Loading products...</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <Package className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">
                      {products.length === 0 ? 'No products available' : 'No products found'}
                    </p>
                    {products.length > 0 && (
                      <button
                        onClick={() => {
                          setProductSearch('');
                          setSelectedCategory('all');
                          setSelectedFaithFilter('all');
                        }}
                        className="mt-3 text-sm text-pink-600 dark:text-pink-400 hover:underline"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <img
                          src={product.image_url || 'https://images.pexels.com/photos/3932930/pexels-photo-3932930.jpeg'}
                          alt={product.name}
                          className="w-full h-32 object-cover rounded-lg mb-2"
                        />
                        {product.featured && (
                          <span className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" />
                            Featured
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">{product.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">{product.category?.name}</p>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-lg font-bold text-pink-600 dark:text-pink-400">${parseFloat(product.price).toFixed(2)}</p>
                        {product.stock && (
                          <span className="text-xs text-gray-500">
                            {product.stock > 10 ? 'In Stock' : `Only ${product.stock} left`}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedProductForPurchase(product);
                            setSelectedItemForPurchase(null);
                          }}
                          className="flex-1 border-2 border-pink-600 text-pink-600 dark:text-pink-400 dark:border-pink-400 text-sm py-2 px-3 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all flex items-center justify-center gap-2"
                        >
                          <Info className="w-4 h-4" />
                          View
                        </button>
                        <button
                          onClick={() => handleAddProductToRegistry(product.id)}
                          disabled={addingProductId === product.id}
                          className={`flex-1 text-white text-sm py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                            addedProductIds.has(product.id)
                              ? 'bg-green-600 hover:bg-green-700'
                              : 'bg-pink-600 hover:bg-pink-700 disabled:bg-pink-400 disabled:cursor-wait'
                          }`}
                        >
                          {addingProductId === product.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            </>
                          ) : addedProductIds.has(product.id) ? (
                            <>
                              <Check className="w-4 h-4" />
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Registry Items</h3>
              {registryItems.length > 0 && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {registryItems.length} item{registryItems.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
            {registryItems.map((item) => {
              const product = products.find(p => p.id === item.product_id);
              if (!product) return null;

              const completionPercentage = (item.quantity_purchased / item.quantity_requested) * 100;
              const priorityColors = {
                high: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300',
                medium: 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300',
                low: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              };

              return (
                <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <img
                      src={product.image_url || 'https://images.pexels.com/photos/3932930/pexels-photo-3932930.jpeg'}
                      alt={product.name}
                      className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{product.name}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-500">{product.category?.name}</p>
                        </div>
                        <p className="text-lg font-bold text-pink-600 dark:text-pink-400 whitespace-nowrap">
                          ${parseFloat(product.price).toFixed(2)}
                        </p>
                      </div>

                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                          <span>Fulfillment Progress</span>
                          <span className="font-medium">{item.quantity_purchased} of {item.quantity_requested} purchased</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              completionPercentage === 100
                                ? 'bg-green-500'
                                : completionPercentage > 50
                                ? 'bg-blue-500'
                                : 'bg-pink-500'
                            }`}
                            style={{ width: `${completionPercentage}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-1.5">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Quantity:</span>
                          <button
                            onClick={() => handleUpdateItemQuantity(item.id, item.quantity_requested - 1)}
                            className="p-0.5 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white min-w-[2ch] text-center">
                            {item.quantity_requested}
                          </span>
                          <button
                            onClick={() => handleUpdateItemQuantity(item.id, item.quantity_requested + 1)}
                            className="p-0.5 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <select
                          value={item.priority}
                          onChange={(e) => handleUpdateItemPriority(item.id, e.target.value as any)}
                          className={`text-xs px-3 py-1.5 border-0 rounded-lg font-medium ${priorityColors[item.priority]}`}
                        >
                          <option value="high">High Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="low">Low Priority</option>
                        </select>

                        {completionPercentage === 100 && (
                          <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">
                            <Check className="w-3 h-3" />
                            Complete
                          </span>
                        )}

                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="ml-auto p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Remove from registry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {item.notes && (
                        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded px-2 py-1">
                          {item.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {registryItems.length === 0 && (
              <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <Package className="w-20 h-20 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No items in registry yet</h4>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Start adding products to your registry</p>
                <button
                  onClick={() => setShowAddProducts(true)}
                  className="inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Browse Products
                </button>
              </div>
            )}
          </div>

          {showShareModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Share Your Registry</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Registry Link</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={`${window.location.origin}/registry/${selectedRegistry.registry_url_slug}`}
                      readOnly
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                    <button
                      onClick={copyRegistryLink}
                      className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors"
                    >
                      {copySuccess ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                {selectedRegistry.privacy_setting === 'password_protected' && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      <Lock className="w-4 h-4 inline mr-1" />
                      This registry is password protected. Share the password separately with your guests.
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="w-full mt-6 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
        </div>
      )}

      {/* Manage Registry View - List of User Registries */}
      {!showConfirmation && activeTab === 'manage' && !selectedRegistry && (
        <div>
          {registries.length === 0 ? (
            <div className="text-center py-16">
              <Gift className="w-24 h-24 mx-auto text-gray-300 dark:text-gray-600 mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No Registries Yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first registry to get started!</p>
              <button
                onClick={() => setActiveTab('create')}
                className="inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Your First Registry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {registries.map((registry) => (
                <div
                  key={registry.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400">
                      {config.icon}
                    </div>
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                      {registry.faith_tradition}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {registry.primary_name}
                    {registry.secondary_name && ` & ${registry.secondary_name}`}
                  </h3>
                  {registry.event_date && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(registry.event_date).toLocaleDateString()}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                    Created {new Date(registry.created_at).toLocaleDateString()}
                  </p>
                  <button
                    onClick={() => {
                      setSelectedRegistry(registry);
                      loadRegistryItems(registry.id);
                    }}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Manage
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Browse Registries View */}
      {!showConfirmation && activeTab === 'browse' && (
        <>
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search registries..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRegistries.map((registry) => (
              <div
                key={registry.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400">
                    {config.icon}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                      {registry.faith_tradition}
                    </span>
                    {registry.privacy_setting === 'password_protected' && (
                      <Lock className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {registry.primary_name}
                  {registry.secondary_name && ` & ${registry.secondary_name}`}
                </h3>
                {registry.event_date && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {new Date(registry.event_date).toLocaleDateString()}
                  </p>
                )}
                {registry.story && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                    {registry.story}
                  </p>
                )}
                <button
                  onClick={() => {
                    setSelectedRegistry(registry);
                    setActiveTab('manage');
                    loadRegistryItems(registry.id);
                  }}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  View Registry
                </button>
              </div>
            ))}
            {filteredRegistries.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Gift className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No public registries yet</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false);
            setActiveTab('create');
          }}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-5">
          <div className="bg-green-600 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3">
            <Check className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Purchase Flow Modal */}
      {selectedProductForPurchase && (
        <RegistryPurchaseFlow
          product={selectedProductForPurchase}
          registryItem={selectedItemForPurchase}
          registryId={selectedRegistry?.id}
          onClose={() => {
            setSelectedProductForPurchase(null);
            setSelectedItemForPurchase(null);
          }}
          onPurchaseComplete={() => {
            loadRegistryItems();
            loadRegistryStatistics();
            setToastMessage('Purchase completed successfully!');
            setTimeout(() => setToastMessage(null), 3000);
          }}
          mode={selectedItemForPurchase ? 'purchase' : 'product-detail'}
        />
      )}
    </div>
  );
}
