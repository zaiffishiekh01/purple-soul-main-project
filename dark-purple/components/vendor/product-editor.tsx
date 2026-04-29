'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Save, ArrowLeft, Loader2, Upload, X } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface Category {
  layer1_slug: string;
  layer1_name: string;
  layer2_slug?: string;
  layer2_name?: string;
}

interface ProductEditorProps {
  productId?: string;
  mode: 'create' | 'edit';
}

export function ProductEditor({ productId, mode }: ProductEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    stock_quantity: '',
    layer1_category_slug: '',
    layer2_category_slug: '',
    is_active: true,
    sku: '',
    handmade_story: '',
    artisan_notes: '',
    origin_country: '',
  });

  useEffect(() => {
    fetchCategories();
    if (mode === 'edit' && productId) {
      fetchProduct();
    }
  }, [mode, productId]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('layer1_category_slug, layer1_category_name, layer2_category_slug, layer2_category_name')
        .not('layer1_category_slug', 'is', null);

      if (error) throw error;

      const uniqueCategories = new Map<string, Category>();
      data?.forEach(item => {
        if (item.layer1_category_slug) {
          const key = `${item.layer1_category_slug}-${item.layer2_category_slug || 'none'}`;
          if (!uniqueCategories.has(key)) {
            uniqueCategories.set(key, {
              layer1_slug: item.layer1_category_slug,
              layer1_name: item.layer1_category_name || item.layer1_category_slug,
              layer2_slug: item.layer2_category_slug || undefined,
              layer2_name: item.layer2_category_name || undefined,
            });
          }
        }
      });

      setCategories(Array.from(uniqueCategories.values()));
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Product not found');

      setFormData({
        title: data.title || '',
        description: data.description || '',
        price: data.price || '',
        stock_quantity: data.stock_quantity?.toString() || '',
        layer1_category_slug: data.layer1_category_slug || '',
        layer2_category_slug: data.layer2_category_slug || '',
        is_active: data.is_active ?? true,
        sku: data.sku || '',
        handmade_story: data.handmade_story || '',
        artisan_notes: data.artisan_notes || '',
        origin_country: data.origin_country || '',
      });

      if (data.images && Array.isArray(data.images)) {
        setImageUrls(data.images);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const payload: any = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        stock_quantity: parseInt(formData.stock_quantity || '0'),
        layer1_category_slug: formData.layer1_category_slug || null,
        layer2_category_slug: formData.layer2_category_slug || null,
        is_active: formData.is_active,
        sku: formData.sku || null,
        handmade_story: formData.handmade_story || null,
        artisan_notes: formData.artisan_notes || null,
        origin_country: formData.origin_country || null,
        images: imageUrls.length > 0 ? imageUrls : [],
        vendor_id: user.id,
      };

      if (mode === 'create') {
        const { error: insertError } = await supabase
          .from('products')
          .insert([payload]);

        if (insertError) throw insertError;
        toast.success('Product created successfully!');
      } else {
        const { error: updateError } = await supabase
          .from('products')
          .update(payload)
          .eq('id', productId);

        if (updateError) throw updateError;
        toast.success('Product updated successfully!');
      }

      router.push('/vendor/products');
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save product';
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const addImage = () => {
    if (newImageUrl && !imageUrls.includes(newImageUrl)) {
      setImageUrls([...imageUrls, newImageUrl]);
      setNewImageUrl('');
    }
  };

  const removeImage = (url: string) => {
    setImageUrls(imageUrls.filter(img => img !== url));
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-white/50" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/vendor/products">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-4xl font-serif text-white">
            {mode === 'create' ? 'Add New Product' : 'Edit Product'}
          </h1>
        </div>

        {error && (
          <div className="glass-card p-4 mb-6 border-red-500/30">
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="glass-card glass-card-hover p-8">
            <h2 className="text-2xl font-serif text-white mb-6">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-white/80">Product Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  required
                  placeholder="Enter product title"
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40 mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-white/80">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={4}
                  placeholder="Describe your product"
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40 mt-1.5"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price" className="text-white/80">Price (USD) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    required
                    placeholder="0.00"
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="stock_quantity" className="text-white/80">Stock Quantity *</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    min="0"
                    value={formData.stock_quantity}
                    onChange={(e) => handleChange('stock_quantity', e.target.value)}
                    required
                    placeholder="0"
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="sku" className="text-white/80">SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => handleChange('sku', e.target.value)}
                    placeholder="Product SKU"
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="layer1_category_slug" className="text-white/80">Primary Category</Label>
                <select
                  id="layer1_category_slug"
                  value={formData.layer1_category_slug}
                  onChange={(e) => handleChange('layer1_category_slug', e.target.value)}
                  className="w-full px-3 py-2 mt-1.5 bg-white/5 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold/50"
                >
                  <option value="" className="bg-gray-900">Select a category</option>
                  {Array.from(new Set(categories.map(c => c.layer1_slug))).map((slug) => {
                    const cat = categories.find(c => c.layer1_slug === slug);
                    return (
                      <option key={slug} value={slug} className="bg-gray-900">
                        {cat?.layer1_name}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          <div className="glass-card glass-card-hover p-8">
            <h2 className="text-2xl font-serif text-white mb-6">Product Images</h2>
            <div className="space-y-4">
              <div>
                <Label className="text-white/80">Image URLs</Label>
                <p className="text-sm text-white/50 mb-3">Add image URLs from Pexels or other sources</p>
                <div className="flex gap-2">
                  <Input
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://images.pexels.com/..."
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                  />
                  <Button type="button" onClick={addImage} className="celestial-button">
                    <Upload className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>

              {imageUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {imageUrls.map((url, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden bg-white/5">
                      <img src={url} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(url)}
                        className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="glass-card glass-card-hover p-8">
            <h2 className="text-2xl font-serif text-white mb-6">Handmade Details</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="handmade_story" className="text-white/80">Handmade Story</Label>
                <Textarea
                  id="handmade_story"
                  value={formData.handmade_story}
                  onChange={(e) => handleChange('handmade_story', e.target.value)}
                  rows={3}
                  placeholder="Tell the story behind this handmade item"
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40 mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="artisan_notes" className="text-white/80">Artisan Notes</Label>
                <Textarea
                  id="artisan_notes"
                  value={formData.artisan_notes}
                  onChange={(e) => handleChange('artisan_notes', e.target.value)}
                  rows={3}
                  placeholder="Add notes about the artisan and craftsmanship"
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40 mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="origin_country" className="text-white/80">Country of Origin</Label>
                <Input
                  id="origin_country"
                  value={formData.origin_country}
                  onChange={(e) => handleChange('origin_country', e.target.value)}
                  placeholder="e.g., Morocco, Turkey, India"
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40 mt-1.5"
                />
              </div>
            </div>
          </div>

          <div className="glass-card glass-card-hover p-8">
            <h2 className="text-2xl font-serif text-white mb-6">Product Status</h2>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="is_active" className="text-white/80">Active</Label>
                <p className="text-sm text-white/50 mt-1">
                  Make this product visible to customers
                </p>
              </div>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleChange('is_active', checked)}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={saving} className="celestial-button flex-1 md:flex-initial">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Product
                </>
              )}
            </Button>
            <Link href="/vendor/products">
              <Button type="button" variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
