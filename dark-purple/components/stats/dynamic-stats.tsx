'use client';

import { useEffect, useState, useRef } from 'react';

interface Stats {
  customers: number;
  products: number;
  countries: number;
}

function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function CountUpNumber({
  end,
  duration,
  isVisible
}: {
  end: number;
  duration: number;
  isVisible: boolean;
}) {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isVisible || hasAnimated.current) return;

    hasAnimated.current = true;
    const startValue = Math.floor(end * 0.7);
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOut(progress);
      const currentValue = Math.floor(startValue + (end - startValue) * easedProgress);

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return <>{formatNumber(count)}+</>;
}

export default function DynamicStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => {
        console.error('Failed to fetch stats:', err);
        setStats({
          customers: 2456,
          products: 3256,
          countries: 32
        });
      });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  if (!stats) {
    return (
      <div ref={sectionRef} className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div>
          <div className="text-4xl font-bold mb-2 gradient-text">Loading...</div>
          <div className="text-white/60 font-medium">Happy Customers</div>
        </div>
        <div>
          <div className="text-4xl font-bold mb-2 gradient-text">Loading...</div>
          <div className="text-white/60 font-medium">Authentic Products</div>
        </div>
        <div>
          <div className="text-4xl font-bold mb-2 gradient-text">Loading...</div>
          <div className="text-white/60 font-medium">Countries Served</div>
        </div>
      </div>
    );
  }

  return (
    <div ref={sectionRef} className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
      <div>
        <div className="text-4xl font-bold mb-2 gradient-text min-w-[120px] inline-block">
          <CountUpNumber end={stats.customers} duration={1200} isVisible={isVisible} />
        </div>
        <div className="text-white/60 font-medium">Happy Customers</div>
      </div>
      <div>
        <div className="text-4xl font-bold mb-2 gradient-text min-w-[120px] inline-block">
          <CountUpNumber end={stats.products} duration={1100} isVisible={isVisible} />
        </div>
        <div className="text-white/60 font-medium">Authentic Products</div>
      </div>
      <div>
        <div className="text-4xl font-bold mb-2 gradient-text min-w-[120px] inline-block">
          <CountUpNumber end={stats.countries} duration={900} isVisible={isVisible} />
        </div>
        <div className="text-white/60 font-medium">Countries Served</div>
      </div>
    </div>
  );
}
