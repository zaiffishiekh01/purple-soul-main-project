import { useState, useEffect } from 'react';
import { Link2, Save, Trash2 } from 'lucide-react';
import { dashboardClient } from '../../lib/data-client';

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  level: number;
}

interface CategoryGroup {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

interface Mapping {
  id: string;
  category_id: string;
  group_id: string;
  category: Category;
  group: CategoryGroup;
}

export function AdminCategoryMappings() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [groups, setGroups] = useState<CategoryGroup[]>([]);
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesRes, groupsRes, mappingsRes] = await Promise.all([
        dashboardClient.from('categories').select('*').order('name'),
        dashboardClient.from('category_groups').select('*').order('name'),
        dashboardClient
          .from('category_group_mappings')
          .select(`
            id,
            category_id,
            group_id,
            category:categories(id, name, slug, parent_id, level),
            group:category_groups(id, name, slug, icon)
          `)
      ]);

      if (categoriesRes.error) throw categoriesRes.error;
      if (groupsRes.error) throw groupsRes.error;
      if (mappingsRes.error) throw mappingsRes.error;

      setCategories(categoriesRes.data || []);
      setGroups(groupsRes.data || []);
      setMappings(mappingsRes.data as any || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMapping = async () => {
    if (!selectedCategory || !selectedGroup) {
      alert('Please select both a category and a group');
      return;
    }

    try {
      const { error } = await dashboardClient
        .from('category_group_mappings')
        .insert({
          category_id: selectedCategory,
          group_id: selectedGroup
        });

      if (error) throw error;

      await loadData();
      setSelectedCategory('');
      setSelectedGroup('');
    } catch (error: any) {
      console.error('Error creating mapping:', error);
      if (error.code === '23505') {
        alert('This mapping already exists');
      } else {
        alert('Failed to create mapping');
      }
    }
  };

  const handleDeleteMapping = async (mappingId: string) => {
    if (!confirm('Remove this mapping?')) return;

    try {
      const { error } = await dashboardClient
        .from('category_group_mappings')
        .delete()
        .eq('id', mappingId);

      if (error) throw error;

      await loadData();
    } catch (error) {
      console.error('Error deleting mapping:', error);
      alert('Failed to delete mapping');
    }
  };

  const getCategoryIndent = (level: number) => {
    return '\u00A0\u00A0'.repeat(level) + (level > 0 ? '└─ ' : '');
  };

  const groupedMappings = groups.map(group => ({
    group,
    mappings: mappings.filter(m => m.group_id === group.id)
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Category Group Mappings</h2>
        <p className="text-gray-600 mt-1">
          Map hierarchical taxonomy categories to flat category groups
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Create New Mapping</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Taxonomy Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a category...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {getCategoryIndent(cat.level)}{cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Group
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a group...</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.icon} {group.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleCreateMapping}
          disabled={!selectedCategory || !selectedGroup}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          Create Mapping
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Current Mappings</h3>

        <div className="space-y-6">
          {groupedMappings.map(({ group, mappings }) => (
            <div key={group.id} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{group.icon}</span>
                <h4 className="font-semibold text-lg text-gray-900">{group.name}</h4>
                <span className="text-sm text-gray-500">
                  ({mappings.length} {mappings.length === 1 ? 'mapping' : 'mappings'})
                </span>
              </div>

              {mappings.length === 0 ? (
                <p className="text-sm text-gray-500 pl-10">No mappings yet</p>
              ) : (
                <div className="space-y-2 pl-10">
                  {mappings.map(mapping => (
                    <div
                      key={mapping.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Link2 className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {getCategoryIndent(mapping.category.level)}{mapping.category.name}
                          </p>
                          <p className="text-xs text-gray-500">{mapping.category.slug}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteMapping(mapping.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Remove mapping"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {groupedMappings.every(g => g.mappings.length === 0) && (
          <div className="text-center py-12 text-gray-500">
            No mappings created yet. Create your first mapping above.
          </div>
        )}
      </div>
    </div>
  );
}
