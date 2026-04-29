'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Trash2, ShoppingCart, Share2, Sparkles, Loader2, ExternalLink } from 'lucide-react';
import { useAPIAuth as useAuth } from '@/lib/auth/api-context';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useCart } from '@/lib/cart-context';

interface WishlistItem {
  id: string;
  product_id: string;
  added_at: string;
  products: {
    id: string;
    title: string;
    price: number;
    images: string[];
    stock_quantity: number;
    vendor_id: string;
    vendors?: {
      business_name: string;
    };
  };
}

export default function WishlistPage() {
  const { user } = useAuth();
  const { addItem } = useCart();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('wishlist_items')
        .select(`
          *,
          products (
            id,
            title,
            price,
            images,
            stock_quantity,
            vendor_id,
            vendors (
              business_name
            )
          )
        `)
        .eq('user_id', user?.id)
        .order('added_at', { ascending: false });

      if (error) throw error;
      setWishlistItems(data || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (itemId: string) => {
    setRemovingItems(prev => new Set(prev).add(itemId));
    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setWishlistItems(prev => prev.filter(item => item.id !== itemId));
      toast.success('Removed from wishlist');
    } catch (error: any) {
      console.error('Error removing item:', error);
      toast.error(error.message || 'Failed to remove item');
    } finally {
      setRemovingItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const moveToCart = async (item: WishlistItem) => {
    try {
      if (item.products.stock_quantity < 1) {
        toast.error('This item is out of stock');
        return;
      }

      addItem({
        id: item.product_id,
        title: item.products.title,
        price: item.products.price,
        image: item.products.images[0] || ''
      });

      await removeFromWishlist(item.id);
      toast.success('Added to cart');
    } catch (error) {
      console.error('Error moving to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  const shareWishlist = async () => {
    const url = `${window.location.origin}/wishlist/${user?.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Wishlist',
          text: 'Check out my wishlist!',
          url: url,
        });
        toast.success('Shared successfully');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          copyToClipboard(url);
        }
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copied to clipboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white/50" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass-card mb-6">
              <Sparkles className="w-4 h-4" style={{ color: '#d4af8a' }} />
              <span className="text-sm font-semibold text-white/90">Your Collection</span>
            </div>

            <h1 className="hero-text font-serif text-white mb-6 leading-tight">
              My Wishlist
            </h1>

            <p className="text-xl text-white/70 leading-relaxed max-w-2xl mx-auto">
              Save your favorite items for later and never miss out on the pieces you love
            </p>
          </div>
        </div>
      </section>

      <div className="ethereal-divider mb-12"></div>

      <div className="container mx-auto px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          {wishlistItems.length > 0 && (
            <div className="flex justify-between items-center mb-8">
              <p className="text-white/70">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
              </p>
              <Button
                onClick={shareWishlist}
                variant="outline"
                className="bg-white/5 border-white/20 text-white hover:bg-white/10"
              >
                <Share2 className="w-4 h-4 mr-2" style={{ color: '#d4af8a' }} />
                Share Wishlist
              </Button>
            </div>
          )}

          {wishlistItems.length === 0 ? (
            <Card className="glass-card glass-card-hover p-12">
              <CardContent className="py-12 text-center">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 glass-card">
                  <Heart className="w-10 h-10" style={{ color: '#d4af8a' }} />
                </div>
                <h3 className="text-2xl font-serif font-semibold mb-4 text-white">
                  Your wishlist is empty
                </h3>
                <p className="text-base text-white/60 mb-8">
                  Browse our collection and save items you love for later
                </p>
                <Link href="/">
                  <button className="celestial-button text-white px-8">
                    Start Shopping
                  </button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistItems.map((item) => (
                <Card key={item.id} className="glass-card glass-card-hover overflow-hidden">
                  <div className="relative aspect-square">
                    {item.products.images[0] ? (
                      <img
                        src={item.products.images[0]}
                        alt={item.products.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-white/5 flex items-center justify-center">
                        <Heart className="w-12 h-12 text-white/20" />
                      </div>
                    )}
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      disabled={removingItems.has(item.id)}
                      className="absolute top-3 right-3 w-10 h-10 rounded-full glass-card flex items-center justify-center hover:bg-white/20 transition-colors"
                    >
                      {removingItems.has(item.id) ? (
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5 text-white" />
                      )}
                    </button>
                  </div>

                  <CardContent className="p-6 space-y-4">
                    <div>
                      <Link href={`/p/${item.product_id}`}>
                        <h3 className="text-xl font-serif text-white hover:text-white/80 transition-colors mb-2 line-clamp-2">
                          {item.products.title}
                        </h3>
                      </Link>
                      {item.products.vendors?.business_name && (
                        <p className="text-sm text-white/50">
                          by {item.products.vendors.business_name}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-serif text-white">
                        ${parseFloat(item.products.price.toString()).toFixed(2)}
                      </span>
                      {item.products.stock_quantity < 1 && (
                        <Badge variant="outline" className="bg-red-500/20 text-red-200 border-red-500/30">
                          Out of Stock
                        </Badge>
                      )}
                      {item.products.stock_quantity > 0 && item.products.stock_quantity <= 5 && (
                        <Badge variant="outline" className="bg-amber-500/20 text-amber-200 border-amber-500/30">
                          Only {item.products.stock_quantity} left
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => moveToCart(item)}
                        disabled={item.products.stock_quantity < 1}
                        className="flex-1 celestial-button text-white"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                      <Link href={`/p/${item.product_id}`}>
                        <Button
                          variant="outline"
                          className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
