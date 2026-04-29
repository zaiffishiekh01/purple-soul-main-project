import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { DynamicHero } from '@/components/layout/dynamic-hero';

export const revalidate = 3600;

async function getData() {
  const supabase = createClient();

  const [productsRes, collectionsRes] = await Promise.all([
    supabase.from('products').select('*').eq('is_active', true).limit(4),
    supabase.from('collections').select('*').eq('is_active', true).limit(4)
  ]);

  return {
    products: productsRes.data || [],
    collections: collectionsRes.data || []
  };
}

export default async function HomePage() {
  const { products, collections } = await getData();
  const featuredCollections = collections.slice(0, 4);

  const purposeCategories = [
    { name: 'Prayer &\nRemembrance', slug: 'prayer-remembrance' },
    { name: 'Sacred Space\n& Home', slug: 'sacred-space-home' },
    { name: 'Learning &\nScripture', slug: 'learning-scripture' },
    { name: 'Rituals &\nLife Moments', slug: 'rituals-life-moments' },
    { name: 'Reflection &\nInner Work', slug: 'reflection-inner-work' },
    { name: 'Apparel &\nPersonal Expression', slug: 'apparel-personal-expression' },
    { name: 'Sacred Art &\nAesthetics', slug: 'sacred-art-aesthetics' },
    { name: 'Music, Sound\n& Silence', slug: 'music-sound-silence' },
    { name: 'Gifts &\nCollections', slug: 'gifts-collections' },
    { name: 'Digital & Media\nResources', slug: 'digital-media-resources' },
  ];

  const subCategories = [
    { name: 'Prayer Beads &\nCounters', href: '/c/prayer-remembrance/prayer-beads-counters' },
    { name: 'Sacred\nLighting', href: '/c/sacred-space-home/sacred-lighting' },
    { name: 'Journals & Study\nNotebooks', href: '/c/learning-scripture/journals-study-notebooks' },
    { name: 'New\nHome', href: '/c/rituals-life-moments/new-home' },
    { name: 'Meditation &\nContemplation', href: '/c/reflection-inner-work/meditation-contemplation-tools' },
    { name: 'Scarves &\nShawls', href: '/c/apparel-personal-expression/scarves-shawls' },
  ];

  const traditions = [
    { name: 'Islamic\nTradition', slug: 'islamic' },
    { name: 'Christian\nTradition', slug: 'christian' },
    { name: 'Jewish\nTradition', slug: 'jewish' },
    { name: 'Abrahamic\nShared Practices', slug: 'interfaith' },
  ];

  return (
    <div className="relative min-h-screen">
      <DynamicHero />

      <section id="purpose-section" className="py-20 px-4 relative z-10">
        <div className="container mx-auto">
          <div className="ethereal-divider mb-12"></div>
          <h2 className="section-title font-serif text-center text-white mb-16 tracking-wide">
            Explore by Purpose
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-5 mb-10 max-w-7xl mx-auto">
            {purposeCategories.map((cat) => (
              <Link key={cat.slug} href={`/c/${cat.slug}`}>
                <div className="glass-card glass-card-hover p-8 text-center min-h-[140px] flex items-center justify-center group cursor-pointer">
                  <h3 className="text-white/90 font-light text-lg whitespace-pre-line group-hover:text-white transition-colors leading-relaxed">
                    {cat.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 max-w-7xl mx-auto">
            {subCategories.map((sub) => (
              <Link key={sub.name} href={sub.href}>
                <button className="w-full px-5 py-3 rounded-lg bg-white/5 border border-white/20 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300 text-sm min-h-[60px] flex items-center justify-center whitespace-pre-line text-center leading-snug">
                  {sub.name}
                </button>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="tradition-section" className="py-20 px-4 relative z-10">
        <div className="container mx-auto">
          <div className="ethereal-divider mb-12"></div>
          <h2 className="section-title font-serif text-center text-white mb-16 tracking-wide">
            Explore by Tradition
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {traditions.map((trad) => (
              <Link key={trad.slug} href={`/search?tradition=${trad.slug}`}>
                <div className="glass-card glass-card-hover p-10 text-center min-h-[160px] flex items-center justify-center group cursor-pointer">
                  <h3 className="text-white/90 font-light text-xl whitespace-pre-line group-hover:text-white transition-colors leading-relaxed">
                    {trad.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 relative z-10">
        <div className="container mx-auto">
          <div className="ethereal-divider mb-12"></div>
          <h2 className="section-title font-serif text-center text-white mb-16 tracking-wide">
            Curated Collections
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {featuredCollections.map((collection) => (
              <Link key={collection.id} href={`/collections/${collection.slug}`}>
                <div className="product-card overflow-hidden">
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={collection.image_url || 'https://images.pexels.com/photos/4188303/pexels-photo-4188303.jpeg'}
                      alt={collection.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                  <div className="p-5 text-center">
                    <h3 className="text-white/95 font-medium mb-2 text-base">{collection.name}</h3>
                    <p className="text-white/50 text-xs leading-relaxed line-clamp-2">{collection.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 relative z-10">
        <div className="container mx-auto">
          <div className="ethereal-divider mb-12"></div>
          <h2 className="section-title font-serif text-center text-white mb-16 tracking-wide">
            Featured Selections
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {products.map((product) => (
              <Link key={product.id} href={`/p/${product.id}`}>
                <div className="product-card overflow-hidden">
                  <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-purple-900/10 to-transparent">
                    <Image
                      src={product.images[0] || 'https://images.pexels.com/photos/4188303/pexels-photo-4188303.jpeg'}
                      alt={product.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                  <div className="p-5 text-center">
                    <h3 className="text-white/95 font-light mb-3 line-clamp-2 text-base leading-snug">{product.title}</h3>
                    <p className="text-rose-gold font-medium text-lg">${product.price}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-t border-white/10 relative z-10 mt-12">
        <div className="container mx-auto">
          <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-center text-white/60 text-sm">
            <div className="flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="opacity-70">
                <path d="M10 2L3 7V13L10 18L17 13V7L10 2Z" stroke="currentColor" strokeWidth="1.2" fill="none" />
                <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.2" fill="none" />
              </svg>
              <span className="font-light">Curated with Spiritual Care</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white/30">·</span>
              <span className="font-light">Respect for All Abrahamic Traditions</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white/30">·</span>
              <span className="font-light">Ethical Fulfillment & Secure Checkout</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
