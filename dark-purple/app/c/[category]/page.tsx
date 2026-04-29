'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { ProductCard } from '@/components/products/product-card';
import { supabase } from '@/lib/supabase/client';

interface CategoryPageProps {
  params: {
    category: string;
  };
}

interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  subcategories?: CategoryData[];
}

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface DynamicFacet {
  id: string;
  name: string;
  type: string;
  options?: FilterOption[];
  min?: number;
  max?: number;
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [category, setCategory] = useState<CategoryData | null>(null);
  const [facets, setFacets] = useState<DynamicFacet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [showFilters, setShowFilters] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadCategoryAndProducts();
  }, [params.category]);

  async function loadCategoryAndProducts() {
    setLoading(true);
    await Promise.all([loadCategory(), loadFacets(), loadProducts()]);
    setLoading(false);
  }

  async function loadCategory() {
    try {
      const response = await fetch(`/api/catalog/taxonomy?category=${params.category}`);
      if (response.ok) {
        const data = await response.json();
        setCategory(data);
      }
    } catch (error) {
      console.error('Error loading category:', error);
    }
  }

  async function loadFacets() {
    try {
      const response = await fetch(`/api/catalog/facets?category=${params.category}`);
      if (response.ok) {
        const data = await response.json();
        setFacets(data);
        const initialExpanded: Record<string, boolean> = {};
        data.forEach((facet: DynamicFacet) => {
          initialExpanded[facet.id] = false;
        });
        setExpandedSections(initialExpanded);
      }
    } catch (error) {
      console.error('Error loading facets:', error);
    }
  }

  async function loadProducts() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('layer1_category_slug', params.category)
      .eq('is_active', true);

    if (data) {
      setProducts(data);
    }
  }

  const toggleFilter = (facetId: string, value: string) => {
    setSelectedFilters(prev => {
      const currentValues = prev[facetId] || [];
      const isSelected = currentValues.includes(value);
      return {
        ...prev,
        [facetId]: isSelected
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value]
      };
    });
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const clearAllFilters = () => setSelectedFilters({});

  const hasActiveFilters = Object.values(selectedFilters).some(arr => arr.length > 0);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      for (const [facetId, selectedValues] of Object.entries(selectedFilters)) {
        if (selectedValues.length === 0) continue;
        const facet = facets.find(f => f.id === facetId);
        if (!facet) continue;
        if (facet.type === 'multiselect') {
          const productValues = product[facetId] || [];
          const productArray = Array.isArray(productValues) ? productValues : [productValues];
          if (!selectedValues.some(v => productArray.includes(v))) return false;
        } else if (facet.type === 'boolean') {
          if (!product[facetId]) return false;
        }
      }
      return true;
    });
  }, [products, selectedFilters, facets]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <nav className="text-sm text-white/60 mb-4">
            <Link href="/" className="hover:text-white/90">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-white/90">{category?.name || 'Products'}</span>
          </nav>
          <h1 className="section-title font-serif text-white mb-3">{category?.name || 'Products'}</h1>
          {category?.description && (
            <p className="text-white/60 text-lg">{category.description}</p>
          )}
        </div>

        <div className="flex gap-8">
          {showFilters && (
            <aside className="w-64 flex-shrink-0">
              <div className="glass-card p-6 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-medium text-lg">Filters</h3>
                  <button onClick={() => setShowFilters(false)} className="text-white/60 hover:text-white lg:hidden">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-white/50 text-xs leading-relaxed mb-6 italic">
                  Each item here is reviewed for craft integrity, respectful use, and spiritual dignity.
                </p>

                {facets.length === 0 ? (
                  <div className="text-center text-white/50 text-sm py-4">Loading filters...</div>
                ) : (
                  <div className="space-y-4">
                    {facets.filter(f => f.type === 'multiselect' && f.options && f.options.length > 0).map((facet, index) => (
                      <div key={facet.id}>
                        {index > 0 && <div className="ethereal-divider my-2" />}
                        <div>
                          <button
                            onClick={() => toggleSection(facet.id)}
                            className="flex items-center justify-between w-full text-white/90 font-medium mb-3 hover:text-white"
                          >
                            <span>{facet.name}</span>
                            {expandedSections[facet.id] ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                          {expandedSections[facet.id] && (
                            <div className="space-y-2">
                              {facet.options?.map((option) => (
                                <label key={option.value} className="flex items-center gap-2 cursor-pointer group">
                                  <input
                                    type="checkbox"
                                    checked={(selectedFilters[facet.id] || []).includes(option.value)}
                                    onChange={() => toggleFilter(facet.id, option.value)}
                                    className="w-4 h-4 rounded border-white/30 bg-white/10"
                                  />
                                  <span className="text-white/70 group-hover:text-white/90 text-sm">
                                    {option.label}
                                    {option.count !== undefined && (
                                      <span className="text-white/50 ml-1">({option.count})</span>
                                    )}
                                  </span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {hasActiveFilters && (
                      <>
                        <div className="ethereal-divider my-2" />
                        <button
                          onClick={clearAllFilters}
                          className="w-full px-4 py-2 rounded-lg border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-all text-sm"
                        >
                          Reset All
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </aside>
          )}

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-white/60 text-sm">
                  <span className="text-white font-medium">{filteredProducts.length}</span>{' '}
                  {filteredProducts.length === 1 ? 'product' : 'products'}
                </p>
              </div>
              {!showFilters && (
                <button
                  onClick={() => setShowFilters(true)}
                  className="text-white/70 hover:text-white text-sm flex items-center gap-2"
                >
                  <ChevronDown className="w-4 h-4" />
                  Show Filters
                </button>
              )}
            </div>

            {hasActiveFilters && (
              <div className="mb-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white/60 text-sm">Active filters:</span>
                  {Object.entries(selectedFilters).map(([facetId, values]) =>
                    values.map(value => {
                      const facet = facets.find(f => f.id === facetId);
                      const option = facet?.options?.find(o => o.value === value);
                      return (
                        <button
                          key={`${facetId}-${value}`}
                          onClick={() => toggleFilter(facetId, value)}
                          className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-sm border border-white/20 hover:bg-white/20 flex items-center gap-2"
                        >
                          {option?.label || value}
                          <X className="w-3 h-3" />
                        </button>
                      );
                    })
                  )}
                  <button
                    onClick={clearAllFilters}
                    className="px-3 py-1 rounded-full text-rose-gold text-sm hover:underline"
                  >
                    Clear all
                  </button>
                </div>
              </div>
            )}

            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 glass-card">
                <p className="text-white/60">No products found matching your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
