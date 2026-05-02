import { useCallback, useContext, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardClient } from '../lib/data-client';
import { dashboardKeys } from '../lib/dashboard-query-keys';
import { Product } from '../types';
import { VendorContext } from '../contexts/VendorContext';
import { useAuth } from '../contexts/AuthContext';

async function fetchProductsList(opts: { isAdmin: boolean; vendorId: string | null }) {
  let query = dashboardClient.from('products').select('*');
  if (!opts.isAdmin && opts.vendorId) {
    query = query.eq('vendor_id', opts.vendorId);
  }
  query = query.order('created_at', { ascending: false });
  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as Product[];
}

export function useProducts() {
  const vendorContext = useContext(VendorContext);
  const vendor = vendorContext?.vendor ?? null;
  const vendorLoading = vendorContext?.loading ?? false;
  const { isAdmin } = useAuth();
  const vendorId = vendor?.id ?? null;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: dashboardKeys.products({ isAdmin, vendorId }),
    queryFn: () => fetchProductsList({ isAdmin, vendorId }),
    enabled: !vendorLoading && (isAdmin || !!vendorId),
  });

  const products = (query.data ?? []) as Product[];

  const invalidateProducts = useCallback(() => {
    return queryClient.invalidateQueries({ queryKey: dashboardKeys.productsPrefix });
  }, [queryClient]);

  const addProduct = useCallback(
    async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
      if (!vendorId) return;

      const { data: vendorData } = await dashboardClient
        .from('vendors')
        .select('auto_approve_products')
        .eq('id', vendorId)
        .maybeSingle();

      const autoApprove = vendorData?.auto_approve_products === true;

      const productToInsert = {
        ...product,
        vendor_id: vendorId,
        status: autoApprove ? 'active' : 'draft',
        approval_status: autoApprove ? 'approved' : 'pending_review',
        approved_at: autoApprove ? new Date().toISOString() : null,
      };

      const { data, error } = await dashboardClient
        .from('products')
        .insert(productToInsert)
        .select()
        .single();

      if (error) throw error;
      await invalidateProducts();
      return data;
    },
    [vendorId, invalidateProducts]
  );

  const updateProduct = useCallback(
    async (id: string, updates: Partial<Product>) => {
      const { data, error } = await dashboardClient
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await invalidateProducts();
      return data;
    },
    [invalidateProducts]
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      const { error } = await dashboardClient.from('products').delete().eq('id', id);
      if (error) throw error;
      await invalidateProducts();
    },
    [invalidateProducts]
  );

  const refetch = useCallback(async () => {
    await query.refetch();
  }, [query]);

  const loading = vendorLoading || query.isPending || query.isRefetching;

  return useMemo(
    () => ({
      products,
      loading,
      addProduct,
      updateProduct,
      deleteProduct,
      refetch,
    }),
    [products, loading, addProduct, updateProduct, deleteProduct, refetch]
  );
}
