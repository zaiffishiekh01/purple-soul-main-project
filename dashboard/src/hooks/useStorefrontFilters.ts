import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface StorefrontFacetGroup {
  id: string;
  name: string;
  slug: string;
  display_order: number;
}

export interface StorefrontFacetValue {
  id: string;
  facet_group_id: string;
  name: string;
  slug: string;
  display_order: number;
}

export interface FacetWithValues extends StorefrontFacetGroup {
  values: StorefrontFacetValue[];
}

export function useStorefrontFilters(categoryId?: string | null) {
  const [facets, setFacets] = useState<FacetWithValues[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadFacets();
  }, [categoryId]);

  const loadFacets = async () => {
    try {
      setLoading(true);
      setError(null);

      let facetGroupIds: string[] = [];

      if (categoryId) {
        const { data: mappings, error: mappingsError } = await supabase
          .from('category_facets')
          .select('facet_group_id')
          .eq('category_id', categoryId);

        if (mappingsError) throw mappingsError;

        facetGroupIds = (mappings || []).map(m => m.facet_group_id);
      }

      let groupsQuery = supabase
        .from('facet_groups')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (facetGroupIds.length > 0) {
        groupsQuery = groupsQuery.in('id', facetGroupIds);
      }

      const { data: groups, error: groupsError } = await groupsQuery;

      if (groupsError) throw groupsError;

      if (!groups || groups.length === 0) {
        setFacets([]);
        return;
      }

      const groupIds = groups.map(g => g.id);

      const { data: values, error: valuesError } = await supabase
        .from('facet_values')
        .select('*')
        .in('facet_group_id', groupIds)
        .eq('is_active', true)
        .order('display_order');

      if (valuesError) throw valuesError;

      const facetsWithValues: FacetWithValues[] = groups.map(group => ({
        ...group,
        values: (values || []).filter(v => v.facet_group_id === group.id)
      }));

      setFacets(facetsWithValues);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load filters'));
    } finally {
      setLoading(false);
    }
  };

  return { facets, loading, error };
}

export async function getProductsByFilters(
  categoryId?: string | null,
  facetValueIds: string[] = [],
  limit: number = 50,
  offset: number = 0
) {
  let query = supabase
    .from('products')
    .select(`
      *,
      product_facets!inner(facet_value_id)
    `)
    .eq('status', 'active');

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  if (facetValueIds.length > 0) {
    query = query.in('product_facets.facet_value_id', facetValueIds);
  }

  query = query
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false });

  const { data, error, count } = await query;

  if (error) throw error;

  return { products: data || [], total: count || 0 };
}
