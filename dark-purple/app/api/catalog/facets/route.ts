import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

const EXTERNAL_CATALOG_URL = process.env.NEXT_PUBLIC_CATALOG_API_BASE_URL;

/**
 * GET /api/catalog/facets
 *
 * Returns dynamic facets (filters) for a specific category.
 * Required query param: category (slug)
 *
 * Fetches from external Admin Dashboard as the source of truth.
 * Falls back to local generation if external API is unavailable.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categorySlug = searchParams.get('category');

  if (!categorySlug) {
    return NextResponse.json(
      { error: 'Category parameter is required' },
      { status: 400 }
    );
  }

  if (EXTERNAL_CATALOG_URL) {
    try {
      const response = await fetch(
        `${EXTERNAL_CATALOG_URL}/api/catalog/facets?category=${categorySlug}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        }
      );

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }

      console.warn('External catalog API returned non-OK status:', response.status);
    } catch (error) {
      console.warn('Failed to fetch from external catalog API, using local fallback:', error);
    }
  }

  try {
    const supabase = createClient();

    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .maybeSingle();

    if (categoryError) throw categoryError;
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('price, materials, origin_country, is_handcrafted, is_ethically_sourced, has_spiritual_significance')
      .eq('category_id', category.id);

    if (productsError) throw productsError;

    const facets = [];

    if (products && products.length > 0) {
      const prices = products.map(p => p.price).filter(Boolean);
      if (prices.length > 0) {
        facets.push({
          id: 'price',
          name: 'Price Range',
          type: 'range',
          min: Math.min(...prices),
          max: Math.max(...prices)
        });
      }

      const materials = new Set<string>();
      products.forEach(p => {
        if (Array.isArray(p.materials)) {
          p.materials.forEach(m => materials.add(m));
        }
      });
      if (materials.size > 0) {
        facets.push({
          id: 'materials',
          name: 'Materials',
          type: 'multiselect',
          options: Array.from(materials).map(m => ({
            value: m,
            label: m,
            count: products.filter(p => Array.isArray(p.materials) && p.materials.includes(m)).length
          }))
        });
      }

      const countries = new Set<string>();
      products.forEach(p => {
        if (p.origin_country) countries.add(p.origin_country);
      });
      if (countries.size > 0) {
        facets.push({
          id: 'origin_country',
          name: 'Origin Country',
          type: 'multiselect',
          options: Array.from(countries).map(c => ({
            value: c,
            label: c,
            count: products.filter(p => p.origin_country === c).length
          }))
        });
      }

      const handcraftedCount = products.filter(p => p.is_handcrafted).length;
      if (handcraftedCount > 0) {
        facets.push({
          id: 'is_handcrafted',
          name: 'Handcrafted',
          type: 'boolean'
        });
      }

      const ethicalCount = products.filter(p => p.is_ethically_sourced).length;
      if (ethicalCount > 0) {
        facets.push({
          id: 'is_ethically_sourced',
          name: 'Ethically Sourced',
          type: 'boolean'
        });
      }

      const spiritualCount = products.filter(p => p.has_spiritual_significance).length;
      if (spiritualCount > 0) {
        facets.push({
          id: 'has_spiritual_significance',
          name: 'Spiritual Significance',
          type: 'boolean'
        });
      }
    }

    return NextResponse.json(facets);
  } catch (error) {
    console.error('Error fetching facets from fallback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch facets' },
      { status: 500 }
    );
  }
}
