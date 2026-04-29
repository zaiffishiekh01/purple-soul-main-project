import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ProductGrid } from '@/components/products/product-grid';
import { dataAdapter } from '@/lib/data';

interface CollectionPageProps {
  params: {
    slug: string;
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const collection = await dataAdapter.getCollection(params.slug);

  if (!collection) {
    notFound();
  }

  const allProducts = await dataAdapter.getProducts();
  const products = allProducts.filter(p => collection.product_ids.includes(p.id));

  return (
    <div className="min-h-screen">
      <div className="relative h-[300px] mb-12">
        <Image
          src={collection.image_url || 'https://images.pexels.com/photos/163185/old-retro-antique-vintage-163185.jpeg?auto=compress&cs=tinysrgb&w=1200'}
          alt={collection.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-fixnix-darkpurple via-fixnix-darkpurple/50 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {collection.name}
            </h1>
            {collection.description && (
              <p className="text-white/90 text-lg max-w-2xl">
                {collection.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16">
        <div className="mb-6">
          <p className="text-white/70">
            {products.length} {products.length === 1 ? 'product' : 'products'}
          </p>
        </div>

        <ProductGrid
          products={products}
          emptyMessage="No products in this collection yet"
        />
      </div>
    </div>
  );
}
