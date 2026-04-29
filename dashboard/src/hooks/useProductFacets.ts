import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface FacetGroup {
  id: string;
  name: string;
  slug: string;
  is_required: boolean;
}

export interface FacetValue {
  id: string;
  facet_group_id: string;
  name: string;
  slug: string;
  is_active: boolean;
}

export function useProductFacets(categoryId: string | null) {
  const [facetGroups, setFacetGroups] = useState<FacetGroup[]>([]);
  const [facetValues, setFacetValues] = useState<Record<string, FacetValue[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!categoryId) {
      setFacetGroups([]);
      setFacetValues({});
      return;
    }

    loadFacets();
  }, [categoryId]);

  const loadFacets = async () => {
    if (!categoryId) return;

    try {
      setLoading(true);
      setError(null);

      const { data: mappings, error: mappingsError } = await supabase
        .from('category_facets')
        .select(`
          facet_group_id,
          is_required,
          facet_group:facet_groups(id, name, slug, is_active)
        `)
        .eq('category_id', categoryId);

      if (mappingsError) throw mappingsError;

      const activeGroups = (mappings || [])
        .filter(m => (m.facet_group as any)?.is_active)
        .map(m => ({
          id: (m.facet_group as any).id,
          name: (m.facet_group as any).name,
          slug: (m.facet_group as any).slug,
          is_required: m.is_required
        }));

      setFacetGroups(activeGroups);

      if (activeGroups.length > 0) {
        const groupIds = activeGroups.map(g => g.id);

        const { data: values, error: valuesError } = await supabase
          .from('facet_values')
          .select('*')
          .in('facet_group_id', groupIds)
          .eq('is_active', true)
          .order('display_order');

        if (valuesError) throw valuesError;

        const valuesByGroup: Record<string, FacetValue[]> = {};
        (values || []).forEach(value => {
          if (!valuesByGroup[value.facet_group_id]) {
            valuesByGroup[value.facet_group_id] = [];
          }
          valuesByGroup[value.facet_group_id].push(value);
        });

        setFacetValues(valuesByGroup);
      } else {
        setFacetValues({});
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load facets'));
    } finally {
      setLoading(false);
    }
  };

  return { facetGroups, facetValues, loading, error };
}

export async function getProductFacets(productId: string) {
  const { data, error } = await supabase
    .from('product_facets')
    .select('facet_value_id')
    .eq('product_id', productId);

  if (error) throw error;

  return (data || []).map(pf => pf.facet_value_id);
}

export async function saveProductFacets(productId: string, facetValueIds: string[]) {
  await supabase
    .from('product_facets')
    .delete()
    .eq('product_id', productId);

  if (facetValueIds.length > 0) {
    const records = facetValueIds.map(fvId => ({
      product_id: productId,
      facet_value_id: fvId
    }));

    const { error } = await supabase
      .from('product_facets')
      .insert(records);

    if (error) throw error;
  }
}
