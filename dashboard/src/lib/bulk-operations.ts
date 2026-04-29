import { supabase } from './supabase';

export async function bulkUpdateOrderStatus(
  orderIds: string[],
  status: string
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const orderId of orderIds) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;
      success++;
    } catch (error) {
      console.error(`Failed to update order ${orderId}:`, error);
      failed++;
    }
  }

  return { success, failed };
}

export async function bulkDeleteProducts(
  productIds: string[]
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const productId of productIds) {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      success++;
    } catch (error) {
      console.error(`Failed to delete product ${productId}:`, error);
      failed++;
    }
  }

  return { success, failed };
}

export async function bulkUpdateProductStatus(
  productIds: string[],
  status: string
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const productId of productIds) {
    try {
      const { error } = await supabase
        .from('products')
        .update({ status })
        .eq('id', productId);

      if (error) throw error;
      success++;
    } catch (error) {
      console.error(`Failed to update product ${productId}:`, error);
      failed++;
    }
  }

  return { success, failed };
}

export async function bulkUpdateProductPrices(
  productIds: string[],
  priceAdjustment: { type: 'increase' | 'decrease' | 'set'; value: number }
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const productId of productIds) {
    try {
      const { data: product } = await supabase
        .from('products')
        .select('price')
        .eq('id', productId)
        .single();

      if (!product) throw new Error('Product not found');

      let newPrice: number;
      if (priceAdjustment.type === 'set') {
        newPrice = priceAdjustment.value;
      } else if (priceAdjustment.type === 'increase') {
        newPrice = product.price + priceAdjustment.value;
      } else {
        newPrice = product.price - priceAdjustment.value;
      }

      newPrice = Math.max(0, newPrice);

      const { error } = await supabase
        .from('products')
        .update({ price: newPrice })
        .eq('id', productId);

      if (error) throw error;
      success++;
    } catch (error) {
      console.error(`Failed to update price for product ${productId}:`, error);
      failed++;
    }
  }

  return { success, failed };
}

export async function bulkImportProducts(
  products: Array<{
    name: string;
    description: string;
    category: string;
    sku: string;
    price: number;
    cost: number;
    status: string;
  }>,
  vendorId: string
): Promise<{ success: number; failed: number; errors: string[] }> {
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const product of products) {
    try {
      const { error } = await supabase
        .from('products')
        .insert({ ...product, vendor_id: vendorId });

      if (error) throw error;
      success++;
    } catch (error: any) {
      console.error(`Failed to import product ${product.sku}:`, error);
      failed++;
      errors.push(`${product.sku}: ${error.message}`);
    }
  }

  return { success, failed, errors };
}

export async function bulkRestockInventory(
  updates: Array<{ inventoryId: string; quantity: number }>
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const update of updates) {
    try {
      const { data: current } = await supabase
        .from('inventory')
        .select('quantity')
        .eq('id', update.inventoryId)
        .single();

      if (!current) throw new Error('Inventory item not found');

      const { error } = await supabase
        .from('inventory')
        .update({
          quantity: current.quantity + update.quantity,
          last_restocked_at: new Date().toISOString(),
        })
        .eq('id', update.inventoryId);

      if (error) throw error;
      success++;
    } catch (error) {
      console.error(`Failed to restock inventory ${update.inventoryId}:`, error);
      failed++;
    }
  }

  return { success, failed };
}

export function parseCSV(csvText: string): Array<Record<string, string>> {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim());
  const results: Array<Record<string, string>> = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());
    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    results.push(row);
  }

  return results;
}
