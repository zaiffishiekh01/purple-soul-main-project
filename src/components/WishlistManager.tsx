import { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Trash2, TrendingDown, Bell, BellOff, Share2, Star, DollarSign, Package, AlertCircle, Sparkles, Eye, Plus, Grid2x2 as Grid, List, Target, X, Copy, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface WishlistManagerProps {
  onAddToCart?: (productId: string, quantity: number) => void;
  onViewProduct?: (productId: string) => void;
}

export default function WishlistManager({ onAddToCart, onViewProduct }: WishlistManagerProps) {
  const [wishlists, setWishlists] = useState<any[]>([]);
  const [selectedWishlist, setSelectedWishlist] = useState<any | null>(null);
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'priority'>('date');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [newWishlistName, setNewWishlistName] = useState('');
  const [newWishlistOccasion, setNewWishlistOccasion] = useState('');
  const [newWishlistBudget, setNewWishlistBudget] = useState('');

  useEffect(() => {
    loadWishlists();
  }, []);

  useEffect(() => {
    if (selectedWishlist) {
      loadWishlistItems(selectedWishlist.id);
    }
  }, [selectedWishlist]);

  const loadWishlists = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('wishlists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setWishlists(data);
        setSelectedWishlist(data[0]);
      } else {
        await createDefaultWishlist();
      }
    } catch (error) {
      console.error('Error loading wishlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultWishlist = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('wishlists')
        .insert({
          user_id: user.id,
          name: 'My Wishlist',
          description: 'Items I love',
          is_public: false,
          share_code: Math.random().toString(36).substring(2, 10).toUpperCase()
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setWishlists([data]);
        setSelectedWishlist(data);
      }
    } catch (error) {
      console.error('Error creating default wishlist:', error);
    }
  };

  const loadWishlistItems = async (wishlistId: string) => {
    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('*')
        .eq('wishlist_id', wishlistId)
        .order('added_date', { ascending: false });

      if (error) throw error;

      setWishlistItems(data || []);
    } catch (error) {
      console.error('Error loading wishlist items:', error);
    }
  };

  const createNewWishlist = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !newWishlistName.trim()) return;

      const { data, error } = await supabase
        .from('wishlists')
        .insert({
          user_id: user.id,
          name: newWishlistName,
          occasion_type: newWishlistOccasion || null,
          budget: parseFloat(newWishlistBudget) || 0,
          is_public: false,
          share_code: Math.random().toString(36).substring(2, 10).toUpperCase()
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setWishlists([data, ...wishlists]);
        setSelectedWishlist(data);
        setShowCreateModal(false);
        setNewWishlistName('');
        setNewWishlistOccasion('');
        setNewWishlistBudget('');
      }
    } catch (error) {
      console.error('Error creating wishlist:', error);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setWishlistItems(wishlistItems.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const togglePriceAlert = async (item: any) => {
    try {
      const newThreshold = item.price_alert_threshold ? null : (item.current_price || item.price_at_addition || 0) * 0.9;

      const { error } = await supabase
        .from('wishlist_items')
        .update({ price_alert_threshold: newThreshold })
        .eq('id', item.id);

      if (error) throw error;

      setWishlistItems(wishlistItems.map(i =>
        i.id === item.id ? { ...i, price_alert_threshold: newThreshold } : i
      ));
    } catch (error) {
      console.error('Error toggling price alert:', error);
    }
  };

  const toggleStockAlert = async (item: any) => {
    try {
      const { error } = await supabase
        .from('wishlist_items')
        .update({ in_stock_notification: !item.in_stock_notification })
        .eq('id', item.id);

      if (error) throw error;

      setWishlistItems(wishlistItems.map(i =>
        i.id === item.id ? { ...i, in_stock_notification: !i.in_stock_notification } : i
      ));
    } catch (error) {
      console.error('Error toggling stock alert:', error);
    }
  };

  const updatePriority = async (itemId: string, priority: 'high' | 'medium' | 'low') => {
    try {
      const { error } = await supabase
        .from('wishlist_items')
        .update({ priority })
        .eq('id', itemId);

      if (error) throw error;

      setWishlistItems(wishlistItems.map(item =>
        item.id === itemId ? { ...item, priority } : item
      ));
    } catch (error) {
      console.error('Error updating priority:', error);
    }
  };

  const moveToCart = async (item: any) => {
    if (onAddToCart) {
      onAddToCart(item.product_id, item.quantity_desired);
    }
  };

  const copyShareCode = () => {
    if (selectedWishlist?.share_code) {
      navigator.clipboard.writeText(selectedWishlist.share_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      case 'low': return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const filteredItems = wishlistItems.filter(item =>
    filterPriority === 'all' || item.priority === filterPriority
  ).sort((a, b) => {
    if (sortBy === 'date') return new Date(b.added_date || b.created_at).getTime() - new Date(a.added_date || a.created_at).getTime();
    if (sortBy === 'price') return (b.current_price || 0) - (a.current_price || 0);
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
  });

  const totalValue = wishlistItems.reduce((sum, item) => sum + ((item.current_price || item.price_at_addition || 0) * (item.quantity_desired || 1)), 0);
  const budget = selectedWishlist?.budget || 0;
  const budgetProgress = budget > 0 ? (totalValue / budget) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                <Heart className="w-10 h-10 text-purple-600 dark:text-purple-400 fill-purple-600 dark:fill-purple-400" />
                My Wishlists
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Track items you love, get price alerts, and manage your budget</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all shadow-lg hover:shadow-xl font-semibold"
            >
              <Plus className="w-5 h-5" />
              Create Wishlist
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2">
            {wishlists.map((wishlist) => (
              <button
                key={wishlist.id}
                onClick={() => setSelectedWishlist(wishlist)}
                className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                  selectedWishlist?.id === wishlist.id
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
              >
                {wishlist.name}
                {wishlist.items_count > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                    {wishlist.items_count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {selectedWishlist && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Items</span>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{wishlistItems.length}</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Value</span>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">${totalValue.toFixed(2)}</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Budget</span>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {budget > 0 ? `$${budget.toFixed(2)}` : 'No limit'}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">High Priority</span>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {wishlistItems.filter(i => i.priority === 'high').length}
                </p>
              </div>
            </div>

            {budget > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Budget Progress</span>
                  <span className={`text-sm font-bold ${budgetProgress > 100 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    ${totalValue.toFixed(2)} / ${budget.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${budgetProgress > 100 ? 'bg-red-500' : 'bg-purple-600'}`}
                    style={{ width: `${Math.min(budgetProgress, 100)}%` }}
                  ></div>
                </div>
                {budgetProgress > 100 && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Over budget by ${(totalValue - budget).toFixed(2)}
                  </p>
                )}
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 mb-6">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="all">All Priority</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="date">Sort by Date</option>
                    <option value="price">Sort by Price</option>
                    <option value="priority">Sort by Priority</option>
                  </select>

                  <button
                    onClick={() => setShowShareModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>

              <div className="p-6">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-16">
                    <Heart className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No items yet</h3>
                    <p className="text-gray-600 dark:text-gray-400">Start adding items to your wishlist while browsing products</p>
                  </div>
                ) : (
                  <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                    {filteredItems.map((item) => {
                      const productData = item.product_data || {};
                      const hasProduct = productData.name && productData.image;

                      return (
                        <div key={item.id} className={`group bg-gray-50 dark:bg-gray-700/50 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all ${viewMode === 'list' ? 'flex gap-4 p-4' : ''}`}>
                          {hasProduct && (
                            <div className={`relative bg-white dark:bg-gray-800 ${viewMode === 'grid' ? 'aspect-square' : 'w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden'}`}>
                              <img
                                src={productData.image}
                                alt={productData.name}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-3 right-3 flex flex-col gap-2">
                                <button
                                  onClick={() => removeItem(item.id)}
                                  className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                                </button>
                                <button
                                  onClick={() => togglePriceAlert(item)}
                                  className={`p-2 rounded-full shadow-lg transition-colors ${
                                    item.price_alert_threshold
                                      ? 'bg-yellow-500 text-white'
                                      : 'bg-white dark:bg-gray-800 hover:bg-yellow-50 dark:hover:bg-yellow-900/30'
                                  }`}
                                >
                                  <TrendingDown className="w-4 h-4" />
                                </button>
                              </div>
                              {productData.in_stock === false && (
                                <div className="absolute top-3 left-3 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                                  Out of Stock
                                </div>
                              )}
                            </div>
                          )}

                          <div className={viewMode === 'grid' ? 'p-4' : 'flex-1'}>
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 flex-1">
                                {hasProduct ? productData.name : `Product ${item.product_id.substring(0, 8)}`}
                              </h3>
                              <select
                                value={item.priority}
                                onChange={(e) => updatePriority(item.id, e.target.value as any)}
                                className={`ml-2 px-2 py-1 rounded-lg text-xs font-semibold ${getPriorityColor(item.priority)}`}
                              >
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                              </select>
                            </div>

                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                  ${(item.current_price || item.price_at_addition || 0).toFixed(2)}
                                </p>
                                {item.price_at_addition && item.current_price && item.current_price !== item.price_at_addition && (
                                  <p className="text-sm text-gray-500 dark:text-gray-400 line-through">
                                    ${item.price_at_addition.toFixed(2)}
                                  </p>
                                )}
                              </div>
                              {productData.rating && (
                                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  {productData.rating}
                                </div>
                              )}
                            </div>

                            {item.notes && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                {item.notes}
                              </p>
                            )}

                            <div className="flex gap-2">
                              <button
                                onClick={() => moveToCart(item)}
                                disabled={productData.in_stock === false}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                              >
                                <ShoppingCart className="w-4 h-4" />
                                Add to Cart
                              </button>
                              {onViewProduct && hasProduct && (
                                <button
                                  onClick={() => onViewProduct(item.product_id)}
                                  className="px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              )}
                            </div>

                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 text-xs text-gray-500 dark:text-gray-400">
                              Added {new Date(item.added_date || item.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create New Wishlist</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Wishlist Name
                </label>
                <input
                  type="text"
                  value={newWishlistName}
                  onChange={(e) => setNewWishlistName(e.target.value)}
                  placeholder="e.g., Wedding Registry, Birthday Wishlist"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Occasion Type (Optional)
                </label>
                <select
                  value={newWishlistOccasion}
                  onChange={(e) => setNewWishlistOccasion(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select occasion</option>
                  <option value="wedding">Wedding</option>
                  <option value="birthday">Birthday</option>
                  <option value="religious_celebration">Religious Celebration</option>
                  <option value="housewarming">Housewarming</option>
                  <option value="anniversary">Anniversary</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Budget (Optional)
                </label>
                <input
                  type="number"
                  value={newWishlistBudget}
                  onChange={(e) => setNewWishlistBudget(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={createNewWishlist}
                disabled={!newWishlistName.trim()}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {showShareModal && selectedWishlist && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Share Wishlist</h2>
              <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Share Code:</p>
              <div className="flex items-center gap-3">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 text-center tracking-wider flex-1">
                  {selectedWishlist.share_code}
                </p>
                <button
                  onClick={copyShareCode}
                  className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                >
                  {copiedCode ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center">
              Share this code with friends and family to let them view your wishlist
            </p>
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
