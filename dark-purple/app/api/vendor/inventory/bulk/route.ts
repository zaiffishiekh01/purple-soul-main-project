import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { withVendorAuth, logVendorAction } from '@/lib/api/vendor';

interface BulkInventoryItem {
  product_id: string;
  quantity_change: number;
  reason?: string;
  notes?: string;
}

export async function POST(request: NextRequest) {
  return withVendorAuth(request, async (ctx) => {
    try {
      const body = await request.json();
      const { items, global_reason } = body;

      if (!Array.isArray(items) || items.length === 0) {
        return NextResponse.json({
          error: 'items array is required and must not be empty'
        }, { status: 400 });
      }

      if (items.length > 100) {
        return NextResponse.json({
          error: 'Maximum 100 items per bulk operation'
        }, { status: 400 });
      }

      const supabase = createClient();

      const productIds = items.map(item => item.product_id);
      const { data: products, error: fetchError } = await supabase
        .from('products')
        .select('id, vendor_id, stock_quantity, name')
        .in('id', productIds);

      if (fetchError) {
        throw fetchError;
      }

      const productMap = new Map(products?.map(p => [p.id, p]) || []);

      const results = {
        success: [] as any[],
        failed: [] as any[],
      };

      for (const item of items as BulkInventoryItem[]) {
        try {
          const product = productMap.get(item.product_id);

          if (!product) {
            results.failed.push({
              product_id: item.product_id,
              error: 'Product not found',
            });
            continue;
          }

          if (product.vendor_id !== ctx.vendorId) {
            results.failed.push({
              product_id: item.product_id,
              error: 'Not your product',
            });
            continue;
          }

          if (!Number.isInteger(item.quantity_change)) {
            results.failed.push({
              product_id: item.product_id,
              error: 'quantity_change must be an integer',
            });
            continue;
          }

          const currentQuantity = product.stock_quantity || 0;
          const newQuantity = currentQuantity + item.quantity_change;

          if (newQuantity < 0) {
            results.failed.push({
              product_id: item.product_id,
              error: `Cannot reduce inventory below 0. Current: ${currentQuantity}`,
            });
            continue;
          }

          const { error: updateError } = await supabase
            .from('products')
            .update({
              stock_quantity: newQuantity,
              updated_at: new Date().toISOString(),
            })
            .eq('id', item.product_id);

          if (updateError) {
            results.failed.push({
              product_id: item.product_id,
              error: 'Failed to update inventory',
            });
            continue;
          }

          const { error: historyError } = await supabase
            .from('inventory_history')
            .insert({
              product_id: item.product_id,
              vendor_id: ctx.vendorId,
              quantity_change: item.quantity_change,
              quantity_before: currentQuantity,
              quantity_after: newQuantity,
              reason: item.reason || global_reason || 'bulk_update',
              notes: item.notes || `Bulk inventory adjustment`,
              changed_by: ctx.userId,
            });

          if (historyError) {
            console.error('Failed to log inventory history:', historyError);
          }

          results.success.push({
            product_id: item.product_id,
            product_name: product.name,
            previous_quantity: currentQuantity,
            new_quantity: newQuantity,
            change: item.quantity_change,
          });

        } catch (itemError) {
          results.failed.push({
            product_id: item.product_id,
            error: 'Unexpected error processing item',
          });
        }
      }

      await logVendorAction(ctx.userId, 'bulk_adjust_inventory', 'inventory', null, request);

      return NextResponse.json({
        success: true,
        results,
        summary: {
          total: items.length,
          succeeded: results.success.length,
          failed: results.failed.length,
        },
      });

    } catch (error) {
      console.error('Bulk inventory error:', error);

      await logVendorAction(
        ctx.userId,
        'bulk_adjust_inventory',
        'inventory',
        null,
        request,
        'failure',
        error instanceof Error ? error.message : 'Unknown error'
      );

      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}
