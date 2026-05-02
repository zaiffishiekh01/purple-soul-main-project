import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ChevronRight, ChevronDown, Folder, FolderOpen, Save, X } from 'lucide-react';
import { dashboardClient } from '../../lib/data-client';

interface Category {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string;
  icon: string;
  display_order: number;
  is_active: boolean;
  level: number;
  path: string;
  created_at: string;
  updated_at: string;
  children?: Category[];
}

export function AdminCatalogTaxonomy() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAddingChild, setIsAddingChild] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '📦',
    display_order: 0,
    is_active: true
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await dashboardClient
        .from('categories')
        .select('*')
        .order('display_order');

      if (error) throw error;

      const tree = buildTree(data || []);
      setCategories(tree);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildTree = (flatList: Category[]): Category[] => {
    const map = new Map<string, Category>();
    const roots: Category[] = [];

    flatList.forEach(cat => {
      map.set(cat.id, { ...cat, children: [] });
    });

    flatList.forEach(cat => {
      const node = map.get(cat.id)!;
      if (cat.parent_id) {
        const parent = map.get(cat.parent_id);
        if (parent) {
          parent.children!.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const handleCreate = async (parentId: string | null) => {
    try {
      const { error } = await dashboardClient
        .from('categories')
        .insert({
          parent_id: parentId,
          ...formData
        });

      if (error) throw error;

      await loadCategories();
      resetForm();
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Failed to create category');
    }
  };

  const handleUpdate = async () => {
    if (!editingCategory) return;

    try {
      const { error } = await dashboardClient
        .from('categories')
        .update(formData)
        .eq('id', editingCategory.id);

      if (error) throw error;

      await loadCategories();
      resetForm();
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Failed to update category');
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure? This will also delete all subcategories.')) return;

    try {
      const { error } = await dashboardClient
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      await loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  };

  const startEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon,
      display_order: category.display_order,
      is_active: category.is_active
    });
  };

  const resetForm = () => {
    setEditingCategory(null);
    setIsAddingChild(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: '📦',
      display_order: 0,
      is_active: true
    });
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const renderCategory = (category: Category, depth: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedNodes.has(category.id);
    const isEditing = editingCategory?.id === category.id;

    return (
      <div key={category.id} className="select-none">
        <div
          className={`flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors ${
            depth > 0 ? 'ml-6' : ''
          }`}
        >
          <button
            onClick={() => toggleNode(category.id)}
            className="p-1 hover:bg-gray-200 rounded"
          >
            {hasChildren ? (
              isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
            ) : (
              <div className="w-4 h-4" />
            )}
          </button>

          {isExpanded ? <FolderOpen className="w-5 h-5 text-blue-600" /> : <Folder className="w-5 h-5 text-gray-400" />}

          <span className="text-xl">{category.icon}</span>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{category.name}</span>
              <span className="text-xs text-gray-500">({category.slug})</span>
              {!category.is_active && (
                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">Inactive</span>
              )}
            </div>
            {category.description && (
              <p className="text-sm text-gray-600">{category.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddingChild(category.id)}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Add subcategory"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => startEdit(category)}
              className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(category.id)}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isAddingChild === category.id && (
          <div className={`${depth > 0 ? 'ml-12' : 'ml-6'} mt-2 mb-4`}>
            <CategoryForm
              formData={formData}
              setFormData={setFormData}
              onSave={() => handleCreate(category.id)}
              onCancel={resetForm}
              title="Add Subcategory"
              generateSlug={generateSlug}
            />
          </div>
        )}

        {isEditing && (
          <div className={`${depth > 0 ? 'ml-12' : 'ml-6'} mt-2 mb-4`}>
            <CategoryForm
              formData={formData}
              setFormData={setFormData}
              onSave={handleUpdate}
              onCancel={resetForm}
              title="Edit Category"
              generateSlug={generateSlug}
            />
          </div>
        )}

        {isExpanded && hasChildren && (
          <div>
            {category.children!.map(child => renderCategory(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Catalog Taxonomy</h2>
          <p className="text-gray-600 mt-1">Manage hierarchical product categories</p>
        </div>
        <button
          onClick={() => setIsAddingChild('root')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Root Category
        </button>
      </div>

      {isAddingChild === 'root' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <CategoryForm
            formData={formData}
            setFormData={setFormData}
            onSave={() => handleCreate(null)}
            onCancel={resetForm}
            title="Add Root Category"
            generateSlug={generateSlug}
          />
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {categories.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No categories yet. Create your first category to get started.
          </div>
        ) : (
          <div className="space-y-1">
            {categories.map(category => renderCategory(category))}
          </div>
        )}
      </div>
    </div>
  );
}

interface CategoryFormProps {
  formData: any;
  setFormData: (data: any) => void;
  onSave: () => void;
  onCancel: () => void;
  title: string;
  generateSlug: (name: string) => string;
}

function CategoryForm({ formData, setFormData, onSave, onCancel, title, generateSlug }: CategoryFormProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
      <h3 className="font-semibold text-gray-900">{title}</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => {
              setFormData({
                ...formData,
                name: e.target.value,
                slug: generateSlug(e.target.value)
              });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Category name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="category-slug"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
          <input
            type="text"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="📦"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
          <input
            type="number"
            value={formData.display_order}
            onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            rows={2}
            placeholder="Category description"
          />
        </div>

        <div className="col-span-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="rounded border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">Active</span>
          </label>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
        <button
          onClick={onSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
      </div>
    </div>
  );
}
