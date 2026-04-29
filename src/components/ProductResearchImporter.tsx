import React, { useState } from 'react';
import { Upload, Link, Search, Plus, X, Save, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ProductImportForm {
  name: string;
  sourceUrl: string;
  sourceName: string;
  category: string;
  price: string;
  description: string;
  imageUrl: string;
  material: string;
  origin: string;
  craftType: string;
  tags: string[];
  attributes: { name: string; value: string }[];
}

export default function ProductResearchImporter() {
  const [importMethod, setImportMethod] = useState<'manual' | 'bulk'>('manual');
  const [formData, setFormData] = useState<ProductImportForm>({
    name: '',
    sourceUrl: '',
    sourceName: '',
    category: '',
    price: '',
    description: '',
    imageUrl: '',
    material: '',
    origin: '',
    craftType: '',
    tags: [],
    attributes: []
  });
  const [currentTag, setCurrentTag] = useState('');
  const [currentAttribute, setCurrentAttribute] = useState({ name: '', value: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const sourceData = {
        name: formData.sourceName,
        website_url: formData.sourceUrl,
        source_type: 'research',
        is_verified: false
      };

      const { data: source, error: sourceError } = await supabase
        .from('product_sources')
        .upsert(sourceData, { onConflict: 'name' })
        .select()
        .single();

      if (sourceError) throw sourceError;

      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      const productData = {
        name: formData.name,
        slug,
        full_description: formData.description,
        source_id: source.id,
        base_price: parseFloat(formData.price),
        primary_image_url: formData.imageUrl,
        material: formData.material,
        origin: formData.origin,
        craft_type: formData.craftType,
        source_url: formData.sourceUrl,
        is_active: true,
        stock_quantity: 0
      };

      const { data: product, error: productError } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (productError) throw productError;

      if (formData.tags.length > 0) {
        const tagData = formData.tags.map(tag => ({
          product_id: product.id,
          tag
        }));
        await supabase.from('product_tags').insert(tagData);
      }

      if (formData.attributes.length > 0) {
        const attrData = formData.attributes.map(attr => ({
          product_id: product.id,
          attribute_name: attr.name,
          attribute_value: attr.value,
          is_filterable: true
        }));
        await supabase.from('product_attributes').insert(attrData);
      }

      setMessage('Product imported successfully!');
      setFormData({
        name: '',
        sourceUrl: '',
        sourceName: '',
        category: '',
        price: '',
        description: '',
        imageUrl: '',
        material: '',
        origin: '',
        craftType: '',
        tags: [],
        attributes: []
      });
    } catch (error) {
      console.error('Error importing product:', error);
      setMessage('Error importing product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (currentTag && !formData.tags.includes(currentTag)) {
      setFormData({ ...formData, tags: [...formData.tags, currentTag] });
      setCurrentTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const addAttribute = () => {
    if (currentAttribute.name && currentAttribute.value) {
      setFormData({
        ...formData,
        attributes: [...formData.attributes, currentAttribute]
      });
      setCurrentAttribute({ name: '', value: '' });
    }
  };

  const removeAttribute = (index: number) => {
    setFormData({
      ...formData,
      attributes: formData.attributes.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Product Research & Import
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Import product information from your market research
          </p>
        </div>

        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Important Note</h3>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Use this tool to track products you've researched from other websites. Always ensure you have
            proper permissions before using any product images or descriptions commercially. This is for
            research and vendor relationship building.
          </p>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setImportMethod('manual')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
              importMethod === 'manual'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Upload className="inline-block w-5 h-5 mr-2" />
            Manual Import
          </button>
          <button
            onClick={() => setImportMethod('bulk')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
              importMethod === 'bulk'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Search className="inline-block w-5 h-5 mr-2" />
            Bulk Import (CSV)
          </button>
        </div>

        {importMethod === 'manual' ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Source Website URL
                </label>
                <div className="relative">
                  <Link className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    value={formData.sourceUrl}
                    onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="https://example.com/product"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Source/Vendor Name
                </label>
                <input
                  type="text"
                  value={formData.sourceName}
                  onChange={(e) => setFormData({ ...formData, sourceName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Vendor/Website Name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Product Name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Material
                </label>
                <input
                  type="text"
                  value={formData.material}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Ceramic, Wood, Glass"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Origin
                </label>
                <input
                  type="text"
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Morocco, Japan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Craft Type
                </label>
                <input
                  type="text"
                  value={formData.craftType}
                  onChange={(e) => setFormData({ ...formData, craftType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Pottery, Calligraphy"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Product description..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Add tag..."
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Attributes (for filtering)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={currentAttribute.name}
                    onChange={(e) => setCurrentAttribute({ ...currentAttribute, name: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Attribute name (e.g., Size)"
                  />
                  <input
                    type="text"
                    value={currentAttribute.value}
                    onChange={(e) => setCurrentAttribute({ ...currentAttribute, value: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Value (e.g., Large)"
                  />
                  <button
                    type="button"
                    onClick={addAttribute}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.attributes.map((attr, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <span className="text-gray-700 dark:text-gray-300">
                        <strong>{attr.name}:</strong> {attr.value}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeAttribute(index)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-lg ${
                message.includes('Error')
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                  : 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
              }`}>
                {message}
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                <Save className="inline-block w-5 h-5 mr-2" />
                {loading ? 'Importing...' : 'Import Product'}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-12">
            <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Bulk Import (Coming Soon)
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Import multiple products at once using a CSV file
            </p>
          </div>
        )}
      </div>
    </div>
  );
}