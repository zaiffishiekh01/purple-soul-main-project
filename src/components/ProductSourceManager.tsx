import React, { useState, useEffect } from 'react';
import { ExternalLink, CreditCard as Edit, Trash2, Plus, Check, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ProductSource {
  id: string;
  name: string;
  website_url: string;
  contact_email: string;
  contact_phone: string;
  source_type: string;
  is_verified: boolean;
  notes: string;
  created_at: string;
}

export default function ProductSourceManager() {
  const [sources, setSources] = useState<ProductSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    website_url: '',
    contact_email: '',
    contact_phone: '',
    source_type: 'vendor',
    notes: ''
  });

  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = async () => {
    try {
      const { data, error } = await supabase
        .from('product_sources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSources(data || []);
    } catch (error) {
      console.error('Error loading sources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        const { error } = await supabase
          .from('product_sources')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('product_sources')
          .insert([formData]);

        if (error) throw error;
      }

      setFormData({
        name: '',
        website_url: '',
        contact_email: '',
        contact_phone: '',
        source_type: 'vendor',
        notes: ''
      });
      setShowAddForm(false);
      setEditingId(null);
      loadSources();
    } catch (error) {
      console.error('Error saving source:', error);
    }
  };

  const handleEdit = (source: ProductSource) => {
    setFormData({
      name: source.name,
      website_url: source.website_url,
      contact_email: source.contact_email,
      contact_phone: source.contact_phone,
      source_type: source.source_type,
      notes: source.notes
    });
    setEditingId(source.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this source?')) return;

    try {
      const { error } = await supabase
        .from('product_sources')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadSources();
    } catch (error) {
      console.error('Error deleting source:', error);
    }
  };

  const toggleVerified = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('product_sources')
        .update({ is_verified: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      loadSources();
    } catch (error) {
      console.error('Error updating verification:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading sources...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Product Sources & Vendors
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your product sources and vendor relationships
            </p>
          </div>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingId(null);
              setFormData({
                name: '',
                website_url: '',
                contact_email: '',
                contact_phone: '',
                source_type: 'vendor',
                notes: ''
              });
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            <Plus className="inline-block w-5 h-5 mr-2" />
            Add Source
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {editingId ? 'Edit Source' : 'Add New Source'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Source Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Source Type
                </label>
                <select
                  value={formData.source_type}
                  onChange={(e) => setFormData({ ...formData, source_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white"
                >
                  <option value="vendor">Vendor</option>
                  <option value="marketplace">Marketplace</option>
                  <option value="manufacturer">Manufacturer</option>
                  <option value="artisan">Artisan</option>
                  <option value="research">Research</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white"
                  placeholder="Add any notes about this source..."
                />
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingId ? 'Update' : 'Add'} Source
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingId(null);
                }}
                className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 gap-4">
          {sources.map((source) => (
            <div
              key={source.id}
              className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {source.name}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      source.is_verified
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {source.is_verified ? 'Verified' : 'Unverified'}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-semibold">
                      {source.source_type}
                    </span>
                  </div>

                  {source.website_url && (
                    <a
                      href={source.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mb-2"
                    >
                      {source.website_url}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}

                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {source.contact_email && <p>Email: {source.contact_email}</p>}
                    {source.contact_phone && <p>Phone: {source.contact_phone}</p>}
                    {source.notes && (
                      <p className="mt-2 text-gray-700 dark:text-gray-300">{source.notes}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleVerified(source.id, source.is_verified)}
                    className={`p-2 rounded-lg ${
                      source.is_verified
                        ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    } hover:opacity-80`}
                    title={source.is_verified ? 'Mark as unverified' : 'Mark as verified'}
                  >
                    {source.is_verified ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => handleEdit(source)}
                    className="p-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(source.id)}
                    className="p-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-800"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {sources.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No sources added yet. Click "Add Source" to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}