import { supabase } from './supabase';

export type UserPreferences = {
  traditions: string[];
  priceRange: { min: number; max: number };
  viewedProducts: string[];
  purchaseHistory: string[];
  wishlistItems: string[];
  stylePreferences: string[];
};

export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  traditions: string[];
  tags: string[];
  artisan_id?: string;
  popularity_score: number;
  rating: number;
};

export class RecommendationEngine {
  private userPreferences: UserPreferences;

  constructor(preferences: UserPreferences) {
    this.userPreferences = preferences;
  }

  calculateProductScore(product: Product): number {
    let score = 0;

    // Tradition matching (highest weight)
    const traditionMatch = product.traditions.some(t =>
      this.userPreferences.traditions.includes(t)
    );
    if (traditionMatch) score += 50;

    // Price range matching
    if (
      product.price >= this.userPreferences.priceRange.min &&
      product.price <= this.userPreferences.priceRange.max
    ) {
      score += 20;
    }

    // Viewed products similarity
    if (this.userPreferences.viewedProducts.includes(product.id)) {
      score += 10;
    }

    // Style preferences
    const styleMatch = product.tags.some(tag =>
      this.userPreferences.stylePreferences.includes(tag)
    );
    if (styleMatch) score += 15;

    // Popularity and rating
    score += product.popularity_score * 0.5;
    score += product.rating * 2;

    return score;
  }

  async getRecommendations(limit: number = 10): Promise<Product[]> {
    const products: Product[] = [];

    const scoredProducts = products.map(product => ({
      product,
      score: this.calculateProductScore(product)
    }));

    return scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.product);
  }

  async getSimilarProducts(productId: string, limit: number = 4): Promise<Product[]> {
    return [];
  }

  async getTrendingProducts(tradition?: string, limit: number = 10): Promise<Product[]> {
    const query = supabase
      .from('live_activity_feed')
      .select('product_id')
      .eq('activity_type', 'purchase')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (tradition) {
      // Would need to join with products table in real implementation
    }

    const { data } = await query.limit(limit);

    return [];
  }

  async getComplementaryProducts(productIds: string[]): Promise<Product[]> {
    return [];
  }

  async getSmartBundles(productId?: string, limit: number = 3): Promise<ProductBundle[]> {
    const bundles: ProductBundle[] = [];

    if (productId) {
      const occasionBundles = await this.getBundlesByProduct(productId);
      bundles.push(...occasionBundles);
    } else {
      const trendingBundles = await this.getTrendingBundles();
      bundles.push(...trendingBundles);
    }

    return bundles.slice(0, limit);
  }

  private async getBundlesByProduct(productId: string): Promise<ProductBundle[]> {
    return [];
  }

  private async getTrendingBundles(): Promise<ProductBundle[]> {
    return [];
  }

  async getFrequentlyBoughtTogether(productId: string): Promise<Product[]> {
    return [];
  }
}

export type ProductBundle = {
  id: string;
  name: string;
  description: string;
  products: Product[];
  totalPrice: number;
  discountedPrice: number;
  savingsPercent: number;
  occasion?: string;
  tradition?: string;
};

export async function trackUserActivity(
  userId: string | null,
  activityType: 'view' | 'wishlist' | 'purchase',
  productId: string
) {
  // Track user activity for personalization
  if (userId) {
    // Store in user activity table
  } else {
    // Store in session storage for anonymous users
    const sessionActivity = JSON.parse(
      sessionStorage.getItem('userActivity') || '{"views": [], "wishlists": []}'
    );

    if (activityType === 'view' && !sessionActivity.views.includes(productId)) {
      sessionActivity.views.push(productId);
      sessionStorage.setItem('userActivity', JSON.stringify(sessionActivity));
    }
  }
}

export function getUserPreferencesFromSession(): UserPreferences {
  const activity = JSON.parse(
    sessionStorage.getItem('userActivity') || '{"views": [], "wishlists": []}'
  );

  return {
    traditions: [],
    priceRange: { min: 0, max: 1000 },
    viewedProducts: activity.views || [],
    purchaseHistory: [],
    wishlistItems: activity.wishlists || [],
    stylePreferences: []
  };
}
