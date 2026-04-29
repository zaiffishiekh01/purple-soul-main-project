/**
 * External Catalog API Client
 *
 * This client communicates with the external Admin Dashboard
 * to fetch catalog data (navigation, taxonomy, facets).
 *
 * The storefront is READ-ONLY and does not manage catalog structure.
 */

const EXTERNAL_DASHBOARD_URL = process.env.NEXT_PUBLIC_EXTERNAL_DASHBOARD_URL || 'https://vendor.sufisciencecenter.info';

interface NavigationItem {
  id: string;
  name: string;
  slug: string;
  layer: number;
  parent_id: string | null;
  sort_order: number;
  subcategories?: NavigationItem[];
}

interface TaxonomyCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  layer: number;
  parent_id: string | null;
  sort_order: number;
  subcategories?: TaxonomyCategory[];
}

interface Facet {
  id: string;
  name: string;
  type: 'select' | 'multiselect' | 'range' | 'boolean';
  options?: Array<{ value: string; label: string; count?: number }>;
  min?: number;
  max?: number;
}

class ExternalCatalogClient {
  private baseUrl: string;
  private cache: Map<string, { data: any; timestamp: number }>;
  private cacheTimeout: number = 5 * 60 * 1000; // 5 minutes

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.cache = new Map();
  }

  private async fetchWithCache<T>(endpoint: string): Promise<T> {
    const cacheKey = endpoint;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data as T;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
    }

    const data = await response.json();
    this.cache.set(cacheKey, { data, timestamp: Date.now() });

    return data as T;
  }

  /**
   * Fetch navigation structure for header/menu
   */
  async getNavigation(): Promise<NavigationItem[]> {
    try {
      return await this.fetchWithCache<NavigationItem[]>('/api/catalog/navigation');
    } catch (error) {
      console.error('Failed to fetch navigation from external dashboard:', error);
      // Fallback to empty navigation
      return [];
    }
  }

  /**
   * Fetch taxonomy structure for category pages
   */
  async getTaxonomy(categorySlug?: string): Promise<TaxonomyCategory[]> {
    try {
      const endpoint = categorySlug
        ? `/api/catalog/taxonomy?category=${categorySlug}`
        : '/api/catalog/taxonomy';
      return await this.fetchWithCache<TaxonomyCategory[]>(endpoint);
    } catch (error) {
      console.error('Failed to fetch taxonomy from external dashboard:', error);
      return [];
    }
  }

  /**
   * Fetch facets (filters) for a specific category
   */
  async getFacets(categorySlug: string): Promise<Facet[]> {
    try {
      return await this.fetchWithCache<Facet[]>(`/api/catalog/facets?category=${categorySlug}`);
    } catch (error) {
      console.error('Failed to fetch facets from external dashboard:', error);
      return [];
    }
  }

  /**
   * Clear cache (useful for testing or forcing refresh)
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Singleton instance
export const externalCatalog = new ExternalCatalogClient(EXTERNAL_DASHBOARD_URL);

// Export types
export type { NavigationItem, TaxonomyCategory, Facet };
