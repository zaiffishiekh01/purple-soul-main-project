import { useState, useEffect } from 'react';
import { dashboardClient } from '../lib/data-client';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  display_order: number;
  is_active: boolean;
  is_featured: boolean;
  featured_order: number;
  show_in_navigation: boolean;
  navigation_label: string;
  mega_menu_enabled: boolean;
  mega_menu_columns: number;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  url_slug_override: string;
  parent_id: string | null;
  level: number;
}

export function useNavigationSettings() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await dashboardClient
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;
      setCategories(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      const { error: updateError } = await dashboardClient
        .from('categories')
        .update(updates)
        .eq('id', id);

      if (updateError) throw updateError;
      await fetchCategories();
      return { success: true };
    } catch (err) {
      console.error('Error updating category:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Update failed' };
    }
  };

  const toggleFeatured = async (id: string, currentValue: boolean) => {
    return updateCategory(id, { is_featured: !currentValue });
  };

  const toggleNavigation = async (id: string, currentValue: boolean) => {
    return updateCategory(id, { show_in_navigation: !currentValue });
  };

  const toggleMegaMenu = async (id: string, currentValue: boolean) => {
    return updateCategory(id, { mega_menu_enabled: !currentValue });
  };

  const updateFeaturedOrder = async (id: string, order: number) => {
    return updateCategory(id, { featured_order: order });
  };

  const updateSEO = async (id: string, seoData: {
    seo_title?: string;
    seo_description?: string;
    seo_keywords?: string;
    url_slug_override?: string;
  }) => {
    return updateCategory(id, seoData);
  };

  const updateNavigationLabel = async (id: string, label: string) => {
    return updateCategory(id, { navigation_label: label });
  };

  const updateMegaMenuColumns = async (id: string, columns: number) => {
    return updateCategory(id, { mega_menu_columns: columns });
  };

  return {
    categories,
    loading,
    error,
    fetchCategories,
    toggleFeatured,
    toggleNavigation,
    toggleMegaMenu,
    updateFeaturedOrder,
    updateSEO,
    updateNavigationLabel,
    updateMegaMenuColumns,
  };
}
