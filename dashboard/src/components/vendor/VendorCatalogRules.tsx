import { useState, useEffect } from 'react';
import {
  BookOpen,
  ChevronRight,
  ChevronDown,
  Search,
  Info,
  Tag,
  Filter,
  Eye,
  Loader,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { dashboardClient } from '../../lib/data-client';

interface Category {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string;
  icon: string;
  level: number;
  is_active: boolean;
  show_in_navigation: boolean;
  is_featured: boolean;
}

interface Facet {
  id: string;
  name: string;
  slug: string;
  data_type: 'text' | 'number' | 'boolean' | 'select' | 'multi_select';
  is_required: boolean;
  display_order: number;
}

interface FacetValue {
  id: string;
  facet_id: string;
  value: string;
  display_order: number;
}

interface CategoryFacet {
  category_id: string;
  facet_id: string;
  is_required: boolean;
  display_order: number;
  facet: Facet;
}

type TabType = 'categories' | 'facets' | 'visibility';

export function VendorCatalogRules() {
  const [activeTab, setActiveTab] = useState<TabType>('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryFacets, setCategoryFacets] = useState<CategoryFacet[]>([]);
  const [facetValues, setFacetValues] = useState<Map<string, FacetValue[]>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchCategoryFacets(selectedCategory);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await dashboardClient
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('level', { ascending: true })
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryFacets = async (categoryId: string) => {
    try {
      const { data, error } = await dashboardClient
        .from('category_facets')
        .select(`
          *,
          facet:facets(*)
        `)
        .eq('category_id', categoryId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategoryFacets(data || []);

      const facetIds = (data || []).map(cf => cf.facet_id);
      if (facetIds.length > 0) {
        await fetchFacetValues(facetIds);
      }
    } catch (err) {
      console.error('Error fetching category facets:', err);
    }
  };

  const fetchFacetValues = async (facetIds: string[]) => {
    try {
      const { data, error } = await dashboardClient
        .from('facet_values')
        .select('*')
        .in('facet_id', facetIds)
        .order('display_order', { ascending: true });

      if (error) throw error;

      const valuesMap = new Map<string, FacetValue[]>();
      (data || []).forEach(value => {
        if (!valuesMap.has(value.facet_id)) {
          valuesMap.set(value.facet_id, []);
        }
        valuesMap.get(value.facet_id)!.push(value);
      });

      setFacetValues(valuesMap);
    } catch (err) {
      console.error('Error fetching facet values:', err);
    }
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const buildCategoryTree = () => {
    const tree: Map<string | null, Category[]> = new Map();

    categories.forEach(cat => {
      const parentId = cat.parent_id;
      if (!tree.has(parentId)) {
        tree.set(parentId, []);
      }
      tree.get(parentId)!.push(cat);
    });

    return tree;
  };

  const renderCategoryTree = (parentId: string | null = null, level: number = 0) => {
    const tree = buildCategoryTree();
    const children = tree.get(parentId) || [];

    return children
      .filter(cat =>
        searchQuery === '' ||
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.slug.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map(category => {
        const hasChildren = (tree.get(category.id) || []).length > 0;
        const isExpanded = expandedCategories.has(category.id);
        const isSelected = selectedCategory === category.id;
        const isLeaf = !hasChildren;

        return (
          <div key={category.id}>
            <div
              className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-emerald-100 border-2 border-emerald-500'
                  : 'hover:bg-gray-100'
              }`}
              style={{ marginLeft: `${level * 24}px` }}
              onClick={() => {
                if (hasChildren) {
                  toggleCategory(category.id);
                }
                setSelectedCategory(category.id);
              }}
            >
              {hasChildren && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCategory(category.id);
                  }}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              )}
              {!hasChildren && <div className="w-6" />}

              <span className="text-xl">{category.icon}</span>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{category.name}</span>
                  {isLeaf && (
                    <CheckCircle className="w-4 h-4 text-emerald-600" title="Leaf category - can be assigned to products" />
                  )}
                </div>
                <p className="text-xs text-gray-500">{category.slug}</p>
              </div>

              {category.is_featured && (
                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">
                  Featured
                </span>
              )}
            </div>

            {hasChildren && isExpanded && renderCategoryTree(category.id, level + 1)}
          </div>
        );
      });
  };

  const selectedCategoryData = categories.find(c => c.id === selectedCategory);

  const tabs = [
    { id: 'categories', label: 'Category Browser', icon: BookOpen },
    { id: 'facets', label: 'Facets & Filters', icon: Filter },
    { id: 'visibility', label: 'Navigation & Visibility', icon: Eye },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Catalog Rules</h1>
          <p className="text-gray-600 mt-1">Browse categories, facets, and requirements for product listing</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-blue-900 font-medium">Read-Only Reference</p>
          <p className="text-sm text-blue-700 mt-1">
            This section is for reference only. All catalog structures, categories, and navigation are managed by the platform admin.
            Use this guide when adding products to ensure proper categorization and required attributes.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {activeTab === 'categories' && (
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Category Hierarchy</h3>
              <p className="text-sm text-gray-600 mb-4">
                Browse the complete category structure. Only <strong>leaf categories</strong> (categories with no children) can be assigned to products.
              </p>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="space-y-1 max-h-[600px] overflow-y-auto">
              {renderCategoryTree()}
            </div>

            {selectedCategoryData && (
              <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <h4 className="font-medium text-emerald-900 mb-2">Selected Category</h4>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedCategoryData.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{selectedCategoryData.name}</p>
                    <p className="text-sm text-gray-600">{selectedCategoryData.description || 'No description'}</p>
                    <p className="text-xs text-gray-500 mt-1">Slug: {selectedCategoryData.slug}</p>
                  </div>
                </div>
                {!categories.some(c => c.parent_id === selectedCategoryData.id) && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-emerald-700">
                    <CheckCircle className="w-4 h-4" />
                    <span>This is a leaf category and can be used for products</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'facets' && (
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Facets & Required Attributes</h3>
              <p className="text-sm text-gray-600">
                Select a category to view the required and optional attributes (facets) needed when creating products.
              </p>
            </div>

            {!selectedCategory ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Tag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Select a category from the Category Browser tab to view its facets</p>
              </div>
            ) : selectedCategoryData ? (
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{selectedCategoryData.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-900">{selectedCategoryData.name}</p>
                      <p className="text-sm text-gray-600">{selectedCategoryData.slug}</p>
                    </div>
                  </div>
                </div>

                {categoryFacets.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Info className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No facets defined for this category</p>
                    <p className="text-sm text-gray-500 mt-1">Only basic product fields are required</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Required Attributes</h4>
                    {categoryFacets.filter(cf => cf.is_required).length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No required facets</p>
                    ) : (
                      categoryFacets
                        .filter(cf => cf.is_required)
                        .map((cf) => (
                          <div key={cf.facet_id} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start gap-3">
                              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-gray-900">{cf.facet.name}</span>
                                  <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded">Required</span>
                                  <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">{cf.facet.data_type}</span>
                                </div>
                                {facetValues.get(cf.facet_id) && facetValues.get(cf.facet_id)!.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-xs text-gray-600 mb-1">Allowed values:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {facetValues.get(cf.facet_id)!.map(fv => (
                                        <span key={fv.id} className="px-2 py-1 text-xs bg-white border border-gray-300 rounded">
                                          {fv.value}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                    )}

                    <h4 className="font-medium text-gray-900 mt-6">Optional Attributes</h4>
                    {categoryFacets.filter(cf => !cf.is_required).length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No optional facets</p>
                    ) : (
                      categoryFacets
                        .filter(cf => !cf.is_required)
                        .map((cf) => (
                          <div key={cf.facet_id} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                            <div className="flex items-start gap-3">
                              <Info className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-gray-900">{cf.facet.name}</span>
                                  <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">Optional</span>
                                  <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">{cf.facet.data_type}</span>
                                </div>
                                {facetValues.get(cf.facet_id) && facetValues.get(cf.facet_id)!.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-xs text-gray-600 mb-1">Allowed values:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {facetValues.get(cf.facet_id)!.map(fv => (
                                        <span key={fv.id} className="px-2 py-1 text-xs bg-white border border-gray-300 rounded">
                                          {fv.value}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                )}

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">How to Use This Information</h4>
                  <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                    <li>When adding products manually, you'll be prompted for these attributes</li>
                    <li>When using bulk upload, the CSV template will include columns for these facets</li>
                    <li>Required facets must be filled in or your product won't be saved</li>
                    <li>Optional facets help with filtering and searchability</li>
                  </ul>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {activeTab === 'visibility' && (
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Navigation & Visibility Rules</h3>
              <p className="text-sm text-gray-600">
                Understanding how your products appear in the storefront
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Centrally Managed Navigation
                </h4>
                <p className="text-sm text-blue-800 mb-3">
                  All storefront navigation, category visibility, and featured placements are controlled by the platform admin.
                  As a vendor, you simply select the appropriate category when listing your products.
                </p>
                <div className="bg-white/50 rounded p-3 text-sm text-blue-900">
                  <strong>What this means for you:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Choose the most accurate leaf category for your product</li>
                    <li>Your product will automatically appear in the correct storefront sections</li>
                    <li>Featured categories and navigation menus are managed centrally for consistency</li>
                    <li>You cannot control which categories appear in navigation or how they're organized</li>
                  </ul>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-lg">
                <h4 className="font-medium text-emerald-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Best Practices for Product Visibility
                </h4>
                <div className="space-y-3 text-sm text-emerald-800">
                  <div className="bg-white/50 rounded p-3">
                    <strong className="block mb-1">1. Choose the Right Category</strong>
                    <p>Select the most specific (leaf) category that accurately describes your product. This ensures it appears in the right place.</p>
                  </div>
                  <div className="bg-white/50 rounded p-3">
                    <strong className="block mb-1">2. Fill in All Required Facets</strong>
                    <p>Complete all required attributes. This helps customers filter and find your products more easily.</p>
                  </div>
                  <div className="bg-white/50 rounded p-3">
                    <strong className="block mb-1">3. Use Optional Facets When Relevant</strong>
                    <p>Even optional attributes can improve product discoverability through search and filtering.</p>
                  </div>
                  <div className="bg-white/50 rounded p-3">
                    <strong className="block mb-1">4. Quality Product Information</strong>
                    <p>Clear titles, detailed descriptions, and good images improve your product's visibility in search results.</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
                <h4 className="font-medium text-amber-900 mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Questions About Catalog Structure?
                </h4>
                <p className="text-sm text-amber-800 mb-3">
                  If you believe a category is missing or misclassified, or if you need specific attributes that aren't available,
                  please contact support. The admin team reviews catalog structure regularly and can make adjustments as needed.
                </p>
                <button
                  onClick={() => {
                    // This would navigate to support, but since we're in read-only mode, we'll just log
                  }}
                  className="px-4 py-2 bg-white text-amber-900 border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors text-sm font-medium"
                >
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
