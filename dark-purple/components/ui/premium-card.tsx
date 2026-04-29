'use client';

import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface PremiumCardProps {
  href?: string;
  image?: string;
  imageAlt?: string;
  badge?: string;
  title: string;
  subtitle?: string;
  description?: string;
  meta?: string;
  price?: string | number;
  accentColor?: 'rose-gold' | 'amber' | 'teal' | 'sky' | 'sage';
  size?: 'sm' | 'md' | 'lg';
  aspectRatio?: 'square' | 'portrait' | 'landscape' | 'video';
  children?: React.ReactNode;
  className?: string;
  imageClassName?: string;
  onClick?: () => void;
  footer?: React.ReactNode;
  topLeft?: React.ReactNode;
  topRight?: React.ReactNode;
  bottomLeft?: React.ReactNode;
  bottomRight?: React.ReactNode;
  disabled?: boolean;
  'aria-label'?: string;
}

const accentMap = {
  'rose-gold': {
    glow: 'rgba(212,175,138,0.35)',
    border: 'rgba(212,175,138,0.5)',
    badge: 'bg-[rgba(212,175,138,0.15)] text-[#d4af8a] border-[rgba(212,175,138,0.3)]',
    price: 'text-[#d4af8a]',
  },
  amber: {
    glow: 'rgba(251,191,36,0.3)',
    border: 'rgba(251,191,36,0.45)',
    badge: 'bg-amber-500/10 text-amber-300 border-amber-400/30',
    price: 'text-amber-300',
  },
  teal: {
    glow: 'rgba(20,184,166,0.3)',
    border: 'rgba(20,184,166,0.45)',
    badge: 'bg-teal-500/10 text-teal-300 border-teal-400/30',
    price: 'text-teal-300',
  },
  sky: {
    glow: 'rgba(56,189,248,0.3)',
    border: 'rgba(56,189,248,0.45)',
    badge: 'bg-sky-500/10 text-sky-300 border-sky-400/30',
    price: 'text-sky-300',
  },
  sage: {
    glow: 'rgba(134,187,126,0.3)',
    border: 'rgba(134,187,126,0.45)',
    badge: 'bg-green-500/10 text-green-300 border-green-400/30',
    price: 'text-green-300',
  },
};

const aspectMap = {
  square: 'aspect-square',
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-[4/3]',
  video: 'aspect-video',
};

const sizeMap = {
  sm: 'rounded-xl',
  md: 'rounded-2xl',
  lg: 'rounded-3xl',
};

export function PremiumCard({
  href,
  image,
  imageAlt = '',
  badge,
  title,
  subtitle,
  description,
  meta,
  price,
  accentColor = 'rose-gold',
  size = 'md',
  aspectRatio = 'portrait',
  children,
  className,
  imageClassName,
  onClick,
  footer,
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
  disabled = false,
  'aria-label': ariaLabel,
}: PremiumCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const accent = accentMap[accentColor];
  const roundedClass = sizeMap[size];

  const cardContent = (
    <motion.div
      ref={cardRef}
      role={href || onClick ? 'button' : undefined}
      tabIndex={href || onClick ? 0 : undefined}
      aria-label={ariaLabel || title}
      aria-disabled={disabled}
      onHoverStart={() => !disabled && setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onFocus={() => !disabled && setHovered(true)}
      onBlur={() => setHovered(false)}
      onClick={!disabled ? onClick : undefined}
      whileHover={
        disabled
          ? {}
          : {
              y: -8,
              scale: 1.025,
              transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
            }
      }
      animate={{
        boxShadow: hovered
          ? `0 24px 60px rgba(0,0,0,0.55), 0 0 40px ${accent.glow}, inset 0 1px 0 rgba(255,255,255,0.12)`
          : `0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.07)`,
        borderColor: hovered ? accent.border : 'rgba(255,255,255,0.1)',
      }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'premium-card relative overflow-hidden cursor-pointer',
        'bg-[rgba(30,20,50,0.6)] backdrop-blur-xl',
        'border border-white/10',
        'will-change-transform',
        roundedClass,
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {/* Image Section */}
      {image && (
        <div className={cn('relative overflow-hidden', aspectMap[aspectRatio])}>
          <motion.div
            className="absolute inset-0"
            animate={{ scale: hovered ? 1.06 : 1 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Image
              src={image}
              alt={imageAlt || title}
              fill
              className={cn('object-cover', imageClassName)}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </motion.div>

          {/* Overlay gradient */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
            animate={{ opacity: hovered ? 0.8 : 0.5 }}
            transition={{ duration: 0.35 }}
          />

          {/* Accent border glow on top edge */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-px"
            animate={{
              background: hovered
                ? `linear-gradient(to right, transparent, ${accent.glow}, transparent)`
                : 'transparent',
              opacity: hovered ? 1 : 0,
            }}
            transition={{ duration: 0.4 }}
          />

          {/* Overlay slots */}
          {topLeft && (
            <motion.div
              className="absolute top-3 left-3 z-10"
              animate={{ y: hovered ? -1 : 0, opacity: hovered ? 1 : 0.85 }}
              transition={{ duration: 0.3 }}
            >
              {topLeft}
            </motion.div>
          )}
          {topRight && (
            <motion.div
              className="absolute top-3 right-3 z-10"
              animate={{ y: hovered ? -1 : 0, opacity: hovered ? 1 : 0.85 }}
              transition={{ duration: 0.3 }}
            >
              {topRight}
            </motion.div>
          )}
          {bottomLeft && (
            <div className="absolute bottom-3 left-3 z-10">{bottomLeft}</div>
          )}
          {bottomRight && (
            <div className="absolute bottom-3 right-3 z-10">{bottomRight}</div>
          )}

          {/* Badge */}
          {badge && (
            <motion.div
              className="absolute top-3 left-3 z-10"
              animate={{ y: hovered ? -2 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <span
                className={cn(
                  'text-[10px] font-medium px-2.5 py-1 rounded-full border backdrop-blur-sm',
                  accent.badge
                )}
              >
                {badge}
              </span>
            </motion.div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        {/* Badge (no image) */}
        {badge && !image && (
          <span
            className={cn(
              'inline-block text-[10px] font-medium px-2.5 py-1 rounded-full border mb-3',
              accent.badge
            )}
          >
            {badge}
          </span>
        )}

        {/* Meta */}
        {meta && (
          <p className="text-[11px] text-white/40 uppercase tracking-widest mb-1.5 font-medium">
            {meta}
          </p>
        )}

        {/* Title */}
        <motion.h3
          className="text-white/95 font-light text-base leading-snug mb-1.5 line-clamp-2"
          animate={{ y: hovered ? -1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 400 }}
        >
          {title}
        </motion.h3>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-white/55 text-sm font-light mb-2 line-clamp-1">
            {subtitle}
          </p>
        )}

        {/* Description */}
        {description && (
          <p className="text-white/45 text-xs leading-relaxed line-clamp-2 mb-3">
            {description}
          </p>
        )}

        {/* Custom children */}
        {children}

        {/* Price */}
        {price !== undefined && (
          <motion.p
            className={cn('font-medium text-lg mt-3', accent.price)}
            animate={{ opacity: hovered ? 1 : 0.9 }}
            transition={{ duration: 0.3 }}
          >
            {typeof price === 'number' ? `$${price.toFixed(2)}` : price}
          </motion.p>
        )}
      </div>

      {/* Footer */}
      {footer && (
        <div className="px-5 pb-5 pt-0 border-t border-white/5 mt-auto">
          {footer}
        </div>
      )}

      {/* Bottom shimmer line on hover */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px"
        animate={{
          scaleX: hovered ? 1 : 0,
          background: `linear-gradient(to right, transparent, ${accent.border}, transparent)`,
        }}
        initial={{ scaleX: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
    </motion.div>
  );

  if (href) {
    return (
      <Link href={href} className="block outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded-2xl">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
