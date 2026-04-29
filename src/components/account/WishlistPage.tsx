import { useState, useEffect } from 'react';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { supabase } from '../../lib/supabase';
import { Heart, Trash2, ShoppingCart, ExternalLink, Loader2 } from 'lucide-react';

interface WishlistPageProps { onBack?: () => void; onViewProduct?: (productId: string) => void; onAddToCart?: (productId: string, quantity: number) => void; }

interface WishlistItem {
  id: string;
  product_id: string;
  product?: any;
  created_at?: string;
}

export default function WishlistPage({ onBack, onViewProduct, onAddToCart }: WishlistPageProps) {
  const { user } = useCustomerAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchWishlist();
  }, [user]);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('*, products(*)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (id: string) => {
    setRemoving(id);
    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    } finally {
      setRemoving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-400" />
          <p className="text-purple-200/70">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface border border-default rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-primary mb-2">My Wishlist</h2>
        <p className="text-secondary">Save your favorite items for later</p>
      </div>

      {items.length === 0 ? (
        <div className="bg-surface border border-default rounded-2xl p-12 text-center">
          <Heart className="w-16 h-16 text-muted mx-auto mb-4" />
          <h3 className="text-xl font-bold text-primary mb-2">Your wishlist is empty</h3>
          <p className="text-secondary mb-6">Browse our collection and save items you love</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => {
            const product = item.products;
            return (
              <div key={item.id} className="bg-surface border border-default rounded-2xl overflow-hidden hover:shadow-theme-lg transition-all group">
                <div className="relative aspect-square bg-surface-deep">
                  {product?.image || product?.image_url ? (
                    <img 
                      src={product?.image || product?.image_url} 
                      alt={product?.name || product?.title || 'Product'} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Heart className="w-12 h-12 text-muted" />
                    </div>
                  )}
                  <button 
                    onClick={() => removeItem(item.id)} 
                    disabled={removing === item.id}
                    className="absolute top-3 right-3 w-8 h-8 bg-surface/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <h3 
                      className="font-bold text-primary line-clamp-2 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400"
                      onClick={() => onViewProduct?.(item.product_id)}
                    >
                      {product?.name || product?.title || 'Product'}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                      ${(product?.price || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => onAddToCart?.(item.product_id, 1)} 
                      className="flex-1 gradient-purple-soul text-white py-2 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" /> Add to Cart
                    </button>
                    <button 
                      onClick={() => onViewProduct?.(item.product_id)} 
                      className="p-2 border border-default rounded-xl text-secondary hover:text-primary transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
