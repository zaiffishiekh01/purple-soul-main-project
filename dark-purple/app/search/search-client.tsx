'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, SlidersHorizontal, X, Loader as Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProductGrid } from '@/components/products/product-grid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';

interface SearchFilters {
  query: string;
  categories: string[];
  traditions: string[];
  purposes: string[];
  materials: string[];
  vendors: string[];
  priceMin: number;
  priceMax: number;
  minRating: number;
  inStockOnly: boolean;
  sortBy: string;
}

interface SearchClientProps {
  initialProducts: any[];
  initialQuery: string;
}

const DEFAULT_FILTERS: SearchFilters = {
  query: '',
  categories: [],
  traditions: [],
  purposes: [],
  materials: [],
  vendors: [],
  priceMin: 0,
  priceMax: 1000,
  minRating: 0,
  inStockOnly: false,
  sortBy: 'relevance'
};

export function SearchClient({ initialProducts, initialQuery }: SearchClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    ...DEFAULT_FILTERS,
    query: initialQuery,
  });
  const [availableFilters, setAvailableFilters] = useState({
    categories: [] as string[],
    traditions: [] as string[],
    purposes: [] as string[],
    materials: [] as string[],
    vendors: [] as Array<{ id: string; name: string }>
  });

  useEffect(() => {
    fetchAvailableFilters();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch();
    }, 400);
    return () => clearTimeout(timer);
  }, [filters]);

  const fetchAvailableFilters = async () => {
    try {
      const [catRes, tradRes, purpRes, matRes, vendorRes] = await Promise.all([
        supabase.from('products').select('layer1_category_slug').eq('is_active', true).not('layer1_category_slug', 'is', null),
        supabase.from('products').select('traditions').eq('is_active', true),
        supabase.from('products').select('purposes').eq('is_active', true),
        supabase.from('products').select('materials').eq('is_active', true),
        supabase.from('users').select('id, full_name').eq('role', 'vendor').order('full_name'),
      ]);

      setAvailableFilters({
        categories: Array.from(new Set(catRes.data?.map(p => p.layer1_category_slug).filter(Boolean))) as string[],
        traditions: Array.from(new Set(tradRes.data?.flatMap(p => p.traditions || []))),
        purposes: Array.from(new Set(purpRes.data?.flatMap(p => p.purposes || []))),
        materials: Array.from(new Set(matRes.data?.flatMap(p => p.materials || []))),
        vendors: vendorRes.data?.map(v => ({ id: v.id, name: v.full_name || 'Unknown Vendor' })) || [],
      });
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const performSearch = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select('*, users(full_name)')
        .eq('is_active', true);

      if (filters.query) {
        query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
      }
      if (filters.categories.length > 0) {
        query = query.in('layer1_category_slug', filters.categories);
      }
      if (filters.traditions.length > 0) {
        query = query.overlaps('traditions', filters.traditions);
      }
      if (filters.purposes.length > 0) {
        query = query.overlaps('purposes', filters.purposes);
      }
      if (filters.materials.length > 0) {
        query = query.overlaps('materials', filters.materials);
      }
      if (filters.vendors.length > 0) {
        query = query.in('vendor_id', filters.vendors);
      }
      if (filters.inStockOnly) {
        query = query.gt('stock_quantity', 0);
      }

      query = query.gte('price', filters.priceMin).lte('price', filters.priceMax);

      switch (filters.sortBy) {
        case 'price_asc': query = query.order('price', { ascending: true }); break;
        case 'price_desc': query = query.order('price', { ascending: false }); break;
        case 'name_asc': query = query.order('title', { ascending: true }); break;
        case 'name_desc': query = query.order('title', { ascending: false }); break;
        case 'newest': query = query.order('created_at', { ascending: false }); break;
        default: query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;

      let productsData = data || [];

      if (filters.minRating > 0 && productsData.length > 0) {
        const productIds = productsData.map(p => p.id);
        const { data: allReviews } = await supabase
          .from('product_reviews')
          .select('product_id, rating')
          .in('product_id', productIds)
          .eq('status', 'approved');

        const ratingMap = new Map<string, { sum: number; count: number }>();
        for (const review of allReviews || []) {
          const existing = ratingMap.get(review.product_id) || { sum: 0, count: 0 };
          ratingMap.set(review.product_id, {
            sum: existing.sum + review.rating,
            count: existing.count + 1,
          });
        }

        productsData = productsData.filter(product => {
          const stats = ratingMap.get(product.id);
          if (!stats || stats.count === 0) return false;
          return stats.sum / stats.count >= filters.minRating;
        });
      }

      setProducts(productsData);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const updateFilter = useCallback((key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const toggleArrayFilter = useCallback((key: 'categories' | 'traditions' | 'purposes' | 'materials' | 'vendors', value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value]
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const activeFilterCount = useMemo(() =>
    filters.categories.length +
    filters.traditions.length +
    filters.purposes.length +
    filters.materials.length +
    filters.vendors.length +
    (filters.priceMin > 0 || filters.priceMax < 1000 ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0),
    [filters]
  );

  const FilterContent = (
    <div className="space-y-6">
      <div>
        <h3 className="text-white font-semibold mb-3">Availability</h3>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="in-stock"
            checked={filters.inStockOnly}
            onCheckedChange={(checked) => updateFilter('inStockOnly', checked)}
          />
          <Label htmlFor="in-stock" className="text-white/80 hover:text-white cursor-pointer">
            In Stock Only
          </Label>
        </div>
      </div>

      <div className="ethereal-divider"></div>

      <div>
        <h3 className="text-white font-semibold mb-3">Price Range</h3>
        <div className="space-y-4">
          <Slider
            value={[filters.priceMin, filters.priceMax]}
            min={0}
            max={1000}
            step={10}
            onValueChange={([min, max]) => {
              setFilters(prev => ({ ...prev, priceMin: min, priceMax: max }));
            }}
            className="w-full"
          />
          <div className="flex items-center gap-2 text-sm text-white/70">
            <span>${filters.priceMin}</span>
            <span>-</span>
            <span>${filters.priceMax}</span>
          </div>
        </div>
      </div>

      <div className="ethereal-divider"></div>

      <div>
        <h3 className="text-white font-semibold mb-3">Minimum Rating</h3>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center space-x-2">
              <Checkbox
                id={`rating-${rating}`}
                checked={filters.minRating === rating}
                onCheckedChange={(checked) => updateFilter('minRating', checked ? rating : 0)}
              />
              <Label htmlFor={`rating-${rating}`} className="text-white/80 hover:text-white cursor-pointer flex items-center gap-1">
                {rating}+ Stars
              </Label>
            </div>
          ))}
        </div>
      </div>

      {availableFilters.categories.length > 0 && (
        <>
          <div className="ethereal-divider"></div>
          <div>
            <h3 className="text-white font-semibold mb-3">Categories</h3>
            <div className="space-y-2">
              {availableFilters.categories.slice(0, 8).map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cat-${category}`}
                    checked={filters.categories.includes(category)}
                    onCheckedChange={() => toggleArrayFilter('categories', category)}
                  />
                  <Label htmlFor={`cat-${category}`} className="text-white/80 hover:text-white cursor-pointer capitalize">
                    {category.replace(/-/g, ' ')}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {availableFilters.traditions.length > 0 && (
        <>
          <div className="ethereal-divider"></div>
          <div>
            <h3 className="text-white font-semibold mb-3">Traditions</h3>
            <div className="space-y-2">
              {availableFilters.traditions.map((tradition) => (
                <div key={tradition} className="flex items-center space-x-2">
                  <Checkbox
                    id={`trad-${tradition}`}
                    checked={filters.traditions.includes(tradition)}
                    onCheckedChange={() => toggleArrayFilter('traditions', tradition)}
                  />
                  <Label htmlFor={`trad-${tradition}`} className="text-white/80 hover:text-white cursor-pointer capitalize">
                    {tradition}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {availableFilters.purposes.length > 0 && (
        <>
          <div className="ethereal-divider"></div>
          <div>
            <h3 className="text-white font-semibold mb-3">Purpose</h3>
            <div className="space-y-2">
              {availableFilters.purposes.slice(0, 8).map((purpose) => (
                <div key={purpose} className="flex items-center space-x-2">
                  <Checkbox
                    id={`purp-${purpose}`}
                    checked={filters.purposes.includes(purpose)}
                    onCheckedChange={() => toggleArrayFilter('purposes', purpose)}
                  />
                  <Label htmlFor={`purp-${purpose}`} className="text-white/80 hover:text-white cursor-pointer capitalize">
                    {purpose}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {availableFilters.materials.length > 0 && (
        <>
          <div className="ethereal-divider"></div>
          <div>
            <h3 className="text-white font-semibold mb-3">Materials</h3>
            <div className="space-y-2">
              {availableFilters.materials.slice(0, 8).map((material) => (
                <div key={material} className="flex items-center space-x-2">
                  <Checkbox
                    id={`mat-${material}`}
                    checked={filters.materials.includes(material)}
                    onCheckedChange={() => toggleArrayFilter('materials', material)}
                  />
                  <Label htmlFor={`mat-${material}`} className="text-white/80 hover:text-white cursor-pointer capitalize">
                    {material}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {availableFilters.vendors.length > 0 && (
        <>
          <div className="ethereal-divider"></div>
          <div>
            <h3 className="text-white font-semibold mb-3">Vendors</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {availableFilters.vendors.map((vendor) => (
                <div key={vendor.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`vendor-${vendor.id}`}
                    checked={filters.vendors.includes(vendor.id)}
                    onCheckedChange={() => toggleArrayFilter('vendors', vendor.id)}
                  />
                  <Label htmlFor={`vendor-${vendor.id}`} className="text-white/80 hover:text-white cursor-pointer">
                    {vendor.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="hero-text font-serif text-white mb-6">Search</h1>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search for products..."
                value={filters.query}
                onChange={(e) => updateFilter('query', e.target.value)}
                className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40"
              />
            </div>

            <div className="flex gap-2">
              <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                <SelectTrigger className="w-[200px] bg-white/5 border-white/20 text-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-[#2D1B4E] border-white/20">
                  <SelectItem value="relevance">Most Relevant</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  <SelectItem value="name_asc">Name: A to Z</SelectItem>
                  <SelectItem value="name_desc">Name: Z to A</SelectItem>
                </SelectContent>
              </Select>

              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden bg-white/5 border-white/20 text-white">
                    <SlidersHorizontal className="w-5 h-5 mr-2" />
                    Filters
                    {activeFilterCount > 0 && (
                      <Badge className="ml-2 bg-rose-500">{activeFilterCount}</Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="bg-gradient-to-b from-[#2D1B4E] to-[#1a0b2e] border-white/20 overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle className="text-white">Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    {FilterContent}
                  </div>
                  {activeFilterCount > 0 && (
                    <Button onClick={clearFilters} variant="ghost" className="w-full mt-6 text-white/70 hover:text-white">
                      Clear All Filters
                    </Button>
                  )}
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-white/60 text-sm">Active filters:</span>
              {filters.inStockOnly && (
                <Badge variant="secondary" className="bg-white/10 text-white">
                  In Stock
                  <button onClick={() => updateFilter('inStockOnly', false)} className="ml-2 hover:text-rose-400">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {filters.minRating > 0 && (
                <Badge variant="secondary" className="bg-white/10 text-white">
                  {filters.minRating}+ Stars
                  <button onClick={() => updateFilter('minRating', 0)} className="ml-2 hover:text-rose-400">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {(filters.priceMin > 0 || filters.priceMax < 1000) && (
                <Badge variant="secondary" className="bg-white/10 text-white">
                  ${filters.priceMin} - ${filters.priceMax}
                  <button onClick={() => setFilters(prev => ({ ...prev, priceMin: 0, priceMax: 1000 }))} className="ml-2 hover:text-rose-400">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {filters.categories.map(cat => (
                <Badge key={cat} variant="secondary" className="bg-white/10 text-white">
                  {cat.replace(/-/g, ' ')}
                  <button onClick={() => toggleArrayFilter('categories', cat)} className="ml-2 hover:text-rose-400">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {filters.traditions.map(trad => (
                <Badge key={trad} variant="secondary" className="bg-white/10 text-white">
                  {trad}
                  <button onClick={() => toggleArrayFilter('traditions', trad)} className="ml-2 hover:text-rose-400">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {filters.purposes.map(purp => (
                <Badge key={purp} variant="secondary" className="bg-white/10 text-white">
                  {purp}
                  <button onClick={() => toggleArrayFilter('purposes', purp)} className="ml-2 hover:text-rose-400">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {filters.materials.map(mat => (
                <Badge key={mat} variant="secondary" className="bg-white/10 text-white">
                  {mat}
                  <button onClick={() => toggleArrayFilter('materials', mat)} className="ml-2 hover:text-rose-400">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {filters.vendors.map(vendorId => {
                const vendor = availableFilters.vendors.find(v => v.id === vendorId);
                return (
                  <Badge key={vendorId} variant="secondary" className="bg-white/10 text-white">
                    {vendor?.name || 'Vendor'}
                    <button onClick={() => toggleArrayFilter('vendors', vendorId)} className="ml-2 hover:text-rose-400">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                );
              })}
              <Button onClick={clearFilters} variant="ghost" size="sm" className="text-white/60 hover:text-white">
                Clear all
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <aside className="hidden md:block">
            <div className="glass-card glass-card-hover p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-serif text-white">Filters</h2>
                {activeFilterCount > 0 && (
                  <Badge className="bg-rose-500">{activeFilterCount}</Badge>
                )}
              </div>
              {FilterContent}
              {activeFilterCount > 0 && (
                <Button onClick={clearFilters} variant="ghost" className="w-full mt-6 text-white/70 hover:text-white">
                  Clear All Filters
                </Button>
              )}
            </div>
          </aside>

          <div className="md:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-white/50" />
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <p className="text-white/60">
                    {products.length} {products.length === 1 ? 'product' : 'products'} found
                  </p>
                </div>

                {products.length > 0 ? (
                  <ProductGrid products={products} />
                ) : (
                  <div className="text-center py-20 glass-card glass-card-hover p-12">
                    <Search className="w-16 h-16 mx-auto mb-4" style={{ color: '#d4af8a' }} />
                    <h3 className="text-2xl font-serif text-white mb-2">No products found</h3>
                    <p className="text-white/60 mb-6">Try adjusting your filters or search terms</p>
                    <Button onClick={clearFilters} className="celestial-button">Clear Filters</Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
