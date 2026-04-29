import { useState, useEffect } from 'react';
import { DollarSign, Plus, Edit, Trash2, Globe, Package, Store, X, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { RegionalPriceRule } from '../../types';
import { useCategoryNames } from '../../hooks/useCategories';

const COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
];

interface RuleFormData {
  scope: 'product' | 'category' | 'vendor';
  product_id?: string;
  category?: string;
  vendor_id?: string;
  country_code: string;
  markup_type: 'FLAT' | 'PERCENT';
  markup_value: number;
  priority: number;
}

export function AdminPricingRules() {
  const categoryNames = useCategoryNames(true);
  const [rules, setRules] = useState<RegionalPriceRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<RegionalPriceRule | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);

  const [formData, setFormData] = useState<RuleFormData>({
    scope: 'category',
    country_code: 'US',
    markup_type: 'FLAT',
    markup_value: 20,
    priority: 0,
  });

  useEffect(() => {
    fetchRules();
    fetchProducts();
    fetchVendors();
  }, []);

  const fetchRules = async () => {
    try {
      const { data, error } = await supabase
        .from('regional_price_rules')
        .select('*')
        .order('priority', { ascending: false });

      if (error) throw error;
      setRules(data || []);
    } catch (error) {
      console.error('Error fetching pricing rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await supabase
        .from('products')
        .select('id, name, sku')
        .order('name');
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchVendors = async () => {
    try {
      const { data } = await supabase
        .from('vendors')
        .select('id, business_name')
        .order('business_name');
      setVendors(data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const ruleData: any = {
        country_code: formData.country_code,
        markup_type: formData.markup_type,
        markup_value: formData.markup_value,
        priority: formData.priority,
        is_active: true,
      };

      if (formData.scope === 'product' && formData.product_id) {
        ruleData.product_id = formData.product_id;
      } else if (formData.scope === 'category' && formData.category) {
        ruleData.category = formData.category;
      } else if (formData.scope === 'vendor' && formData.vendor_id) {
        ruleData.vendor_id = formData.vendor_id;
      }

      if (editingRule) {
        const { error } = await supabase
          .from('regional_price_rules')
          .update(ruleData)
          .eq('id', editingRule.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('regional_price_rules')
          .insert([ruleData]);

        if (error) throw error;
      }

      setShowForm(false);
      setEditingRule(null);
      resetForm();
      fetchRules();
    } catch (error) {
      console.error('Error saving rule:', error);
      alert('Failed to save pricing rule');
    }
  };

  const handleDelete = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this pricing rule?')) return;

    try {
      const { error } = await supabase
        .from('regional_price_rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;
      fetchRules();
    } catch (error) {
      console.error('Error deleting rule:', error);
      alert('Failed to delete pricing rule');
    }
  };

  const toggleRuleStatus = async (rule: RegionalPriceRule) => {
    try {
      const { error } = await supabase
        .from('regional_price_rules')
        .update({ is_active: !rule.is_active })
        .eq('id', rule.id);

      if (error) throw error;
      fetchRules();
    } catch (error) {
      console.error('Error toggling rule status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      scope: 'category',
      country_code: 'US',
      markup_type: 'FLAT',
      markup_value: 20,
      priority: 0,
    });
  };

  const startEdit = (rule: RegionalPriceRule) => {
    setEditingRule(rule);
    setFormData({
      scope: rule.product_id ? 'product' : rule.category ? 'category' : 'vendor',
      product_id: rule.product_id,
      category: rule.category,
      vendor_id: rule.vendor_id,
      country_code: rule.country_code,
      markup_type: rule.markup_type,
      markup_value: rule.markup_value,
      priority: rule.priority,
    });
    setShowForm(true);
  };

  const getRuleScopeDisplay = (rule: RegionalPriceRule) => {
    if (rule.product_id) {
      const product = products.find(p => p.id === rule.product_id);
      return { icon: Package, label: product ? `Product: ${product.name}` : 'Product (Deleted)' };
    }
    if (rule.category) {
      return { icon: Globe, label: `Category: ${rule.category}` };
    }
    if (rule.vendor_id) {
      const vendor = vendors.find(v => v.id === rule.vendor_id);
      return { icon: Store, label: vendor ? `Vendor: ${vendor.business_name}` : 'Vendor (Deleted)' };
    }
    return { icon: Globe, label: 'Unknown' };
  };

  const getCountryDisplay = (code: string) => {
    const country = COUNTRIES.find(c => c.code === code);
    return country ? `${country.flag} ${country.name}` : code;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Regional Pricing Rules</h1>
          <p className="text-gray-600 mt-1">
            Configure country-specific markup for products, categories, or vendors
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Pricing Rule
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-semibold text-blue-900 mb-2">How It Works</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Vendors always see and set <strong>base_price</strong></li>
          <li>• Customers see <strong>base_price + markup</strong> based on their country</li>
          <li>• Rule priority: Product-specific → Category-wide → Vendor-wide</li>
          <li>• Vendors from same country as product see base price (no markup)</li>
        </ul>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading pricing rules...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Scope</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Country</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Markup</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Priority</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rules.map((rule) => {
                  const scope = getRuleScopeDisplay(rule);
                  const Icon = scope.icon;
                  return (
                    <tr key={rule.id} className={!rule.is_active ? 'bg-gray-50 opacity-60' : ''}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-900">{scope.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {getCountryDisplay(rule.country_code)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {rule.markup_type === 'FLAT'
                          ? `$${rule.markup_value}`
                          : `${(rule.markup_value * 100).toFixed(0)}%`
                        }
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{rule.priority}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleRuleStatus(rule)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            rule.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {rule.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => startEdit(rule)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(rule.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {rules.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No pricing rules configured. Add your first rule to get started.
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingRule ? 'Edit Pricing Rule' : 'Add Pricing Rule'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingRule(null);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rule Scope *
                </label>
                <select
                  value={formData.scope}
                  onChange={(e) => setFormData({ ...formData, scope: e.target.value as any })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="category">Category (applies to all products in category)</option>
                  <option value="vendor">Vendor (applies to all products from vendor)</option>
                  <option value="product">Specific Product</option>
                </select>
              </div>

              {formData.scope === 'product' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Product *
                  </label>
                  <select
                    value={formData.product_id || ''}
                    onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    <option value="">Choose a product...</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.sku})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formData.scope === 'category' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Category *
                  </label>
                  <select
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    <option value="">Choose a category...</option>
                    {categoryNames.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formData.scope === 'vendor' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Vendor *
                  </label>
                  <select
                    value={formData.vendor_id || ''}
                    onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    <option value="">Choose a vendor...</option>
                    {vendors.map((vendor) => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.business_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <select
                  value={formData.country_code}
                  onChange={(e) => setFormData({ ...formData, country_code: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  {COUNTRIES.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Markup Type *
                  </label>
                  <select
                    value={formData.markup_type}
                    onChange={(e) => setFormData({ ...formData, markup_type: e.target.value as any })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    <option value="FLAT">Flat Amount ($)</option>
                    <option value="PERCENT">Percentage (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Markup Value *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.markup_value}
                    onChange={(e) => setFormData({ ...formData, markup_value: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                    placeholder={formData.markup_type === 'FLAT' ? '20.00' : '0.20'}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.markup_type === 'FLAT'
                      ? 'Enter dollar amount (e.g., 20 for $20)'
                      : 'Enter decimal (e.g., 0.20 for 20%)'
                    }
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority (higher = applied first)
                </label>
                <input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="0"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-medium flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {editingRule ? 'Update Rule' : 'Create Rule'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingRule(null);
                    resetForm();
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
