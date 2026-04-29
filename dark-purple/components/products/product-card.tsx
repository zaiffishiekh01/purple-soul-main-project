'use client';

import { Product } from '@/types';
import {
  getTraditionScope,
  getPurposeText,
  getQualityBadge,
  getPracticalBadge,
} from '@/lib/badge-utils';
import { PremiumCard } from '@/components/ui/premium-card';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const mainImage =
    product.images[0] ||
    'https://images.pexels.com/photos/163185/old-retro-antique-vintage-163185.jpeg?auto=compress&cs=tinysrgb&w=400';

  const traditionScope = getTraditionScope(product.traditions);
  const purposeText = getPurposeText(product.purposes);
  const qualityBadge = getQualityBadge(
    (product as any).craft_badges,
    (product as any).experience_badges
  );
  const practicalBadge = getPracticalBadge((product as any).practical_badges);

  return (
    <PremiumCard
      href={`/p/${product.id}`}
      image={mainImage}
      imageAlt={product.title}
      title={product.title}
      price={product.price}
      accentColor="rose-gold"
      aspectRatio="square"
      topLeft={
        traditionScope ? (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-sm text-white/60 border border-white/10">
            {traditionScope}
          </span>
        ) : undefined
      }
      topRight={undefined}
      bottomLeft={
        (product as any).origin ? (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-sm text-white/50 border border-white/10">
            {(product as any).origin}
          </span>
        ) : undefined
      }
      bottomRight={
        practicalBadge ? (
          <span className="text-base" title={practicalBadge.label}>
            {practicalBadge.icon}
          </span>
        ) : undefined
      }
    >
      {purposeText && (
        <p className="text-xs text-white/50 mb-2 font-light tracking-wide">
          {purposeText}
        </p>
      )}
      {qualityBadge && (
        <div className="mb-1">
          <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/40 border border-white/10">
            {qualityBadge}
          </span>
        </div>
      )}
    </PremiumCard>
  );
}
