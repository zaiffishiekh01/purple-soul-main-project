'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';

interface PopularSearch {
  query_text: string;
  search_count: number;
}

export function PopularSearches() {
  const [searches, setSearches] = useState<PopularSearch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPopularSearches();
  }, []);

  const fetchPopularSearches = async () => {
    try {
      const response = await fetch('/api/search/popular');
      const data = await response.json();
      setSearches(data.popularSearches || []);
    } catch (error) {
      console.error('Error fetching popular searches:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || searches.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="h-4 w-4" />
        <h3 className="text-sm font-medium">Popular Searches</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {searches.slice(0, 8).map((search) => (
          <Badge
            key={search.query_text}
            variant="secondary"
            className="cursor-pointer hover:bg-secondary/80"
            onClick={() => {
              const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
              if (searchInput) {
                searchInput.value = search.query_text;
                const form = searchInput.closest('form');
                if (form) form.requestSubmit();
              }
            }}
          >
            {search.query_text}
          </Badge>
        ))}
      </div>
    </div>
  );
}
