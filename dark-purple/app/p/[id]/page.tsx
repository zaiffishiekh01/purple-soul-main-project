import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ProductClient } from './product-client';

interface ProductPageProps {
  params: {
    id: string;
  };
}

export const revalidate = 3600;

async function getProduct(id: string) {
  const supabase = createClient();

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !product) {
    return null;
  }

  let relatedProducts: any[] = [];
  if (product.layer1_category_slug) {
    const { data: related } = await supabase
      .from('products')
      .select('*')
      .eq('layer1_category_slug', product.layer1_category_slug)
      .neq('id', id)
      .limit(4);

    if (related) {
      relatedProducts = related;
    }
  }

  return { product, relatedProducts };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const data = await getProduct(params.id);

  if (!data) {
    notFound();
  }

  return <ProductClient product={data.product} relatedProducts={data.relatedProducts} />;
}
