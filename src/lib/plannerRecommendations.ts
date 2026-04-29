import { Product } from '../App';

export interface PlannerRecommendation {
  category: string;
  title: string;
  description: string;
  tags: string[];
  priority: 'essential' | 'recommended' | 'optional';
  quantity?: number;
}

export interface SmartPack {
  id: string;
  name: string;
  description: string;
  products: string[];
  totalPrice: number;
  savings: number;
  category: string;
}

export const getHajjRecommendations = (): PlannerRecommendation[] => [
  {
    category: 'Essential Items',
    title: 'Ihram Clothing',
    description: 'Required white seamless garments for the pilgrimage',
    tags: ['islamic', 'pilgrimage', 'journey-before', 'tradition-islamic'],
    priority: 'essential',
    quantity: 2
  },
  {
    category: 'Essential Items',
    title: 'Travel Prayer Mat',
    description: 'Portable prayer mat for the journey',
    tags: ['islamic', 'pilgrimage', 'journey-during', 'tradition-islamic', 'prayer-reflection'],
    priority: 'essential',
    quantity: 1
  },
  {
    category: 'Essential Items',
    title: 'Hajj & Umrah Guide',
    description: 'Comprehensive guide with duas and rituals',
    tags: ['islamic', 'pilgrimage', 'journey-before', 'journey-during', 'tradition-islamic'],
    priority: 'essential',
    quantity: 1
  },
  {
    category: 'Essential Items',
    title: 'Zamzam Water Bottle',
    description: 'Special container for blessed Zamzam water',
    tags: ['islamic', 'pilgrimage', 'journey-during', 'tradition-islamic'],
    priority: 'essential',
    quantity: 1
  },
  {
    category: 'Comfort & Convenience',
    title: 'Pilgrimage Backpack',
    description: 'Lightweight, organized backpack for the journey',
    tags: ['shared', 'pilgrimage', 'journey-during', 'tradition-shared', 'travel-friendly'],
    priority: 'recommended',
    quantity: 1
  },
  {
    category: 'Comfort & Convenience',
    title: 'Unscented Toiletries Kit',
    description: 'Ihram-compliant hygiene products',
    tags: ['islamic', 'pilgrimage', 'journey-during', 'tradition-islamic'],
    priority: 'recommended',
    quantity: 1
  },
  {
    category: 'Spiritual Items',
    title: 'Prayer Beads (Tasbih)',
    description: 'For dhikr and spiritual reflection',
    tags: ['islamic', 'prayer-reflection'],
    priority: 'optional',
    quantity: 1
  }
];

export const getUmrahRecommendations = (): PlannerRecommendation[] => [
  {
    category: 'Essential Items',
    title: 'Ihram Clothing',
    description: 'Required white seamless garments',
    tags: ['islamic', 'pilgrimage', 'journey-before', 'tradition-islamic'],
    priority: 'essential',
    quantity: 2
  },
  {
    category: 'Essential Items',
    title: 'Travel Prayer Mat',
    description: 'Portable prayer mat',
    tags: ['islamic', 'pilgrimage', 'journey-during', 'tradition-islamic', 'prayer-reflection'],
    priority: 'essential',
    quantity: 1
  },
  {
    category: 'Essential Items',
    title: 'Umrah Guide Book',
    description: 'Step-by-step guide with duas',
    tags: ['islamic', 'pilgrimage', 'journey-before', 'journey-during', 'tradition-islamic'],
    priority: 'essential',
    quantity: 1
  },
  {
    category: 'Recommended Items',
    title: 'Pilgrimage Backpack',
    description: 'Organized backpack for comfort',
    tags: ['shared', 'pilgrimage', 'journey-during', 'tradition-shared', 'travel-friendly'],
    priority: 'recommended',
    quantity: 1
  }
];

export const getChristianPilgrimageRecommendations = (): PlannerRecommendation[] => [
  {
    category: 'Essential Items',
    title: 'Olive Wood Rosary',
    description: 'Hand-carved rosary from the Holy Land',
    tags: ['christian', 'pilgrimage', 'tradition-christian', 'prayer-reflection', 'wood'],
    priority: 'essential',
    quantity: 1
  },
  {
    category: 'Essential Items',
    title: 'Holy Land Guidebook',
    description: 'Detailed guide to biblical sites',
    tags: ['christian', 'jewish', 'pilgrimage', 'journey-before', 'tradition-christian', 'tradition-jewish'],
    priority: 'essential',
    quantity: 1
  },
  {
    category: 'Recommended Items',
    title: 'Portable Communion Kit',
    description: 'Travel communion set',
    tags: ['christian', 'pilgrimage', 'journey-during', 'tradition-christian'],
    priority: 'recommended',
    quantity: 1
  },
  {
    category: 'Recommended Items',
    title: 'Pilgrim Medallion',
    description: 'Commemorative pilgrimage medallion',
    tags: ['christian', 'pilgrimage', 'tradition-christian', 'brass'],
    priority: 'recommended',
    quantity: 1
  }
];

export const getJewishPilgrimageRecommendations = (): PlannerRecommendation[] => [
  {
    category: 'Essential Items',
    title: 'Travel Prayer Book',
    description: 'Compact siddur for the journey',
    tags: ['jewish', 'pilgrimage', 'tradition-jewish', 'travel-friendly', 'prayer-reflection'],
    priority: 'essential',
    quantity: 1
  },
  {
    category: 'Essential Items',
    title: 'Jerusalem Guidebook',
    description: 'Complete guide to holy sites',
    tags: ['christian', 'jewish', 'pilgrimage', 'journey-before', 'tradition-jewish'],
    priority: 'essential',
    quantity: 1
  },
  {
    category: 'Recommended Items',
    title: 'Tefillin Bag',
    description: 'Handcrafted leather tefillin bag',
    tags: ['jewish', 'pilgrimage', 'tradition-jewish', 'travel-friendly', 'leather', 'artisan-heritage'],
    priority: 'recommended',
    quantity: 1
  }
];

export const getUniversalPilgrimageRecommendations = (): PlannerRecommendation[] => [
  {
    category: 'Essential Items',
    title: 'Interfaith Devotional Kit',
    description: 'Multi-faith prayer and reflection items',
    tags: ['shared', 'pilgrimage', 'journey-before', 'tradition-shared', 'travel-friendly'],
    priority: 'essential',
    quantity: 1
  },
  {
    category: 'Essential Items',
    title: 'Pilgrimage Backpack',
    description: 'Organized travel backpack',
    tags: ['shared', 'pilgrimage', 'journey-during', 'tradition-shared', 'travel-friendly'],
    priority: 'essential',
    quantity: 1
  },
  {
    category: 'Recommended Items',
    title: 'Holy Land Guidebook',
    description: 'Comprehensive interfaith guide',
    tags: ['christian', 'jewish', 'pilgrimage', 'journey-before', 'tradition-shared'],
    priority: 'recommended',
    quantity: 1
  }
];

export function matchProductsToRecommendations(
  recommendations: PlannerRecommendation[],
  products: Product[]
): Array<{ recommendation: PlannerRecommendation; products: Product[] }> {
  return recommendations.map(rec => {
    const matchedProducts = products.filter(product =>
      rec.tags.some(tag => product.tags.includes(tag))
    ).sort((a, b) => b.rating - a.rating);

    return {
      recommendation: rec,
      products: matchedProducts
    };
  });
}

export function createSmartPacks(products: Product[], type: 'hajj' | 'umrah' | 'christian' | 'jewish' | 'universal'): SmartPack[] {
  const packs: SmartPack[] = [];

  if (type === 'hajj') {
    const ihram = products.find(p => p.tags.includes('pilgrimage') && p.name.toLowerCase().includes('ihram'));
    const prayerMat = products.find(p => p.tags.includes('pilgrimage') && p.tags.includes('prayer-reflection') && p.category === 'textiles');
    const guide = products.find(p => p.tags.includes('pilgrimage') && p.tags.includes('journey-before') && p.name.toLowerCase().includes('guide'));
    const backpack = products.find(p => p.tags.includes('pilgrimage') && p.tags.includes('journey-during') && p.name.toLowerCase().includes('backpack'));

    if (ihram && prayerMat && guide && backpack) {
      const total = ihram.price + prayerMat.price + guide.price + backpack.price;
      packs.push({
        id: 'hajj-essentials',
        name: 'Hajj Essentials Bundle',
        description: 'Everything you need for your sacred journey to Makkah',
        products: [ihram.id, prayerMat.id, guide.id, backpack.id],
        totalPrice: Math.round(total * 0.85),
        savings: Math.round(total * 0.15),
        category: 'hajj'
      });
    }
  }

  if (type === 'umrah') {
    const ihram = products.find(p => p.tags.includes('pilgrimage') && p.name.toLowerCase().includes('ihram'));
    const prayerMat = products.find(p => p.tags.includes('pilgrimage') && p.tags.includes('prayer-reflection'));
    const guide = products.find(p => p.tags.includes('pilgrimage') && p.name.toLowerCase().includes('umrah'));

    if (ihram && prayerMat && guide) {
      const total = ihram.price + prayerMat.price + guide.price;
      packs.push({
        id: 'umrah-essentials',
        name: 'Umrah Essentials Bundle',
        description: 'Complete package for your blessed Umrah journey',
        products: [ihram.id, prayerMat.id, guide.id],
        totalPrice: Math.round(total * 0.85),
        savings: Math.round(total * 0.15),
        category: 'umrah'
      });
    }
  }

  if (type === 'christian') {
    const rosary = products.find(p => p.tags.includes('christian') && p.tags.includes('pilgrimage') && p.name.toLowerCase().includes('rosary'));
    const guide = products.find(p => p.tags.includes('christian') && p.tags.includes('pilgrimage') && p.name.toLowerCase().includes('guide'));

    if (rosary && guide) {
      const total = rosary.price + guide.price;
      packs.push({
        id: 'christian-essentials',
        name: 'Holy Land Pilgrim Bundle',
        description: 'Essential items for your Christian pilgrimage',
        products: [rosary.id, guide.id],
        totalPrice: Math.round(total * 0.9),
        savings: Math.round(total * 0.1),
        category: 'christian'
      });
    }
  }

  return packs;
}
