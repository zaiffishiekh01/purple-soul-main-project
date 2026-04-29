'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAPIAuth as useAuth } from '@/lib/auth/api-context';
import { supabase } from '@/lib/supabase/client';

interface WishlistContextType {
  wishlistItems: Set<string>;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<void>;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setWishlistItems(new Set());
    }
  }, [user]);

  const fetchWishlist = async () => {
    if (!user) return;

    // Skip database queries for dev bypass user
    if (user.id === 'dev-bypass-id') {
      setWishlistItems(new Set());
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('product_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const productIds = new Set(data?.map(item => item.product_id) || []);
      setWishlistItems(productIds);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlistItems.has(productId);
  };

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      throw new Error('Please sign in to save items to your wishlist');
    }

    // Handle dev bypass user with local state only
    if (user.id === 'dev-bypass-id') {
      setWishlistItems(prev => {
        const next = new Set(prev);
        if (next.has(productId)) {
          next.delete(productId);
        } else {
          next.add(productId);
        }
        return next;
      });
      return;
    }

    try {
      if (wishlistItems.has(productId)) {
        const { error } = await supabase
          .from('wishlist_items')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) throw error;

        setWishlistItems(prev => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
      } else {
        const { error } = await supabase
          .from('wishlist_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            added_at: new Date().toISOString()
          });

        if (error) throw error;

        setWishlistItems(prev => new Set(prev).add(productId));
      }
    } catch (error: any) {
      console.error('Toggle wishlist error:', error);
      throw error;
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, isInWishlist, toggleWishlist, loading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
