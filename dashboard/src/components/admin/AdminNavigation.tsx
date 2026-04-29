import { useState } from 'react';
import {
  Eye,
  Star,
  Menu as MenuIcon,
  Tag,
  Search,
  Loader,
  Save,
  X,
  ArrowUp,
  ArrowDown,
  Settings
} from 'lucide-react';
import { useNavigationSettings } from '../../hooks/useNavigationSettings';

type TabType = 'featured' | 'navigation' | 'mega-menu' | 'seo';

export function AdminNavigation() {
  const [activeTab, setActiveTab] = useState<TabType>('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});
  const [saving, setSaving] = useState(false);

  const {
    categories,
    loading,
    toggleFeatured,
    toggleNavigation,
    toggleMegaMenu,
    updateFeaturedOrder,
    updateSEO,
    updateNavigationLabel,
    updateMegaMenuColumns,
  } = useNavigationSettings();

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featuredCategories = filteredCategories
    .filter(cat => cat.is_featured)
    .sort((a, b) => a.featured_order - b.featured_order);

  const handleSave = async (categoryId: string) => {
    setSaving(true);
    let result;

    if (activeTab === 'featured') {
      result = await updateFeaturedOrder(categoryId, editValues.featured_order || 0);
    } else if (activeTab === 'navigation') {
      result = await updateNavigationLabel(categoryId, editValues.navigation_label || '');
    } else if (activeTab === 'mega-menu') {
      result = await updateMegaMenuColumns(categoryId, editValues.mega_menu_columns || 3);
    } else if (activeTab === 'seo') {
      result = await updateSEO(categoryId, {
        seo_title: editValues.seo_title || '',
        seo_description: editValues.seo_description || '',
        seo_keywords: editValues.seo_keywords || '',
        url_slug_override: editValues.url_slug_override || '',
      });
    }

    setSaving(false);
    if (result?.success) {
      setEditingCategory(null);
      setEditValues({});
    }
  };

  const startEditing = (category: any) => {
    setEditingCategory(category.id);
    if (activeTab === 'featured') {
      setEditValues({ featured_order: category.featured_order });
    } else if (activeTab === 'navigation') {
      setEditValues({ navigation_label: category.navigation_label });
    } else if (activeTab === 'mega-menu') {
      setEditValues({ mega_menu_columns: category.mega_menu_columns });
    } else if (activeTab === 'seo') {
      setEditValues({
        seo_title: category.seo_title,
        seo_description: category.seo_description,
        seo_keywords: category.seo_keywords,
        url_slug_override: category.url_slug_override,
      });
    }
  };

  const cancelEditing = () => {
    setEditingCategory(null);
    setEditValues({});
  };

  const tabs = [
    { id: 'featured', label: 'Featured Categories', icon: Star },
    { id: 'navigation', label: 'Navigation Menu', icon: MenuIcon },
    { id: 'mega-menu', label: 'Mega Menu', icon: Settings },
    { id: 'seo', label: 'SEO & URLs', icon: Tag },
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
        <Eye className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Navigation & Visibility</h1>
          <p className="text-gray-600 mt-1">Control what customers see and how they navigate your storefront</p>
        </div>
      </div>

      {/* Authority Notice */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-blue-900 mb-2">
              Authoritative Navigation Publisher
            </h3>
            <p className="text-blue-800 mb-3">
              This dashboard is the <strong>SINGLE SOURCE OF TRUTH</strong> for all storefront navigation.
              Any changes you make here will immediately reflect in the public navigation API and on all storefronts.
            </p>
            <div className="bg-white/60 rounded-lg p-3 space-y-2 text-sm text-blue-900">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span><strong>menu_label:</strong> Custom navigation label (overrides category name)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span><strong>menu_order:</strong> Display order in navigation (uses display_order)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span><strong>show_in_navigation:</strong> Controls visibility in storefront menus</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span><strong>route_slug:</strong> URL path for navigation links (uses url_slug_override or slug)</span>
              </div>
            </div>
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
              <p className="text-sm text-yellow-900 font-medium">
                <strong>Important:</strong> Storefronts consume this data read-only. They NEVER override or use fallback labels.
                What you set here is exactly what appears in navigation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
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

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
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

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'featured' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Featured Categories</h3>
                  <p className="text-sm text-gray-600">Select categories to highlight on your homepage</p>
                </div>
                <div className="text-sm text-gray-600">
                  {featuredCategories.length} featured
                </div>
              </div>

              {featuredCategories.length > 0 && (
                <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <h4 className="font-medium text-emerald-900 mb-3">Featured Order (Homepage)</h4>
                  <div className="space-y-2">
                    {featuredCategories.map((cat, idx) => (
                      <div key={cat.id} className="flex items-center gap-3 bg-white p-3 rounded-lg">
                        <span className="font-bold text-emerald-600 w-8">{idx + 1}.</span>
                        <span className="flex-1 font-medium">{cat.name}</span>
                        <span className="text-sm text-gray-500">Order: {cat.featured_order}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {filteredCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <h4 className="font-medium text-gray-900">{category.name}</h4>
                        <p className="text-sm text-gray-500">{category.slug}</p>
                      </div>
                    </div>

                    {editingCategory === category.id ? (
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          value={editValues.featured_order || 0}
                          onChange={(e) => setEditValues({ ...editValues, featured_order: parseInt(e.target.value) || 0 })}
                          placeholder="Order"
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <button
                          onClick={() => handleSave(category.id)}
                          disabled={saving}
                          className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50"
                        >
                          {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="p-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        {category.is_featured && (
                          <button
                            onClick={() => startEditing(category)}
                            className="text-sm text-blue-600 hover:text-blue-700"
                          >
                            Edit Order
                          </button>
                        )}
                        <button
                          onClick={() => toggleFeatured(category.id, category.is_featured)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                            category.is_featured
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          <Star className={`w-4 h-4 ${category.is_featured ? 'fill-yellow-500' : ''}`} />
                          {category.is_featured ? 'Featured' : 'Not Featured'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'navigation' && (
            <div className="space-y-4">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Navigation Menu Visibility</h3>
                <p className="text-sm text-gray-600">Control which categories appear in your main navigation</p>
              </div>

              <div className="space-y-2">
                {filteredCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <h4 className="font-medium text-gray-900">{category.name}</h4>
                        <p className="text-sm text-gray-500">
                          Nav Label: {category.navigation_label || <span className="italic">Uses category name</span>}
                        </p>
                      </div>
                    </div>

                    {editingCategory === category.id ? (
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={editValues.navigation_label || ''}
                          onChange={(e) => setEditValues({ ...editValues, navigation_label: e.target.value })}
                          placeholder="Custom nav label"
                          className="w-64 px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <button
                          onClick={() => handleSave(category.id)}
                          disabled={saving}
                          className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50"
                        >
                          {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="p-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => startEditing(category)}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          Edit Label
                        </button>
                        <button
                          onClick={() => toggleNavigation(category.id, category.show_in_navigation)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                            category.show_in_navigation
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          <Eye className="w-4 h-4" />
                          {category.show_in_navigation ? 'Visible' : 'Hidden'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'mega-menu' && (
            <div className="space-y-4">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Mega Menu Configuration</h3>
                <p className="text-sm text-gray-600">Enable multi-column dropdown menus for categories</p>
              </div>

              <div className="space-y-2">
                {filteredCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <h4 className="font-medium text-gray-900">{category.name}</h4>
                        <p className="text-sm text-gray-500">
                          {category.mega_menu_enabled ? `${category.mega_menu_columns} columns` : 'Standard dropdown'}
                        </p>
                      </div>
                    </div>

                    {editingCategory === category.id ? (
                      <div className="flex items-center gap-3">
                        <select
                          value={editValues.mega_menu_columns || 3}
                          onChange={(e) => setEditValues({ ...editValues, mega_menu_columns: parseInt(e.target.value) })}
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="2">2 Columns</option>
                          <option value="3">3 Columns</option>
                          <option value="4">4 Columns</option>
                        </select>
                        <button
                          onClick={() => handleSave(category.id)}
                          disabled={saving}
                          className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50"
                        >
                          {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="p-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        {category.mega_menu_enabled && (
                          <button
                            onClick={() => startEditing(category)}
                            className="text-sm text-blue-600 hover:text-blue-700"
                          >
                            Configure
                          </button>
                        )}
                        <button
                          onClick={() => toggleMegaMenu(category.id, category.mega_menu_enabled)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                            category.mega_menu_enabled
                              ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          <Settings className="w-4 h-4" />
                          {category.mega_menu_enabled ? 'Mega Menu' : 'Standard'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-4">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">SEO & URL Settings</h3>
                <p className="text-sm text-gray-600">Optimize search engine visibility for each category</p>
              </div>

              <div className="space-y-4">
                {filteredCategories.map((category) => (
                  <div
                    key={category.id}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <div className="flex items-center justify-between p-4 bg-gray-50">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{category.icon}</span>
                        <div>
                          <h4 className="font-medium text-gray-900">{category.name}</h4>
                          <p className="text-sm text-gray-500">/{category.url_slug_override || category.slug}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => editingCategory === category.id ? cancelEditing() : startEditing(category)}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        {editingCategory === category.id ? 'Cancel' : 'Edit SEO'}
                      </button>
                    </div>

                    {editingCategory === category.id && (
                      <div className="p-4 space-y-4 bg-white">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            SEO Title
                          </label>
                          <input
                            type="text"
                            value={editValues.seo_title || ''}
                            onChange={(e) => setEditValues({ ...editValues, seo_title: e.target.value })}
                            placeholder={`${category.name} - Default Site Title`}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                          <p className="text-xs text-gray-500 mt-1">Leave empty to use default</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Meta Description
                          </label>
                          <textarea
                            value={editValues.seo_description || ''}
                            onChange={(e) => setEditValues({ ...editValues, seo_description: e.target.value })}
                            placeholder="Write a compelling description for search engines..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {editValues.seo_description?.length || 0} / 160 characters
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Keywords (comma-separated)
                          </label>
                          <input
                            type="text"
                            value={editValues.seo_keywords || ''}
                            onChange={(e) => setEditValues({ ...editValues, seo_keywords: e.target.value })}
                            placeholder="keyword1, keyword2, keyword3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Custom URL Slug
                          </label>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">/</span>
                            <input
                              type="text"
                              value={editValues.url_slug_override || ''}
                              onChange={(e) => setEditValues({ ...editValues, url_slug_override: e.target.value })}
                              placeholder={category.slug}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Leave empty to use default slug</p>
                        </div>

                        <button
                          onClick={() => handleSave(category.id)}
                          disabled={saving}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50"
                        >
                          {saving ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              Save SEO Settings
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
