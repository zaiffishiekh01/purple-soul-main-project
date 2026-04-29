'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { ProductCard } from '@/components/products/product-card';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface SubcategoryPageProps {
  params: {
    category: string;
    subcategory: string;
  };
}

export default function SubcategoryPage({ params }: SubcategoryPageProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryInfo, setCategoryInfo] = useState<any>(null);
  const [subcategoryInfo, setSubcategoryInfo] = useState<any>(null);
  const [selectedTraditions, setSelectedTraditions] = useState<string[]>([]);
  const [selectedPurposes, setSelectedPurposes] = useState<string[]>([]);
  const [selectedOrigins, setSelectedOrigins] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedProcesses, setSelectedProcesses] = useState<string[]>([]);
  const [selectedLifeMoments, setSelectedLifeMoments] = useState<string[]>([]);
  const [selectedUseContexts, setSelectedUseContexts] = useState<string[]>([]);
  const [selectedPracticeDepth, setSelectedPracticeDepth] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    tradition: false,
    purpose: false,
    origin: false,
    material: false,
    process: false,
    lifeMoment: false,
    useContext: false,
    practiceDepth: false,
  });

  useEffect(() => {
    loadData();
  }, [params.category, params.subcategory]);

  async function loadData() {
    setLoading(true);

    const { data: categoryData } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', params.category)
      .eq('layer', 1)
      .maybeSingle();

    const { data: subcategoryData } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', params.subcategory)
      .eq('layer', 2)
      .maybeSingle();

    if (categoryData) setCategoryInfo(categoryData);
    if (subcategoryData) setSubcategoryInfo(subcategoryData);

    const { data: productsData } = await supabase
      .from('products')
      .select('*')
      .eq('layer1_category_slug', params.category)
      .eq('layer2_category_slug', params.subcategory)
      .eq('is_active', true);

    if (productsData) {
      setProducts(productsData);
    }

    setLoading(false);
  }

  const toggleTradition = (tradition: string) => {
    setSelectedTraditions(prev =>
      prev.includes(tradition)
        ? prev.filter(t => t !== tradition)
        : [...prev, tradition]
    );
  };

  const togglePurpose = (purpose: string) => {
    setSelectedPurposes(prev =>
      prev.includes(purpose)
        ? prev.filter(p => p !== purpose)
        : [...prev, purpose]
    );
  };

  const toggleOrigin = (origin: string) => {
    setSelectedOrigins(prev =>
      prev.includes(origin)
        ? prev.filter(o => o !== origin)
        : [...prev, origin]
    );
  };

  const toggleMaterial = (material: string) => {
    setSelectedMaterials(prev =>
      prev.includes(material)
        ? prev.filter(m => m !== material)
        : [...prev, material]
    );
  };

  const toggleProcess = (process: string) => {
    setSelectedProcesses(prev =>
      prev.includes(process)
        ? prev.filter(p => p !== process)
        : [...prev, process]
    );
  };

  const toggleLifeMoment = (moment: string) => {
    setSelectedLifeMoments(prev =>
      prev.includes(moment)
        ? prev.filter(m => m !== moment)
        : [...prev, moment]
    );
  };

  const toggleUseContext = (context: string) => {
    setSelectedUseContexts(prev =>
      prev.includes(context)
        ? prev.filter(c => c !== context)
        : [...prev, context]
    );
  };

  const togglePracticeDepth = (depth: string) => {
    setSelectedPracticeDepth(prev =>
      prev.includes(depth)
        ? prev.filter(d => d !== depth)
        : [...prev, depth]
    );
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const clearAllFilters = () => {
    setSelectedTraditions([]);
    setSelectedPurposes([]);
    setSelectedOrigins([]);
    setSelectedMaterials([]);
    setSelectedProcesses([]);
    setSelectedLifeMoments([]);
    setSelectedUseContexts([]);
    setSelectedPracticeDepth([]);
  };

  const hasActiveFilters =
    selectedTraditions.length > 0 ||
    selectedPurposes.length > 0 ||
    selectedOrigins.length > 0 ||
    selectedMaterials.length > 0 ||
    selectedProcesses.length > 0 ||
    selectedLifeMoments.length > 0 ||
    selectedUseContexts.length > 0 ||
    selectedPracticeDepth.length > 0;

  const filteredProducts = products.filter(product => {
    if (selectedTraditions.length > 0) {
      const productTraditions = product.traditions || [];
      if (!selectedTraditions.some(t => productTraditions.includes(t))) {
        return false;
      }
    }
    if (selectedPurposes.length > 0) {
      const productPurposes = product.purposes || [];
      if (!selectedPurposes.some(p => productPurposes.includes(p))) {
        return false;
      }
    }
    if (selectedOrigins.length > 0) {
      if (!selectedOrigins.includes(product.origin)) {
        return false;
      }
    }
    if (selectedMaterials.length > 0) {
      const productMaterials = product.materials || [];
      if (!selectedMaterials.some(m => productMaterials.includes(m))) {
        return false;
      }
    }
    if (selectedProcesses.length > 0) {
      const productProcesses = product.handmade_process || [];
      if (!selectedProcesses.some(p => productProcesses.includes(p))) {
        return false;
      }
    }
    if (selectedLifeMoments.length > 0) {
      const productMoments = product.life_moments || [];
      if (!selectedLifeMoments.some(m => productMoments.includes(m))) {
        return false;
      }
    }
    if (selectedUseContexts.length > 0) {
      const productContexts = product.use_contexts || [];
      if (!selectedUseContexts.some(c => productContexts.includes(c))) {
        return false;
      }
    }
    if (selectedPracticeDepth.length > 0) {
      if (!selectedPracticeDepth.includes(product.practice_depth)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <nav className="text-sm text-white/60 mb-4">
            <Link href="/" className="hover:text-white/90">Home</Link>
            <span className="mx-2">/</span>
            <Link href={`/c/${params.category}`} className="hover:text-white/90">
              {categoryInfo?.name || params.category}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white/90">{subcategoryInfo?.name || params.subcategory}</span>
          </nav>
          <h1 className="section-title font-serif text-white mb-3">
            {subcategoryInfo?.name || params.subcategory}
          </h1>
          {subcategoryInfo?.description && (
            <p className="text-white/60 text-lg">{subcategoryInfo.description}</p>
          )}
        </div>

        <div className="flex gap-8">
          {showFilters && (
            <aside className="w-64 flex-shrink-0">
              <div className="glass-card p-6 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-medium text-lg">Filters</h3>
                  <button onClick={() => setShowFilters(false)} className="text-white/60 hover:text-white lg:hidden">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-white/50 text-xs leading-relaxed mb-6 italic">
                  Each item here is reviewed for craft integrity, respectful use, and spiritual dignity.
                </p>

                <div className="space-y-4">
                  <div>
                    <button
                      onClick={() => toggleSection('tradition')}
                      className="flex items-center justify-between w-full text-white/90 font-medium mb-3 hover:text-white"
                    >
                      <span>Faith Tradition</span>
                      {expandedSections.tradition ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    {expandedSections.tradition && (
                      <div className="space-y-2">
                        {['Islamic', 'Christian', 'Jewish', 'Abrahamic Shared'].map((tradition) => (
                          <label key={tradition} className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={selectedTraditions.includes(tradition)}
                              onChange={() => toggleTradition(tradition)}
                              className="w-4 h-4 rounded border-white/30 bg-white/10"
                            />
                            <span className="text-white/70 group-hover:text-white/90 text-sm">{tradition}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="ethereal-divider my-2" />

                  <div>
                    <button
                      onClick={() => toggleSection('purpose')}
                      className="flex items-center justify-between w-full text-white/90 font-medium mb-3 hover:text-white"
                    >
                      <span>Purpose</span>
                      {expandedSections.purpose ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    {expandedSections.purpose && (
                      <div className="space-y-2">
                        {['Prayer', 'Study', 'Reflection', 'Gift', 'Home', 'Travel'].map((purpose) => (
                          <label key={purpose} className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={selectedPurposes.includes(purpose)}
                              onChange={() => togglePurpose(purpose)}
                              className="w-4 h-4 rounded border-white/30 bg-white/10"
                            />
                            <span className="text-white/70 group-hover:text-white/90 text-sm">{purpose}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="ethereal-divider my-2" />

                  <div>
                    <button
                      onClick={() => toggleSection('origin')}
                      className="flex items-center justify-between w-full text-white/90 font-medium mb-3 hover:text-white"
                    >
                      <span>Craft Origin</span>
                      {expandedSections.origin ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    {expandedSections.origin && (
                      <div className="space-y-2">
                        {['Kashmir', 'Anatolia', 'Levant', 'Maghreb', 'Andalusia'].map((origin) => (
                          <label key={origin} className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={selectedOrigins.includes(origin)}
                              onChange={() => toggleOrigin(origin)}
                              className="w-4 h-4 rounded border-white/30 bg-white/10"
                            />
                            <span className="text-white/70 group-hover:text-white/90 text-sm">{origin}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="ethereal-divider my-2" />

                  <div>
                    <button
                      onClick={() => toggleSection('material')}
                      className="flex items-center justify-between w-full text-white/90 font-medium mb-3 hover:text-white"
                    >
                      <span>Material</span>
                      {expandedSections.material ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    {expandedSections.material && (
                      <div className="space-y-2">
                        {['Wood', 'Wool', 'Cotton', 'Silk', 'Leather', 'Stone', 'Metal', 'Mixed Natural Materials'].map((material) => (
                          <label key={material} className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={selectedMaterials.includes(material)}
                              onChange={() => toggleMaterial(material)}
                              className="w-4 h-4 rounded border-white/30 bg-white/10"
                            />
                            <span className="text-white/70 group-hover:text-white/90 text-sm">{material}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="ethereal-divider my-2" />

                  <div>
                    <button
                      onClick={() => toggleSection('process')}
                      className="flex items-center justify-between w-full text-white/90 font-medium mb-3 hover:text-white"
                    >
                      <span>Handmade Process</span>
                      {expandedSections.process ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    {expandedSections.process && (
                      <div className="space-y-2">
                        {['Handcrafted', 'Handwoven', 'Hand-embroidered', 'Hand-carved', 'Hand-bound', 'Small Batch'].map((process) => (
                          <label key={process} className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={selectedProcesses.includes(process)}
                              onChange={() => toggleProcess(process)}
                              className="w-4 h-4 rounded border-white/30 bg-white/10"
                            />
                            <span className="text-white/70 group-hover:text-white/90 text-sm">{process}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="ethereal-divider my-2" />

                  <div>
                    <button
                      onClick={() => toggleSection('lifeMoment')}
                      className="flex items-center justify-between w-full text-white/90 font-medium mb-3 hover:text-white"
                    >
                      <span>Life Moment</span>
                      {expandedSections.lifeMoment ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    {expandedSections.lifeMoment && (
                      <div className="space-y-2">
                        {['Birth & Welcome', 'Marriage & Union', 'New Home', 'Healing', 'Mourning & Remembrance', 'Pilgrimage'].map((moment) => (
                          <label key={moment} className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={selectedLifeMoments.includes(moment)}
                              onChange={() => toggleLifeMoment(moment)}
                              className="w-4 h-4 rounded border-white/30 bg-white/10"
                            />
                            <span className="text-white/70 group-hover:text-white/90 text-sm">{moment}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="ethereal-divider my-2" />

                  <div>
                    <button
                      onClick={() => toggleSection('useContext')}
                      className="flex items-center justify-between w-full text-white/90 font-medium mb-3 hover:text-white"
                    >
                      <span>Use Context</span>
                      {expandedSections.useContext ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    {expandedSections.useContext && (
                      <div className="space-y-2">
                        {['Home', 'Prayer Space', 'Study Area', 'Travel', 'Gift'].map((context) => (
                          <label key={context} className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={selectedUseContexts.includes(context)}
                              onChange={() => toggleUseContext(context)}
                              className="w-4 h-4 rounded border-white/30 bg-white/10"
                            />
                            <span className="text-white/70 group-hover:text-white/90 text-sm">{context}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="ethereal-divider my-2" />

                  <div>
                    <button
                      onClick={() => toggleSection('practiceDepth')}
                      className="flex items-center justify-between w-full text-white/90 font-medium mb-3 hover:text-white"
                    >
                      <span>Practice Depth</span>
                      {expandedSections.practiceDepth ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    {expandedSections.practiceDepth && (
                      <div className="space-y-2">
                        {['Everyday Use', 'Dedicated Practice', 'Occasional / Ceremonial'].map((depth) => (
                          <label key={depth} className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={selectedPracticeDepth.includes(depth)}
                              onChange={() => togglePracticeDepth(depth)}
                              className="w-4 h-4 rounded border-white/30 bg-white/10"
                            />
                            <span className="text-white/70 group-hover:text-white/90 text-sm">{depth}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

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
              </div>
            </aside>
          )}

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-white/60 text-sm">
                  <span className="text-white font-medium">{filteredProducts.length}</span> {filteredProducts.length === 1 ? 'product' : 'products'}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-white/60 text-sm">Sort by:</span>
                <select className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/30 hover:bg-white/15 cursor-pointer">
                  <option className="bg-slate-800 text-white">Most Popular</option>
                  <option className="bg-slate-800 text-white">Price: Low to High</option>
                  <option className="bg-slate-800 text-white">Price: High to Low</option>
                  <option className="bg-slate-800 text-white">Newest</option>
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mb-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white/60 text-sm">Active filters:</span>
                  {selectedTraditions.map(t => (
                    <button
                      key={t}
                      onClick={() => toggleTradition(t)}
                      className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-sm border border-white/20 hover:bg-white/20 flex items-center gap-2"
                    >
                      {t}
                      <X className="w-3 h-3" />
                    </button>
                  ))}
                  {selectedPurposes.map(p => (
                    <button
                      key={p}
                      onClick={() => togglePurpose(p)}
                      className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-sm border border-white/20 hover:bg-white/20 flex items-center gap-2"
                    >
                      {p}
                      <X className="w-3 h-3" />
                    </button>
                  ))}
                  {selectedOrigins.map(o => (
                    <button
                      key={o}
                      onClick={() => toggleOrigin(o)}
                      className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-sm border border-white/20 hover:bg-white/20 flex items-center gap-2"
                    >
                      {o}
                      <X className="w-3 h-3" />
                    </button>
                  ))}
                  {selectedMaterials.map(m => (
                    <button
                      key={m}
                      onClick={() => toggleMaterial(m)}
                      className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-sm border border-white/20 hover:bg-white/20 flex items-center gap-2"
                    >
                      {m}
                      <X className="w-3 h-3" />
                    </button>
                  ))}
                  {selectedProcesses.map(p => (
                    <button
                      key={p}
                      onClick={() => toggleProcess(p)}
                      className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-sm border border-white/20 hover:bg-white/20 flex items-center gap-2"
                    >
                      {p}
                      <X className="w-3 h-3" />
                    </button>
                  ))}
                  {selectedLifeMoments.map(m => (
                    <button
                      key={m}
                      onClick={() => toggleLifeMoment(m)}
                      className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-sm border border-white/20 hover:bg-white/20 flex items-center gap-2"
                    >
                      {m}
                      <X className="w-3 h-3" />
                    </button>
                  ))}
                  {selectedUseContexts.map(c => (
                    <button
                      key={c}
                      onClick={() => toggleUseContext(c)}
                      className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-sm border border-white/20 hover:bg-white/20 flex items-center gap-2"
                    >
                      {c}
                      <X className="w-3 h-3" />
                    </button>
                  ))}
                  {selectedPracticeDepth.map(d => (
                    <button
                      key={d}
                      onClick={() => togglePracticeDepth(d)}
                      className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-sm border border-white/20 hover:bg-white/20 flex items-center gap-2"
                    >
                      {d}
                      <X className="w-3 h-3" />
                    </button>
                  ))}
                  <button
                    onClick={clearAllFilters}
                    className="px-3 py-1 rounded-full text-rose-gold text-sm hover:underline"
                  >
                    Clear all
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white/30"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 glass-card">
                <p className="text-white/60">No products found matching your filters.</p>
                <Link href={`/c/${params.category}`} className="text-rose-gold hover:underline mt-4 inline-block">
                  View all products in {categoryInfo?.name}
                </Link>
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
