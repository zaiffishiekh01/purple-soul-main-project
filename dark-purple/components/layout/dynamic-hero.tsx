'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface HeroState {
  id: string;
  subline: string;
}

const HERO_STATES: HeroState[] = [
  {
    id: 'abrahamic',
    subline: 'Handcrafted forms of devotion, remembrance, and inner discipline across Abrahamic traditions'
  },
  {
    id: 'christian',
    subline: 'Handcrafted forms of devotion, remembrance, and contemplative Christian spiritual life.'
  },
  {
    id: 'jewish',
    subline: 'Handcrafted forms of devotion, remembrance, and sacred kavannah within Jewish tradition'
  },
  {
    id: 'muslim',
    subline: 'Handcrafted forms of devotion, remembrance, and ihsan along the Islamic spiritual path'
  },
  {
    id: 'shared',
    subline: 'Handcrafted forms of devotion, remembrance, and inward refinement shared across faiths'
  }
];

const ROTATION_INTERVAL = 7000;
const TRANSITION_DURATION = 800;

export function DynamicHero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_STATES.length);
    }, ROTATION_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused, prefersReducedMotion]);

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);
  const handleFocus = () => setIsPaused(true);
  const handleBlur = () => setIsPaused(false);

  return (
    <section
      className="relative py-32 px-4 overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <div className="container mx-auto relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="hero-text font-serif text-white mb-8 leading-tight soft-glow">
            Purple Soul Collective by DKC
          </h1>

          <div className="relative h-16 mb-12">
            {HERO_STATES.map((state, index) => (
              <div
                key={state.id}
                className="absolute inset-0 flex items-center justify-center transition-opacity duration-[800ms] ease-in-out"
                style={{
                  opacity: currentIndex === index ? 1 : 0,
                  pointerEvents: currentIndex === index ? 'auto' : 'none'
                }}
              >
                <p className="text-xl text-white/80 tracking-wide px-4">
                  {state.subline}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="#purpose-section">
              <button
                className="w-full sm:w-auto px-8 py-4 rounded-lg bg-white/10 border border-white/30 text-white hover:bg-white/20 hover:border-white/40 transition-all duration-300 font-light tracking-wide text-base backdrop-blur-sm"
                aria-label="Explore products by spiritual purpose"
              >
                Explore by Purpose
              </button>
            </Link>
            <Link href="#tradition-section">
              <button
                className="w-full sm:w-auto px-8 py-4 rounded-lg bg-white/10 border border-white/30 text-white hover:bg-white/20 hover:border-white/40 transition-all duration-300 font-light tracking-wide text-base backdrop-blur-sm"
                aria-label="Explore products by religious tradition"
              >
                Explore by Tradition
              </button>
            </Link>
          </div>

          {!prefersReducedMotion && (
            <div className="flex justify-center gap-2 mt-8" role="presentation" aria-hidden="true">
              {HERO_STATES.map((_, index) => (
                <div
                  key={index}
                  className="h-1 w-8 rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: currentIndex === index ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.15)'
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
