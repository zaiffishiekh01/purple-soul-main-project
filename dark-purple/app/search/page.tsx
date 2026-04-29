import { createClient } from '@/lib/supabase/client';
import { SearchClient } from './search-client';

export const revalidate = 3600;

async function getInitialData(query?: string) {
  const supabase = createClient();

  let searchQuery = supabase
    .from('products')
    .select('*')
    .eq('is_active', true);

  if (query) {
    searchQuery = searchQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
  }

  const { data } = await searchQuery.order('created_at', { ascending: false }).limit(50);
  return data || [];
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const products = await getInitialData(searchParams.q);

  return <SearchClient initialProducts={products} initialQuery={searchParams.q || ''} />;
}
