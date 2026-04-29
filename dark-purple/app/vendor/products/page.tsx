'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Eye, AlertCircle, Package, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api/client';

interface Product {
  id: string;
  title: string;
  price: string;
  stock_quantity: number;
  is_active: boolean;
  images: string[];
  layer1_category_slug?: string;
  category?: {
    name: string;
  };
}

export default function VendorProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get<{ data: Product[] }>('/vendor/products?limit=100');
      setProducts(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-white/50" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-6 border-red-500/30">
        <div className="flex items-center gap-3 text-red-400">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-serif text-white">Products</h1>
            <p className="mt-2 text-white/60">
              Manage your product catalog
            </p>
          </div>
          <Link href="/vendor/products/new">
            <Button className="celestial-button">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>

        <div className="glass-card glass-card-hover p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40"
            />
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="glass-card glass-card-hover p-12 text-center">
            <Package className="h-16 w-16 mx-auto mb-4" style={{ color: '#d4af8a' }} />
            <h3 className="text-2xl font-serif text-white mb-2">
              {products.length === 0 ? 'No products yet' : 'No products found'}
            </h3>
            <p className="text-white/60 mb-6">
              {products.length === 0
                ? 'Get started by adding your first product'
                : 'Try adjusting your search'}
            </p>
            {products.length === 0 && (
              <Link href="/vendor/products/new">
                <Button className="celestial-button">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const imageUrl = product.images?.[0] || 'https://images.pexels.com/photos/4188303/pexels-photo-4188303.jpeg';

              return (
                <div key={product.id} className="glass-card glass-card-hover overflow-hidden group">
                  <div className="aspect-square bg-white/5 relative">
                    <Image
                      src={imageUrl}
                      alt={product.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge
                        className={product.is_active ? 'bg-green-500/80' : 'bg-gray-500/80'}
                      >
                        {product.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-white mb-2 truncate text-lg">
                      {product.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-white/60 mb-4">
                      <span className="text-rose-gold font-medium text-lg">
                        ${parseFloat(product.price).toFixed(2)}
                      </span>
                      <span>Stock: {product.stock_quantity || 0}</span>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/p/${product.id}`} className="flex-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
                      <Link href={`/vendor/products/${product.id}/edit`} className="flex-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
