'use client';

import { ProductEditor } from '@/components/vendor/product-editor';

export default function EditProductPage({ params }: { params: { productId: string } }) {
  return <ProductEditor mode="edit" productId={params.productId} />;
}
