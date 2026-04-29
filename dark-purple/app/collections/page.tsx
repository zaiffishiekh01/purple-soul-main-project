import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { dataAdapter } from '@/lib/data';

export default async function CollectionsPage() {
  const collections = await dataAdapter.getCollections();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Curated Collections</h1>
        <p className="text-white/70 text-lg max-w-2xl">
          Explore our thoughtfully curated collections for special occasions, traditions, and spiritual practices.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((collection) => (
          <Link key={collection.id} href={`/collections/${collection.slug}`}>
            <Card className="group spiritual-card glass-card-hover overflow-hidden h-full">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={collection.image_url || 'https://images.pexels.com/photos/163185/old-retro-antique-vintage-163185.jpeg?auto=compress&cs=tinysrgb&w=800'}
                  alt={collection.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                  {collection.name}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-3">
                  {collection.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
