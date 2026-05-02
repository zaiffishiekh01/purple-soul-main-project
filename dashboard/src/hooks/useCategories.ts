import { useState, useEffect } from 'react';
import { dashboardClient } from '../lib/data-client';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  display_order: number;
  is_active: boolean;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export function useCategories(activeOnly = true) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, [activeOnly]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = dashboardClient
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshCategories = () => {
    fetchCategories();
  };

  return {
    categories,
    loading,
    error,
    refreshCategories,
  };
}

export function useCategoryNames(activeOnly = true): string[] {
  const { categories } = useCategories(activeOnly);
  return categories.map(cat => cat.name);
}
