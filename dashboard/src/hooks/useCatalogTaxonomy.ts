import { useState, useEffect } from 'react';
import { dashboardClient } from '../lib/data-client';

export interface TaxonomyCategory {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  icon: string;
  level: number;
  is_active: boolean;
  children?: TaxonomyCategory[];
}

export function useCatalogTaxonomy() {
  const [categories, setCategories] = useState<TaxonomyCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await dashboardClient
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;

      const tree = buildTree(data || []);
      setCategories(tree);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load categories'));
    } finally {
      setLoading(false);
    }
  };

  const buildTree = (flatList: TaxonomyCategory[]): TaxonomyCategory[] => {
    const map = new Map<string, TaxonomyCategory>();
    const roots: TaxonomyCategory[] = [];

    flatList.forEach(cat => {
      map.set(cat.id, { ...cat, children: [] });
    });

    flatList.forEach(cat => {
      const node = map.get(cat.id)!;
      if (cat.parent_id) {
        const parent = map.get(cat.parent_id);
        if (parent) {
          parent.children!.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  return { categories, loading, error };
}

export function useFlatCatalogTaxonomy() {
  const [categories, setCategories] = useState<TaxonomyCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await dashboardClient
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('level', { ascending: true })
        .order('display_order');

      if (error) throw error;

      setCategories(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load categories'));
    } finally {
      setLoading(false);
    }
  };

  return { categories, loading, error };
}
