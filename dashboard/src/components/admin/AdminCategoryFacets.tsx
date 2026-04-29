import { useState, useEffect } from 'react';
import { Plus, Trash2, Check, X, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  level: number;
}

interface FacetGroup {
  id: string;
  name: string;
  slug: string;
}

interface CategoryFacet {
  id: string;
  category_id: string;
  facet_group_id: string;
  is_required: boolean;
  category?: Category;
  facet_group?: FacetGroup;
}

export function AdminCategoryFacets() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [facetGroups, setFacetGroups] = useState<FacetGroup[]>([]);
  const [mappings, setMappings] = useState<CategoryFacet[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFacetGroup, setSelectedFacetGroup] = useState('');
  const [isRequired, setIsRequired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesRes, facetGroupsRes, mappingsRes] = await Promise.all([
        supabase.from('categories').select('*').order('level').order('display_order'),
        supabase.from('facet_groups').select('*').order('display_order'),
        supabase
          .from('category_facets')
          .select(`
            id,
            category_id,
            facet_group_id,
            is_required,
            category:categories(id, name, slug, parent_id, level),
            facet_group:facet_groups(id, name, slug)
          `)
      ]);

      if (categoriesRes.error) throw categoriesRes.error;
      if (facetGroupsRes.error) throw facetGroupsRes.error;
      if (mappingsRes.error) throw mappingsRes.error;

      setCategories(categoriesRes.data || []);
      setFacetGroups(facetGroupsRes.data || []);
      setMappings(mappingsRes.data as any || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMapping = async () => {
    if (!selectedCategory || !selectedFacetGroup) {
      setError('Please select both a category and a facet group');
      return;
    }

    try {
      const { error } = await supabase
        .from('category_facets')
        .insert({
          category_id: selectedCategory,
          facet_group_id: selectedFacetGroup,
          is_required: isRequired
        });

      if (error) throw error;

      await loadData();
      setSelectedCategory('');
      setSelectedFacetGroup('');
      setIsRequired(false);
      setSuccess('Mapping created successfully');
    } catch (err: any) {
      if (err.code === '23505') {
        setError('This mapping already exists');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to create mapping');
      }
    }
  };

  const handleDeleteMapping = async (mappingId: string) => {
    if (!confirm('Remove this mapping? Products will no longer be able to use this facet.')) return;

    try {
      const { error } = await supabase
        .from('category_facets')
        .delete()
        .eq('id', mappingId);

      if (error) throw error;

      await loadData();
      setSuccess('Mapping removed successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete mapping');
    }
  };

  const handleToggleRequired = async (mappingId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('category_facets')
        .update({ is_required: !currentStatus })
        .eq('id', mappingId);

      if (error) throw error;

      await loadData();
      setSuccess('Requirement status updated');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update requirement');
    }
  };

  const getCategoryIndent = (level: number) => {
    return '\u00A0\u00A0'.repeat(level) + (level > 0 ? '└─ ' : '');
  };

  const getMappingsByCategory = () => {
    const grouped = new Map<string, CategoryFacet[]>();

    mappings.forEach(mapping => {
      const catId = mapping.category_id;
      if (!grouped.has(catId)) {
        grouped.set(catId, []);
      }
      grouped.get(catId)!.push(mapping);
    });

    return grouped;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const groupedMappings = getMappingsByCategory();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Category Facet Mappings</h2>
        <p className="text-gray-600 mt-1">
          Control which facets are available for each product category
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-5 h-5 text-red-600" />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <div className="flex-1">
            <p className="text-sm text-green-700">{success}</p>
          </div>
          <button onClick={() => setSuccess(null)} className="ml-auto">
            <X className="w-5 h-5 text-green-600" />
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Create New Mapping</h3>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select category...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {getCategoryIndent(cat.level)}{cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facet Group
            </label>
            <select
              value={selectedFacetGroup}
              onChange={(e) => setSelectedFacetGroup(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select facet group...</option>
              {facetGroups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required
            </label>
            <div className="flex items-center h-10">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isRequired}
                  onChange={(e) => setIsRequired(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Make required</span>
              </label>
            </div>
          </div>
        </div>

        <button
          onClick={handleCreateMapping}
          disabled={!selectedCategory || !selectedFacetGroup}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Create Mapping
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Current Mappings by Category</h3>

        <div className="space-y-6">
          {categories.map(category => {
            const categoryMappings = groupedMappings.get(category.id) || [];
            if (categoryMappings.length === 0) return null;

            return (
              <div key={category.id} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="font-semibold text-lg text-gray-900">
                    {getCategoryIndent(category.level)}{category.name}
                  </h4>
                  <span className="text-sm text-gray-500">
                    ({categoryMappings.length} {categoryMappings.length === 1 ? 'facet' : 'facets'})
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categoryMappings.map(mapping => (
                    <div
                      key={mapping.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {mapping.facet_group?.name}
                        </span>
                        {mapping.is_required && (
                          <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded">
                            Required
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleRequired(mapping.id, mapping.is_required)}
                          className="p-1 text-gray-600 hover:text-blue-600 rounded transition-colors"
                          title={mapping.is_required ? 'Make optional' : 'Make required'}
                        >
                          {mapping.is_required ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteMapping(mapping.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Remove mapping"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {Array.from(groupedMappings.keys()).length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No mappings created yet. Create your first mapping above.
          </div>
        )}
      </div>
    </div>
  );
}
