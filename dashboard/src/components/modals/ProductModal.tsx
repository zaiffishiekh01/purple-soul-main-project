import { useState, useEffect } from 'react';
import { X, Save, Upload, Trash2, Plus, Info, CheckCircle } from 'lucide-react';
import { Product } from '../../types';
import { uploadProductImage } from '../../lib/storage';
import { useFlatCatalogTaxonomy } from '../../hooks/useCatalogTaxonomy';
import { ProductFacetSelector } from '../ProductFacetSelector';
import { getProductFacets, saveProductFacets } from '../../hooks/useProductFacets';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onSave: (product: Partial<Product>) => Promise<void>;
}

export function ProductModal({ product, onClose, onSave }: ProductModalProps) {
  const { categories: taxonomyCategories, loading: loadingCategories } = useFlatCatalogTaxonomy();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    category_id: '',
    sku: '',
    price: 0,
    cost: 0,
    color: '',
    size_dimensions: '',
    care_instructions: '',
    material: '',
    shipping_timeline: '',
    stock_quantity: 0,
    tags: [] as string[],
    is_digital: false,
    download_limit: 3,
    license_duration_days: 365,
    status: 'draft',
  });
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageMetadata, setImageMetadata] = useState<Array<{
    url: string;
    hasBackground: boolean;
    size: string;
    resolution: string;
  }>>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [digitalFile, setDigitalFile] = useState<File | null>(null);
  const [digitalFilePreview, setDigitalFilePreview] = useState<string>('');
  const [selectedFacets, setSelectedFacets] = useState<string[]>([]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        category: product.category || '',
        category_id: (product as any).category_id || '',
        sku: product.sku,
        price: product.price,
        cost: product.cost,
        color: product.color || '',
        size_dimensions: product.size_dimensions || '',
        care_instructions: product.care_instructions || '',
        material: product.material || '',
        shipping_timeline: product.shipping_timeline || '',
        stock_quantity: product.stock_quantity || 0,
        tags: product.tags || [],
        is_digital: product.is_digital || false,
        download_limit: product.download_limit || 3,
        license_duration_days: product.license_duration_days || 365,
        status: product.status,
      });
      setImagePreviews(product.images || []);
      setImageMetadata(product.image_metadata || []);

      getProductFacets(product.id).then(facets => {
        setSelectedFacets(facets);
      }).catch(err => {
        console.error('Failed to load product facets:', err);
      });
    }
  }, [product]);

  const isDigitalCategory = ['Digital Products', 'Audio & Media', 'Books & Islamic Literature'].includes(formData.category);

  const validateTitle = (title: string): boolean => {
    const wordCount = title.trim().split(/\s+/).length;
    if (wordCount < 4 || wordCount > 5) {
      setErrors(prev => ({ ...prev, name: 'Title must be 4-5 words' }));
      return false;
    }
    setErrors(prev => ({ ...prev, name: '' }));
    return true;
  };

  const validateDescription = (desc: string): boolean => {
    const wordCount = desc.trim().split(/\s+/).length;
    if (wordCount > 10) {
      setErrors(prev => ({ ...prev, description: 'Description must be maximum 10 words' }));
      return false;
    }
    setErrors(prev => ({ ...prev, description: '' }));
    return true;
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);

    const newPreviews = await Promise.all(
      files.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      })
    );

    setImagePreviews([...imagePreviews, ...newPreviews]);

    const newMetadata = files.map((file, index) => ({
      url: '',
      hasBackground: true,
      size: `${(file.size / 1024).toFixed(2)} KB`,
      resolution: 'Pending...',
    }));
    setImageMetadata([...imageMetadata, ...newMetadata]);
  };

  const handleRemoveImage = (index: number) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    setImageMetadata(imageMetadata.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && formData.tags.length < 10) {
      const newTags = [...formData.tags, tagInput.trim()];
      setFormData({ ...formData, tags: newTags });
      setTagInput('');
      setErrors(prev => ({ ...prev, tags: '' }));
    } else if (formData.tags.length >= 10) {
      setErrors(prev => ({ ...prev, tags: 'Maximum 10 tags allowed' }));
    }
  };

  const handleRemoveTag = (index: number) => {
    setFormData({ ...formData, tags: formData.tags.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateTitle(formData.name)) return;
    if (formData.description && !validateDescription(formData.description)) return;

    if (imagePreviews.length < 4) {
      setErrors(prev => ({ ...prev, images: 'Minimum 4 images required' }));
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      let imageUrls = imagePreviews.filter(url => url.startsWith('http'));

      if (imageFiles.length > 0) {
        setUploadingImages(true);
        const tempId = product?.id || `temp-${Date.now()}`;

        const uploadedUrls = await Promise.all(
          imageFiles.map(file => uploadProductImage(file, tempId))
        );

        imageUrls = [...imageUrls, ...uploadedUrls];
        setUploadingImages(false);
      }

      const updatedMetadata = imageUrls.map((url, index) => ({
        url,
        hasBackground: imageMetadata[index]?.hasBackground ?? true,
        size: imageMetadata[index]?.size || 'Unknown',
        resolution: imageMetadata[index]?.resolution || 'Unknown',
      }));

      await onSave({
        ...formData,
        images: imageUrls,
        image_metadata: updatedMetadata,
      });

      if (product?.id) {
        try {
          await saveProductFacets(product.id, selectedFacets);
        } catch (err) {
          console.error('Failed to save product facets:', err);
        }
      }

      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      setErrors(prev => ({ ...prev, submit: 'Failed to save product. Please try again.' }));
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {product ? 'Edit Product' : 'Single Product Upload'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">Add a single product with detailed information and specifications.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Category</h3>
            {loadingCategories ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <select
                value={formData.category_id}
                onChange={(e) => {
                  const categoryId = e.target.value;
                  const selectedCategory = taxonomyCategories.find(c => c.id === categoryId);
                  setFormData({
                    ...formData,
                    category_id: categoryId,
                    category: selectedCategory?.name || ''
                  });
                }}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
              >
                <option value="">Choose a category...</option>
                {taxonomyCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {'\u00A0\u00A0'.repeat(cat.level)}{cat.level > 0 ? '└─ ' : ''}{cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            )}

            {isDigitalCategory && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Digital Product Detected</p>
                    <p>This product will be delivered digitally. Customers will receive a unique license key with limited downloads. No physical shipping required.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <ProductFacetSelector
            categoryId={formData.category_id}
            selectedFacets={selectedFacets}
            onChange={setSelectedFacets}
          />

          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Title
                <span className="text-red-500 ml-1">*</span>
                <span className="text-xs text-gray-500 ml-2">(4-5 words)</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  validateTitle(e.target.value);
                }}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Sufi Prayer Beads Set"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="PROD-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
                <span className="text-xs text-gray-500 ml-2">(Max 10 words)</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  validateDescription(e.target.value);
                }}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                placeholder="Short description of the product"
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>
          </div>

          {!isDigitalCategory && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Color</label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="e.g., Natural Brown"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Size / Dimensions</label>
                  <input
                    type="text"
                    value={formData.size_dimensions}
                    onChange={(e) => setFormData({ ...formData, size_dimensions: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="e.g., 8mm beads, 10 inches"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Care Instructions</label>
                <textarea
                  value={formData.care_instructions}
                  onChange={(e) => setFormData({ ...formData, care_instructions: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                  placeholder="Wipe with dry cloth, avoid water"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Material</label>
                  <input
                    type="text"
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Cotton, Polyester, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Timeline</label>
                  <input
                    type="text"
                    value={formData.shipping_timeline}
                    onChange={(e) => setFormData({ ...formData, shipping_timeline: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="e.g., 3-5 business days"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">{isDigitalCategory ? 'Pricing' : 'Pricing & Inventory'}</h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="29.99"
                />
              </div>

              {!isDigitalCategory && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                  <input
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="100"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">{isDigitalCategory ? 'Product Cover Images' : 'Product Images'}</h3>
              <span className="text-red-500">*</span>
              <span className="text-xs text-gray-500">(Minimum 4 required)</span>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">{isDigitalCategory ? 'Cover Image Requirements:' : 'Image Requirements:'}</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Upload minimum 4 high-quality images</li>
                  <li>Recommended: PNG, JPG, or WebP format</li>
                  <li>File naming: Use underscores, no spaces (e.g., {isDigitalCategory ? 'quran_audio_cover.jpg' : 'sufi_beads_red.jpg'})</li>
                  <li>Clear background preferred for better display</li>
                  {isDigitalCategory && <li>These are preview images, not the actual digital product file</li>}
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Product ${index + 1}`}
                    className="w-full h-32 object-cover rounded-xl border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {imagePreviews.length < 10 && (
                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 transition-colors bg-gray-50">
                  <Upload className="w-6 h-6 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">Add Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {errors.images && <p className="text-red-500 text-sm">{errors.images}</p>}
            {uploadingImages && (
              <p className="text-blue-600 text-sm">Uploading images...</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">Tags</h3>
              <span className="text-xs text-gray-500">(Max 10 tags)</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Add tag (press Enter)"
              />
              <button
                type="button"
                onClick={handleAddTag}
                disabled={formData.tags.length >= 10}
                className="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(index)}
                      className="hover:text-blue-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            {errors.tags && <p className="text-red-500 text-sm">{errors.tags}</p>}
          </div>

          {isDigitalCategory && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">Digital File Upload</h3>
                <span className="text-red-500">*</span>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Digital Product Requirements:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Accepted formats: PDF, EPUB, MP3, MP4, ZIP</li>
                    <li>Maximum file size: 500MB</li>
                    <li>Files are securely encrypted and protected</li>
                    <li>Customers receive unique license keys with download limits</li>
                  </ul>
                </div>
              </div>

              {!digitalFile ? (
                <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 transition-colors bg-gray-50">
                  <Upload className="w-10 h-10 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-700">Upload Digital File</span>
                  <span className="text-xs text-gray-500 mt-1">Click to browse or drag and drop</span>
                  <input
                    type="file"
                    accept=".pdf,.epub,.mp3,.mp4,.zip"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setDigitalFile(file);
                        setDigitalFilePreview(file.name);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">{digitalFilePreview}</p>
                        <p className="text-xs text-green-700">
                          {(digitalFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setDigitalFile(null);
                        setDigitalFilePreview('');
                      }}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Download Limit
                  </label>
                  <input
                    type="number"
                    value={formData.download_limit}
                    onChange={(e) => setFormData({ ...formData, download_limit: parseInt(e.target.value) || 3 })}
                    min="1"
                    max="10"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum downloads per purchase</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    License Duration (Days)
                  </label>
                  <input
                    type="number"
                    value={formData.license_duration_days}
                    onChange={(e) => setFormData({ ...formData, license_duration_days: parseInt(e.target.value) || 365 })}
                    min="1"
                    max="3650"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">How long the license remains valid</p>
                </div>
              </div>
            </div>
          )}

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 text-sm">
              {errors.submit}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Uploading Product...' : 'Upload Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
